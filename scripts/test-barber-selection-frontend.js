/**
 * Script para probar la selección de barbero en el frontend
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

async function testBarberSelectionFrontend() {
    let connection;
    
    try {
        console.log('🧪 Probando selección de barbero en el frontend...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Simular la API de servicios
        console.log('\n🔌 Simulando API de servicios...');
        const [barberos] = await connection.execute(`
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
            HAVING servicios_count > 0 AND horarios_count > 0
            ORDER BY u.rol DESC, u.nombre, apellido
        `);
        
        console.log(`✅ Barberos disponibles: ${barberos.length}`);
        barberos.forEach(barbero => {
            console.log(`   - ID: ${barbero.id}, ${barbero.nombre} ${barbero.apellido} (${barbero.rol})`);
        });
        
        // 2. Simular la selección de Alexis Allendez
        const alexis = barberos.find(b => b.nombre === 'Alexis' && b.apellido === 'Allendez');
        if (alexis) {
            console.log(`\n✅ Alexis Allendez encontrado (ID: ${alexis.id})`);
            
            // 3. Simular la API de horarios
            console.log('\n🔌 Simulando API de horarios...');
            const fecha = '2024-12-23'; // Lunes
            const [year, month, day] = fecha.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaSemana = days[date.getDay()];
            
            console.log(`   Fecha: ${fecha} -> Día: ${diaSemana}`);
            
            // Verificar horarios para este día
            const [horarios] = await connection.execute(`
                SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
                FROM horarios_laborales
                WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
            `, [alexis.id, diaSemana]);
            
            if (horarios.length > 0) {
                console.log(`   ✅ Horarios disponibles: ${horarios.length}`);
                horarios.forEach(horario => {
                    console.log(`      - ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
                
                // Verificar configuración del barbero
                const [config] = await connection.execute(`
                    SELECT intervalo_turnos, anticipacion_reserva, max_reservas_dia
                    FROM configuracion_barbero
                    WHERE id_usuario = ?
                `, [alexis.id]);
                
                if (config && config.length > 0) {
                    const configData = config[0];
                    console.log(`   ⚙️  Configuración: Intervalo ${configData.intervalo_turnos}min`);
                    
                    // Simular generación de slots
                    const intervalo = configData.intervalo_turnos || 30;
                    const duracionServicio = 30; // minutos
                    
                    console.log(`   🔧 Generando slots con intervalo: ${intervalo}min`);
                    
                    horarios.forEach(workHour => {
                        const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
                        const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);
                        
                        let slotCount = 0;
                        for (let time = new Date(startTime); time < endTime; time.setMinutes(time.getMinutes() + intervalo)) {
                            const slotStart = time.toTimeString().slice(0, 5);
                            const slotEnd = new Date(time.getTime() + (duracionServicio * 60000));
                            const slotEndStr = slotEnd.toTimeString().slice(0, 5);
                            
                            if (slotEnd <= endTime) {
                                slotCount++;
                                if (slotCount <= 5) {
                                    console.log(`        Slot ${slotCount}: ${slotStart} - ${slotEndStr}`);
                                }
                            }
                        }
                        
                        if (slotCount > 5) {
                            console.log(`        ... y ${slotCount - 5} slots más`);
                        }
                        console.log(`      📊 Total de slots: ${slotCount}`);
                    });
                }
            } else {
                console.log(`   ❌ No hay horarios para ${diaSemana}`);
            }
        } else {
            console.log(`❌ Alexis Allendez no encontrado`);
        }
        
        console.log('\n✅ Prueba completada!');
        console.log('\n💡 Para probar en el navegador:');
        console.log('   1. Abre la consola del navegador (F12)');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Selecciona a Alexis Allendez del dropdown');
        console.log('   4. Verifica en la consola que aparezca: "🔍 Barbero seleccionado: ID 1"');
        console.log('   5. Selecciona una fecha (lunes a jueves)');
        console.log('   6. Verifica que se carguen los horarios');
        
        console.log('\n🔧 Si hay problemas, verifica en la consola:');
        console.log('   - El ID del barbero seleccionado');
        console.log('   - Si selectedBarberId se actualiza correctamente');
        console.log('   - Si la función loadAvailableSlots recibe el ID correcto');
        
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
    testBarberSelectionFrontend();
}

module.exports = { testBarberSelectionFrontend };
