const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:3000';

// Función para probar obtener horarios disponibles
async function testGetAvailableSlots() {
    try {
        console.log('🚀 Probando obtención de horarios disponibles...\n');

        // Test 1: Obtener servicios
        console.log('📋 Test 1: Obtener servicios disponibles');
        const servicesResponse = await fetch(`${BASE_URL}/api/booking/services`);
        const servicesResult = await servicesResponse.json();
        
        if (servicesResult.success) {
            console.log('✅ Servicios obtenidos:', servicesResult.data.length, 'servicios');
            servicesResult.data.forEach(service => {
                console.log(`   - ${service.nombre}: $${service.precio} (${service.duracion} min)`);
            });
        } else {
            console.error('❌ Error obteniendo servicios:', servicesResult.message);
            return;
        }

        // Test 2: Obtener horarios para mañana
        console.log('\n📋 Test 2: Obtener horarios para mañana');
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fecha = tomorrow.toISOString().split('T')[0];
        
        const slotsResponse = await fetch(`${BASE_URL}/api/booking/slots?fecha=${fecha}`);
        const slotsResult = await slotsResponse.json();
        
        if (slotsResult.success) {
            console.log('✅ Horarios obtenidos para', fecha);
            console.log('   Barbero:', slotsResult.barbero?.nombre || 'No especificado');
            console.log('   Barbería:', slotsResult.barbero?.barberia || 'No especificada');
            console.log('   Horarios disponibles:', slotsResult.data.length);
            
            if (slotsResult.data.length > 0) {
                console.log('   Slots disponibles:');
                slotsResult.data.forEach(slot => {
                    console.log(`     - ${slot.hora_inicio} - ${slot.hora_fin}`);
                });
            } else {
                console.log('   ⚠️  No hay horarios disponibles para esta fecha');
            }
        } else {
            console.error('❌ Error obteniendo horarios:', slotsResult.message);
        }

        // Test 3: Obtener horarios para un servicio específico
        if (servicesResult.data.length > 0) {
            console.log('\n📋 Test 3: Obtener horarios para un servicio específico');
            const serviceId = servicesResult.data[0].id;
            
            const slotsWithServiceResponse = await fetch(`${BASE_URL}/api/booking/slots?fecha=${fecha}&servicio_id=${serviceId}`);
            const slotsWithServiceResult = await slotsWithServiceResponse.json();
            
            if (slotsWithServiceResult.success) {
                console.log('✅ Horarios obtenidos para servicio ID:', serviceId);
                console.log('   Horarios disponibles:', slotsWithServiceResult.data.length);
                
                if (slotsWithServiceResult.data.length > 0) {
                    console.log('   Slots disponibles:');
                    slotsWithServiceResult.data.forEach(slot => {
                        console.log(`     - ${slot.hora_inicio} - ${slot.hora_fin}`);
                    });
                }
            } else {
                console.error('❌ Error obteniendo horarios con servicio:', slotsWithServiceResult.message);
            }
        }

        // Test 4: Probar diferentes fechas
        console.log('\n📋 Test 4: Probar diferentes fechas de la semana');
        const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        
        for (let i = 1; i <= 7; i++) {
            const testDate = new Date();
            testDate.setDate(testDate.getDate() + i);
            const testFecha = testDate.toISOString().split('T')[0];
            const diaSemana = diasSemana[testDate.getDay()];
            
            const testResponse = await fetch(`${BASE_URL}/api/booking/slots?fecha=${testFecha}`);
            const testResult = await testResponse.json();
            
            if (testResult.success) {
                console.log(`   ${diaSemana} (${testFecha}): ${testResult.data.length} horarios disponibles`);
            } else {
                console.log(`   ${diaSemana} (${testFecha}): Error - ${testResult.message}`);
            }
        }

        console.log('\n✅ Todas las pruebas completadas');

    } catch (error) {
        console.error('❌ Error en las pruebas:', error);
    }
}

// Función para probar crear una reserva
async function testCreateBooking() {
    try {
        console.log('\n🚀 Probando creación de reserva...\n');

        // Obtener servicios primero
        const servicesResponse = await fetch(`${BASE_URL}/api/booking/services`);
        const servicesResult = await servicesResponse.json();
        
        if (!servicesResult.success || servicesResult.data.length === 0) {
            console.error('❌ No hay servicios disponibles para crear reserva');
            return;
        }

        // Obtener horarios para mañana
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fecha = tomorrow.toISOString().split('T')[0];
        
        const slotsResponse = await fetch(`${BASE_URL}/api/booking/slots?fecha=${fecha}&servicio_id=${servicesResult.data[0].id}`);
        const slotsResult = await slotsResponse.json();
        
        if (!slotsResult.success || slotsResult.data.length === 0) {
            console.error('❌ No hay horarios disponibles para crear reserva');
            return;
        }

        // Crear reserva de prueba
        const bookingData = {
            nombre: 'Cliente',
            apellido: 'Prueba',
            email: 'cliente.prueba@test.com',
            telefono: '123-456-7890',
            servicio: servicesResult.data[0].id,
            fecha: fecha,
            hora: slotsResult.data[0].hora_inicio,
            comentarios: 'Reserva de prueba desde script'
        };

        console.log('📋 Creando reserva de prueba...');
        console.log('   Datos:', bookingData);

        const bookingResponse = await fetch(`${BASE_URL}/api/booking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        const bookingResult = await bookingResponse.json();

        if (bookingResult.success) {
            console.log('✅ Reserva creada exitosamente');
            console.log('   Código de confirmación:', bookingResult.data.confirmationCode);
            console.log('   ID de la reserva:', bookingResult.data.appointmentId);
        } else {
            console.error('❌ Error creando reserva:', bookingResult.message);
        }

    } catch (error) {
        console.error('❌ Error en la prueba de reserva:', error);
    }
}

// Función principal
async function runTests() {
    console.log('🎯 Iniciando pruebas del sistema de booking...\n');
    
    await testGetAvailableSlots();
    await testCreateBooking();
    
    console.log('\n🎉 Todas las pruebas completadas');
}

// Ejecutar pruebas
runTests().catch(error => {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
}); 