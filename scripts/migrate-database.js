const { query } = require('../config/db');

async function migrateDatabase() {
    try {
        console.log('🚀 Iniciando migración de la base de datos...\n');

        // 1. Verificar estructura actual de la tabla servicios
        console.log('1️⃣ Verificando estructura actual de la tabla servicios...');
        const tableStructure = await query(`
            DESCRIBE servicios
        `);
        
        const hasDuracion = tableStructure.some(col => col.Field === 'duracion');
        if (hasDuracion) {
            console.log('✅ Campo duracion ya existe en la tabla servicios');
            console.log('🎯 No es necesaria la migración');
            return;
        }

        console.log('❌ Campo duracion NO encontrado. Iniciando migración...\n');

        // 2. Agregar campo duracion
        console.log('2️⃣ Agregando campo duracion a la tabla servicios...');
        await query(`
            ALTER TABLE servicios 
            ADD COLUMN duracion INT NOT NULL DEFAULT 30 COMMENT 'Duración del servicio en minutos'
        `);
        console.log('✅ Campo duracion agregado exitosamente');

        // 3. Actualizar servicios existentes con duraciones típicas
        console.log('\n3️⃣ Actualizando servicios existentes con duraciones típicas...');
        
        // Citas simples: 30 minutos
        const resultCortes = await query(`
            UPDATE servicios 
            SET duracion = 30 
            WHERE nombre LIKE '%corte%' AND nombre NOT LIKE '%barba%'
        `);
        console.log(`   ✅ ${resultCortes.affectedRows} servicios de corte actualizados a 30 min`);

        // Citas con barba: 60 minutos
        const resultBarba = await query(`
            UPDATE servicios 
            SET duracion = 60 
            WHERE nombre LIKE '%barba%' OR nombre LIKE '%completo%'
        `);
        console.log(`   ✅ ${resultBarba.affectedRows} servicios con barba actualizados a 60 min`);

        // Citas mixtas: 45 minutos
        const resultMixtos = await query(`
            UPDATE servicios 
            SET duracion = 45 
            WHERE nombre LIKE '%corte%' AND nombre LIKE '%barba%'
        `);
        console.log(`   ✅ ${resultMixtos.affectedRows} servicios mixtos actualizados a 45 min`);

        // Servicios rápidos: 20 minutos
        const resultRapidos = await query(`
            UPDATE servicios 
            SET duracion = 20 
            WHERE nombre LIKE '%peinado%' OR nombre LIKE '%arreglo%'
        `);
        console.log(`   ✅ ${resultRapidos.affectedRows} servicios rápidos actualizados a 20 min`);

        // Servicios muy rápidos: 15 minutos
        const resultMuyRapidos = await query(`
            UPDATE servicios 
            SET duracion = 15 
            WHERE nombre LIKE '%arreglo%' OR nombre LIKE '%tinte%'
        `);
        console.log(`   ✅ ${resultMuyRapidos.affectedRows} servicios muy rápidos actualizados a 15 min`);

        // 4. Verificar que todos los servicios tengan duración
        console.log('\n4️⃣ Verificando que todos los servicios tengan duración...');
        const serviciosSinDuracion = await query(`
            SELECT COUNT(*) as total FROM servicios WHERE duracion IS NULL OR duracion = 0
        `);

        if (serviciosSinDuracion[0].total > 0) {
            console.log(`⚠️  ${serviciosSinDuracion[0].total} servicios aún no tienen duración configurada`);
            console.log('   Configurando duración por defecto (30 min)...');
            
            await query(`
                UPDATE servicios 
                SET duracion = 30 
                WHERE duracion IS NULL OR duracion = 0
            `);
            console.log('✅ Duración por defecto configurada');
        } else {
            console.log('✅ Todos los servicios tienen duración configurada');
        }

        // 5. Mostrar servicios con sus duraciones
        console.log('\n5️⃣ Servicios con sus duraciones configuradas:');
        const servicios = await query(`
            SELECT id, nombre, precio, duracion, estado 
            FROM servicios 
            ORDER BY id
        `);
        
        servicios.forEach((servicio, index) => {
            const duracionFormateada = servicio.duracion >= 60 
                ? `${Math.floor(servicio.duracion/60)}h ${servicio.duracion%60}min`
                : `${servicio.duracion} min`;
            
            console.log(`   ${index + 1}. ${servicio.nombre}`);
            console.log(`      Precio: $${servicio.precio} | Duración: ${duracionFormateada} | Estado: ${servicio.estado}`);
        });

        // 6. Verificar estructura final
        console.log('\n6️⃣ Verificando estructura final de la tabla...');
        const finalStructure = await query(`
            DESCRIBE servicios
        `);
        
        const duracionField = finalStructure.find(col => col.Field === 'duracion');
        if (duracionField) {
            console.log('✅ Migración completada exitosamente');
            console.log(`   Campo duracion: ${duracionField.Type} ${duracionField.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${duracionField.Default ? `DEFAULT ${duracionField.Default}` : ''}`);
        } else {
            console.log('❌ Error: Campo duracion no se agregó correctamente');
        }

        console.log('\n🎯 Ahora puedes:');
        console.log('   1. Crear nuevos servicios con duración personalizada');
        console.log('   2. Editar servicios existentes para ajustar duración');
        console.log('   3. El sistema generará turnos basándose en la duración real del servicio');

    } catch (error) {
        console.error('❌ Error durante la migración:', error);
        console.log('\n🔧 Solución manual:');
        console.log('   Ejecuta en MySQL:');
        console.log('   ALTER TABLE servicios ADD COLUMN duracion INT NOT NULL DEFAULT 30;');
    } finally {
        process.exit(0);
    }
}

// Ejecutar migración
console.log('🚀 Script de migración para el nuevo sistema de duración por servicio');
console.log('⚠️  Asegúrate de tener un backup de la base de datos antes de continuar');
console.log('\n¿Continuar con la migración? (Ctrl+C para cancelar)');

// Esperar 5 segundos antes de ejecutar
setTimeout(() => {
    console.log('\n⏰ Ejecutando migración en 3 segundos...');
    setTimeout(() => {
        migrateDatabase();
    }, 3000);
}, 5000);
