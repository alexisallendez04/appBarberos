// Script para depurar el problema de fechas en el dashboard
const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'barberia_db',
    port: 3308
};

async function debugDashboardDates() {
    let connection;
    
    try {
        console.log('🔍 Iniciando depuración de fechas del dashboard...');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos');
        
        // Obtener la fecha actual en diferentes formatos
        const now = new Date();
        const todayJS = now.toISOString().split('T')[0];
        const todayMySQL = now.toISOString().slice(0, 10);
        
        console.log('\n📅 Fechas actuales:');
        console.log('JavaScript Date:', now);
        console.log('JavaScript toISOString().split("T")[0]:', todayJS);
        console.log('JavaScript toISOString().slice(0, 10):', todayMySQL);
        
        // Verificar la fecha actual en MySQL
        const [mysqlDateResult] = await connection.execute('SELECT CURDATE() as today, NOW() as now');
        const mysqlToday = mysqlDateResult[0].today;
        const mysqlNow = mysqlDateResult[0].now;
        
        console.log('\n🗄️ Fechas de MySQL:');
        console.log('CURDATE():', mysqlToday);
        console.log('NOW():', mysqlNow);
        
        // Verificar si hay turnos para hoy
        console.log('\n🔍 Verificando turnos para hoy...');
        
        // Buscar con fecha JavaScript
        const [turnosJS] = await connection.execute(`
            SELECT 
                id, fecha, hora_inicio, estado, precio_final,
                DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_formateada
            FROM turnos 
            WHERE fecha = ?
            LIMIT 5
        `, [todayJS]);
        
        console.log(`\n📊 Turnos encontrados con fecha JavaScript (${todayJS}):`, turnosJS.length);
        turnosJS.forEach(turno => {
            console.log(`  - ID: ${turno.id}, Fecha: ${turno.fecha}, Formateada: ${turno.fecha_formateada}, Estado: ${turno.estado}`);
        });
        
        // Buscar con fecha MySQL
        const [turnosMySQL] = await connection.execute(`
            SELECT 
                id, fecha, hora_inicio, estado, precio_final,
                DATE_FORMAT(fecha, '%Y-%m-%d') as fecha_formateada
            FROM turnos 
            WHERE fecha = CURDATE()
            LIMIT 5
        `, []);
        
        console.log(`\n📊 Turnos encontrados con CURDATE():`, turnosMySQL.length);
        turnosMySQL.forEach(turno => {
            console.log(`  - ID: ${turno.id}, Fecha: ${turno.fecha}, Formateada: ${turno.fecha_formateada}, Estado: ${turnosMySQL.estado}`);
        });
        
        // Verificar todos los turnos de los últimos 7 días
        console.log('\n📊 Turnos de los últimos 7 días:');
        const [turnosSemana] = await connection.execute(`
            SELECT 
                fecha,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados
            FROM turnos 
            WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
            GROUP BY fecha
            ORDER BY fecha DESC
        `);
        
        turnosSemana.forEach(dia => {
            console.log(`  - ${dia.fecha}: Total: ${dia.total}, Completados: ${dia.completados}, Reservados: ${dia.reservados}, Confirmados: ${dia.confirmados}`);
        });
        
        // Verificar la estructura de la tabla turnos
        console.log('\n🏗️ Estructura de la tabla turnos:');
        const [columns] = await connection.execute('DESCRIBE turnos');
        columns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
        
        // Verificar si hay turnos con fechas nulas o inválidas
        console.log('\n⚠️ Verificando turnos con fechas problemáticas:');
        const [turnosProblematicos] = await connection.execute(`
            SELECT 
                id, fecha, hora_inicio, estado
            FROM turnos 
            WHERE fecha IS NULL OR fecha = '0000-00-00' OR fecha < '2020-01-01'
            LIMIT 10
        `);
        
        if (turnosProblematicos.length > 0) {
            console.log('❌ Turnos con fechas problemáticas encontrados:');
            turnosProblematicos.forEach(turno => {
                console.log(`  - ID: ${turno.id}, Fecha: ${turno.fecha}, Estado: ${turno.estado}`);
            });
        } else {
            console.log('✅ No se encontraron turnos con fechas problemáticas');
        }
        
        // Verificar el usuario de prueba
        console.log('\n👤 Verificando usuario de prueba:');
        const [usuarios] = await connection.execute('SELECT id, nombre, apellido, email FROM usuarios LIMIT 5');
        usuarios.forEach(usuario => {
            console.log(`  - ID: ${usuario.id}, Nombre: ${usuario.nombre} ${usuario.apellido}, Email: ${usuario.email}`);
        });
        
        // Verificar turnos del usuario específico
        if (usuarios.length > 0) {
            const userId = usuarios[0].id;
            console.log(`\n📊 Turnos del usuario ${userId} (${usuarios[0].nombre}):`);
            
            const [turnosUsuario] = await connection.execute(`
                SELECT 
                    fecha,
                    COUNT(*) as total,
                    SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                    SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                    SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                    SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
                FROM turnos 
                WHERE id_usuario = ? AND fecha = CURDATE()
                GROUP BY fecha
            `, [userId]);
            
            if (turnosUsuario.length > 0) {
                turnosUsuario.forEach(dia => {
                    console.log(`  - ${dia.fecha}: Total: ${dia.total}, Completados: ${dia.completados}, Reservados: ${dia.reservados}, Confirmados: ${dia.confirmados}, Recaudado: $${dia.total_recaudado}`);
                });
            } else {
                console.log('  - No hay turnos para hoy');
            }
        }
        
    } catch (error) {
        console.error('❌ Error durante la depuración:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Ejecutar la depuración
debugDashboardDates().catch(console.error);
