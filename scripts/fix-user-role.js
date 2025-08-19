const mysql = require('mysql2/promise');

async function fixUserRole() {
    let connection;
    
    try {
        console.log('🔧 Corrigiendo rol de usuario...\n');
        
        // Configuración de la base de datos
        const dbConfig = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'barberia_db'
        };
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida\n');
        
        // Verificar usuario actual
        console.log('📋 Verificando usuario actual...');
        const [currentUser] = await connection.execute(`
            SELECT id, nombre, apellido, email, rol, estado
            FROM usuarios 
            WHERE email = 'admin@barberia.com'
        `);
        
        if (currentUser.length === 0) {
            console.log('❌ No se encontró el usuario admin@barberia.com');
            return;
        }
        
        const user = currentUser[0];
        console.log(`📋 Usuario encontrado:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Nombre: ${user.nombre} ${user.apellido}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Rol actual: ${user.rol}`);
        console.log(`   Estado: ${user.estado}\n`);
        
        // Cambiar rol a barbero
        console.log('🔄 Cambiando rol de admin a barbero...');
        await connection.execute(`
            UPDATE usuarios 
            SET rol = 'barbero' 
            WHERE id = ?
        `, [user.id]);
        
        console.log('✅ Rol cambiado exitosamente\n');
        
        // Verificar el cambio
        console.log('📋 Verificando cambio...');
        const [updatedUser] = await connection.execute(`
            SELECT id, nombre, apellido, email, rol, estado
            FROM usuarios 
            WHERE id = ?
        `, [user.id]);
        
        console.log(`✅ Usuario actualizado:`);
        console.log(`   ID: ${updatedUser[0].id}`);
        console.log(`   Nombre: ${updatedUser[0].nombre} ${updatedUser[0].apellido}`);
        console.log(`   Email: ${updatedUser[0].email}`);
        console.log(`   Rol nuevo: ${updatedUser[0].rol}`);
        console.log(`   Estado: ${updatedUser[0].estado}\n`);
        
        // Verificar configuración del barbero
        console.log('📋 Verificando configuración del barbero...');
        const [barberConfig] = await connection.execute(`
            SELECT * FROM configuracion_barbero WHERE id_usuario = ?
        `, [user.id]);
        
        if (barberConfig.length === 0) {
            console.log('⚠️  No se encontró configuración del barbero, creando...');
            await connection.execute(`
                INSERT INTO configuracion_barbero (id_usuario, intervalo_turnos)
                VALUES (?, 30)
            `, [user.id]);
            console.log('✅ Configuración del barbero creada');
        } else {
            console.log('✅ Configuración del barbero encontrada');
        }
        
        // Verificar horarios laborales
        console.log('\n📋 Verificando horarios laborales...');
        const [schedules] = await connection.execute(`
            SELECT * FROM horarios_laborales WHERE id_usuario = ?
        `, [user.id]);
        
        if (schedules.length === 0) {
            console.log('⚠️  No se encontraron horarios laborales, creando horarios por defecto...');
            
            const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const horarios = [
                { hora_inicio: '09:00', hora_fin: '18:00' },
                { hora_inicio: '09:00', hora_fin: '18:00' },
                { hora_inicio: '09:00', hora_fin: '18:00' },
                { hora_inicio: '09:00', hora_fin: '18:00' },
                { hora_inicio: '09:00', hora_fin: '18:00' },
                { hora_inicio: '09:00', hora_fin: '16:00' }
            ];
            
            for (let i = 0; i < diasSemana.length; i++) {
                await connection.execute(`
                    INSERT INTO horarios_laborales (id_usuario, dia_semana, hora_inicio, hora_fin, estado)
                    VALUES (?, ?, ?, ?, 'activo')
                `, [user.id, diasSemana[i], horarios[i].hora_inicio, horarios[i].hora_fin]);
            }
            
            console.log('✅ Horarios laborales creados');
        } else {
            console.log(`✅ ${schedules.length} horarios laborales encontrados`);
        }
        
        console.log('\n🎉 Corrección completada exitosamente!');
        console.log('El sistema ahora debería funcionar correctamente.');
        
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
fixUserRole();

