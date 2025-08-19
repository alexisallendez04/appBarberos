const { query } = require('../config/db');

async function cleanupHistoricalAppointments() {
    try {
        console.log('🧹 Iniciando limpieza de citas históricas...\n');

        // 1. Mostrar estadísticas actuales
        console.log('1️⃣ Estadísticas actuales de citas:');
        const stats = await query(`
            SELECT 
                estado,
                COUNT(*) as total,
                MIN(fecha) as fecha_mas_antigua,
                MAX(fecha) as fecha_mas_reciente
            FROM turnos 
            GROUP BY estado
            ORDER BY total DESC
        `);
        
        stats.forEach(stat => {
            console.log(`   ${stat.estado}: ${stat.total} citas (${stat.fecha_mas_antigua} - ${stat.fecha_mas_reciente})`);
        });

        // 2. Mostrar servicios con citas históricas
        console.log('\n2️⃣ Servicios con citas históricas:');
        const serviciosConHistorial = await query(`
            SELECT 
                s.id,
                s.nombre,
                s.precio,
                s.duracion,
                COUNT(t.id) as total_citas,
                SUM(CASE WHEN t.estado = 'completado' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN t.estado = 'cancelado' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN t.estado = 'no_show' THEN 1 ELSE 0 END) as no_show,
                MAX(t.fecha) as ultima_cita
            FROM servicios s
            LEFT JOIN turnos t ON s.id = t.id_servicio
            WHERE t.estado IN ('completado', 'cancelado', 'no_show')
            GROUP BY s.id, s.nombre, s.precio, s.duracion
            HAVING total_citas > 0
            ORDER BY total_citas DESC
        `);

        if (serviciosConHistorial.length === 0) {
            console.log('   ✅ No hay servicios con citas históricas');
        } else {
            serviciosConHistorial.forEach((servicio, index) => {
                console.log(`   ${index + 1}. ${servicio.nombre}`);
                console.log(`      Precio: $${servicio.precio} | Duración: ${servicio.duracion} min`);
                console.log(`      Total citas: ${servicio.total_citas}`);
                console.log(`      Completadas: ${servicio.completadas} | Canceladas: ${servicio.canceladas} | No-show: ${servicio.no_show}`);
                console.log(`      Última cita: ${servicio.ultima_cita}`);
                console.log('');
            });
        }

        // 3. Mostrar citas históricas por fecha
        console.log('3️⃣ Citas históricas por fecha:');
        const citasPorFecha = await query(`
            SELECT 
                fecha,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completadas,
                SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as canceladas,
                SUM(CASE WHEN estado = 'no_show' THEN 1 ELSE 0 END) as no_show
            FROM turnos 
            WHERE estado IN ('completado', 'cancelado', 'no_show')
            AND fecha < CURDATE()
            GROUP BY fecha
            ORDER BY fecha DESC
            LIMIT 10
        `);

        if (citasPorFecha.length === 0) {
            console.log('   ✅ No hay citas históricas');
        } else {
            citasPorFecha.forEach((fecha, index) => {
                console.log(`   ${index + 1}. ${fecha.fecha}: ${fecha.total} citas`);
                console.log(`      Completadas: ${fecha.completadas} | Canceladas: ${fecha.canceladas} | No-show: ${fecha.no_show}`);
            });
        }

        // 4. Opciones de limpieza
        console.log('\n4️⃣ Opciones de limpieza disponibles:');
        console.log('   A) Limpiar citas completadas de hace más de 30 días');
        console.log('   B) Limpiar citas canceladas de hace más de 7 días');
        console.log('   C) Limpiar citas no-show de hace más de 7 días');
        console.log('   D) Limpiar todas las citas históricas (completadas, canceladas, no-show)');
        console.log('   E) Solo mostrar información (sin limpiar)');

        // 5. Simular limpieza (sin ejecutar)
        console.log('\n5️⃣ Simulación de limpieza (sin ejecutar):');
        
        // Citas completadas antiguas
        const citasCompletadasAntiguas = await query(`
            SELECT COUNT(*) as total FROM turnos 
            WHERE estado = 'completado' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        console.log(`   Citas completadas de hace más de 30 días: ${citasCompletadasAntiguas[0].total}`);

        // Citas canceladas antiguas
        const citasCanceladasAntiguas = await query(`
            SELECT COUNT(*) as total FROM turnos 
            WHERE estado = 'cancelado' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        console.log(`   Citas canceladas de hace más de 7 días: ${citasCanceladasAntiguas[0].total}`);

        // Citas no-show antiguas
        const citasNoShowAntiguas = await query(`
            SELECT COUNT(*) as total FROM turnos 
            WHERE estado = 'no_show' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        console.log(`   Citas no-show de hace más de 7 días: ${citasNoShowAntiguas[0].total}`);

        // Total de citas que se podrían limpiar
        const totalLimpieza = citasCompletadasAntiguas[0].total + citasCanceladasAntiguas[0].total + citasNoShowAntiguas[0].total;
        console.log(`   Total de citas que se podrían limpiar: ${totalLimpieza}`);

        // 6. Servicios que se liberarían
        if (totalLimpieza > 0) {
            console.log('\n6️⃣ Servicios que se liberarían después de la limpieza:');
            const serviciosLiberados = await query(`
                SELECT 
                    s.id,
                    s.nombre,
                    COUNT(t.id) as citas_activas
                FROM servicios s
                LEFT JOIN turnos t ON s.id = t.id_servicio 
                    AND t.estado IN ('reservado', 'confirmado', 'en_proceso')
                    AND (t.fecha > CURDATE() OR (t.fecha = CURDATE() AND t.hora_fin > CURTIME()))
                GROUP BY s.id, s.nombre
                HAVING citas_activas = 0
                ORDER BY s.nombre
            `);

            if (serviciosLiberados.length === 0) {
                console.log('   ⚠️  No hay servicios que se liberarían');
            } else {
                serviciosLiberados.forEach((servicio, index) => {
                    console.log(`   ${index + 1}. ${servicio.nombre} (ID: ${servicio.id})`);
                });
            }
        }

        console.log('\n🎯 Para ejecutar la limpieza real, modifica este script y descomenta las líneas correspondientes');
        console.log('⚠️  IMPORTANTE: La limpieza es irreversible. Haz backup antes de ejecutar.');

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la limpieza
cleanupHistoricalAppointments();
