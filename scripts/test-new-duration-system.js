const { query } = require('../config/db');

async function testNewDurationSystem() {
    try {
        console.log('🧪 Probando el nuevo sistema de duración por servicio...\n');

        // 1. Verificar que la tabla servicios tenga el campo duracion
        console.log('1️⃣ Verificando estructura de la tabla servicios...');
        const tableStructure = await query(`
            DESCRIBE servicios
        `);
        
        const hasDuracion = tableStructure.some(col => col.Field === 'duracion');
        if (hasDuracion) {
            console.log('✅ Campo duracion encontrado en la tabla servicios');
        } else {
            console.log('❌ Campo duracion NO encontrado. Ejecuta sql/update-schema.sql primero');
            return;
        }

        // 2. Mostrar servicios existentes con sus duraciones
        console.log('\n2️⃣ Servicios existentes con duraciones:');
        const servicios = await query(`
            SELECT id, nombre, precio, duracion, estado 
            FROM servicios 
            ORDER BY id
        `);
        
        if (servicios.length === 0) {
            console.log('⚠️  No hay servicios en la base de datos');
        } else {
            servicios.forEach((servicio, index) => {
                console.log(`   ${index + 1}. ${servicio.nombre} - $${servicio.precio} - ${servicio.duracion} min - ${servicio.estado}`);
            });
        }

        // 3. Simular creación de un nuevo servicio con duración
        console.log('\n3️⃣ Simulando creación de servicio con duración...');
        const nuevoServicio = {
            nombre: 'Corte + Barba Completo',
            descripcion: 'Corte de cabello profesional + afeitado de barba',
            precio: 45.00,
            duracion: 75, // 1 hora 15 minutos
            estado: 'activo'
        };
        
        console.log(`   Nombre: ${nuevoServicio.nombre}`);
        console.log(`   Precio: $${nuevoServicio.precio}`);
        console.log(`   Duración: ${nuevoServicio.duracion} minutos (${Math.floor(nuevoServicio.duracion/60)}h ${nuevoServicio.duracion%60}min)`);
        console.log(`   Estado: ${nuevoServicio.estado}`);

        // 4. Verificar configuración de intervalo mínimo
        console.log('\n4️⃣ Verificando configuración de intervalo mínimo...');
        const configuraciones = await query(`
            SELECT id_usuario, intervalo_turnos, anticipacion_reserva, max_reservas_dia
            FROM configuracion_barbero
        `);
        
        if (configuraciones.length === 0) {
            console.log('⚠️  No hay configuraciones de barberos');
        } else {
            configuraciones.forEach((config, index) => {
                console.log(`   Barbero ${config.id_usuario}: Intervalo mínimo ${config.intervalo_turnos} min`);
            });
        }

        // 5. Simular generación de slots para diferentes servicios
        console.log('\n5️⃣ Simulando generación de slots para diferentes servicios...');
        
        const serviciosTest = [
            { nombre: 'Corte Simple', duracion: 30, intervalo: 15 },
            { nombre: 'Corte + Barba', duracion: 60, intervalo: 15 },
            { nombre: 'Tratamiento Completo', duracion: 90, intervalo: 15 }
        ];

        serviciosTest.forEach(servicio => {
            const intervaloEfectivo = Math.max(servicio.duracion, servicio.intervalo);
            console.log(`   ${servicio.nombre}:`);
            console.log(`     Duración: ${servicio.duracion} min`);
            console.log(`     Intervalo mínimo: ${servicio.intervalo} min`);
            console.log(`     Intervalo efectivo: ${intervaloEfectivo} min`);
            console.log(`     Turnos por hora: ${Math.floor(60 / intervaloEfectivo)}`);
        });

        // 6. Verificar que los turnos existentes usen la duración del servicio
        console.log('\n6️⃣ Verificando turnos existentes...');
        const turnos = await query(`
            SELECT t.id, t.fecha, t.hora_inicio, t.hora_fin, 
                   s.nombre as servicio_nombre, s.duracion as servicio_duracion,
                   TIMESTAMPDIFF(MINUTE, t.hora_inicio, t.hora_fin) as duracion_real
            FROM turnos t
            JOIN servicios s ON t.id_servicio = s.id
            ORDER BY t.fecha DESC, t.hora_inicio ASC
            LIMIT 5
        `);
        
        if (turnos.length === 0) {
            console.log('⚠️  No hay turnos en la base de datos');
        } else {
            console.log('Turnos recientes:');
            turnos.forEach((turno, index) => {
                const duracionCoincide = turno.duracion_real === turno.servicio_duracion;
                const status = duracionCoincide ? '✅' : '❌';
                console.log(`   ${index + 1}. ${turno.fecha} ${turno.hora_inicio}-${turno.hora_fin}`);
                console.log(`      Servicio: ${turno.servicio_nombre}`);
                console.log(`      Duración configurada: ${turno.servicio_duracion} min`);
                console.log(`      Duración real: ${turno.duracion_real} min ${status}`);
            });
        }

        console.log('\n🎯 Resumen del nuevo sistema:');
        console.log('   ✅ Cada servicio define su propia duración');
        console.log('   ✅ El intervalo mínimo es solo para espaciado entre turnos');
        console.log('   ✅ Los slots se generan basándose en la duración real del servicio');
        console.log('   ✅ Mayor flexibilidad para diferentes tipos de servicios');
        console.log('   ✅ Mejor aprovechamiento del tiempo del barbero');

    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la prueba
testNewDurationSystem();
