const mysql = require('mysql2/promise');

async function checkDatabase() {
    let connection;
    
    try {
        console.log('🔍 Verificando base de datos...\n');
        
        // Configuración de conexión sin especificar base de datos
        const dbConfig = {
            host: 'localhost',
            user: 'root',
            password: ''
        };
        
        // Conectar a MySQL sin especificar base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a MySQL establecida\n');
        
        // Verificar si la base de datos existe
        console.log('📋 Verificando si existe la base de datos barberia_db...');
        const [databases] = await connection.execute('SHOW DATABASES');
        
        const dbExists = databases.some(db => db.Database === 'barberia_db');
        
        if (dbExists) {
            console.log('✅ La base de datos barberia_db existe');
        } else {
            console.log('❌ La base de datos barberia_db no existe');
            console.log('🔄 Creando base de datos...');
            await connection.execute('CREATE DATABASE barberia_db');
            console.log('✅ Base de datos barberia_db creada');
        }
        
        // Cambiar a la base de datos
        await connection.execute('USE barberia_db');
        console.log('✅ Conectado a la base de datos barberia_db\n');
        
        // Verificar tablas
        console.log('📋 Verificando tablas...');
        const [tables] = await connection.execute('SHOW TABLES');
        
        if (tables.length === 0) {
            console.log('❌ No hay tablas en la base de datos');
            console.log('🔄 Ejecutando esquema...');
            
            // Leer y ejecutar el esquema
            const fs = require('fs');
            const path = require('path');
            const schemaPath = path.join(__dirname, '..', 'sql', 'schema.sql');
            
            if (fs.existsSync(schemaPath)) {
                const schema = fs.readFileSync(schemaPath, 'utf8');
                const statements = schema.split(';').filter(stmt => stmt.trim());
                
                for (const statement of statements) {
                    if (statement.trim()) {
                        await connection.execute(statement);
                    }
                }
                console.log('✅ Esquema ejecutado correctamente');
            } else {
                console.log('❌ No se encontró el archivo schema.sql');
            }
        } else {
            console.log(`✅ ${tables.length} tablas encontradas:`);
            tables.forEach(table => {
                console.log(`   - ${Object.values(table)[0]}`);
            });
        }
        
        // Verificar usuarios
        console.log('\n📋 Verificando usuarios...');
        const [users] = await connection.execute('SELECT * FROM usuarios');
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            console.log('🔄 Creando usuario admin...');
            
            await connection.execute(`
                INSERT INTO usuarios (nombre, apellido, email, password, rol, estado, nombre_barberia)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, ['Administrador', 'Sistema', 'admin@barberia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'barbero', 'activo', 'Barbería Alexis Allendez']);
            
            console.log('✅ Usuario admin creado');
        } else {
            console.log(`✅ ${users.length} usuarios encontrados:`);
            users.forEach(user => {
                console.log(`   - ${user.nombre} ${user.apellido} (${user.email}) - Rol: ${user.rol}`);
            });
        }
        
        console.log('\n🎉 Verificación completada!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la función
checkDatabase();

