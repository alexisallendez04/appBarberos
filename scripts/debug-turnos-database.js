const { query } = require('../config/db');

async function debugTurnosDatabase() {
    try {
        console.log('🔍 Verificando tabla turnos en la base de datos...\n');

        // 1. Verificar estructura de la tabla turnos
        console.log('1️⃣ Estructura de la tabla turnos:');
        const estructura = await query(`
            DESCRIBE turnos
        `);
        
        estructura.forEach(campo => {
            console.log(`   - ${campo.Field}: ${campo.Type} ${campo.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${campo.Default ? `DEFAULT: ${campo.Default}` : ''}`);
        });

        // 2. Verificar todas las citas del lunes 20 de enero
        console.log('\n2️⃣ Todas las citas del lunes 20 de enero:');
        const todasLasCitas = await query(`
            SELECT 
                id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio,
                id_cliente, precio_final, codigo_cancelacion
            FROM turnos 
            WHERE fecha = '2025-01-20'
            ORDER BY hora_inicio ASC
        `);
        
        if (todasLasCitas.length === 0) {
            console.log('   ❌ No hay citas para el lunes 20 de enero');
        } else {
            console.log(`   ✅ ${todasLasCitas.length} cita(s) encontrada(s):`);
            todasLasCitas.forEach((cita, index) => {
                console.log(`     ${index + 1}. ID: ${cita.id}`);
                console.log(`        Fecha: ${cita.fecha}`);
                console.log(`        Hora inicio: ${cita.hora_inicio}`);
                console.log(`        Hora fin: ${cita.hora_fin}`);
                console.log(`        Estado: ${cita.estado}`);
                console.log(`        Usuario: ${cita.id_usuario}`);
                console.log(`        Servicio: ${cita.id_servicio}`);
                console.log(`        Cliente: ${cita.id_cliente}`);
                console.log(`        Precio: ${cita.precio_final}`);
                console.log(`        Código cancelación: ${cita.codigo_cancelacion || 'N/A'}`);
                console.log('');
            });
        }

        // 3. Verificar citas activas (reservado, confirmado, en_proceso)
        console.log('3️⃣ Citas activas (reservado, confirmado, en_proceso):');
        const citasActivas = await query(`
            SELECT 
                id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio
            FROM turnos 
            WHERE fecha = '2025-01-20' 
            AND estado IN ('reservado', 'confirmado', 'en_proceso')
            ORDER BY hora_inicio ASC
        `);
        
        if (citasActivas.length === 0) {
            console.log('   ❌ No hay citas activas para el lunes 20 de enero');
        } else {
            console.log(`   ✅ ${citasActivas.length} cita(s) activa(s):`);
            citasActivas.forEach((cita, index) => {
                console.log(`     ${index + 1}. ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        }

        // 4. Verificar servicios para entender las duraciones
        console.log('\n4️⃣ Servicios disponibles:');
        const servicios = await query(`
            SELECT id, nombre, duracion, estado, precio
            FROM servicios 
            WHERE estado = 'activo'
            ORDER BY id ASC
        `);
        
        if (servicios.length === 0) {
            console.log('   ❌ No hay servicios activos');
        } else {
            console.log(`   ✅ ${servicios.length} servicio(s) activo(s):`);
            servicios.forEach((servicio, index) => {
                console.log(`     ${index + 1}. ID: ${servicio.id} - ${servicio.nombre}`);
                console.log(`        Duración: ${servicio.duracion} minutos`);
                console.log(`        Precio: ${servicio.precio}`);
                console.log(`        Estado: ${servicio.estado}`);
                console.log('');
            });
        }

        // 5. Verificar si las citas tienen hora_fin correcta
        console.log('5️⃣ Verificación de hora_fin en citas:');
        if (todasLasCitas.length > 0) {
            todasLasCitas.forEach((cita, index) => {
                console.log(`   Cita ${index + 1}:`);
                console.log(`     Hora inicio: ${cita.hora_inicio}`);
                console.log(`     Hora fin: ${cita.hora_fin}`);
                
                // Verificar si hora_fin es NULL o vacía
                if (!cita.hora_fin || cita.hora_fin === '00:00:00' || cita.hora_fin === '') {
                    console.log(`     ❌ PROBLEMA: hora_fin está vacía o es NULL`);
                } else {
                    console.log(`     ✅ hora_fin está configurada`);
                }
                
                // Verificar si hora_fin es igual a hora_inicio
                if (cita.hora_fin === cita.hora_inicio) {
                    console.log(`     ❌ PROBLEMA: hora_fin es igual a hora_inicio`);
                }
                
                console.log('');
            });
        }

        // 6. Análisis del problema
        console.log('6️⃣ Análisis del problema:');
        console.log('   🔍 El usuario reporta que:');
        console.log('      - Con "Corte" (60 min): Aparece 9:00');
        console.log('      - Con "Corte + Barba" (90 min): NO aparece 9:00');
        console.log('');
        console.log('   🎯 Esto sugiere que:');
        console.log('      1. La cita existente tiene hora_fin = 10:00 (correcto)');
        console.log('      2. Con "Corte" (9:00-10:00) NO debería aparecer 9:00');
        console.log('      3. Con "Corte + Barba" (9:00-10:30) NO debería aparecer 9:00');
        console.log('');
        console.log('   🚨 Si aparece 9:00 con "Corte", hay un bug en la lógica de solapamiento');

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar verificación
debugTurnosDatabase();
