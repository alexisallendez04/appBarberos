const { query } = require('../config/db');

async function verificarTodasCitas() {
    try {
        console.log('🔍 Verificando TODAS las citas en la base de datos...\n');

        // 1. Verificar todas las citas existentes
        console.log('1️⃣ Todas las citas existentes:');
        const todasLasCitas = await query(`
            SELECT 
                id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio,
                id_cliente, precio_final
            FROM turnos 
            ORDER BY fecha DESC, hora_inicio ASC
            LIMIT 20
        `);
        
        if (todasLasCitas.length === 0) {
            console.log('   ❌ No hay citas en la base de datos');
        } else {
            console.log(`   ✅ ${todasLasCitas.length} cita(s) encontrada(s):`);
            todasLasCitas.forEach((cita, index) => {
                console.log(`     ${index + 1}. ID: ${cita.id}`);
                console.log(`        Fecha: ${cita.fecha}`);
                console.log(`        Hora: ${cita.hora_inicio} - ${cita.hora_fin}`);
                console.log(`        Estado: ${cita.estado}`);
                console.log(`        Usuario: ${cita.id_usuario}`);
                console.log(`        Servicio: ${cita.id_servicio}`);
                console.log(`        Cliente: ${cita.id_cliente}`);
                console.log(`        Precio: ${cita.precio_final}`);
                console.log('');
            });
        }

        // 2. Verificar citas activas (reservado, confirmado, en_proceso)
        console.log('2️⃣ Citas activas (reservado, confirmado, en_proceso):');
        const citasActivas = await query(`
            SELECT 
                id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio
            FROM turnos 
            WHERE estado IN ('reservado', 'confirmado', 'en_proceso')
            ORDER BY fecha DESC, hora_inicio ASC
        `);
        
        if (citasActivas.length === 0) {
            console.log('   ❌ No hay citas activas en la base de datos');
        } else {
            console.log(`   ✅ ${citasActivas.length} cita(s) activa(s):`);
            citasActivas.forEach((cita, index) => {
                console.log(`     ${index + 1}. ${cita.fecha} - ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        }

        // 3. Verificar citas para la próxima semana
        console.log('\n3️⃣ Citas para la próxima semana:');
        const proximaSemana = await query(`
            SELECT 
                id, fecha, hora_inicio, hora_fin, estado, id_usuario, id_servicio
            FROM turnos 
            WHERE fecha >= CURDATE() AND fecha <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
            ORDER BY fecha ASC, hora_inicio ASC
        `);
        
        if (proximaSemana.length === 0) {
            console.log('   ❌ No hay citas para la próxima semana');
        } else {
            console.log(`   ✅ ${proximaSemana.length} cita(s) para la próxima semana:`);
            proximaSemana.forEach((cita, index) => {
                console.log(`     ${index + 1}. ${cita.fecha} - ${cita.hora_inicio} - ${cita.hora_fin} (${cita.estado})`);
            });
        }

        // 4. Verificar si hay citas con hora_fin incorrecta
        console.log('\n4️⃣ Verificación de hora_fin:');
        if (todasLasCitas.length > 0) {
            const citasConProblema = todasLasCitas.filter(cita => 
                !cita.hora_fin || 
                cita.hora_fin === '00:00:00' || 
                cita.hora_fin === '' ||
                cita.hora_fin === cita.hora_inicio
            );
            
            if (citasConProblema.length === 0) {
                console.log('   ✅ Todas las citas tienen hora_fin correcta');
            } else {
                console.log(`   ❌ ${citasConProblema.length} cita(s) con problema en hora_fin:`);
                citasConProblema.forEach((cita, index) => {
                    console.log(`     ${index + 1}. ID: ${cita.id} - ${cita.fecha} ${cita.hora_inicio} - ${cita.hora_fin}`);
                });
            }
        }

        // 5. Análisis del problema
        console.log('\n5️⃣ Análisis del problema:');
        if (todasLasCitas.length === 0) {
            console.log('   🎯 No hay citas en la base de datos');
            console.log('   🚨 Si el usuario ve horarios ocupados, el problema está en:');
            console.log('      1. El frontend está mostrando horarios hardcodeados');
            console.log('      2. Hay algún script que está generando horarios falsos');
            console.log('      3. El usuario está viendo una página en caché');
        } else {
            console.log('   🎯 Hay citas en la base de datos');
            console.log('   🔍 Verificar si alguna de estas citas está interfiriendo');
        }

    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar verificación
verificarTodasCitas();
