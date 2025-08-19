// Script para verificar los datos del dashboard en la base de datos
const mysql = require('mysql2/promise');

// Configuración de la base de datos (usar las mismas credenciales que app.js)
const dbConfig = {
    host: 'localhost',
    user: 'Alexis83',
    password: 'TukiTuki12',
    database: 'barberia_db',
    port: 3308
};

async function checkDashboardData() {
    let connection;
    
    try {
        console.log('🔍 Verificando datos del dashboard...');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos');
        
        // Verificar la fecha actual en MySQL
        const [mysqlDateResult] = await connection.execute('SELECT CURDATE() as today, NOW() as now');
        const mysqlToday = mysqlDateResult[0].today;
        const mysqlNow = mysqlDateResult[0].now;
        
        console.log('\n📅 Fechas de MySQL:');
        console.log('  - CURDATE():', mysqlToday);
        console.log('  - NOW():', mysqlNow);
        
        // Verificar si hay turnos en la base de datos
        console.log('\n🔍 Verificando turnos en la base de datos...');
        const [totalTurnos] = await connection.execute('SELECT COUNT(*) as total FROM turnos');
        console.log('  - Total de turnos en la base de datos:', totalTurnos[0].total);
        
        if (totalTurnos[0].total > 0) {
            // Verificar turnos de los últimos 7 días
            const [turnosSemana] = await connection.execute(`
                SELECT 
                    fecha,
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                    SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
                FROM turnos 
                WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
                GROUP BY fecha
                ORDER BY fecha DESC
            `);
            
            console.log('\n📊 Turnos de los últimos 7 días:');
            turnosSemana.forEach(dia => {
                console.log(`  - ${dia.fecha}: Total: ${dia.total}, Completados: ${dia.completados}, Reservados: ${dia.reservados}, Confirmados: ${dia.confirmados}, Recaudado: $${dia.total_recaudado}`);
            });
            
            // Verificar turnos para hoy específicamente
            const [turnosHoy] = await connection.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                    SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
                FROM turnos 
                WHERE fecha = CURDATE()
            `);
            
            console.log('\n📊 Turnos para hoy:');
            console.log('  - Total:', turnosHoy[0].total);
            console.log('  - Completados:', turnosHoy[0].completados);
            console.log('  - Reservados:', turnosHoy[0].reservados);
            console.log('  - Confirmados:', turnosHoy[0].confirmados);
            console.log('  - Total recaudado:', turnosHoy[0].total_recaudado);
            
            // Verificar algunos turnos de ejemplo
            const [turnosEjemplo] = await connection.execute(`
                SELECT 
                    id, fecha, hora_inicio, estado, precio_final,
                    DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_formateada
                FROM turnos 
                ORDER BY fecha DESC, hora_inicio DESC
                LIMIT 5
            `);
            
            console.log('\n📋 Ejemplos de turnos:');
            turnosEjemplo.forEach(turno => {
                console.log(`  - ID: ${turno.id}, Fecha: ${turno.fecha} (${turno.fecha_formateada}), Hora: ${turno.hora_inicio}, Estado: ${turno.estado}, Precio: $${turno.precio_final}`);
            });
            
        } else {
            console.log('⚠️ No hay turnos en la base de datos');
        }
        
        // Verificar usuarios
        console.log('\n👤 Verificando usuarios:');
        const [usuarios] = await connection.execute('SELECT id, nombre, apellido, email FROM usuarios LIMIT 5');
        usuarios.forEach(usuario => {
            console.log(`  - ID: ${usuario.id}, Nombre: ${usuario.nombre} ${usuario.apellido}, Email: ${usuario.email}`);
        });
        
        // Verificar si hay turnos para un usuario específico
        if (usuarios.length > 0) {
            const userId = usuarios[0].id;
            console.log(`\n🔍 Verificando turnos para usuario ${userId} (${usuarios[0].nombre}):`);
            
            const [turnosUsuario] = await connection.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                    SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
                FROM turnos 
                WHERE id_usuario = ?
            `, [userId]);
            
            console.log('  - Total turnos del usuario:', turnosUsuario[0].total);
            console.log('  - Completados:', turnosUsuario[0].completados);
            console.log('  - Reservados:', turnosUsuario[0].reservados);
            console.log('  - Confirmados:', turnosUsuario[0].confirmados);
            console.log('  - Total recaudado:', turnosUsuario[0].total_recaudado);
            
            // Verificar turnos de hoy para este usuario
            const [turnosHoyUsuario] = await connection.execute(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                    SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
                FROM turnos 
                WHERE id_usuario = ? AND fecha = CURDATE()
            `, [userId]);
            
            console.log(`\n📊 Turnos de hoy para usuario ${userId}:`);
            console.log('  - Total:', turnosHoyUsuario[0].total);
            console.log('  - Completados:', turnosHoyUsuario[0].completados);
            console.log('  - Reservados:', turnosHoyUsuario[0].reservados);
            console.log('  - Confirmados:', turnosHoyUsuario[0].confirmados);
            console.log('  - Total recaudado:', turnosHoyUsuario[0].total_recaudado);
        }
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la verificación
checkDashboardData().catch(console.error); 