const { query } = require('../config/db');

async function debugSlotTiming() {
    try {
        console.log('🔍 Verificando generación de slots y timing...\n');

        const fecha = '2025-08-18'; // Lunes 18 de agosto
        const barberoId = 1;

        // 1. Verificar servicios
        console.log('1️⃣ Servicios disponibles:');
        const servicios = await query(`
            SELECT id, nombre, duracion, estado, precio
            FROM servicios 
            WHERE estado = 'activo'
            ORDER BY id ASC
        `);
        
        servicios.forEach((servicio, index) => {
            console.log(`   ${index + 1}. ID: ${servicio.id} - ${servicio.nombre}`);
            console.log(`      - Duración: ${servicio.duracion} minutos`);
            console.log(`      - Precio: ${servicio.precio}`);
            console.log('');
        });

        // 2. Verificar configuración del barbero
        console.log('2️⃣ Configuración del barbero:');
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

        // 3. Verificar horarios laborales
        console.log('\n3️⃣ Horarios laborales para lunes:');
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
        console.log('\n4️⃣ Citas existentes para 18 de agosto:');
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

        // 5. Probar generación de slots para cada servicio
        console.log('\n5️⃣ Generando slots para cada servicio:');
        
        for (const servicio of servicios) {
            console.log(`\n   🔧 Probando servicio: ${servicio.nombre} (${servicio.duracion} min)`);
            
            const slots = generateSlotsDebug(horarios, citas, servicio.duracion, { bufferTime: 5 });
            
            console.log(`   ✅ Total de slots: ${slots.length}`);
            
            if (slots.length > 0) {
                // Mostrar los primeros 5 slots
                slots.slice(0, 5).forEach((slot, index) => {
                    console.log(`      ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
                });
                
                if (slots.length > 5) {
                    console.log(`      ... y ${slots.length - 5} slots más`);
                }
                
                // Verificar timing entre slots
                if (slots.length > 1) {
                    console.log(`   📊 Análisis de timing:`);
                    for (let i = 0; i < Math.min(3, slots.length - 1); i++) {
                        const currentSlot = slots[i];
                        const nextSlot = slots[i + 1];
                        
                        const currentStart = new Date(`2000-01-01T${currentSlot.hora_inicio}`);
                        const nextStart = new Date(`2000-01-01T${nextSlot.hora_inicio}`);
                        
                        const diffMinutes = (nextStart - currentStart) / (1000 * 60);
                        console.log(`      Slot ${i + 1} → Slot ${i + 2}: ${diffMinutes} minutos de diferencia`);
                    }
                }
            }
        }

        // 6. Análisis del problema
        console.log('\n6️⃣ Análisis del problema:');
        console.log('   🔍 El usuario reporta que los turnos aparecen cada 1 hora 15 min (75 min)');
        console.log('   🎯 Esto sugiere que hay un error en el cálculo:');
        console.log('      - Duración del servicio + Buffer = 45 + 5 = 50 min (correcto)');
        console.log('      - Pero aparece cada 75 min (incorrecto)');
        console.log('   🚨 Posibles causas:');
        console.log('      1. Error en el cálculo de currentTime');
        console.log('      2. Error en la conversión de fechas');
        console.log('      3. Error en la lógica de avance de tiempo');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        process.exit(0);
    }
}

// Función que simula generateSmartSlots con logging detallado
function generateSlotsDebug(workingHours, existingAppointments, serviceDuration, config) {
    const slots = [];
    const bufferTime = config?.bufferTime || 5;

    console.log(`      📝 Parámetros: duración=${serviceDuration}min, buffer=${bufferTime}min`);

    workingHours.forEach(workHour => {
        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);

        console.log(`      🕐 Horario laboral: ${workHour.hora_inicio} - ${workHour.hora_fin}`);

        let currentTime = new Date(startTime);
        let slotCount = 0;
        
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            if (slotEnd > endTime) {
                console.log(`      ⏹️  Slot se extiende más allá del horario laboral, parando`);
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
                    if (slotCount <= 3) {
                        console.log(`      ✅ Slot ${slotCount}: ${slotStart} - ${slotEndStr} (${serviceDuration} min)`);
                    }
                } else {
                    console.log(`      ❌ Slot ${slotStart} - ${slotEndStr} OCUPADO`);
                }
            } else {
                console.log(`      ⏸️  Slot ${slotStart} - ${slotEndStr} en pausa`);
            }

            // Avanzar al siguiente slot
            const oldTime = currentTime.toTimeString().slice(0, 5);
            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
            const newTime = currentTime.toTimeString().slice(0, 5);
            
            if (slotCount <= 3) {
                console.log(`      ⏭️  Avanzando de ${oldTime} a ${newTime} (buffer: ${bufferTime} min)`);
            }
        }
    });

    return slots;
}

// Ejecutar verificación
debugSlotTiming();
