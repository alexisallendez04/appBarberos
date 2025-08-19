const { query } = require('../config/db');

async function cargarDatosSimple() {
    console.log('🚀 CARGANDO DATOS DE PRUEBA SIMPLE PARA AGOSTO');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar que podemos conectar
        console.log('\n📡 1. VERIFICANDO CONEXIÓN:');
        const test = await query('SELECT 1 as test');
        console.log('   ✅ Conexión exitosa');
        
        // 2. Limpiar turnos existentes de agosto
        console.log('\n🧹 2. LIMPIANDO TURNOS DE AGOSTO:');
        const eliminados = await query(`
            DELETE FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        console.log('   ✅ Turnos eliminados');
        
        // 3. Insertar algunos turnos de prueba
        console.log('\n📅 3. INSERTANDO TURNOS DE PRUEBA:');
        
        // Turnos para hoy (18 de agosto)
        const turnosHoy = [
            {
                fecha: '2025-08-18',
                hora_inicio: '09:00',
                hora_fin: '09:45',
                estado: 'completado',
                precio_final: 25000,
                id_cliente: 1,
                id_servicio: 1,
                id_usuario: 1
            },
            {
                fecha: '2025-08-18',
                hora_inicio: '10:00',
                hora_fin: '11:00',
                estado: 'completado',
                precio_final: 35000,
                id_cliente: 2,
                id_servicio: 2,
                id_usuario: 1
            },
            {
                fecha: '2025-08-18',
                hora_inicio: '11:15',
                hora_fin: '11:45',
                estado: 'completado',
                precio_final: 15000,
                id_cliente: 3,
                id_servicio: 3,
                id_usuario: 1
            }
        ];
        
        // Turnos para ayer (17 de agosto)
        const turnosAyer = [
            {
                fecha: '2025-08-17',
                hora_inicio: '09:00',
                hora_fin: '09:45',
                estado: 'completado',
                precio_final: 25000,
                id_cliente: 4,
                id_servicio: 1,
                id_usuario: 1
            },
            {
                fecha: '2025-08-17',
                hora_inicio: '10:00',
                hora_fin: '11:00',
                estado: 'completado',
                precio_final: 35000,
                id_cliente: 5,
                id_servicio: 2,
                id_usuario: 1
            }
        ];
        
        // Turnos para la semana pasada
        const turnosSemanaPasada = [
            {
                fecha: '2025-08-11',
                hora_inicio: '09:00',
                hora_fin: '09:45',
                estado: 'completado',
                precio_final: 25000,
                id_cliente: 6,
                id_servicio: 1,
                id_usuario: 1
            },
            {
                fecha: '2025-08-12',
                hora_inicio: '10:00',
                hora_fin: '11:00',
                estado: 'completado',
                precio_final: 35000,
                id_cliente: 7,
                id_servicio: 2,
                id_usuario: 1
            },
            {
                fecha: '2025-08-13',
                hora_inicio: '11:00',
                hora_fin: '11:30',
                estado: 'completado',
                precio_final: 15000,
                id_cliente: 8,
                id_servicio: 3,
                id_usuario: 1
            }
        ];
        
        // Insertar todos los turnos
        const todosTurnos = [...turnosHoy, ...turnosAyer, ...turnosSemanaPasada];
        
        for (const turno of todosTurnos) {
            await query(`
                INSERT INTO turnos (
                    fecha, hora_inicio, hora_fin, estado, precio_final,
                    id_cliente, id_servicio, id_usuario
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                turno.fecha, turno.hora_inicio, turno.hora_fin, turno.estado,
                turno.precio_final, turno.id_cliente, turno.id_servicio, turno.id_usuario
            ]);
        }
        
        console.log(`   ✅ ${todosTurnos.length} turnos insertados`);
        
        // 4. Verificar datos insertados
        console.log('\n📊 4. VERIFICANDO DATOS INSERTADOS:');
        
        const resumen = await query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha >= '2025-08-01'
        `);
        
        console.log(`   📊 Total turnos en agosto: ${resumen[0].total}`);
        console.log(`   💰 Ingresos totales: $${resumen[0].ingresos}`);
        
        // 5. Verificar períodos específicos
        console.log('\n🧪 5. VERIFICANDO PERÍODOS:');
        
        // Hoy
        const hoy = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = CURDATE()
        `);
        
        // Ayer
        const ayer = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Esta semana
        const semana = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEARWEEK(fecha) = YEARWEEK(CURDATE())
        `);
        
        console.log(`   📅 Hoy: ${hoy[0].total} turnos, $${hoy[0].ingresos || 0}`);
        console.log(`   📅 Ayer: ${ayer[0].total} turnos, $${ayer[0].ingresos || 0}`);
        console.log(`   📅 Esta semana: ${semana[0].total} turnos, $${semana[0].ingresos || 0}`);
        
        console.log('\n✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE!');
        console.log('\n🧪 AHORA PUEDES PROBAR LOS REPORTES:');
        console.log('   1. 📊 Ve a la sección de Reportes');
        console.log('   2. 📅 Prueba: Hoy, Ayer, Esta Semana');
        console.log('   3. 📈 Verifica las nuevas métricas');
        console.log('   4. 💡 Revisa los insights');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Ejecutar
cargarDatosSimple().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
