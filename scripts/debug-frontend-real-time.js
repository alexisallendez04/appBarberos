const { query } = require('../config/db');

async function debugFrontendRealTime() {
    try {
        console.log('🔍 Monitoreo en tiempo real del frontend...\n');

        // 1. Verificar qué controlador se está usando
        console.log('1️⃣ Verificando controladores activos:');
        
        // Verificar si hay algún problema con las rutas
        console.log('   Ruta /api/booking/slots → BookingController.getAvailableSlots');
        console.log('   Ruta /api/slots → publicController.getAvailableSlots');
        
        // 2. Verificar la configuración actual
        console.log('\n2️⃣ Configuración actual del sistema:');
        const configuraciones = await query(`
            SELECT id_usuario, intervalo_turnos, anticipacion_reserva, max_reservas_dia
            FROM configuracion_barbero
        `);
        
        if (configuraciones.length === 0) {
            console.log('⚠️  No hay configuraciones de barberos');
        } else {
            configuraciones.forEach((config, index) => {
                console.log(`   Barbero ${config.id_usuario}:`);
                console.log(`     Intervalo mínimo: ${config.intervalo_turnos} min`);
                console.log(`     Anticipación: ${config.anticipacion_reserva} min`);
                console.log(`     Máximo por día: ${config.max_reservas_dia}`);
            });
        }

        // 3. Simular llamada del frontend paso a paso
        console.log('\n3️⃣ Simulando llamada del frontend paso a paso:');
        
        const fecha = '2025-01-20'; // Lunes
        const barberoId = 1;
        const servicioId = 2; // ID del servicio "corte"
        
        console.log(`   Fecha: ${fecha}`);
        console.log(`   Barbero ID: ${barberoId}`);
        console.log(`   Servicio ID: ${servicioId}`);
        
        // 4. Verificar qué servicio se está solicitando
        console.log('\n4️⃣ Verificando servicio solicitado:');
        const servicio = await query(`
            SELECT id, nombre, duracion, estado 
            FROM servicios 
            WHERE id = ? AND estado = 'activo'
        `, [servicioId]);
        
        if (servicio.length === 0) {
            console.log('❌ Servicio no encontrado');
            return;
        }
        
        const servicioData = servicio[0];
        console.log(`   Servicio: ${servicioData.nombre}`);
        console.log(`   Duración: ${servicioData.duracion} minutos`);
        console.log(`   Estado: ${servicioData.estado}`);
        
        // 5. Verificar horarios laborales
        console.log('\n5️⃣ Verificando horarios laborales:');
        const diaSemana = 'lunes';
        const horarios = await query(`
            SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
        `, [barberoId, diaSemana]);
        
        if (horarios.length === 0) {
            console.log('❌ No hay horarios laborales para este día');
            return;
        }
        
        horarios.forEach((horario, index) => {
            console.log(`   Horario ${index + 1}: ${horario.hora_inicio} - ${horario.hora_fin}`);
            if (horario.pausa_inicio && horario.pausa_fin) {
                console.log(`     Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
            }
        });
        
        // 6. Verificar citas existentes
        console.log('\n6️⃣ Verificando citas existentes:');
        const citas = await query(`
            SELECT hora_inicio, hora_fin, estado
            FROM turnos
            WHERE id_usuario = ? AND fecha = ? AND estado IN ('reservado', 'confirmado', 'en_proceso')
        `, [barberoId, fecha]);
        
        if (citas.length === 0) {
            console.log('   ✅ No hay citas existentes para este día');
        } else {
            console.log(`   ⚠️  ${citas.length} cita(s) existente(s):`);
            citas.forEach((cita, index) => {
                console.log(`     ${index + 1}. ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        }
        
        // 7. Simular generación de slots usando la lógica correcta
        console.log('\n7️⃣ Generando slots usando generateSmartSlots:');
        const slots = generateSlotsCorrect(horarios, citas, servicioData.duracion);
        
        console.log(`   Total de slots generados: ${slots.length}`);
        slots.forEach((slot, index) => {
            if (index < 8) { // Mostrar solo los primeros 8
                console.log(`     ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
            }
        });
        
        if (slots.length > 8) {
            console.log(`     ... y ${slots.length - 8} horarios más`);
        }
        
        // 8. Análisis del problema
        console.log('\n8️⃣ Análisis del problema:');
        console.log('   🔍 El usuario reporta horarios: 9:00, 9:10, 9:20, 9:30...');
        console.log('   🔍 Estos horarios NO están siendo generados por generateSmartSlots');
        console.log('   🔍 Los horarios correctos deberían ser: 9:00, 10:05, 11:10, 14:25...');
        
        console.log('\n🎯 Posibles causas restantes:');
        console.log('   1. ❌ El frontend está usando una función diferente');
        console.log('   2. ❌ Hay algún script JavaScript que está sobrescribiendo los horarios');
        console.log('   3. ❌ El controlador no está siendo llamado correctamente');
        console.log('   4. ❌ Hay algún problema de caché o estado del frontend');
        
        console.log('\n🔧 Próximos pasos:');
        console.log('   1. Verificar la consola del navegador para ver errores');
        console.log('   2. Verificar la pestaña Network para ver las llamadas al API');
        console.log('   3. Verificar si hay algún script que genere horarios cada 10 min');
        console.log('   4. Verificar si el frontend está usando la función correcta');

    } catch (error) {
        console.error('❌ Error durante el monitoreo:', error);
    } finally {
        process.exit(0);
    }
}

// Función que simula exactamente generateSmartSlots
function generateSlotsCorrect(workingHours, existingAppointments, serviceDuration) {
    const slots = [];
    const bufferTime = 5; // 5 minutos de buffer

    workingHours.forEach(workHour => {
        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);
        const pausaInicio = workHour.pausa_inicio ? new Date(`2000-01-01T${workHour.pausa_inicio}`) : null;
        const pausaFin = workHour.pausa_fin ? new Date(`2000-01-01T${workHour.pausa_fin}`) : null;

        // Generar slots desde el inicio del horario laboral
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            
            // Calcular hora de fin del slot usando la duración del servicio
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            // Verificar que el slot no se extienda más allá del horario laboral
            if (slotEnd > endTime) {
                break;
            }

            // Verificar si hay pausa en este horario
            const isInBreak = pausaInicio && pausaFin && 
                currentTime < pausaFin && slotEnd > pausaInicio;

            if (!isInBreak) {
                // Verificar si el slot está ocupado
                const isOccupied = existingAppointments.some(appointment => {
                    const appointmentStart = new Date(`2000-01-01T${appointment.hora_inicio}`);
                    const appointmentEnd = new Date(`2000-01-01T${appointment.hora_fin}`);
                    
                    const slotStartTime = new Date(currentTime);
                    const slotEndTime = new Date(slotEnd);
                    
                    // Hay conflicto si los slots se solapan
                    return (
                        (slotStartTime < appointmentEnd && slotEndTime > appointmentStart)
                    );
                });

                if (!isOccupied) {
                    slots.push({
                        hora_inicio: slotStart,
                        hora_fin: slotEndStr,
                        duracion: serviceDuration
                    });
                }
            }

            // Avanzar al siguiente slot (duración del servicio + buffer)
            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
        }
    });

    return slots;
}

// Ejecutar monitoreo
debugFrontendRealTime();
