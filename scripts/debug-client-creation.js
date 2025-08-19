const { query } = require('../config/db');
require('dotenv').config();

async function debugClientCreation() {
    try {
        console.log('🔍 DEBUGGEANDO EL PROBLEMA DE CREACIÓN DE CLIENTES\n');

        // 1. Verificar todos los clientes existentes
        console.log('1️⃣ Clientes existentes en la base de datos:');
        const clientsSql = 'SELECT id, nombre, apellido, telefono, email, creado_en FROM clientes ORDER BY id';
        const clients = await query(clientsSql);
        
        clients.forEach((client, index) => {
            console.log(`   ${index + 1}. ID: ${client.id} | ${client.nombre} ${client.apellido} | Tel: ${client.telefono} | Email: ${client.email} | Creado: ${client.creado_en}`);
        });
        console.log();

        // 2. Verificar todas las citas y sus clientes asociados
        console.log('2️⃣ Citas y sus clientes asociados:');
        const appointmentsSql = `
            SELECT 
                t.id as turno_id,
                t.fecha,
                t.hora_inicio,
                t.hora_fin,
                t.estado,
                t.id_cliente,
                c.nombre as cliente_nombre,
                c.apellido as cliente_apellido,
                c.telefono as cliente_telefono,
                s.nombre as servicio_nombre
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            JOIN servicios s ON t.id_servicio = s.id
            ORDER BY t.fecha DESC, t.hora_inicio DESC
        `;
        const appointments = await query(appointmentsSql);
        
        appointments.forEach((appointment, index) => {
            console.log(`   ${index + 1}. Turno ID: ${appointment.turno_id} | ${appointment.fecha} ${appointment.hora_inicio} | Cliente ID: ${appointment.id_cliente} | ${appointment.cliente_nombre} ${appointment.cliente_apellido} | Tel: ${appointment.cliente_telefono} | ${appointment.servicio_nombre} (${appointment.estado})`);
        });
        console.log();

        // 3. Analizar el problema
        console.log('3️⃣ ANÁLISIS DEL PROBLEMA:');
        
        if (clients.length === 1) {
            console.log('   ❌ PROBLEMA DETECTADO: Solo hay 1 cliente en la base de datos');
            console.log('   ❌ Todas las citas están asociadas al mismo cliente (ID: ' + clients[0].id + ')');
            console.log('   ❌ Esto significa que la función findOrCreate no está funcionando correctamente');
        } else {
            console.log('   ✅ Hay múltiples clientes, verificando duplicados...');
            
            // Verificar duplicados por teléfono
            const duplicatePhonesSql = `
                SELECT telefono, COUNT(*) as cantidad, GROUP_CONCAT(CONCAT(nombre, ' ', apellido) SEPARATOR ', ') as nombres
                FROM clientes 
                WHERE telefono IS NOT NULL AND telefono != ''
                GROUP BY telefono 
                HAVING COUNT(*) > 1
            `;
            const duplicatePhones = await query(duplicatePhonesSql);
            
            if (duplicatePhones.length > 0) {
                console.log('   ❌ PROBLEMA DETECTADO: Hay teléfonos duplicados');
                duplicatePhones.forEach(dup => {
                    console.log(`      Teléfono ${dup.telefono}: ${dup.cantidad} clientes (${dup.nombres})`);
                });
            } else {
                console.log('   ✅ No hay teléfonos duplicados');
            }
        }
        console.log();

        // 4. Verificar la lógica de findOrCreate
        console.log('4️⃣ VERIFICANDO LA LÓGICA DE findOrCreate:');
        console.log('   La función findOrCreate debería:');
        console.log('   1. Buscar cliente por email (si existe)');
        console.log('   2. Buscar cliente por teléfono');
        console.log('   3. Si no existe, crear nuevo cliente');
        console.log();
        console.log('   ❌ PROBLEMA: Parece que siempre está encontrando el primer cliente');
        console.log('   ❌ POSIBLE CAUSA: La búsqueda por teléfono no funciona correctamente');
        console.log();

        // 5. Probar la búsqueda manual
        console.log('5️⃣ PRUEBA MANUAL DE BÚSQUEDA:');
        if (clients.length > 0) {
            const testPhone = clients[0].telefono;
            console.log(`   Probando búsqueda por teléfono: ${testPhone}`);
            
            const searchSql = 'SELECT * FROM clientes WHERE telefono = ?';
            const searchResult = await query(searchSql, [testPhone]);
            console.log(`   Resultados encontrados: ${searchResult.length}`);
            searchResult.forEach((result, index) => {
                console.log(`      ${index + 1}. ${result.nombre} ${result.apellido} (ID: ${result.id})`);
            });
        }
        console.log();

        // 6. Solución propuesta
        console.log('6️⃣ SOLUCIÓN PROPUESTA:');
        console.log();
        console.log('🔧 OPCIÓN 1 - CORREGIR EL SISTEMA ACTUAL:');
        console.log('   1. Revisar la función findOrCreate en models/Client.js');
        console.log('   2. Verificar la lógica de búsqueda por teléfono');
        console.log('   3. Agregar logs para debuggear el proceso');
        console.log('   4. Corregir la lógica de creación de clientes');
        console.log();
        console.log('🔧 OPCIÓN 2 - SIMPLIFICAR EL SISTEMA:');
        console.log('   1. Usar teléfono como identificador único');
        console.log('   2. Crear función que busque por teléfono exacto');
        console.log('   3. Si no existe, crear nuevo cliente');
        console.log('   4. Si existe, usar el cliente existente');
        console.log();
        console.log('🔧 OPCIÓN 3 - ELIMINAR TABLA CLIENTES:');
        console.log('   1. Agregar campos de cliente directamente a turnos');
        console.log('   2. Cada reserva es independiente');
        console.log('   3. Crear vistas para clientes frecuentes');
        console.log('   4. Más simple y sin problemas de duplicados');
        console.log();

        // 7. Recomendación
        console.log('7️⃣ RECOMENDACIÓN:');
        console.log('   💡 Sugiero la OPCIÓN 2: Usar teléfono como identificador único');
        console.log('   💡 Es la solución más práctica y mantiene la funcionalidad');
        console.log('   💡 Permite identificar clientes recurrentes');
        console.log('   💡 Es fácil de implementar y mantener');

    } catch (error) {
        console.error('❌ Error en el debug:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el debug
debugClientCreation();
