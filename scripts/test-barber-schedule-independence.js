/**
 * Script de prueba para verificar que cada barbero tenga horarios independientes
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

async function testBarberScheduleIndependence() {
    let connection;
    
    try {
        console.log('🧪 Iniciando prueba de independencia de horarios por barbero...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Verificar todos los barberos activos
        console.log('\n👥 Verificando barberos activos...');
        const [barberos] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia
            FROM usuarios 
            WHERE (rol = 'barbero' OR rol = 'admin') AND estado = 'activo'
            ORDER BY rol DESC, nombre, apellido
        `);
        
        if (barberos.length === 0) {
            console.log('❌ No se encontraron barberos activos');
            return;
        }
        
        console.log(`✅ Se encontraron ${barberos.length} barberos activos:`);
        barberos.forEach(barbero => {
            console.log(`   - ${barbero.nombre} ${barbero.apellido} (${barbero.rol}) - ${barbero.nombre_barberia || 'Sin barbería'}`);
        });
        
        // 2. Verificar horarios laborales por barbero
        console.log('\n⏰ Verificando horarios laborales por barbero...');
        for (const barbero of barberos) {
            const [horarios] = await connection.execute(`
                SELECT 
                    dia_semana, 
                    hora_inicio, 
                    hora_fin, 
                    estado,
                    id_usuario
                FROM horarios_laborales 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
            `, [barbero.id]);
            
            console.log(`\n   📅 ${barbero.nombre} ${barbero.apellido} (ID: ${barbero.id}):`);
            if (horarios.length === 0) {
                console.log(`     ❌ No tiene horarios configurados`);
            } else {
                console.log(`     ✅ ${horarios.length} días laborales configurados:`);
                horarios.forEach(horario => {
                    console.log(`        - ${horario.dia_semana}: ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
            }
        }
        
        // 3. Verificar que no haya horarios duplicados o compartidos
        console.log('\n🔍 Verificando independencia de horarios...');
        const [todosHorarios] = await connection.execute(`
            SELECT 
                h.id,
                h.dia_semana,
                h.hora_inicio,
                h.hora_fin,
                h.id_usuario,
                CONCAT(u.nombre, ' ', u.apellido) as barbero_nombre
            FROM horarios_laborales h
            JOIN usuarios u ON h.id_usuario = u.id
            WHERE h.estado = 'activo'
            ORDER BY h.dia_semana, h.hora_inicio
        `);
        
        console.log(`✅ Total de horarios activos en el sistema: ${todosHorarios.length}`);
        
        // Agrupar horarios por día de la semana
        const horariosPorDia = {};
        todosHorarios.forEach(horario => {
            if (!horariosPorDia[horario.dia_semana]) {
                horariosPorDia[horario.dia_semana] = [];
            }
            horariosPorDia[horario.dia_semana].push(horario);
        });
        
        // Verificar cada día
        Object.keys(horariosPorDia).forEach(dia => {
            const horariosDelDia = horariosPorDia[dia];
            console.log(`\n   📅 ${dia.toUpperCase()}:`);
            
            // Agrupar por barbero
            const horariosPorBarbero = {};
            horariosDelDia.forEach(horario => {
                if (!horariosPorBarbero[horario.barbero_nombre]) {
                    horariosPorBarbero[horario.barbero_nombre] = [];
                }
                horariosPorBarbero[horario.barbero_nombre].push(horario);
            });
            
            Object.keys(horariosPorBarbero).forEach(barberoNombre => {
                const horarios = horariosPorBarbero[barberoNombre];
                console.log(`     👤 ${barberoNombre}: ${horarios.length} horarios`);
                horarios.forEach(horario => {
                    console.log(`        - ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
            });
        });
        
        // 4. Verificar configuración específica por barbero
        console.log('\n⚙️ Verificando configuración específica por barbero...');
        for (const barbero of barberos) {
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
            `, [barbero.id]);
            
            console.log(`\n   🔧 ${barbero.nombre} ${barbero.apellido}:`);
            if (config) {
                console.log(`     ✅ Configuración personalizada:`);
                console.log(`        - Intervalo de turnos: ${config.intervalo_turnos} minutos`);
                console.log(`        - Anticipación de reserva: ${config.anticipacion_reserva} minutos`);
                console.log(`        - Máximo reservas por día: ${config.max_reservas_dia}`);
                console.log(`        - Permitir reservas mismo día: ${config.permitir_reservas_mismo_dia ? 'Sí' : 'No'}`);
                console.log(`        - Mostrar precios: ${config.mostrar_precios ? 'Sí' : 'No'}`);
                console.log(`        - Moneda: ${config.moneda}`);
            } else {
                console.log(`     ⚠️  Sin configuración personalizada (usará valores por defecto)`);
            }
        }
        
        // 5. Verificar días especiales por barbero
        console.log('\n🎯 Verificando días especiales por barbero...');
        for (const barbero of barberos) {
            const [diasEspeciales] = await connection.execute(`
                SELECT 
                    fecha,
                    tipo,
                    descripcion,
                    todo_dia,
                    hora_inicio,
                    hora_fin
                FROM dias_especiales
                WHERE id_usuario = ?
                ORDER BY fecha
            `, [barbero.id]);
            
            console.log(`\n   📅 ${barbero.nombre} ${barbero.apellido}:`);
            if (diasEspeciales.length === 0) {
                console.log(`     ℹ️  No tiene días especiales configurados`);
            } else {
                console.log(`     ✅ ${diasEspeciales.length} días especiales configurados:`);
                diasEspeciales.forEach(dia => {
                    if (dia.todo_dia) {
                        console.log(`        - ${dia.fecha}: ${dia.tipo} - ${dia.descripcion} (Todo el día)`);
                    } else {
                        console.log(`        - ${dia.fecha}: ${dia.tipo} - ${dia.descripcion} (${dia.hora_inicio} - ${dia.hora_fin})`);
                    }
                });
            }
        }
        
        // 6. Simular la API corregida
        console.log('\n🔌 Simulando llamadas a la API corregida...');
        for (const barbero of barberos) {
            console.log(`\n   🔍 Simulando GET /api/booking/slots para ${barbero.nombre} ${barbero.apellido}:`);
            
            // Simular parámetros
            const fecha = '2024-12-23'; // Lunes
            const diaSemana = 'lunes';
            
            // Verificar horarios para este barbero específico
            const [horariosBarbero] = await connection.execute(`
                SELECT dia_semana, hora_inicio, hora_fin
                FROM horarios_laborales 
                WHERE id_usuario = ? AND dia_semana = ? AND estado = 'activo'
            `, [barbero.id, diaSemana]);
            
            if (horariosBarbero.length === 0) {
                console.log(`     ❌ No tiene horarios para ${diaSemana}`);
            } else {
                console.log(`     ✅ Horarios disponibles para ${diaSemana}:`);
                horariosBarbero.forEach(horario => {
                    console.log(`        - ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
                
                // Verificar citas existentes para este barbero
                const [citasExistentes] = await connection.execute(`
                    SELECT hora_inicio, hora_fin, estado
                    FROM turnos 
                    WHERE id_usuario = ? AND fecha = ? AND estado != 'cancelado'
                `, [barbero.id, fecha]);
                
                console.log(`     📋 Citas existentes para ${fecha}: ${citasExistentes.length}`);
                citasExistentes.forEach(cita => {
                    console.log(`        - ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
                });
            }
        }
        
        console.log('\n✅ Prueba de independencia de horarios completada exitosamente!');
        console.log('\n💡 Para probar la funcionalidad completa:');
        console.log('   1. Inicia el servidor: npm start');
        console.log('   2. Ve a: http://localhost:3000/booking');
        console.log('   3. Selecciona diferentes barberos');
        console.log('   4. Verifica que cada uno tenga sus propios horarios');
        console.log('   5. Verifica que no se mezclen los horarios entre barberos');
        
        console.log('\n🔧 Si los horarios siguen siendo compartidos:');
        console.log('   1. Verifica que cada barbero tenga su propia configuración en configuracion_barbero');
        console.log('   2. Verifica que cada barbero tenga sus propios horarios en horarios_laborales');
        console.log('   3. Verifica que cada barbero tenga sus propios días especiales en dias_especiales');
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
    testBarberScheduleIndependence();
}

module.exports = { testBarberScheduleIndependence };
