const { query } = require('../config/db');

async function testApiRealTime() {
    try {
        console.log('🧪 Probando API en tiempo real...\n');

        const fecha = '2025-08-18';
        const barberoId = 1;
        const servicioId = 1; // "corte" - 45 minutos

        console.log(`📅 Fecha: ${fecha}`);
        console.log(`👨‍💼 Barbero ID: ${barberoId}`);
        console.log(`✂️  Servicio ID: ${servicioId}`);

        // 1. Verificar configuración del barbero
        console.log('\n1️⃣ Configuración del barbero:');
        const config = await query(`
            SELECT id_usuario, intervalo_turnos, anticipacion_reserva, max_reservas_dia
            FROM configuracion_barbero
            WHERE id_usuario = ?
        `, [barberoId]);

        if (config.length > 0) {
            const barberConfig = config[0];
            console.log(`   - Intervalo turnos: ${barberConfig.intervalo_turnos} min`);
            console.log(`   - Anticipación: ${barberConfig.anticipacion_reserva} min`);
            console.log(`   - Máximo por día: ${barberConfig.max_reservas_dia}`);
        }

        // 2. Verificar duración del servicio
        console.log('\n2️⃣ Duración del servicio:');
        const servicio = await query(`
            SELECT id, nombre, duracion, estado 
            FROM servicios 
            WHERE id = ? AND estado = 'activo'
        `, [servicioId]);

        if (servicio.length > 0) {
            const servicioData = servicio[0];
            console.log(`   - Servicio: ${servicioData.nombre}`);
            console.log(`   - Duración: ${servicioData.duracion} minutos`);
        }

        // 3. Verificar horarios laborales
        console.log('\n3️⃣ Horarios laborales:');
        const horarios = await query(`
            SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = 'lunes' AND estado = 'activo'
        `, [barberoId]);

        if (horarios.length > 0) {
            horarios.forEach((horario, index) => {
                console.log(`   ${index + 1}. ${horario.hora_inicio} - ${horario.hora_fin}`);
                if (horario.pausa_inicio && horario.pausa_fin) {
                    console.log(`      Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
                }
            });
        }

        // 4. Verificar citas existentes
        console.log('\n4️⃣ Citas existentes:');
        const citas = await query(`
            SELECT id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio
            FROM turnos
            WHERE id_usuario = ? AND fecha = ? AND estado IN ('reservado', 'confirmado', 'en_proceso')
            ORDER BY hora_inicio ASC
        `, [barberoId, fecha]);

        if (citas.length > 0) {
            citas.forEach((cita, index) => {
                console.log(`   ${index + 1}. ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        } else {
            console.log('   ✅ No hay citas activas para este día');
        }

        // 5. Simular generateSmartSlots paso a paso
        console.log('\n5️⃣ Simulando generateSmartSlots paso a paso:');
        const slots = generateSlotsStepByStep(horarios, citas, servicio[0].duracion, { bufferTime: 5 });
        
        console.log(`\n✅ Total de slots generados: ${slots.length}`);
        slots.forEach((slot, index) => {
            console.log(`   ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
        });

        // 6. Verificar timing entre slots
        console.log('\n6️⃣ Análisis de timing entre slots:');
        if (slots.length > 1) {
            for (let i = 0; i < slots.length - 1; i++) {
                const currentSlot = slots[i];
                const nextSlot = slots[i + 1];
                
                const currentStart = new Date(`2000-01-01T${currentSlot.hora_inicio}`);
                const nextStart = new Date(`2000-01-01T${nextSlot.hora_inicio}`);
                
                const diffMinutes = (nextStart - currentStart) / (1000 * 60);
                console.log(`   Slot ${i + 1} → Slot ${i + 2}: ${diffMinutes} minutos de diferencia`);
                
                // Verificar si es correcto
                const expectedDiff = servicio[0].duracion + 5; // duración + buffer
                if (Math.abs(diffMinutes - expectedDiff) > 1) {
                    console.log(`   ❌ PROBLEMA: Diferencia esperada: ${expectedDiff} min, Real: ${diffMinutes} min`);
                } else {
                    console.log(`   ✅ CORRECTO: Diferencia esperada: ${expectedDiff} min, Real: ${diffMinutes} min`);
                }
            }
        }

        // 7. Comparar con lo que ve el usuario
        console.log('\n7️⃣ Comparación con lo que ve el usuario:');
        console.log('   🔍 Usuario ve: 9:00, 10:15, 11:30, 15:15, 16:30');
        console.log('   🔍 Diferencia: cada 75 minutos (1 hora 15 min)');
        console.log('   🎯 Backend genera: cada 50 minutos (45 + 5 buffer)');
        console.log('   🚨 PROBLEMA: El frontend NO está mostrando los horarios del backend');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        process.exit(0);
    }
}

// Función que simula generateSmartSlots paso a paso
function generateSlotsStepByStep(workingHours, existingAppointments, serviceDuration, config) {
    const slots = [];
    const bufferTime = config?.bufferTime || 5;

    console.log(`   📝 Parámetros: duración=${serviceDuration}min, buffer=${bufferTime}min`);

    workingHours.forEach(workHour => {
        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);

        console.log(`   🕐 Horario laboral: ${workHour.hora_inicio} - ${workHour.hora_fin}`);

        let currentTime = new Date(startTime);
        let slotCount = 0;
        
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            if (slotEnd > endTime) {
                console.log(`   ⏹️  Slot se extiende más allá del horario laboral, parando`);
                break;
            }

            const isInBreak = workHour.pausa_inicio && workHour.pausa_fin && 
                slotStart < workHour.pausa_fin && slotEndStr > workHour.pausa_inicio;

            if (!isInBreak) {
                const isOccupied = existingAppointments.some(appointment => {
                    const appointmentStart = new Date(`2000-01-01T${appointment.hora_inicio}`);
                    const appointmentEnd = new Date(`2000-01-01T${appointment.hora_fin}`);
                    
                    const slotStartTime = new Date(currentTime);
                    const slotEndTime = new Date(slotEnd);
                    
                    return (slotStartTime < appointmentEnd && slotEndTime > appointmentStart);
                });

                if (!isOccupied) {
                    slots.push({
                        hora_inicio: slotStart,
                        hora_fin: slotEndStr,
                        disponible: true,
                        duracion: serviceDuration,
                        tiempo_total: `${serviceDuration} min`
                    });
                    
                    slotCount++;
                    console.log(`   ✅ Slot ${slotCount}: ${slotStart} - ${slotEndStr} (${serviceDuration} min)`);
                } else {
                    console.log(`   ❌ Slot ${slotStart} - ${slotEndStr} OCUPADO`);
                }
            } else {
                console.log(`   ⏸️  Slot ${slotStart} - ${slotEndStr} en pausa`);
            }

            // Avanzar al siguiente slot
            const oldTime = currentTime.toTimeString().slice(0, 5);
            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
            const newTime = currentTime.toTimeString().slice(0, 5);
            
            console.log(`   ⏭️  Avanzando de ${oldTime} a ${newTime} (buffer: ${bufferTime} min)`);
        }
    });

    return slots;
}

// Ejecutar prueba
testApiRealTime();
