const { query, getConnection } = require('../config/db');

async function checkCurrentUser() {
    let connection;
    
    try {
        connection = await getConnection();
        console.log('✅ Conexión a la base de datos establecida');

        // Verificar todos los usuarios
        console.log('\n📋 Verificando todos los usuarios...');
        const [users] = await connection.execute(`
            SELECT 
                id, 
                nombre, 
                apellido, 
                email, 
                rol, 
                estado,
                creado_en
            FROM usuarios 
            ORDER BY creado_en ASC
        `);
        
        console.log('Usuarios encontrados:');
        users.forEach(user => {
            console.log(`  ID: ${user.id} | ${user.nombre} ${user.apellido} | ${user.email} | Rol: ${user.rol} | Estado: ${user.estado} | Creado: ${user.creado_en}`);
        });

        // Verificar servicios por usuario
        console.log('\n📋 Verificando servicios por usuario...');
        const [servicesByUser] = await connection.execute(`
            SELECT 
                s.id_usuario,
                u.nombre,
                u.apellido,
                COUNT(s.id) as total_servicios,
                SUM(CASE WHEN s.estado = 'activo' THEN 1 ELSE 0 END) as servicios_activos
            FROM servicios s
            INNER JOIN usuarios u ON s.id_usuario = u.id
            GROUP BY s.id_usuario, u.nombre, u.apellido
            ORDER BY total_servicios DESC
        `);
        
        console.log('Servicios por usuario:');
        servicesByUser.forEach(item => {
            console.log(`  Usuario ID ${item.id_usuario} (${item.nombre} ${item.apellido}): ${item.total_servicios} servicios total, ${item.servicios_activos} activos`);
        });

        // Verificar horarios por usuario
        console.log('\n📋 Verificando horarios por usuario...');
        const [schedulesByUser] = await connection.execute(`
            SELECT 
                h.id_usuario,
                u.nombre,
                u.apellido,
                COUNT(h.id) as total_horarios
            FROM horarios_laborales h
            INNER JOIN usuarios u ON h.id_usuario = u.id
            GROUP BY h.id_usuario, u.nombre, u.apellido
            ORDER BY total_horarios DESC
        `);
        
        console.log('Horarios por usuario:');
        schedulesByUser.forEach(item => {
            console.log(`  Usuario ID ${item.id_usuario} (${item.nombre} ${item.apellido}): ${item.total_horarios} horarios`);
        });

        // Determinar el usuario principal (el que tiene más servicios y horarios)
        console.log('\n📋 Determinando usuario principal...');
        const [mainUser] = await connection.execute(`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.email,
                COUNT(DISTINCT s.id) as servicios_count,
                COUNT(DISTINCT h.id) as horarios_count,
                (COUNT(DISTINCT s.id) + COUNT(DISTINCT h.id)) as total_config
            FROM usuarios u
            LEFT JOIN servicios s ON u.id = s.id_usuario
            LEFT JOIN horarios_laborales h ON u.id = h.id_usuario
            WHERE u.rol = 'barbero' AND u.estado = 'activo'
            GROUP BY u.id, u.nombre, u.apellido, u.email
            ORDER BY total_config DESC, u.creado_en ASC
            LIMIT 1
        `);
        
        if (mainUser.length > 0) {
            const user = mainUser[0];
            console.log(`🎯 Usuario principal recomendado:`);
            console.log(`  ID: ${user.id}`);
            console.log(`  Nombre: ${user.nombre} ${user.apellido}`);
            console.log(`  Email: ${user.email}`);
            console.log(`  Servicios: ${user.servicios_count}`);
            console.log(`  Horarios: ${user.horarios_count}`);
            console.log(`  Total configuración: ${user.total_config}`);
        } else {
            console.log('❌ No se encontró un usuario principal');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            connection.release();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la verificación
checkCurrentUser(); 