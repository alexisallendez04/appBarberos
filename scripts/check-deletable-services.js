const { query } = require('../config/db');

async function checkDeletableServices() {
    try {
        console.log('🔍 Verificando servicios que se pueden eliminar...\n');

        // Verificar servicios con citas activas
        const serviciosConCitasActivas = await query(`
            SELECT 
                s.id,
                s.nombre,
                s.precio,
                s.duracion,
                COUNT(t.id) as citas_activas
            FROM servicios s
            LEFT JOIN turnos t ON s.id = t.id_servicio 
                AND t.estado IN ('reservado', 'confirmado', 'en_proceso')
                AND (t.fecha > CURDATE() OR (t.fecha = CURDATE() AND t.hora_fin > CURTIME()))
            GROUP BY s.id, s.nombre, s.precio, s.duracion
            HAVING citas_activas > 0
            ORDER BY s.nombre
        `);

        if (serviciosConCitasActivas.length > 0) {
            console.log('❌ Servicios que NO se pueden eliminar (tienen citas activas):');
            serviciosConCitasActivas.forEach((servicio, index) => {
                console.log(`   ${index + 1}. ${servicio.nombre} (ID: ${servicio.id})`);
                console.log(`      Precio: $${servicio.precio} | Duración: ${servicio.duracion} min`);
                console.log(`      Citas activas: ${servicio.citas_activas}`);
                console.log('');
            });
        } else {
            console.log('✅ No hay servicios con citas activas');
        }

        // Verificar servicios que SÍ se pueden eliminar
        const serviciosDeletables = await query(`
            SELECT 
                s.id,
                s.nombre,
                s.precio,
                s.duracion,
                COUNT(t.id) as citas_historicas
            FROM servicios s
            LEFT JOIN turnos t ON s.id = t.id_servicio
            GROUP BY s.id, s.nombre, s.precio, s.duracion
            HAVING citas_historicas = 0
            ORDER BY s.nombre
        `);

        if (serviciosDeletables.length > 0) {
            console.log('✅ Servicios que SÍ se pueden eliminar:');
            serviciosDeletables.forEach((servicio, index) => {
                console.log(`   ${index + 1}. ${servicio.nombre} (ID: ${servicio.id})`);
                console.log(`      Precio: $${servicio.precio} | Duración: ${servicio.duracion} min`);
                console.log(`      Citas históricas: ${servicio.citas_historicas}`);
            });
        } else {
            console.log('❌ No hay servicios que se puedan eliminar');
        }

        // Resumen
        console.log('\n📊 Resumen:');
        console.log(`   Total servicios: ${serviciosConCitasActivas.length + serviciosDeletables.length}`);
        console.log(`   No eliminables: ${serviciosConCitasActivas.length}`);
        console.log(`   Eliminables: ${serviciosDeletables.length}`);

        if (serviciosDeletables.length === 0) {
            console.log('\n💡 Para liberar servicios, ejecuta:');
            console.log('   node scripts/cleanup-historical-appointments.js');
            console.log('   (para ver qué se puede limpiar)');
        }

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar verificación
checkDeletableServices();
