// Script para depurar problemas de zona horaria
const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'Alexis83',
    password: 'TukiTuki12',
    database: 'barberia_db',
    port: 3308
};

async function debugTimezone() {
    let connection;
    
    try {
        console.log('🔍 Depurando problemas de zona horaria...');
        
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la base de datos');
        
        // Verificar diferentes formas de obtener la fecha
        console.log('\n📅 Verificando fechas en MySQL:');
        
        const [dateResults] = await connection.execute(`
            SELECT 
                CURDATE() as curdate,
                CURDATE() + INTERVAL 0 SECOND as curdate_plus,
                DATE(NOW()) as date_now,
                DATE(UTC_TIMESTAMP()) as date_utc,
                DATE(CONVERT_TZ(NOW(), '+00:00', '+03:00')) as date_local,
                NOW() as now,
                UTC_TIMESTAMP() as utc_now,
                @@global.time_zone as global_timezone,
                @@session.time_zone as session_timezone,
                @@system_time_zone as system_timezone
        `);
        
        const result = dateResults[0];
        console.log('  - CURDATE():', result.curdate);
        console.log('  - DATE(NOW()):', result.date_now);
        console.log('  - DATE(UTC_TIMESTAMP()):', result.date_utc);
        console.log('  - NOW():', result.now);
        console.log('  - UTC_TIMESTAMP():', result.utc_now);
        console.log('  - Global timezone:', result.global_timezone);
        console.log('  - Session timezone:', result.session_timezone);
        console.log('  - System timezone:', result.system_timezone);
        
        // Verificar turnos con diferentes criterios de fecha
        console.log('\n🔍 Verificando turnos con diferentes criterios de fecha:');
        
        // 1. Con CURDATE()
        const [turnosCurdate] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
            FROM turnos 
            WHERE fecha = CURDATE()
        `);
        
        console.log('📊 Turnos con CURDATE():');
        console.log('  - Total:', turnosCurdate[0].total);
        console.log('  - Completados:', turnosCurdate[0].completados);
        console.log('  - Total recaudado:', turnosCurdate[0].total_recaudado);
        
        // 2. Con DATE(NOW())
        const [turnosDateNow] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
            FROM turnos 
            WHERE fecha = DATE(NOW())
        `);
        
        console.log('📊 Turnos con DATE(NOW()):');
        console.log('  - Total:', turnosDateNow[0].total);
        console.log('  - Completados:', turnosDateNow[0].completados);
        console.log('  - Total recaudado:', turnosDateNow[0].total_recaudado);
        
        // 3. Con fecha específica de ayer
        const [turnosYesterday] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
            FROM turnos 
            WHERE fecha = '2025-08-13'
        `);
        
        console.log('📊 Turnos con fecha específica 2025-08-13:');
        console.log('  - Total:', turnosYesterday[0].total);
        console.log('  - Completados:', turnosYesterday[0].total_completados);
        console.log('  - Total recaudado:', turnosYesterday[0].total_recaudado);
        
        // 4. Con fecha específica de hoy
        const [turnosToday] = await connection.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                SUM(CASE WHEN estado = 'reservado' THEN 1 ELSE 0 END) as reservados,
                SUM(CASE WHEN estado = 'confirmado' THEN 1 ELSE 0 END) as confirmados,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as total_recaudado
            FROM turnos 
            WHERE fecha = '2025-08-14'
        `);
        
        console.log('📊 Turnos con fecha específica 2025-08-14:');
        console.log('  - Total:', turnosToday[0].total);
        console.log('  - Completados:', turnosToday[0].completados);
        console.log('  - Total recaudado:', turnosToday[0].total_recaudado);
        
        // Verificar todas las fechas disponibles en la tabla turnos
        console.log('\n📅 Fechas disponibles en la tabla turnos:');
        const [fechasDisponibles] = await connection.execute(`
            SELECT 
                fecha,
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados
            FROM turnos 
            GROUP BY fecha
            ORDER BY fecha DESC
            LIMIT 10
        `);
        
        fechasDisponibles.forEach(fecha => {
            console.log(`  - ${fecha.fecha}: Total: ${fecha.total}, Completados: ${fecha.completados}`);
        });
        
    } catch (error) {
        console.error('❌ Error durante la depuración:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

debugTimezone().catch(console.error);
