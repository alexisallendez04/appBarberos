const { query } = require('../config/db');

async function testSlotGenerationReal() {
    try {
        console.log('🧪 Probando generación de slots REAL para lunes 20 de enero...\n');

        const fecha = '2025-01-20';
        const barberoId = 1;
        const servicioId = 2; // "corte" - 45 minutos

        console.log(`📅 Fecha: ${fecha}`);
        console.log(`👨‍💼 Barbero ID: ${barberoId}`);
        console.log(`✂️  Servicio ID: ${servicioId}`);

        // 1. Obtener configuración del barbero
        console.log('\n1️⃣ Configuración del barbero:');
        const config = await query(`
            SELECT id_usuario, intervalo_turnos, anticipacion_reserva, max_reservas_dia
            FROM configuracion_barbero
            WHERE id_usuario = ?
        `, [barberoId]);

        if (config.length === 0) {
            console.log('   ❌ No hay configuración para este barbero');
            return;
        }

        const barberConfig = config[0];
        console.log(`   ✅ Configuración encontrada:`);
        console.log(`      - Intervalo turnos: ${barberConfig.intervalo_turnos} min`);
        console.log(`      - Anticipación: ${barberConfig.anticipacion_reserva} min`);
        console.log(`      - Máximo por día: ${barberConfig.max_reservas_dia}`);

        // 2. Obtener duración del servicio
        console.log('\n2️⃣ Duración del servicio:');
        const servicio = await query(`
            SELECT id, nombre, duracion, estado 
            FROM servicios 
            WHERE id = ? AND estado = 'activo'
        `, [servicioId]);

        if (servicio.length === 0) {
            console.log('   ❌ Servicio no encontrado');
            return;
        }

        const servicioData = servicio[0];
        console.log(`   ✅ Servicio: ${servicioData.nombre}`);
        console.log(`      - Duración: ${servicioData.duracion} minutos`);
        console.log(`      - Estado: ${servicioData.estado}`);

        // 3. Obtener día de la semana
        console.log('\n3️⃣ Día de la semana:');
        const date = new Date(fecha);
        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = days[date.getDay()];
        console.log(`   ✅ ${fecha} es ${diaSemana}`);

        // 4. Obtener horarios laborales
        console.log('\n4️⃣ Horarios laborales:');
        const horarios = await query(`
            SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
        `, [barberoId, diaSemana]);

        if (horarios.length === 0) {
            console.log('   ❌ No hay horarios laborales para este día');
            return;
        }

        console.log(`   ✅ ${horarios.length} horario(s) laboral(es):`);
        horarios.forEach((horario, index) => {
            console.log(`      ${index + 1}. ${horario.hora_inicio} - ${horario.hora_fin}`);
            if (horario.pausa_inicio && horario.pausa_fin) {
                console.log(`         Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
            }
        });

        // 5. Obtener citas existentes
        console.log('\n5️⃣ Citas existentes:');
        const citas = await query(`
            SELECT id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio
            FROM turnos
            WHERE id_usuario = ? AND fecha = ? AND estado IN ('reservado', 'confirmado', 'en_proceso')
            ORDER BY hora_inicio ASC
        `, [barberoId, fecha]);

        if (citas.length === 0) {
            console.log('   ✅ No hay citas activas para este día');
        } else {
            console.log(`   ⚠️  ${citas.length} cita(s) activa(s):`);
            citas.forEach((cita, index) => {
                console.log(`      ${index + 1}. ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        }

        // 6. Simular generación de slots
        console.log('\n6️⃣ Generando slots usando generateSmartSlots:');
        const slots = generateSmartSlots(horarios, citas, servicioData.duracion, { bufferTime: barberConfig.intervalo_turnos });
        
        console.log(`   ✅ Total de slots generados: ${slots.length}`);
        slots.forEach((slot, index) => {
            console.log(`      ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
        });

        // 7. Verificar si el slot de 9:00 aparece
        console.log('\n7️⃣ Verificación del slot 9:00:');
        const slot9am = slots.find(slot => slot.hora_inicio === '09:00');
        if (slot9am) {
            console.log(`   ❌ PROBLEMA: El slot 9:00 SÍ aparece`);
            console.log(`      - Hora fin: ${slot9am.hora_fin}`);
            console.log(`      - Duración: ${slot9am.duracion} min`);
        } else {
            console.log(`   ✅ CORRECTO: El slot 9:00 NO aparece`);
        }

        // 8. Análisis del problema
        console.log('\n8️⃣ Análisis del problema:');
        if (slot9am) {
            console.log('   🚨 El slot 9:00 aparece cuando NO debería');
            console.log('   🔍 Posibles causas:');
            console.log('      1. La lógica de verificación de solapamiento no funciona');
            console.log('      2. Las citas existentes no se están filtrando correctamente');
            console.log('      3. Hay un bug en generateSmartSlots');
        } else {
            console.log('   ✅ El slot 9:00 NO aparece (correcto)');
            console.log('   🔍 Si el usuario lo ve en el frontend, el problema está en:');
            console.log('      1. El frontend está usando datos en caché');
            console.log('      2. Hay algún script que sobrescribe los horarios');
            console.log('      3. El usuario está viendo una página antigua');
        }

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        process.exit(0);
    }
}

// Función que simula exactamente generateSmartSlots
function generateSmartSlots(workingHours, existingAppointments, serviceDuration, config) {
    const slots = [];
    const bufferTime = config?.bufferTime || 5;

    workingHours.forEach(workHour => {
        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);

        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            if (slotEnd > endTime) {
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
                    
                    const hasConflict = (slotStartTime < appointmentEnd && slotEndTime > appointmentStart);
                    
                    if (hasConflict) {
                        console.log(`         ❌ Slot ${slotStart} - ${slotEndStr} CONFLICTA con cita ${appointment.hora_inicio} - ${appointment.hora_fin}`);
                    }
                    
                    return hasConflict;
                });

                if (!isOccupied) {
                    slots.push({
                        hora_inicio: slotStart,
                        hora_fin: slotEndStr,
                        disponible: true,
                        duracion: serviceDuration,
                        tiempo_total: `${serviceDuration} min`
                    });
                    console.log(`         ✅ Slot ${slotStart} - ${slotEndStr} DISPONIBLE`);
                } else {
                    console.log(`         ❌ Slot ${slotStart} - ${slotEndStr} OCUPADO`);
                }
            }

            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
        }
    });

    return slots;
}

// Ejecutar prueba
testSlotGenerationReal();
