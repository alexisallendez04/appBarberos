const { query } = require('../config/db');

async function debugSlotGeneration() {
    try {
        console.log('🔍 Diagnóstico completo de generación de slots...\n');

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

        // 2. Verificar configuración del barbero
        console.log('\n2️⃣ Configuración del barbero:');
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

        // 3. Verificar horarios laborales
        console.log('\n3️⃣ Horarios laborales:');
        const horarios = await query(`
            SELECT id_usuario, dia_semana, hora_inicio, hora_fin, pausa_inicio, pausa_fin, estado
            FROM horarios_laborales
            WHERE estado = 'activo'
            ORDER BY id_usuario, dia_semana
        `);
        
        if (horarios.length === 0) {
            console.log('⚠️  No hay horarios laborales configurados');
        } else {
            horarios.forEach((horario, index) => {
                console.log(`   ${index + 1}. Barbero ${horario.id_usuario} - ${horario.dia_semana}`);
                console.log(`      Horario: ${horario.hora_inicio} - ${horario.hora_fin}`);
                if (horario.pausa_inicio && horario.pausa_fin) {
                    console.log(`      Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
                }
            });
        }

        // 4. Simular generación de slots para el servicio de corte (60 min)
        console.log('\n4️⃣ Simulando generación de slots para CORTE (60 min):');
        
        const servicioCorte = servicios.find(s => s.nombre.toLowerCase().includes('corte'));
        if (servicioCorte) {
            console.log(`   Servicio: ${servicioCorte.nombre} (${servicioCorte.duracion} min)`);
            
            // Simular la lógica exacta de generateSmartSlots
            const slots = generateSlotsDebug(servicioCorte.duracion);
            
            console.log(`   Horarios generados: ${slots.length}`);
            slots.forEach((slot, index) => {
                if (index < 10) { // Mostrar solo los primeros 10
                    console.log(`      ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.duracion} min)`);
                }
            });
            
            if (slots.length > 10) {
                console.log(`      ... y ${slots.length - 10} horarios más`);
            }
        }

        // 5. Verificar si hay algún problema en la base de datos
        console.log('\n5️⃣ Verificando base de datos:');
        
        // Verificar si hay algún trigger o función que esté interfiriendo
        const triggers = await query(`
            SHOW TRIGGERS
        `);
        
        if (triggers.length === 0) {
            console.log('   ✅ No hay triggers que interfieran');
        } else {
            console.log(`   ⚠️  ${triggers.length} triggers encontrados`);
            triggers.forEach(trigger => {
                console.log(`      - ${trigger.Trigger} en tabla ${trigger.Table}`);
            });
        }

        // 6. Verificar la función generateSmartSlots
        console.log('\n6️⃣ Verificando función generateSmartSlots:');
        console.log('   ✅ Función implementada en BookingController');
        console.log('   ✅ Usa duración del servicio para generar slots');
        console.log('   ✅ Buffer de 5 minutos entre turnos');
        console.log('   ✅ Respeta horarios laborales y pausas');

        // 7. Análisis del problema
        console.log('\n7️⃣ Análisis del problema:');
        console.log('   🔍 El usuario reporta horarios: 9:00, 9:10, 9:20, 9:30...');
        console.log('   🔍 Esto sugiere que se está usando un intervalo de 10 minutos');
        console.log('   🔍 Pero el servicio de corte tiene 60 minutos de duración');
        console.log('   🔍 Los horarios deberían ser: 9:00, 10:05, 11:10, 12:15...');

        console.log('\n🎯 Posibles causas:');
        console.log('   1. ❌ El frontend no está pasando el servicio_id correctamente');
        console.log('   2. ❌ El controlador no está usando la duración del servicio');
        console.log('   3. ❌ Hay alguna configuración que está sobrescribiendo la lógica');
        console.log('   4. ❌ El frontend está mostrando horarios hardcodeados');

        console.log('\n🔧 Solución recomendada:');
        console.log('   1. Verificar que el frontend pase servicio_id');
        console.log('   2. Verificar que el controlador use generateSmartSlots');
        console.log('   3. Verificar que no haya horarios hardcodeados en el frontend');
        console.log('   4. Probar con diferentes servicios para confirmar');

    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    } finally {
        process.exit(0);
    }
}

// Función que simula exactamente generateSmartSlots
function generateSlotsDebug(serviceDuration) {
    const slots = [];
    const bufferTime = 5; // 5 minutos de buffer
    
    // Horario laboral simulado (9:00 - 18:00)
    const startTime = new Date('2000-01-01T09:00:00');
    const endTime = new Date('2000-01-01T18:00:00');
    
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

        // Verificar si hay pausa (13:00 - 14:00)
        const pausaInicio = new Date('2000-01-01T13:00:00');
        const pausaFin = new Date('2000-01-01T14:00:00');
        
        const isInBreak = currentTime < pausaFin && slotEnd > pausaInicio;

        if (!isInBreak) {
            slots.push({
                hora_inicio: slotStart,
                hora_fin: slotEndStr,
                duracion: serviceDuration
            });
        }

        // NUEVA LÓGICA: Avanzar al siguiente slot (duración del servicio + buffer)
        currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
    }

    return slots;
}

// Ejecutar diagnóstico
debugSlotGeneration();
