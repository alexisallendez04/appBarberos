const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function recreateDatabase() {
    let connection;
    
    try {
        console.log('🔄 Recreando base de datos...');
        
        // Conectar sin especificar base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'Alexis83',
            password: process.env.DB_PASSWORD || 'TukiTuki12',
            port: process.env.DB_PORT || 3308,
            charset: 'utf8mb4'
        });
        
        // Eliminar base de datos si existe
        console.log('🗑️  Eliminando base de datos existente...');
        await connection.query('DROP DATABASE IF EXISTS barberia_db');
        
        // Crear nueva base de datos
        console.log('📝 Creando nueva base de datos...');
        await connection.query('CREATE DATABASE barberia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
        
        // Usar la nueva base de datos
        await connection.query('USE barberia_db');
        
        // Leer y ejecutar schema
        console.log('📖 Ejecutando schema...');
        const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Dividir en sentencias individuales
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.query(statement);
                } catch (error) {
                    console.log(`⚠️  Error en sentencia: ${error.message}`);
                }
            }
        }
        
        // Leer y ejecutar datos de ejemplo
        console.log('📋 Insertando datos de ejemplo...');
        const sampleDataPath = path.join(__dirname, '..', 'sql', 'sample-data.sql');
        if (fs.existsSync(sampleDataPath)) {
            const sampleData = fs.readFileSync(sampleDataPath, 'utf8');
            const sampleStatements = sampleData
                .split(';')
                .map(stmt => stmt.trim())
                .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
            
            for (const statement of sampleStatements) {
                if (statement.trim()) {
                    try {
                        await connection.query(statement);
                    } catch (error) {
                        console.log(`⚠️  Error en datos de ejemplo: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Base de datos recreada exitosamente!');
        console.log('📋 Credenciales de acceso:');
        console.log('   Email: admin@barberia.com');
        console.log('   Contraseña: admin123');
        
    } catch (error) {
        console.error('❌ Error al recrear la base de datos:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar la recreación
recreateDatabase(); 