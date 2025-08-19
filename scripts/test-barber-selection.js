/**
 * Script de prueba para la funcionalidad de selección de barbero
 * Este script verifica que el sistema pueda manejar múltiples barberos
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

async function testBarberSelection() {
    let connection;
    
    try {
        console.log('🧪 Iniciando prueba de selección de barbero...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Verificar que existan barberos en el sistema
        console.log('\n📋 Verificando barberos existentes...');
        const [barberos] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia
            FROM usuarios 
            WHERE rol IN ('barbero', 'admin') AND estado = 'activo'
            ORDER BY nombre, apellido
        `);
        
        if (barberos.length === 0) {
            console.log('❌ No se encontraron barberos en el sistema');
            console.log('💡 Ejecuta primero el script insert-sample-data.js');
            return;
        }
        
        console.log(`✅ Se encontraron ${barberos.length} barberos:`);
        barberos.forEach(barbero => {
            console.log(`   - ${barbero.nombre} ${barbero.apellido} (${barbero.rol}) - ${barbero.nombre_barberia || 'Sin barbería'}`);
        });
        
        // 2. Verificar servicios por barbero
        console.log('\n🔧 Verificando servicios por barbero...');
        for (const barbero of barberos) {
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
        
        // 3. Verificar horarios por barbero
        console.log('\n⏰ Verificando horarios por barbero...');
        for (const barbero of barberos) {
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
        
        // 4. Simular la consulta que hace el controlador
        console.log('\n🔍 Simulando consulta del controlador getAvailableBarbers...');
        const [barberosDisponibles] = await connection.execute(`
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.nombre_barberia,
                u.avatar_url,
                u.descripcion,
                COUNT(DISTINCT s.id) as servicios_count,
                COUNT(DISTINCT h.id) as horarios_count
            FROM usuarios u
            LEFT JOIN servicios s ON u.id = s.id_usuario AND s.estado = 'activo'
            LEFT JOIN horarios_laborales h ON u.id = h.id_usuario AND h.estado = 'activo'
            WHERE (u.rol = 'barbero' OR u.rol = 'admin') 
            AND u.estado = 'activo'
            GROUP BY u.id, u.nombre, u.apellido, u.nombre_barberia, u.avatar_url, u.descripcion
            HAVING servicios_count > 0 AND horarios_count > 0
            ORDER BY u.nombre, u.apellido
        `);
        
        console.log(`✅ Barberos disponibles para reservas: ${barberosDisponibles.length}`);
        barberosDisponibles.forEach(barbero => {
            console.log(`   - ${barbero.nombre} ${barbero.apellido}: ${barbero.servicios_count} servicios, ${barbero.horarios_count} horarios`);
        });
        
        // 5. Verificar que se puedan obtener servicios por barbero
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
        
        // 6. Verificar configuración de barberos
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
        
        console.log('\n✅ Prueba de selección de barbero completada exitosamente!');
        console.log('\n💡 Para probar la funcionalidad completa:');
        console.log('   1. Inicia el servidor: npm start');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Selecciona un barbero del dropdown');
        console.log('   4. Verifica que se muestren solo los servicios de ese barbero');
        console.log('   5. Selecciona un servicio y verifica la disponibilidad');
        
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
    testBarberSelection();
}

module.exports = { testBarberSelection };
