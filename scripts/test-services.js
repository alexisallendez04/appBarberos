const { query, getConnection } = require('../config/db');

async function testServices() {
    let connection;
    
    try {
        // Crear conexión usando la configuración del proyecto
        connection = await getConnection();
        console.log('✅ Conexión a la base de datos establecida');

        // Verificar usuarios
        console.log('\n📋 Verificando usuarios...');
        const [users] = await connection.execute(`
            SELECT id, nombre, apellido, email, rol, estado 
            FROM usuarios 
            ORDER BY id
        `);
        
        console.log('Usuarios encontrados:');
        users.forEach(user => {
            console.log(`  ID: ${user.id} | ${user.nombre} ${user.apellido} | ${user.email} | Rol: ${user.rol} | Estado: ${user.estado}`);
        });

        // Verificar servicios
        console.log('\n📋 Verificando servicios...');
        const [services] = await connection.execute(`
            SELECT 
                s.id,
                s.nombre,
                s.descripcion,
                s.precio,
                s.duracion,
                s.estado,
                s.id_usuario,
                u.nombre as barbero_nombre,
                u.apellido as barbero_apellido
            FROM servicios s
            LEFT JOIN usuarios u ON s.id_usuario = u.id
            ORDER BY s.id
        `);
        
        console.log('Servicios encontrados:');
        if (services.length === 0) {
            console.log('  ❌ No se encontraron servicios');
        } else {
            services.forEach(service => {
                console.log(`  ID: ${service.id} | ${service.nombre} | $${service.precio} | ${service.duracion}min | Estado: ${service.estado} | Barbero: ${service.barbero_nombre} ${service.barbero_apellido} (ID: ${service.id_usuario})`);
            });
        }

        // Verificar servicios activos del barbero principal (ID 2)
        console.log('\n📋 Verificando servicios activos del barbero principal (ID 2)...');
        const [activeServices] = await connection.execute(`
            SELECT 
                s.id,
                s.nombre,
                s.descripcion,
                s.precio,
                s.duracion,
                s.estado
            FROM servicios s
            INNER JOIN usuarios u ON s.id_usuario = u.id
            WHERE s.estado = 'activo' AND u.estado = 'activo' AND u.id = 2
            ORDER BY s.nombre ASC
        `);
        
        console.log('Servicios activos del barbero principal:');
        if (activeServices.length === 0) {
            console.log('  ❌ No se encontraron servicios activos');
        } else {
            activeServices.forEach(service => {
                console.log(`  ID: ${service.id} | ${service.nombre} | $${service.precio} | ${service.duracion}min`);
            });
        }

        // Verificar si hay servicios sin estado
        console.log('\n📋 Verificando servicios sin estado...');
        const [servicesWithoutState] = await connection.execute(`
            SELECT id, nombre, estado FROM servicios WHERE estado IS NULL
        `);
        
        if (servicesWithoutState.length > 0) {
            console.log('Servicios sin estado:');
            servicesWithoutState.forEach(service => {
                console.log(`  ID: ${service.id} | ${service.nombre} | Estado: ${service.estado}`);
            });
        } else {
            console.log('  ✅ Todos los servicios tienen estado');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la prueba
testServices(); 