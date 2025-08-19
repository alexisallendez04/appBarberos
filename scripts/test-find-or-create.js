const Client = require('../models/Client');
require('dotenv').config();

async function testFindOrCreate() {
    try {
        console.log('🧪 PROBANDO LA FUNCIÓN findOrCreate\n');

        // 1. Probar con datos que deberían encontrar un cliente existente
        console.log('1️⃣ Probando con teléfono existente:');
        const testData1 = {
            nombre: 'Juan Pérez',
            apellido: 'García',
            telefono: '123-123-14', // Este teléfono ya existe (Alexis Allendez)
            email: 'juan@test.com'
        };

        console.log('   Datos de prueba:', testData1);
        const result1 = await Client.findOrCreate(testData1);
        console.log('   Resultado:', result1.nombre, result1.apellido, '(ID:', result1.id + ')');
        console.log();

        // 2. Probar con datos que deberían crear un nuevo cliente
        console.log('2️⃣ Probando con teléfono nuevo:');
        const testData2 = {
            nombre: 'María González',
            apellido: 'López',
            telefono: '999-888-777', // Este teléfono no existe
            email: 'maria.gonzalez@test.com'
        };

        console.log('   Datos de prueba:', testData2);
        const result2 = await Client.findOrCreate(testData2);
        console.log('   Resultado:', result2.nombre, result2.apellido, '(ID:', result2.id + ')');
        console.log();

        // 3. Probar con email existente
        console.log('3️⃣ Probando con email existente:');
        const testData3 = {
            nombre: 'Pedro Nuevo',
            apellido: 'Apellido',
            telefono: '555-444-333',
            email: 'carlos@test.com' // Este email ya existe
        };

        console.log('   Datos de prueba:', testData3);
        const result3 = await Client.findOrCreate(testData3);
        console.log('   Resultado:', result3.nombre, result3.apellido, '(ID:', result3.id + ')');
        console.log();

        // 4. Verificar todos los clientes después de las pruebas
        console.log('4️⃣ Verificando todos los clientes después de las pruebas:');
        const { query } = require('../config/db');
        const allClientsSql = 'SELECT id, nombre, apellido, telefono, email FROM clientes ORDER BY id';
        const allClients = await query(allClientsSql);
        
        allClients.forEach((client, index) => {
            console.log(`   ${index + 1}. ID: ${client.id} | ${client.nombre} ${client.apellido} | Tel: ${client.telefono} | Email: ${client.email}`);
        });
        console.log();

        // 5. Análisis del problema
        console.log('5️⃣ ANÁLISIS DEL PROBLEMA:');
        console.log('   La función findOrCreate parece estar funcionando correctamente.');
        console.log('   El problema debe estar en el controlador de booking.');
        console.log();
        console.log('🔍 VERIFICANDO EL CONTROLADOR DE BOOKING...');

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testFindOrCreate();
