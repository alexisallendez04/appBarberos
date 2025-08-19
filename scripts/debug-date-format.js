const { query } = require('../config/db');
require('dotenv').config();

async function debugDateFormat() {
    try {
        console.log('🔍 DEBUG: Analizando formato de fechas en la base de datos\n');

        // Verificar la estructura de la tabla turnos
        console.log('1️⃣ Verificando estructura de la tabla turnos...');
        const structureSql = `
            DESCRIBE turnos
        `;
        
        const structure = await query(structureSql);
        console.log('Estructura de la tabla turnos:');
        structure.forEach(field => {
            console.log(`   ${field.Field}: ${field.Type} ${field.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        console.log();

        // Obtener todas las citas con información detallada
        console.log('2️⃣ Obteniendo citas con información detallada...');
        const appointmentsSql = `
            SELECT 
                t.id,
                t.fecha,
                t.hora_inicio,
                t.hora_fin,
                t.estado,
                t.codigo_cancelacion,
                DATE_FORMAT(t.fecha, '%Y-%m-%d') as fecha_formateada,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                s.nombre as servicio_nombre
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            JOIN servicios s ON t.id_servicio = s.id
            ORDER BY t.fecha DESC, t.hora_inicio ASC
        `;

        const appointments = await query(appointmentsSql);
        
        console.log(`📊 Total de citas: ${appointments.length}\n`);
        
        appointments.forEach((appointment, index) => {
            console.log(`Cita ${index + 1}:`);
            console.log(`   ID: ${appointment.id}`);
            console.log(`   Fecha (raw): ${appointment.fecha}`);
            console.log(`   Fecha (formateada): ${appointment.fecha_formateada}`);
            console.log(`   Hora inicio: ${appointment.hora_inicio}`);
            console.log(`   Hora fin: ${appointment.hora_fin}`);
            console.log(`   Estado: ${appointment.estado}`);
            console.log(`   Cliente: ${appointment.cliente_nombre} ${appointment.cliente_apellido}`);
            console.log(`   Servicio: ${appointment.servicio_nombre}`);
            console.log();
        });

        // Verificar específicamente el 11/08
        console.log('3️⃣ Verificando citas para el 11/08...');
        const specificDateSql = `
            SELECT 
                t.id,
                t.fecha,
                t.hora_inicio,
                t.hora_fin,
                t.estado,
                DATE_FORMAT(t.fecha, '%Y-%m-%d') as fecha_formateada,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                s.nombre as servicio_nombre
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            JOIN servicios s ON t.id_servicio = s.id
            WHERE DATE_FORMAT(t.fecha, '%Y-%m-%d') = '2024-11-08'
            ORDER BY t.hora_inicio ASC
        `;

        const specificAppointments = await query(specificDateSql);
        
        console.log(`📅 Citas para 2024-11-08: ${specificAppointments.length}`);
        specificAppointments.forEach((appointment, index) => {
            console.log(`   ${index + 1}. ${appointment.hora_inicio} - ${appointment.hora_fin} | ${appointment.cliente_nombre} ${appointment.cliente_apellido} | ${appointment.servicio_nombre} | Estado: ${appointment.estado}`);
        });
        console.log();

        // Verificar también con diferentes formatos de fecha
        console.log('4️⃣ Verificando con diferentes formatos...');
        const formats = [
            '2024-11-08',
            '2024-08-11', 
            '2025-08-11',
            '2025-11-08'
        ];

        for (const dateFormat of formats) {
            const formatSql = `
                SELECT COUNT(*) as count
                FROM turnos t
                WHERE DATE_FORMAT(t.fecha, '%Y-%m-%d') = ?
            `;
            
            const [result] = await query(formatSql, [dateFormat]);
            console.log(`   ${dateFormat}: ${result.count} citas`);
        }

    } catch (error) {
        console.error('❌ Error en debug de fechas:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el debug
debugDateFormat();
