const fetch = require('node-fetch');
require('dotenv').config();

async function testBookingAPI() {
    try {
        console.log('🧪 PROBANDO EL ENDPOINT DE LA API DE BOOKING\n');

        // 1. Probar con datos que deberían crear un nuevo cliente
        console.log('1️⃣ Probando con datos nuevos:');
        const testData1 = {
            nombre: 'Carlos Mendoza',
            apellido: 'Vargas',
            email: 'carlos.mendoza@test.com',
            telefono: '999-888-777',
            servicio: 1,
            fecha: '2025-08-14',
            hora: '15:00',
            comentarios: 'Cliente de prueba'
        };

        console.log('   Datos enviados:', testData1);
        
        const response1 = await fetch('http://localhost:3000/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData1)
        });

        const result1 = await response1.json();
        console.log('   Respuesta:', result1);
        console.log();

        // 2. Probar con teléfono existente
        console.log('2️⃣ Probando con teléfono existente:');
        const testData2 = {
            nombre: 'Juan Pérez',
            apellido: 'García',
            email: 'juan.perez@test.com',
            telefono: '123-123-14', // Este teléfono ya existe (Alexis Allendez)
            servicio: 1,
            fecha: '2025-08-14',
            hora: '16:00',
            comentarios: 'Cliente existente'
        };

        console.log('   Datos enviados:', testData2);
        
        const response2 = await fetch('http://localhost:3000/api/booking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData2)
        });

        const result2 = await response2.json();
        console.log('   Respuesta:', result2);
        console.log();

        // 3. Verificar clientes después de las pruebas
        console.log('3️⃣ Verificando clientes después de las pruebas:');
        const { query } = require('../config/db');
        const clientsSql = 'SELECT id, nombre, apellido, telefono, email FROM clientes ORDER BY id DESC LIMIT 5';
        const clients = await query(clientsSql);
        
        clients.forEach((client, index) => {
            console.log(`   ${index + 1}. ID: ${client.id} | ${client.nombre} ${client.apellido} | Tel: ${client.telefono} | Email: ${client.email}`);
        });
        console.log();

        // 4. Verificar citas después de las pruebas
        console.log('4️⃣ Verificando citas después de las pruebas:');
        const appointmentsSql = `
            SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
                   c.nombre as cliente_nombre, c.apellido as cliente_apellido, c.telefono
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            ORDER BY t.id DESC
            LIMIT 5
        `;
        const appointments = await query(appointmentsSql);
        
        appointments.forEach((appointment, index) => {
            console.log(`   ${index + 1}. ID: ${appointment.id} | ${appointment.fecha} ${appointment.hora_inicio} | ${appointment.cliente_nombre} ${appointment.cliente_apellido} | Tel: ${appointment.telefono} | Estado: ${appointment.estado}`);
        });
        console.log();

        // 5. Análisis
        console.log('5️⃣ ANÁLISIS:');
        if (result1.success && result2.success) {
            console.log('   ✅ Ambos requests fueron exitosos');
            console.log('   ✅ El sistema está funcionando correctamente');
            console.log('   ✅ Los clientes se están creando/vinculando correctamente');
        } else {
            console.log('   ❌ Alguno de los requests falló');
            console.log('   ❌ Revisar logs del servidor');
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
        console.log('💡 Asegúrate de que el servidor esté corriendo en http://localhost:3000');
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testBookingAPI();
