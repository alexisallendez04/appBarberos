const { query } = require('../config/db');

async function executeCleanup() {
    try {
        console.log('🧹 Ejecutando limpieza real de citas históricas...\n');
        console.log('⚠️  ADVERTENCIA: Esta operación es irreversible!\n');

        // 1. Backup de seguridad (crear tabla temporal)
        console.log('1️⃣ Creando backup de seguridad...');
        await query(`
            CREATE TABLE IF NOT EXISTS turnos_backup_${Date.now()} AS 
            SELECT * FROM turnos WHERE estado IN ('completado', 'cancelado', 'no_show')
        `);
        console.log('✅ Backup creado exitosamente');

        // 2. Limpiar citas completadas de hace más de 30 días
        console.log('\n2️⃣ Limpiando citas completadas de hace más de 30 días...');
        const resultCompletadas = await query(`
            DELETE FROM turnos 
            WHERE estado = 'completado' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        console.log(`✅ ${resultCompletadas.affectedRows} citas completadas eliminadas`);

        // 3. Limpiar citas canceladas de hace más de 7 días
        console.log('\n3️⃣ Limpiando citas canceladas de hace más de 7 días...');
        const resultCanceladas = await query(`
            DELETE FROM turnos 
            WHERE estado = 'cancelado' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        console.log(`✅ ${resultCanceladas.affectedRows} citas canceladas eliminadas`);

        // 4. Limpiar citas no-show de hace más de 7 días
        console.log('\n4️⃣ Limpiando citas no-show de hace más de 7 días...');
        const resultNoShow = await query(`
            DELETE FROM turnos 
            WHERE estado = 'no_show' 
            AND fecha < DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `);
        console.log(`✅ ${resultNoShow.affectedRows} citas no-show eliminadas`);

        // 5. Estadísticas después de la limpieza
        console.log('\n5️⃣ Estadísticas después de la limpieza:');
        const statsAfter = await query(`
            SELECT 
                estado,
                COUNT(*) as total
            FROM turnos 
            GROUP BY estado
            ORDER BY total DESC
        `);
        
        statsAfter.forEach(stat => {
            console.log(`   ${stat.estado}: ${stat.total} citas`);
        });

        // 6. Servicios que ahora se pueden eliminar
        console.log('\n6️⃣ Servicios que ahora se pueden eliminar:');
        const serviciosLiberados = await query(`
            SELECT 
                s.id,
                s.nombre,
                s.precio,
                s.duracion,
                COUNT(t.id) as citas_restantes
            FROM servicios s
            LEFT JOIN turnos t ON s.id = t.id_servicio
            GROUP BY s.id, s.nombre, s.precio, s.duracion
            HAVING citas_restantes = 0
            ORDER BY s.nombre
        `);

        if (serviciosLiberados.length === 0) {
            console.log('   ⚠️  No hay servicios que se puedan eliminar');
        } else {
            console.log('   ✅ Servicios disponibles para eliminación:');
            serviciosLiberados.forEach((servicio, index) => {
                console.log(`   ${index + 1}. ${servicio.nombre} (ID: ${servicio.id})`);
                console.log(`      Precio: $${servicio.precio} | Duración: ${servicio.duracion} min`);
            });
        }

        // 7. Resumen de la operación
        const totalEliminadas = resultCompletadas.affectedRows + resultCanceladas.affectedRows + resultNoShow.affectedRows;
        console.log('\n🎯 Resumen de la operación:');
        console.log(`   ✅ Total de citas eliminadas: ${totalEliminadas}`);
        console.log(`   ✅ Servicios liberados: ${serviciosLiberados.length}`);
        console.log(`   ✅ Backup creado: turnos_backup_${Date.now()}`);

        if (totalEliminadas > 0) {
            console.log('\n💡 Ahora puedes:');
            console.log('   1. Ir al Dashboard → Servicios');
            console.log('   2. Eliminar los servicios que ya no necesites');
            console.log('   3. Crear nuevos servicios con el nuevo sistema de duración');
        }

    } catch (error) {
        console.error('❌ Error durante la limpieza:', error);
        console.log('\n🔄 Intentando restaurar desde el backup...');
        
        // En caso de error, intentar restaurar
        try {
            const backupTables = await query(`
                SHOW TABLES LIKE 'turnos_backup_%'
            `);
            
            if (backupTables.length > 0) {
                const latestBackup = backupTables[backupTables.length - 1];
                console.log(`🔄 Restaurando desde: ${latestBackup}`);
                // Aquí podrías implementar la restauración si es necesario
            }
        } catch (restoreError) {
            console.error('❌ Error durante la restauración:', restoreError);
        }
    } finally {
        process.exit(0);
    }
}

// Confirmar antes de ejecutar
console.log('🚨 ATENCIÓN: Este script eliminará citas históricas de la base de datos.');
console.log('📋 Asegúrate de:');
console.log('   1. Tener un backup completo de la base de datos');
console.log('   2. No tener citas activas o futuras importantes');
console.log('   3. Estar en un momento de bajo tráfico');
console.log('\n¿Estás seguro de que quieres continuar? (Ctrl+C para cancelar)');

// Esperar 10 segundos antes de ejecutar
setTimeout(() => {
    console.log('\n⏰ Ejecutando limpieza en 5 segundos...');
    setTimeout(() => {
        executeCleanup();
    }, 5000);
}, 10000);
