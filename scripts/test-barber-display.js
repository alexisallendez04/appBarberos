/**
 * Script de prueba para verificar que todos los barberos se muestren correctamente
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Alexis83',
    password: process.env.DB_PASSWORD || 'TukiTuki12',
    port: process.env.DB_PORT || 3308,
    database: process.env.DB_NAME || 'barberia_db'
};

async function testBarberDisplay() {
    let connection;
    
    try {
        console.log('🧪 Iniciando prueba de visualización de barberos...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Verificar todos los usuarios del sistema
        console.log('\n📋 Verificando todos los usuarios del sistema...');
        const [usuarios] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia, email
            FROM usuarios 
            ORDER BY rol, nombre, apellido
        `);
        
        console.log(`✅ Total de usuarios en el sistema: ${usuarios.length}`);
        usuarios.forEach(usuario => {
            console.log(`   - ${usuario.nombre} ${usuario.apellido} (${usuario.rol}) - Estado: ${usuario.estado}`);
        });
        
        // 2. Verificar barberos y administradores activos
        console.log('\n👥 Verificando barberos y administradores activos...');
        const [barberosActivos] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia, email
            FROM usuarios 
            WHERE (rol = 'barbero' OR rol = 'admin') AND estado = 'activo'
            ORDER BY rol DESC, nombre, apellido
        `);
        
        console.log(`✅ Barberos y administradores activos: ${barberosActivos.length}`);
        barberosActivos.forEach(barbero => {
            console.log(`   - ${barbero.nombre} ${barbero.apellido} (${barbero.rol}) - ${barbero.nombre_barberia || 'Sin barbería'}`);
        });
        
        // 3. Verificar servicios por barbero
        console.log('\n🔧 Verificando servicios por barbero...');
        for (const barbero of barberosActivos) {
            const [servicios] = await connection.execute(`
                SELECT id, nombre, precio, estado
                FROM servicios 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY nombre
            `, [barbero.id]);
            
            console.log(`   ${barbero.nombre} ${barbero.apellido}: ${servicios.length} servicios`);
            servicios.forEach(servicio => {
                console.log(`     - ${servicio.nombre}: $${servicio.precio}`);
            });
        }
        
        // 4. Verificar horarios por barbero
        console.log('\n⏰ Verificando horarios por barbero...');
        for (const barbero of barberosActivos) {
            const [horarios] = await connection.execute(`
                SELECT dia_semana, hora_inicio, hora_fin, estado
                FROM horarios_laborales 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
            `, [barbero.id]);
            
            console.log(`   ${barbero.nombre} ${barbero.apellido}: ${horarios.length} días laborales`);
            horarios.forEach(horario => {
                console.log(`     - ${horario.dia_semana}: ${horario.hora_inicio} - ${horario.hora_fin}`);
            });
        }
        
        // 5. Simular la consulta corregida del controlador
        console.log('\n🔍 Simulando consulta corregida del controlador...');
        const [barberosDisponibles] = await connection.execute(`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.nombre_barberia,
                u.avatar_url,
                u.descripcion,
                u.rol,
                COALESCE(COUNT(DISTINCT s.id), 0) as servicios_count,
                COALESCE(COUNT(DISTINCT h.id), 0) as horarios_count
            FROM usuarios u
            LEFT JOIN servicios s ON u.id = s.id_usuario AND s.estado = 'activo'
            LEFT JOIN horarios_laborales h ON u.id = h.id_usuario AND h.estado = 'activo'
            WHERE (u.rol = 'barbero' OR u.rol = 'admin') 
            AND u.estado = 'activo'
            GROUP BY u.id, u.nombre, u.apellido, u.nombre_barberia, u.avatar_url, u.descripcion, u.rol
            ORDER BY u.rol DESC, u.nombre, u.apellido
        `);
        
        console.log(`✅ Barberos disponibles para reservas: ${barberosDisponibles.length}`);
        barberosDisponibles.forEach(barbero => {
            console.log(`   - ${barbero.nombre} ${barbero.apellido} (${barbero.rol}): ${barbero.servicios_count} servicios, ${barbero.horarios_count} horarios`);
        });
        
        // 6. Verificar que se puedan obtener servicios por barbero
        console.log('\n📦 Verificando obtención de servicios por barbero...');
        for (const barbero of barberosDisponibles) {
            const [servicios] = await connection.execute(`
                SELECT 
                    s.id,
                    s.nombre,
                    s.descripcion,
                    s.precio,
                    s.precio_anterior,
                    s.id_usuario,
                    CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre,
                    u.nombre_barberia,
                    u.avatar_url
                FROM servicios s
                JOIN usuarios u ON s.id_usuario = u.id
                WHERE s.id_usuario = ? AND s.estado = 'activo'
                ORDER BY s.nombre
            `, [barbero.id]);
            
            console.log(`   ${barbero.nombre} ${barbero.apellido}: ${servicios.length} servicios disponibles`);
        }
        
        // 7. Verificar configuración de barberos
        console.log('\n⚙️ Verificando configuración de barberos...');
        for (const barbero of barberosDisponibles) {
            const [config] = await connection.execute(`
                SELECT 
                    intervalo_turnos,
                    anticipacion_reserva,
                    max_reservas_dia,
                    permitir_reservas_mismo_dia
                FROM configuracion_barbero
                WHERE id_usuario = ?
            `, [barbero.id]);
            
            if (config) {
                console.log(`   ${barbero.nombre} ${barbero.apellido}: ${config.intervalo_turnos}min intervalos, ${config.max_reservas_dia} max/día`);
            } else {
                console.log(`   ${barbero.nombre} ${barbero.apellido}: Sin configuración (usará valores por defecto)`);
            }
        }
        
        console.log('\n✅ Prueba de visualización de barberos completada exitosamente!');
        console.log('\n💡 Para probar la funcionalidad completa:');
        console.log('   1. Inicia el servidor: npm start');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Verifica que aparezcan TODOS los barberos activos');
        console.log('   4. Verifica que se muestren los servicios de cada barbero');
        console.log('   5. Verifica que no haya errores en la consola');
        
        console.log('\n🔧 Si solo aparece el administrador:');
        console.log('   1. Verifica que el otro barbero tenga estado = "activo"');
        console.log('   2. Verifica que tenga servicios configurados');
        console.log('   3. Verifica que tenga horarios configurados');
        console.log('   4. Ejecuta este script para ver el estado actual');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar la prueba
if (require.main === module) {
    testBarberDisplay();
}

module.exports = { testBarberDisplay };
