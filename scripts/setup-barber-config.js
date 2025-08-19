const mysql = require('mysql2/promise');

async function setupBarberConfig() {
    let connection;
    
    try {
        console.log('🔧 Configurando barbero...\n');
        
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
        
        // Obtener el ID del usuario barbero
        console.log('📋 Obteniendo usuario barbero...');
        const [users] = await connection.execute(`
            SELECT id, nombre, apellido, email, rol
            FROM usuarios 
            WHERE rol = 'barbero' AND estado = 'activo'
        `);
        
        if (users.length === 0) {
            console.log('❌ No se encontró ningún barbero activo');
            return;
        }
        
        const barber = users[0];
        console.log(`✅ Barbero encontrado: ${barber.nombre} ${barber.apellido} (ID: ${barber.id})\n`);
        
        // Verificar configuración del barbero
        console.log('📋 Verificando configuración del barbero...');
        const [barberConfig] = await connection.execute(`
            SELECT * FROM configuracion_barbero WHERE id_usuario = ?
        `, [barber.id]);
        
        if (barberConfig.length === 0) {
            console.log('🔄 Creando configuración del barbero...');
            await connection.execute(`
                INSERT INTO configuracion_barbero (id_usuario, intervalo_turnos)
                VALUES (?, 30)
            `, [barber.id]);
            console.log('✅ Configuración del barbero creada');
        } else {
            console.log('✅ Configuración del barbero ya existe');
        }
        
        // Verificar horarios laborales
        console.log('\n📋 Verificando horarios laborales...');
        const [schedules] = await connection.execute(`
            SELECT * FROM horarios_laborales WHERE id_usuario = ?
        `, [barber.id]);
        
        if (schedules.length === 0) {
            console.log('🔄 Creando horarios laborales...');
            
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
                `, [barber.id, diasSemana[i], horarios[i].hora_inicio, horarios[i].hora_fin]);
            }
            
            console.log('✅ Horarios laborales creados');
        } else {
            console.log(`✅ ${schedules.length} horarios laborales ya existen`);
        }
        
        // Crear algunos servicios de ejemplo
        console.log('\n📋 Verificando servicios...');
        const [services] = await connection.execute(`
            SELECT * FROM servicios WHERE id_usuario = ?
        `, [barber.id]);
        
        if (services.length === 0) {
            console.log('🔄 Creando servicios de ejemplo...');
            
            const serviciosEjemplo = [
                {
                    nombre: 'Corte Clásico',
                    descripcion: 'Corte tradicional con tijera y navaja',
                    precio: 2500.00,
                    precio_anterior: null
                },
                {
                    nombre: 'Corte Moderno',
                    descripcion: 'Corte con técnicas modernas y acabado premium',
                    precio: 3000.00,
                    precio_anterior: 3500.00
                },
                {
                    nombre: 'Barba',
                    descripcion: 'Arreglo y modelado de barba',
                    precio: 1500.00,
                    precio_anterior: null
                },
                {
                    nombre: 'Corte + Barba',
                    descripcion: 'Corte completo con arreglo de barba',
                    precio: 3500.00,
                    precio_anterior: 4000.00
                }
            ];
            
            for (const servicio of serviciosEjemplo) {
                await connection.execute(`
                    INSERT INTO servicios (nombre, descripcion, precio, precio_anterior, id_usuario, estado)
                    VALUES (?, ?, ?, ?, ?, 'activo')
                `, [servicio.nombre, servicio.descripcion, servicio.precio, servicio.precio_anterior, barber.id]);
            }
            
            console.log('✅ Servicios de ejemplo creados');
        } else {
            console.log(`✅ ${services.length} servicios ya existen`);
        }
        
        console.log('\n🎉 Configuración completada exitosamente!');
        console.log('El sistema está listo para funcionar.');
        
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
setupBarberConfig();

