/**
 * Script de diagnóstico para el problema de horarios de Alexis Allendez
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

async function debugAlexisHorarios() {
    let connection;
    
    try {
        console.log('🔍 Iniciando diagnóstico de horarios de Alexis Allendez...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Buscar específicamente a Alexis Allendez
        console.log('\n👤 Buscando a Alexis Allendez...');
        const [alexis] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia, email
            FROM usuarios 
            WHERE nombre = 'Alexis' AND apellido = 'Allendez'
        `);
        
        if (alexis.length === 0) {
            console.log('❌ No se encontró Alexis Allendez en la base de datos');
            return;
        }
        
        const alexisData = alexis[0];
        console.log(`✅ Alexis Allendez encontrado:`);
        console.log(`   - ID: ${alexisData.id}`);
        console.log(`   - Rol: ${alexisData.rol}`);
        console.log(`   - Estado: ${alexisData.estado}`);
        console.log(`   - Email: ${alexisData.email}`);
        
        // 2. Verificar horarios laborales
        console.log('\n⏰ Verificando horarios laborales...');
        const [horarios] = await connection.execute(`
            SELECT 
                id, dia_semana, hora_inicio, hora_fin, estado,
                pausa_inicio, pausa_fin
            FROM horarios_laborales 
            WHERE id_usuario = ? AND estado = 'activo'
            ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
        `, [alexisData.id]);
        
        console.log(`✅ Horarios encontrados: ${horarios.length}`);
        horarios.forEach(horario => {
            console.log(`   - ${horario.dia_semana}: ${horario.hora_inicio} - ${horario.hora_fin}`);
            if (horario.pausa_inicio && horario.pausa_fin) {
                console.log(`     Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
            }
        });
        
        // 3. Verificar servicios
        console.log('\n🔧 Verificando servicios...');
        const [servicios] = await connection.execute(`
            SELECT id, nombre, precio, descripcion, estado
            FROM servicios 
            WHERE id_usuario = ? AND estado = 'activo'
            ORDER BY nombre
        `, [alexisData.id]);
        
        console.log(`✅ Servicios encontrados: ${servicios.length}`);
        servicios.forEach(servicio => {
            console.log(`   - ${servicio.nombre}: $${servicio.precio}`);
        });
        
        // 4. Simular la función getDayOfWeek con diferentes fechas
        console.log('\n📅 Simulando función getDayOfWeek...');
        const fechasTest = [
            '2024-12-23', // Lunes
            '2024-12-24', // Martes
            '2024-12-25', // Miércoles
            '2024-12-26', // Jueves
            '2024-12-27', // Viernes
            '2024-12-28', // Sábado
            '2024-12-29'  // Domingo
        ];
        
        fechasTest.forEach(fecha => {
            const [year, month, day] = fecha.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaSemana = days[date.getDay()];
            
            console.log(`   ${fecha} -> ${diaSemana}`);
        });
        
        // 5. Simular la consulta de horarios para cada día
        console.log('\n🔍 Simulando consulta de horarios por día...');
        for (const fecha of fechasTest) {
            const [year, month, day] = fecha.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            const diaSemana = days[date.getDay()];
            
            const [horariosDia] = await connection.execute(`
                SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
                FROM horarios_laborales
                WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
            `, [alexisData.id, diaSemana]);
            
            if (horariosDia.length > 0) {
                console.log(`   ✅ ${fecha} (${diaSemana}): ${horariosDia.length} horarios`);
                horariosDia.forEach(horario => {
                    console.log(`      - ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
            } else {
                console.log(`   ❌ ${fecha} (${diaSemana}): Sin horarios`);
            }
        }
        
        // 6. Verificar configuración del barbero
        console.log('\n⚙️ Verificando configuración del barbero...');
        const [config] = await connection.execute(`
            SELECT 
                intervalo_turnos,
                anticipacion_reserva,
                max_reservas_dia,
                permitir_reservas_mismo_dia,
                mostrar_precios,
                moneda
            FROM configuracion_barbero
            WHERE id_usuario = ?
        `, [alexisData.id]);
        
        if (config) {
            console.log(`✅ Configuración encontrada:`);
            console.log(`   - Intervalo de turnos: ${config.intervalo_turnos} minutos`);
            console.log(`   - Anticipación de reserva: ${config.anticipacion_reserva} minutos`);
            console.log(`   - Máximo reservas por día: ${config.max_reservas_dia}`);
            console.log(`   - Permitir reservas mismo día: ${config.permitir_reservas_mismo_dia ? 'Sí' : 'No'}`);
        } else {
            console.log(`⚠️  Sin configuración personalizada (usará valores por defecto)`);
        }
        
        // 7. Verificar días especiales
        console.log('\n🎯 Verificando días especiales...');
        const [diasEspeciales] = await connection.execute(`
            SELECT fecha, tipo, descripcion, todo_dia, hora_inicio, hora_fin
            FROM dias_especiales
            WHERE id_usuario = ?
            ORDER BY fecha
        `, [alexisData.id]);
        
        if (diasEspeciales.length > 0) {
            console.log(`✅ Días especiales encontrados: ${diasEspeciales.length}`);
            diasEspeciales.forEach(dia => {
                if (dia.todo_dia) {
                    console.log(`   - ${dia.fecha}: ${dia.tipo} - ${dia.descripcion} (Todo el día)`);
                } else {
                    console.log(`   - ${dia.fecha}: ${dia.tipo} - ${dia.descripcion} (${dia.hora_inicio} - ${dia.hora_fin})`);
                }
            });
        } else {
            console.log(`ℹ️  No hay días especiales configurados`);
        }
        
        // 8. Simular la API completa
        console.log('\n🔌 Simulando llamada completa a la API...');
        const fechaTest = '2024-12-23'; // Lunes
        const [year, month, day] = fechaTest.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const days = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const diaSemana = days[date.getDay()];
        
        console.log(`   Fecha: ${fechaTest} -> Día: ${diaSemana}`);
        
        // Verificar horarios para este día específico
        const [horariosEspecificos] = await connection.execute(`
            SELECT hora_inicio, hora_fin, pausa_inicio, pausa_fin
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
        `, [alexisData.id, diaSemana]);
        
        if (horariosEspecificos.length > 0) {
            console.log(`   ✅ Horarios disponibles para ${diaSemana}: ${horariosEspecificos.length}`);
            horariosEspecificos.forEach(horario => {
                console.log(`      - ${horario.hora_inicio} - ${horario.hora_fin}`);
            });
            
            // Verificar citas existentes
            const [citasExistentes] = await connection.execute(`
                SELECT hora_inicio, hora_fin, estado
                FROM turnos 
                WHERE id_usuario = ? AND fecha = ? AND estado != 'cancelado'
            `, [alexisData.id, fechaTest]);
            
            console.log(`   📋 Citas existentes para ${fechaTest}: ${citasExistentes.length}`);
        } else {
            console.log(`   ❌ No hay horarios para ${diaSemana}`);
        }
        
        console.log('\n✅ Diagnóstico completado!');
        console.log('\n💡 Posibles causas del problema:');
        console.log('   1. La fecha seleccionada no coincide con los días laborales configurados');
        console.log('   2. Problema en la conversión de zona horaria');
        console.log('   3. El día de la semana no se está calculando correctamente');
        console.log('   4. Problema en la consulta SQL de horarios');
        
        console.log('\n🔧 Para resolver:');
        console.log('   1. Verifica que la fecha seleccionada sea lunes, martes, miércoles o jueves');
        console.log('   2. Verifica que no haya días especiales que bloqueen la fecha');
        console.log('   3. Revisa los logs del servidor para ver errores específicos');
        
    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar el diagnóstico
if (require.main === module) {
    debugAlexisHorarios();
}

module.exports = { debugAlexisHorarios };
