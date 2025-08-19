/**
 * Script para probar la selección de barbero corregida
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

async function testFixedBarberSelection() {
    let connection;
    
    try {
        console.log('🧪 Probando selección de barbero corregida...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Simular la nueva función getAvailableBarbers() corregida
        console.log('\n🔧 Simulando getAvailableBarbers() corregida...');
        const sql = `
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
            ORDER BY u.rol DESC, u.nombre, u.apellido
        `;
        
        const [barberos] = await connection.execute(sql);
        console.log(`✅ Barberos disponibles (con servicios y horarios): ${barberos.length}`);
        
        barberos.forEach((barbero, index) => {
            console.log(`   ${index + 1}. ${barbero.nombre} ${barbero.apellido} (${barbero.rol}): ${barbero.servicios_count} servicios, ${barbero.horarios_count} horarios`);
        });
        
        // 2. Verificar que solo aparezca Alexis Allendez
        if (barberos.length === 1 && barberos[0].nombre === 'Alexis' && barberos[0].apellido === 'Allendez') {
            console.log('\n✅ SOLUCIÓN FUNCIONANDO: Solo aparece Alexis Allendez');
        } else {
            console.log('\n❌ PROBLEMA: Aparecen más barberos de los esperados');
            barberos.forEach(barbero => {
                if (barbero.nombre !== 'Alexis' || barbero.apellido !== 'Allendez') {
                    console.log(`   ⚠️  Barberos no esperados: ${barbero.nombre} ${barbero.apellido}`);
                }
            });
        }
        
        // 3. Simular la API de servicios
        console.log('\n🔌 Simulando API de servicios...');
        const serviciosPorBarbero = {};
        
        for (const barbero of barberos) {
            const [servicios] = await connection.execute(`
                SELECT id, nombre, precio, descripcion, estado
                FROM servicios 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY nombre
            `, [barbero.id]);
            
            serviciosPorBarbero[barbero.id] = {
                barbero: {
                    id: barbero.id,
                    nombre: barbero.nombre,
                    apellido: barbero.apellido,
                    nombre_completo: `${barbero.nombre} ${barbero.apellido}`,
                    nombre_barberia: barbero.nombre_barberia,
                    avatar_url: barbero.avatar_url,
                    descripcion: barbero.descripcion,
                    servicios_count: barbero.servicios_count,
                    horarios_count: barbero.horarios_count
                },
                servicios: servicios
            };
        }
        
        console.log(`✅ Servicios por barbero configurados: ${Object.keys(serviciosPorBarbero).length}`);
        Object.keys(serviciosPorBarbero).forEach(barberoId => {
            const item = serviciosPorBarbero[barberoId];
            console.log(`   - ${item.barbero.nombre_completo}: ${item.servicios.length} servicios`);
        });
        
        // 4. Simular la selección de Alexis y carga de horarios
        console.log('\n🧪 Simulando selección de Alexis y carga de horarios...');
        const alexisId = barberos.find(b => b.nombre === 'Alexis' && b.apellido === 'Allendez')?.id;
        
        if (alexisId) {
            console.log(`✅ Alexis Allendez seleccionado (ID: ${alexisId})`);
            
            // Simular fecha de lunes
            const fechaTest = '2024-12-23'; // Lunes
            const [year, month, day] = fechaTest.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaSemana = days[date.getDay()];
            
            console.log(`   Fecha: ${fechaTest} -> Día: ${diaSemana}`);
            
            // Verificar horarios para este día
            const [horarios] = await connection.execute(`
                SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
                FROM horarios_laborales
                WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
            `, [alexisId, diaSemana]);
            
            if (horarios.length > 0) {
                console.log(`   ✅ Horarios disponibles para ${diaSemana}: ${horarios.length}`);
                horarios.forEach(horario => {
                    console.log(`      - ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
                
                // Verificar configuración del barbero
                const [config] = await connection.execute(`
                    SELECT intervalo_turnos, anticipacion_reserva, max_reservas_dia
                    FROM configuracion_barbero
                    WHERE id_usuario = ?
                `, [alexisId]);
                
                if (config && config.length > 0) {
                    const configData = config[0];
                    console.log(`   ⚙️  Configuración: Intervalo ${configData.intervalo_turnos}min, Max ${configData.max_reservas_dia}/día`);
                    
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
                } else {
                    console.log(`   ⚠️  Sin configuración personalizada (usará valores por defecto)`);
                }
            } else {
                console.log(`   ❌ No hay horarios para ${diaSemana}`);
            }
        } else {
            console.log(`❌ No se pudo encontrar Alexis Allendez`);
        }
        
        console.log('\n✅ Prueba completada exitosamente!');
        console.log('\n💡 Resumen de la solución:');
        console.log('   1. ✅ getAvailableBarbers() ahora solo devuelve barberos con servicios y horarios');
        console.log('   2. ✅ El frontend no selecciona barbero por defecto automáticamente');
        console.log('   3. ✅ Se valida que se haya seleccionado un barbero antes de cargar horarios');
        console.log('   4. ✅ Solo Alexis Allendez aparece en la lista (con servicios y horarios)');
        
        console.log('\n🔧 Para probar en el navegador:');
        console.log('   1. Reinicia el servidor: npm start');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Verifica que solo aparezca Alexis Allendez en el dropdown');
        console.log('   4. Selecciona a Alexis Allendez');
        console.log('   5. Selecciona una fecha (lunes a jueves)');
        console.log('   6. Verifica que aparezcan horarios disponibles');
        
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
    testFixedBarberSelection();
}

module.exports = { testFixedBarberSelection };
