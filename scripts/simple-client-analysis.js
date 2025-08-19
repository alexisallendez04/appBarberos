const { query } = require('../config/db');
require('dotenv').config();

async function simpleClientAnalysis() {
    try {
        console.log('🔍 ANÁLISIS SIMPLIFICADO DEL MANEJO DE CLIENTES\n');

        // 1. Verificar estructura actual
        console.log('1️⃣ Estructura actual del sistema:');
        console.log('   - Tabla "clientes" separada');
        console.log('   - Tabla "turnos" con referencia a clientes');
        console.log('   - Sistema complejo de gestión');
        console.log();

        // 2. Contar clientes y citas
        console.log('2️⃣ Datos actuales:');
        const clientCountSql = 'SELECT COUNT(*) as total FROM clientes';
        const [clientCount] = await query(clientCountSql);
        console.log(`   Total de clientes: ${clientCount.total}`);

        const appointmentCountSql = 'SELECT COUNT(*) as total FROM turnos';
        const [appointmentCount] = await query(appointmentCountSql);
        console.log(`   Total de citas: ${appointmentCount.total}`);
        console.log();

        // 3. Verificar datos de clientes
        console.log('3️⃣ Datos de clientes existentes:');
        const clientsSql = 'SELECT id, nombre, apellido, telefono, email, total_visitas FROM clientes';
        const clients = await query(clientsSql);
        
        if (clients.length === 0) {
            console.log('   No hay clientes registrados');
        } else {
            clients.forEach((client, index) => {
                console.log(`   ${index + 1}. ${client.nombre} ${client.apellido} - Tel: ${client.telefono} - Visitas: ${client.total_visitas}`);
            });
        }
        console.log();

        // 4. Verificar citas
        console.log('4️⃣ Datos de citas existentes:');
        const appointmentsSql = `
            SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, t.estado,
                   c.nombre, c.apellido, c.telefono,
                   s.nombre as servicio_nombre
            FROM turnos t
            JOIN clientes c ON t.id_cliente = c.id
            JOIN servicios s ON t.id_servicio = s.id
            ORDER BY t.fecha DESC, t.hora_inicio DESC
            LIMIT 10
        `;
        const appointments = await query(appointmentsSql);
        
        if (appointments.length === 0) {
            console.log('   No hay citas registradas');
        } else {
            appointments.forEach((appointment, index) => {
                console.log(`   ${index + 1}. ${appointment.fecha} ${appointment.hora_inicio} - ${appointment.nombre} ${appointment.apellido} - ${appointment.servicio_nombre} (${appointment.estado})`);
            });
        }
        console.log();

        // 5. Análisis de problemas
        console.log('5️⃣ PROBLEMAS IDENTIFICADOS:');
        console.log('   ❌ Sistema complejo de gestión de clientes');
        console.log('   ❌ Necesidad de mantener tabla separada de clientes');
        console.log('   ❌ Posibles duplicados por teléfono/email');
        console.log('   ❌ Experiencia poco práctica para el barbero');
        console.log('   ❌ Lógica compleja de búsqueda y gestión');
        console.log();

        // 6. Propuesta de solución
        console.log('6️⃣ SOLUCIÓN PROPUESTA - SIMPLIFICACIÓN:');
        console.log();
        console.log('💡 ELIMINAR TABLA "CLIENTES" Y MANEJAR DATOS DIRECTAMENTE EN "TURNOS"');
        console.log();
        console.log('✅ BENEFICIOS:');
        console.log('   ✅ Experiencia más directa y práctica');
        console.log('   ✅ No hay problemas de duplicados');
        console.log('   ✅ Cada reserva es independiente');
        console.log('   ✅ Menos complejidad en la base de datos');
        console.log('   ✅ Más fácil de mantener y usar');
        console.log('   ✅ Mejor experiencia para el barbero');
        console.log();
        console.log('🔄 CAMBIOS NECESARIOS:');
        console.log('   1. Agregar campos a tabla turnos:');
        console.log('      - cliente_nombre VARCHAR(100)');
        console.log('      - cliente_apellido VARCHAR(100)');
        console.log('      - cliente_telefono VARCHAR(20)');
        console.log('      - cliente_email VARCHAR(100)');
        console.log('      - cliente_notas TEXT');
        console.log('   2. Migrar datos existentes');
        console.log('   3. Eliminar tabla clientes y dependencias');
        console.log('   4. Simplificar formularios y lógica');
        console.log('   5. Actualizar controladores y modelos');
        console.log();
        console.log('📋 IMPLEMENTACIÓN:');
        console.log('   1. Crear script de migración');
        console.log('   2. Actualizar esquema de base de datos');
        console.log('   3. Modificar controladores');
        console.log('   4. Simplificar formularios');
        console.log('   5. Actualizar dashboard');
        console.log();
        console.log('🎯 RESULTADO FINAL:');
        console.log('   - Sistema más simple y práctico');
        console.log('   - Mejor experiencia de usuario');
        console.log('   - Menos mantenimiento');
        console.log('   - Más fácil de usar para el barbero');

    } catch (error) {
        console.error('❌ Error en el análisis:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el análisis
simpleClientAnalysis();

