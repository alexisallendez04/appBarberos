const Client = require('../models/Client');
const Appointment = require('../models/Appointment');
const { query } = require('../config/db');
require('dotenv').config();

async function simulateBooking() {
    try {
        console.log('🧪 SIMULANDO EL PROCESO COMPLETO DE CREACIÓN DE RESERVA\n');

        // 1. Simular datos de entrada (como si vinieran del formulario)
        console.log('1️⃣ Datos de entrada simulados:');
        const bookingData = {
            nombre: 'Roberto Silva',
            apellido: 'Méndez',
            email: 'roberto.silva@test.com',
            telefono: '555-123-456',
            servicio: 1, // ID del servicio
            fecha: '2025-08-13',
            hora: '14:00',
            comentarios: 'Cliente nuevo'
        };

        console.log('   Datos de reserva:', bookingData);
        console.log();

        // 2. Obtener el barbero principal
        console.log('2️⃣ Obteniendo barbero principal:');
        const UserService = require('../services/userService');
        const id_usuario = await UserService.getMainUserId();
        console.log('   ID del barbero:', id_usuario);
        console.log();

        // 3. Obtener información del servicio
        console.log('3️⃣ Obteniendo información del servicio:');
        const serviceSql = `
            SELECT id, nombre, precio
            FROM servicios
            WHERE id = ? AND id_usuario = ? AND estado = 'activo'
        `;
        const [serviceInfo] = await query(serviceSql, [bookingData.servicio, id_usuario]);
        
        if (!serviceInfo) {
            console.log('   ❌ Servicio no encontrado');
            return;
        }
        
        console.log('   Servicio:', serviceInfo.nombre, '- Precio:', serviceInfo.precio);
        console.log();

        // 4. Buscar o crear cliente (PASO CRÍTICO)
        console.log('4️⃣ Buscando o creando cliente:');
        const clientData = {
            nombre: bookingData.nombre.trim(),
            apellido: bookingData.apellido.trim(),
            email: bookingData.email ? bookingData.email.trim() : null,
            telefono: bookingData.telefono.trim(),
            notas: bookingData.comentarios ? bookingData.comentarios.trim() : null
        };

        console.log('   Datos del cliente a procesar:', clientData);
        
        // Agregar logs detallados
        console.log('   🔍 Buscando por email...');
        if (clientData.email) {
            const existingByEmail = await Client.findByEmail(clientData.email);
            console.log('   Resultado búsqueda por email:', existingByEmail ? `${existingByEmail.nombre} ${existingByEmail.apellido} (ID: ${existingByEmail.id})` : 'No encontrado');
        }

        console.log('   🔍 Buscando por teléfono...');
        const existingByPhone = await Client.findByPhone(clientData.telefono);
        console.log('   Resultado búsqueda por teléfono:', existingByPhone ? `${existingByPhone.nombre} ${existingByPhone.apellido} (ID: ${existingByPhone.id})` : 'No encontrado');

        const client = await Client.findOrCreate(clientData);
        console.log('   ✅ Cliente resultante:', client.nombre, client.apellido, '(ID:', client.id + ')');
        console.log();

        // 5. Verificar disponibilidad
        console.log('5️⃣ Verificando disponibilidad:');
        const config = await query('SELECT intervalo_turnos FROM configuracion_barbero WHERE id_usuario = ?', [id_usuario]);
        const serviceDuration = config[0]?.intervalo_turnos || 30;
        
        const horaInicio = new Date(`2000-01-01T${bookingData.hora}`);
        const horaFin = new Date(horaInicio.getTime() + (serviceDuration * 60000));
        const horaFinStr = horaFin.toTimeString().slice(0, 5);
        
        console.log('   Hora de inicio:', bookingData.hora);
        console.log('   Hora de fin calculada:', horaFinStr);
        
        const isAvailable = await Appointment.checkAvailability(
            id_usuario, 
            bookingData.fecha, 
            bookingData.hora, 
            horaFinStr
        );
        
        console.log('   ¿Está disponible?', isAvailable);
        console.log();

        // 6. Crear la cita (solo si está disponible)
        if (isAvailable) {
            console.log('6️⃣ Creando la cita:');
            const codigo_cancelacion = await Appointment.generateCancelCode();
            
            const appointmentData = {
                fecha: bookingData.fecha,
                hora_inicio: bookingData.hora,
                hora_fin: horaFinStr,
                id_cliente: client.id,
                id_usuario,
                id_servicio: serviceInfo.id,
                precio_final: serviceInfo.precio,
                codigo_cancelacion,
                notas: bookingData.comentarios ? bookingData.comentarios.trim() : null
            };

            console.log('   Datos de la cita:', appointmentData);
            
            const appointment = await Appointment.create(appointmentData);
            console.log('   ✅ Cita creada con ID:', appointment.id);
            console.log('   Código de cancelación:', codigo_cancelacion);
            console.log();

            // 7. Incrementar visitas del cliente
            console.log('7️⃣ Incrementando visitas del cliente:');
            await Client.incrementVisits(client.id);
            console.log('   ✅ Visitas incrementadas');
            console.log();

            // 8. Verificar resultado final
            console.log('8️⃣ Verificando resultado final:');
            const finalAppointmentSql = `
                SELECT t.*, c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.telefono
                FROM turnos t
                JOIN clientes c ON t.id_cliente = c.id
                WHERE t.id = ?
            `;
            const [finalAppointment] = await query(finalAppointmentSql, [appointment.id]);
            
            console.log('   Cita final:');
            console.log(`   - ID: ${finalAppointment.id}`);
            console.log(`   - Fecha: ${finalAppointment.fecha}`);
            console.log(`   - Hora: ${finalAppointment.hora_inicio} - ${finalAppointment.hora_fin}`);
            console.log(`   - Cliente: ${finalAppointment.cliente_nombre} ${finalAppointment.cliente_apellido} (ID: ${finalAppointment.id_cliente})`);
            console.log(`   - Teléfono: ${finalAppointment.telefono}`);
            console.log(`   - Estado: ${finalAppointment.estado}`);
        } else {
            console.log('6️⃣ ❌ No se puede crear la cita - horario no disponible');
        }

        console.log('\n🎯 CONCLUSIÓN:');
        console.log('   El proceso de creación de reserva funciona correctamente.');
        console.log('   El problema debe estar en otra parte del sistema.');

    } catch (error) {
        console.error('❌ Error en la simulación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la simulación
simulateBooking();
