/**
 * Script para corregir la configuración de Alexis Allendez
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

async function fixAlexisConfig() {
    let connection;
    
    try {
        console.log('🔧 Iniciando corrección de configuración de Alexis Allendez...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Verificar configuración actual
        console.log('\n📋 Verificando configuración actual...');
        const [configActual] = await connection.execute(`
            SELECT 
                id_usuario,
                intervalo_turnos,
                anticipacion_reserva,
                max_reservas_dia,
                permitir_reservas_mismo_dia,
                mostrar_precios,
                moneda
            FROM configuracion_barbero
            WHERE id_usuario = 1
        `);
        
        if (configActual.length > 0) {
            console.log('✅ Configuración actual encontrada:');
            console.log(`   - ID Usuario: ${configActual[0].id_usuario}`);
            console.log(`   - Intervalo turnos: ${configActual[0].intervalo_turnos}`);
            console.log(`   - Anticipación reserva: ${configActual[0].anticipacion_reserva}`);
            console.log(`   - Max reservas/día: ${configActual[0].max_reservas_dia}`);
            console.log(`   - Permitir mismo día: ${configActual[0].permitir_reservas_mismo_dia}`);
            console.log(`   - Mostrar precios: ${configActual[0].mostrar_precios}`);
            console.log(`   - Moneda: ${configActual[0].moneda}`);
        } else {
            console.log('⚠️  No se encontró configuración para Alexis Allendez');
        }
        
        // 2. Corregir la configuración
        console.log('\n🔧 Corrigiendo configuración...');
        
        // Actualizar la configuración existente
        console.log('🔄 Actualizando configuración existente...');
        await connection.execute(`
            UPDATE configuracion_barbero SET
                intervalo_turnos = ?,
                anticipacion_reserva = ?,
                max_reservas_dia = ?,
                permitir_reservas_mismo_dia = ?,
                mostrar_precios = ?,
                notificaciones_email = ?,
                notificaciones_sms = ?,
                moneda = ?,
                zona_horaria = ?
            WHERE id_usuario = ?
        `, [
            5,                     // intervalo_turnos (5 minutos - SOLO para buffer entre turnos)
            1440,                  // anticipacion_reserva (24 horas = 1440 minutos)
            20,                    // max_reservas_dia
            true,                  // permitir_reservas_mismo_dia
            true,                  // mostrar_precios
            true,                  // notificaciones_email
            false,                 // notificaciones_sms
            'ARS',                // moneda
            'America/Argentina/Buenos_Aires', // zona_horaria
            1                      // id_usuario (Alexis Allendez)
        ]);
        
        console.log('✅ Configuración actualizada');
        
        // 3. Verificar la nueva configuración
        console.log('\n✅ Verificando nueva configuración...');
        const [nuevaConfig] = await connection.execute(`
            SELECT 
                id_usuario,
                intervalo_turnos,
                anticipacion_reserva,
                max_reservas_dia,
                permitir_reservas_mismo_dia,
                mostrar_precios,
                moneda
            FROM configuracion_barbero
            WHERE id_usuario = 1
        `);
        
        if (nuevaConfig.length > 0) {
            console.log('✅ Nueva configuración aplicada:');
            console.log(`   - ID Usuario: ${nuevaConfig[0].id_usuario}`);
            console.log(`   - Intervalo turnos: ${nuevaConfig[0].intervalo_turnos} minutos`);
            console.log(`   - Anticipación reserva: ${nuevaConfig[0].anticipacion_reserva} minutos`);
            console.log(`   - Max reservas/día: ${nuevaConfig[0].max_reservas_dia}`);
            console.log(`   - Permitir mismo día: ${nuevaConfig[0].permitir_reservas_mismo_dia ? 'Sí' : 'No'}`);
            console.log(`   - Mostrar precios: ${nuevaConfig[0].mostrar_precios ? 'Sí' : 'No'}`);
            console.log(`   - Moneda: ${nuevaConfig[0].moneda}`);
        }
        
        // 4. Probar la generación de slots
        console.log('\n🧪 Probando generación de slots...');
        const fechaTest = '2024-12-23'; // Lunes
        const [year, month, day] = fechaTest.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = days[date.getDay()];
        
        console.log(`   Fecha: ${fechaTest} -> Día: ${diaSemana}`);
        
        // Obtener horarios para este día
        const [horarios] = await connection.execute(`
            SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
        `, [1, diaSemana]);
        
        if (horarios.length > 0) {
            console.log(`   ✅ Horarios disponibles: ${horarios.length}`);
            horarios.forEach(horario => {
                console.log(`      - ${horario.hora_inicio} - ${horario.hora_fin}`);
            });
            
            // Simular generación de slots usando el nuevo sistema inteligente
            const bufferTime = 5; // minutos (buffer entre turnos)
            const duracionServicio = 45; // minutos (ejemplo: servicio "corte")
            
            console.log(`   🔧 Generando slots con duración: ${duracionServicio}min + buffer: ${bufferTime}min`);
            console.log(`   📊 Intervalo total entre slots: ${duracionServicio + bufferTime} minutos`);
            
            horarios.forEach(workHour => {
                const startTime = new Date(`2000-01-01T${workHour.hora_inicio}`);
                const endTime = new Date(`2000-01-01T${workHour.hora_fin}`);
                
                let currentTime = new Date(startTime);
                let slotCount = 0;
                
                while (currentTime < endTime) {
                    const slotStart = currentTime.toTimeString().slice(0, 5);
                    const slotEnd = new Date(currentTime.getTime() + (duracionServicio * 60000));
                    const slotEndStr = slotEnd.toTimeString().slice(0, 5);
                    
                    if (slotEnd <= endTime) {
                        slotCount++;
                        if (slotCount <= 5) { // Mostrar solo los primeros 5 slots
                            console.log(`      Slot ${slotCount}: ${slotStart} - ${slotEndStr} (${duracionServicio} min)`);
                        }
                        
                        // Avanzar al siguiente slot: duración del servicio + buffer
                        currentTime = new Date(slotEnd.getTime() + (bufferTime * 60000));
                    } else {
                        break;
                    }
                }
                
                if (slotCount > 5) {
                    console.log(`      ... y ${slotCount - 5} slots más`);
                }
                console.log(`   📊 Total de slots generados: ${slotCount}`);
            });
        } else {
            console.log(`   ❌ No hay horarios para ${diaSemana}`);
        }
        
        console.log('\n✅ Corrección completada exitosamente!');
        console.log('\n💡 Ahora deberías poder:');
        console.log('   1. Seleccionar a Alexis Allendez');
        console.log('   2. Seleccionar una fecha (lunes a jueves)');
        console.log('   3. Ver horarios disponibles');
        console.log('   4. Completar la reserva');
        
        console.log('\n🔧 Para probar:');
        console.log('   1. Reinicia el servidor: npm start');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Selecciona a Alexis Allendez');
        console.log('   4. Selecciona una fecha de lunes a jueves');
        console.log('   5. Verifica que aparezcan horarios disponibles');
        
    } catch (error) {
        console.error('❌ Error durante la corrección:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar la corrección
if (require.main === module) {
    fixAlexisConfig();
}

module.exports = { fixAlexisConfig };
