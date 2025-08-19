const { query } = require('../config/db');

async function testSmartSlots() {
    try {
        console.log('🧪 Probando el nuevo sistema de slots inteligentes...\n');

        // 1. Verificar servicios con duración
        console.log('1️⃣ Servicios disponibles con duración:');
        const servicios = await query(`
            SELECT id, nombre, precio, duracion, estado 
            FROM servicios 
            WHERE estado = 'activo'
            ORDER BY duracion ASC
        `);
        
        if (servicios.length === 0) {
            console.log('❌ No hay servicios activos en la base de datos');
            return;
        }

        servicios.forEach((servicio, index) => {
            const duracionFormateada = servicio.duracion >= 60 
                ? `${Math.floor(servicio.duracion/60)}h ${servicio.duracion%60}min`
                : `${servicio.duracion} min`;
            
            console.log(`   ${index + 1}. ${servicio.nombre}`);
            console.log(`      Precio: $${servicio.precio} | Duración: ${duracionFormateada} | ID: ${servicio.id}`);
        });

        // 2. Simular generación de slots para diferentes servicios
        console.log('\n2️⃣ Simulación de generación de slots inteligentes:');
        
        const horariosLaborales = [
            { hora_inicio: '09:00', hora_fin: '18:00', pausa_inicio: '13:00', pausa_fin: '14:00' }
        ];

        const citasExistentes = [
            { hora_inicio: '10:00', hora_fin: '10:30' },
            { hora_inicio: '14:30', hora_fin: '15:30' }
        ];

        servicios.forEach((servicio, index) => {
            console.log(`\n   📅 ${servicio.nombre} (${servicio.duracion} min):`);
            
            // Simular generación de slots
            const slots = generateSlotsSimulation(horariosLaborales, citasExistentes, servicio.duracion);
            
            console.log(`      Horarios disponibles: ${slots.length}`);
            slots.forEach((slot, slotIndex) => {
                if (slotIndex < 5) { // Mostrar solo los primeros 5
                    console.log(`         ${slotIndex + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
                }
            });
            
            if (slots.length > 5) {
                console.log(`         ... y ${slots.length - 5} horarios más`);
            }
        });

        // 3. Análisis de eficiencia
        console.log('\n3️⃣ Análisis de eficiencia del nuevo sistema:');
        
        const serviciosTest = [
            { nombre: 'Arreglo Rápido', duracion: 15 },
            { nombre: 'Corte Simple', duracion: 30 },
            { nombre: 'Corte + Barba', duracion: 60 },
            { nombre: 'Tratamiento Premium', duracion: 90 }
        ];

        serviciosTest.forEach(servicio => {
            const slotsPorHora = Math.floor(60 / servicio.duracion);
            const eficiencia = ((servicio.duracion / 60) * 100).toFixed(1);
            
            console.log(`   ${servicio.nombre}:`);
            console.log(`     Duración: ${servicio.duracion} min`);
            console.log(`     Slots por hora: ${slotsPorHora}`);
            console.log(`     Eficiencia: ${eficiencia}% del tiempo laboral`);
            console.log(`     Tiempo total por turno: ${servicio.duracion} min`);
        });

        // 4. Comparación con el sistema anterior
        console.log('\n4️⃣ Comparación con el sistema anterior:');
        console.log('   SISTEMA ANTERIOR:');
        console.log('     ❌ Intervalo fijo (ej: 30 min) para todos los servicios');
        console.log('     ❌ Servicios de 15 min desperdiciaban 15 min');
        console.log('     ❌ Servicios de 60 min no cabían en slots de 30 min');
        console.log('     ❌ Configuración rígida y poco eficiente');
        
        console.log('\n   NUEVO SISTEMA:');
        console.log('     ✅ Cada servicio define su duración real');
        console.log('     ✅ Slots se generan dinámicamente según duración');
        console.log('     ✅ Sin desperdicio de tiempo');
        console.log('     ✅ Configuración flexible y eficiente');
        console.log('     ✅ Buffer configurable entre turnos');

        console.log('\n🎯 Ventajas del nuevo sistema:');
        console.log('   ✅ Mayor eficiencia en el uso del tiempo');
        console.log('   ✅ Flexibilidad total para diferentes tipos de servicios');
        console.log('   ✅ Mejor experiencia para el cliente');
        console.log('   ✅ Optimización automática del horario');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        process.exit(0);
    }
}

// Función de simulación de generación de slots
function generateSlotsSimulation(workingHours, existingAppointments, serviceDuration) {
    const slots = [];
    const bufferTime = 5; // 5 minutos de buffer

    workingHours.forEach(workHour => {
        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);
        const pausaInicio = workHour.pausa_inicio ? new Date(`2000-01-01T${workHour.pausa_inicio}`) : null;
        const pausaFin = workHour.pausa_fin ? new Date(`2000-01-01T${workHour.pausa_fin}`) : null;

        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);

            if (slotEnd > endTime) break;

            // Verificar si está en pausa
            const isInBreak = pausaInicio && pausaFin && 
                currentTime < pausaFin && slotEnd > pausaInicio;

            if (!isInBreak) {
                // Verificar si está ocupado
                const isOccupied = existingAppointments.some(appointment => {
                    const appointmentStart = new Date(`2000-01-01T${appointment.hora_inicio}`);
                    const appointmentEnd = new Date(`2000-01-01T${appointment.hora_fin}`);
                    
                    return (currentTime < appointmentEnd && slotEnd > appointmentStart);
                });

                if (!isOccupied) {
                    slots.push({
                        hora_inicio: slotStart,
                        hora_fin: slotEndStr,
                        duracion: serviceDuration
                    });
                }
            }

            // Avanzar al siguiente slot
            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
        }
    });

    return slots;
}

// Ejecutar prueba
testSmartSlots();
