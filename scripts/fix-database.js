const { pool } = require('../config/db');

async function fixDatabase() {
    try {
        console.log('🔄 Iniciando corrección de la base de datos...');
        
        // Primero seleccionar la base de datos
        await pool.execute('USE barberia_db');
        console.log('✅ Base de datos seleccionada: barberia_db');
        
        // Verificar estructura actual
        console.log('\n🔍 Verificando estructura actual...');
        const [currentColumns] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' 
            AND TABLE_NAME = 'usuarios' 
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('📊 Columnas actuales en la tabla usuarios:');
        currentColumns.forEach(column => {
            console.log(`   - ${column.COLUMN_NAME}: ${column.DATA_TYPE} ${column.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        // Verificar qué campos faltan
        const existingColumns = currentColumns.map(col => col.COLUMN_NAME);
        const requiredColumns = ['nombre_barberia', 'direccion', 'avatar_url'];
        const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
        
        if (missingColumns.length === 0) {
            console.log('\n✅ Todos los campos requeridos ya existen');
        } else {
            console.log(`\n❌ Faltan los siguientes campos: ${missingColumns.join(', ')}`);
            
            // Agregar campos faltantes
            const addColumnStatements = [
                {
                    condition: !existingColumns.includes('nombre_barberia'),
                    sql: "ALTER TABLE usuarios ADD COLUMN nombre_barberia VARCHAR(100) NULL AFTER telefono",
                    description: "Agregando campo nombre_barberia"
                },
                {
                    condition: !existingColumns.includes('direccion'),
                    sql: "ALTER TABLE usuarios ADD COLUMN direccion VARCHAR(200) NULL AFTER nombre_barberia",
                    description: "Agregando campo direccion"
                },
                {
                    condition: !existingColumns.includes('avatar_url'),
                    sql: "ALTER TABLE usuarios ADD COLUMN avatar_url VARCHAR(255) NULL AFTER password",
                    description: "Agregando campo avatar_url"
                }
            ];
            
            console.log('\n🔧 Agregando campos faltantes...');
            for (const statement of addColumnStatements) {
                if (statement.condition) {
                    try {
                        console.log(`   ${statement.description}...`);
                        await pool.execute(statement.sql);
                        console.log(`   ✅ ${statement.description} completado`);
                    } catch (error) {
                        console.log(`   ⚠️  ${statement.description} - ${error.message}`);
                    }
                }
            }
        }
        
        // Verificar índices
        console.log('\n🔍 Verificando índices...');
        const [indexes] = await pool.execute(`
            SELECT INDEX_NAME 
            FROM INFORMATION_SCHEMA.STATISTICS 
            WHERE TABLE_SCHEMA = 'barberia_db' 
            AND TABLE_NAME = 'usuarios'
        `);
        
        const existingIndexes = indexes.map(idx => idx.INDEX_NAME);
        const requiredIndexes = ['idx_usuarios_email', 'idx_usuarios_rol', 'idx_usuarios_estado'];
        const missingIndexes = requiredIndexes.filter(idx => !existingIndexes.includes(idx));
        
        if (missingIndexes.length > 0) {
            console.log(`\n🔧 Agregando índices faltantes: ${missingIndexes.join(', ')}`);
            
            const indexStatements = [
                {
                    name: 'idx_usuarios_email',
                    sql: "CREATE INDEX idx_usuarios_email ON usuarios(email)",
                    condition: !existingIndexes.includes('idx_usuarios_email')
                },
                {
                    name: 'idx_usuarios_rol',
                    sql: "CREATE INDEX idx_usuarios_rol ON usuarios(rol)",
                    condition: !existingIndexes.includes('idx_usuarios_rol')
                },
                {
                    name: 'idx_usuarios_estado',
                    sql: "CREATE INDEX idx_usuarios_estado ON usuarios(estado)",
                    condition: !existingIndexes.includes('idx_usuarios_estado')
                }
            ];
            
            for (const index of indexStatements) {
                if (index.condition) {
                    try {
                        console.log(`   Creando índice ${index.name}...`);
                        await pool.execute(index.sql);
                        console.log(`   ✅ Índice ${index.name} creado`);
                    } catch (error) {
                        console.log(`   ⚠️  Índice ${index.name} - ${error.message}`);
                    }
                }
            }
        } else {
            console.log('✅ Todos los índices ya existen');
        }
        
        // Verificación final
        console.log('\n🔍 Verificación final de la estructura...');
        const [finalColumns] = await pool.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' 
            AND TABLE_NAME = 'usuarios' 
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('\n📊 Estructura final de la tabla usuarios:');
        finalColumns.forEach(column => {
            console.log(`   - ${column.COLUMN_NAME}: ${column.DATA_TYPE} ${column.IS_NULLABLE === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
        });
        
        console.log('\n🎉 Base de datos corregida exitosamente!');
        
    } catch (error) {
        console.error('❌ Error durante la corrección:', error.message);
        console.error('🔧 Detalles del error:', error);
    } finally {
        await pool.end();
    }
}

// Ejecutar la corrección
fixDatabase(); 