const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function updateDatabase() {
    try {
        console.log('🔄 Iniciando actualización de la base de datos...');
        
        // Sentencias SQL individuales
        const updateStatements = [
            // Agregar campo nombre_barberia
            "ALTER TABLE usuarios ADD COLUMN nombre_barberia VARCHAR(100) NULL AFTER telefono",
            
            // Agregar campo direccion
            "ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(200) NULL AFTER nombre_barberia",
            
            // Agregar campo avatar_url
            "ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(255) NULL AFTER password",
            
            // Crear índices (con manejo de errores si ya existen)
            "CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email)",
            "CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol)",
            "CREATE INDEX IF NOT EXISTS idx_usuarios_estado ON usuarios(estado)"
        ];
        
        console.log('🔧 Ejecutando actualizaciones...');
        
        // Ejecutar cada sentencia individualmente
        for (let i = 0; i < updateStatements.length; i++) {
            const statement = updateStatements[i];
            try {
                console.log(`   Ejecutando: ${statement.substring(0, 50)}...`);
                await pool.execute(statement);
                console.log(`   ✅ Sentencia ${i + 1} ejecutada correctamente`);
            } catch (error) {
                if (error.code === 'ER_DUP_FIELDNAME' || error.code === 'ER_DUP_KEYNAME') {
                    console.log(`   ⚠️  Sentencia ${i + 1} ya existe (normal si ya se ejecutó antes)`);
                } else {
                    console.error(`   ❌ Error en sentencia ${i + 1}:`, error.message);
                }
            }
        }
        
        console.log('\n✅ Base de datos actualizada correctamente');
        console.log('📋 Nuevos campos agregados:');
        console.log('   - nombre_barberia (VARCHAR(100))');
        console.log('   - direccion (VARCHAR(200))');
        console.log('   - avatar_url (VARCHAR(255))');
        console.log('   - Índices de rendimiento');
        
        // Verificar la estructura actualizada
        console.log('\n🔍 Verificando estructura actualizada...');
        const [columns] = await pool.execute(`
            SELECT 
                COLUMN_NAME, 
                DATA_TYPE, 
                IS_NULLABLE, 
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' 
            AND TABLE_NAME = 'usuarios' 
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n📊 Estructura actual de la tabla usuarios:');
        columns.forEach(column => {
            console.log(`   - ${column.COLUMN_NAME}: ${column.DATA_TYPE} ${column.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        console.log('\n🎉 Actualización completada exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la actualización:', error.message);
        console.error('🔧 Detalles del error:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar la actualización
updateDatabase(); 