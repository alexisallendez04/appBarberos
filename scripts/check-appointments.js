const { query } = require('../config/db');
require('dotenv').config();

async function checkAppointments() {
    try {
        console.log('🔍 Verificando citas existentes en la base de datos\n');

        // Obtener todas las citas
        const allAppointmentsSql = `
            SELECT 
                t.id,
                t.fecha,
                t.hora_inicio,
                t.hora_fin,
                t.estado,
                t.codigo_cancelacion,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.telefono as cliente_telefono,
                s.nombre as servicio_nombre,
                u.nombre as barbero_nombre
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            JOIN servicios s ON t.id_servicio = s.id
            JOIN usuarios u ON t.id_usuario = u.id
            ORDER BY t.fecha DESC, t.hora_inicio ASC
        `;

        const allAppointments = await query(allAppointmentsSql);
        
        console.log(`📊 Total de citas en la base de datos: ${allAppointments.length}\n`);

        if (allAppointments.length === 0) {
            console.log('❌ No hay citas registradas en la base de datos');
            return;
        }

        // Agrupar por fecha
        const appointmentsByDate = {};
        allAppointments.forEach(appointment => {
            const fecha = appointment.fecha;
            if (!appointmentsByDate[fecha]) {
                appointmentsByDate[fecha] = [];
            }
            appointmentsByDate[fecha].push(appointment);
        });

        // Mostrar citas por fecha
        Object.keys(appointmentsByDate).sort().forEach(fecha => {
            console.log(`📅 Fecha: ${fecha}`);
            appointmentsByDate[fecha].forEach(appointment => {
                console.log(`   ${appointment.hora_inicio} - ${appointment.hora_fin} | ${appointment.cliente_nombre} ${appointment.cliente_apellido} | ${appointment.servicio_nombre} | Estado: ${appointment.estado}`);
            });
            console.log();
        });

        // Verificar específicamente el 11/08
        const fechaEspecifica = '2024-11-08';
        console.log(`🔍 Verificando específicamente la fecha ${fechaEspecifica}...`);
        
        const appointmentsForDate = appointmentsByDate[fechaEspecifica] || [];
        console.log(`   Citas para ${fechaEspecifica}: ${appointmentsForDate.length}`);
        
        appointmentsForDate.forEach(appointment => {
            console.log(`   ${appointment.hora_inicio} - ${appointment.hora_fin} | ${appointment.cliente_nombre} ${appointment.cliente_apellido} | ${appointment.servicio_nombre} | Estado: ${appointment.estado}`);
        });

        // Verificar si hay citas que se solapan
        console.log('\n🔍 Verificando posibles solapamientos...');
        Object.keys(appointmentsByDate).forEach(fecha => {
            const appointments = appointmentsByDate[fecha];
            if (appointments.length > 1) {
                console.log(`\n📅 Fecha: ${fecha}`);
                for (let i = 0; i < appointments.length; i++) {
                    for (let j = i + 1; j < appointments.length; j++) {
                        const app1 = appointments[i];
                        const app2 = appointments[j];
                        
                        // Verificar solapamiento
                        const overlap = (app1.hora_inicio < app2.hora_fin && app1.hora_fin > app2.hora_inicio);
                        
                        if (overlap) {
                            console.log(`   ⚠️ SOLAPAMIENTO DETECTADO:`);
                            console.log(`      ${app1.hora_inicio} - ${app1.hora_fin} | ${app1.cliente_nombre} ${app1.cliente_apellido}`);
                            console.log(`      ${app2.hora_inicio} - ${app2.hora_fin} | ${app2.cliente_nombre} ${app2.cliente_apellido}`);
                        }
                    }
                }
            }
        });

    } catch (error) {
        console.error('❌ Error al verificar citas:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la verificación
checkAppointments();
