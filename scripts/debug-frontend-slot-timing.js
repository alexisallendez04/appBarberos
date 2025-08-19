const { query } = require('../config/db');

async function debugFrontendSlotTiming() {
    console.log('🔍 DEBUG: Problema de Timing de Slots en Frontend');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar configuración del barbero
        console.log('\n📋 1. CONFIGURACIÓN DEL BARBERO:');
        const config = await query(`
            SELECT 
                intervalo_turnos,
                anticipacion_reserva,
                max_reservas_dia
            FROM configuracion_barbero 
            WHERE id_usuario = 1
        `);
        
        if (config.length > 0) {
            console.log('✅ Configuración encontrada:');
            console.log(`   - Intervalo entre turnos: ${config[0].intervalo_turnos} minutos`);
            console.log(`   - Anticipación reserva: ${config[0].anticipacion_reserva} minutos`);
            console.log(`   - Máx reservas por día: ${config[0].max_reservas_dia}`);
        } else {
            console.log('❌ No hay configuración de barbero');
        }
        
        // 2. Verificar servicios y sus duraciones
        console.log('\n📋 2. SERVICIOS Y DURACIONES:');
        const servicios = await query(`
            SELECT id, nombre, duracion, estado
            FROM servicios 
            WHERE estado = 'activo'
            ORDER BY nombre
        `);
        
        servicios.forEach(servicio => {
            console.log(`   - ${servicio.nombre}: ${servicio.duracion} minutos (ID: ${servicio.id})`);
        });
        
        // 3. Verificar horarios laborales para el 18 de agosto (lunes)
        console.log('\n📋 3. HORARIOS LABORALES PARA LUNES:');
        const horariosLunes = await query(`
            SELECT 
                hora_inicio,
                hora_fin,
                pausa_inicio,
                pausa_fin
            FROM horarios_laborales 
            WHERE id_usuario = 1 AND dia_semana = 'lunes'
        `);
        
        if (horariosLunes.length > 0) {
            horariosLunes.forEach(horario => {
                console.log(`   - ${horario.hora_inicio} - ${horario.hora_fin}`);
                if (horario.pausa_inicio && horario.pausa_fin) {
                    console.log(`     Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
                }
            });
        } else {
            console.log('   ❌ No hay horarios configurados para lunes');
        }
        
        // 4. Simular generación de slots para servicio de 45 minutos
        console.log('\n📋 4. SIMULACIÓN DE GENERACIÓN DE SLOTS (45 min):');
        const fecha = '2025-08-18';
        const serviceDuration = 45;
        const bufferTime = 5;
        
        console.log(`   Fecha: ${fecha}`);
        console.log(`   Duración servicio: ${serviceDuration} minutos`);
        console.log(`   Buffer: ${bufferTime} minutos`);
        console.log(`   Intervalo total: ${serviceDuration + bufferTime} minutos`);
        
        // Simular slots desde 9:00 hasta 17:00
        const startTime = new Date(`2000-01-01T09:00:00`);
        const endTime = new Date(`2000-01-01T17:00:00`);
        let currentTime = new Date(startTime);
        
        console.log('\n   Slots generados:');
        let slotCount = 0;
        while (currentTime < endTime) {
            const slotStart = currentTime.toTimeString().slice(0, 5);
            const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
            const slotEndStr = slotEnd.toTimeString().slice(0, 5);
            
            console.log(`   ${slotCount + 1}. ${slotStart} - ${slotEndStr} (${serviceDuration} min)`);
            
            // Avanzar al siguiente slot
            currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
            slotCount++;
        }
        
        // 5. Verificar si hay algún problema en la base de datos
        console.log('\n📋 5. VERIFICACIÓN DE BASE DE DATOS:');
        const turnosExistentes = await query(`
            SELECT 
                fecha,
                hora_inicio,
                hora_fin,
                estado,
                id_servicio
            FROM turnos 
            WHERE fecha = ? AND estado IN ('reservado', 'confirmado', 'en_proceso')
            ORDER BY hora_inicio
        `, [fecha]);
        
        if (turnosExistentes.length > 0) {
            console.log(`   ✅ Citas existentes para ${fecha}:`);
            turnosExistentes.forEach(turno => {
                console.log(`      - ${turno.hora_inicio} - ${turno.hora_fin} (${turno.estado})`);
            });
        } else {
            console.log(`   ℹ️  No hay citas activas para ${fecha}`);
        }
        
        // 6. Verificar si hay algún problema con el controlador
        console.log('\n📋 6. VERIFICACIÓN DEL CONTROLADOR:');
        console.log('   - publicController.getAvailableSlots llama a BookingController.getAvailableSlots');
        console.log('   - BookingController.getAvailableSlots usa generateSmartSlots');
        console.log('   - generateSmartSlots genera slots basados en serviceDuration + bufferTime');
        
        // 7. Verificar la diferencia entre lo que debería ser y lo que se ve
        console.log('\n📋 7. ANÁLISIS DEL PROBLEMA:');
        console.log('   PROBLEMA REPORTADO: Frontend muestra slots cada 75 minutos');
        console.log('   ESPERADO: Slots cada 50 minutos (45 min servicio + 5 min buffer)');
        console.log('   DIFERENCIA: 75 - 50 = 25 minutos extra');
        console.log('   POSIBLES CAUSAS:');
        console.log('     a) Algoritmo de generación de slots incorrecto');
        console.log('     b) Cálculo de buffer incorrecto');
        console.log('     c) Lógica de frontend que recalcula tiempos');
        console.log('     d) Conflicto entre diferentes configuraciones');
        
        console.log('\n🔍 CONCLUSIÓN:');
        console.log('   Si el backend está generando slots correctos (50 min para 45 min servicio),');
        console.log('   pero el frontend muestra 75 min, el problema está en:');
        console.log('   1. Caché del navegador (ya intentado)');
        console.log('   2. JavaScript del frontend que recalcula los tiempos');
        console.log('   3. Algún script externo que interfiere');
        console.log('   4. Problema de sincronización entre frontend y backend');
        console.log('   5. Lógica de generación de slots en el backend');
        
    } catch (error) {
        console.error('❌ Error durante el debug:', error);
    }
}

// Ejecutar el debug
debugFrontendSlotTiming().then(() => {
    console.log('\n✅ Debug completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
