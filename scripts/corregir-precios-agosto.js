const { query } = require('../config/db');

async function corregirPreciosAgosto() {
    console.log('🔧 CORRIGIENDO PRECIOS DE AGOSTO A $20,000');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar el precio correcto del servicio
        console.log('\n💰 1. VERIFICANDO PRECIO CORRECTO:');
        const servicios = await query('SELECT id, nombre, precio FROM servicios WHERE estado = "activo" LIMIT 1');
        
        if (servicios.length === 0) {
            console.log('   ❌ No hay servicios activos');
            return;
        }
        
        const precioCorrecto = servicios[0].precio;
        console.log(`   ✅ Precio correcto del servicio: $${precioCorrecto}`);
        console.log(`   📋 Servicio: ${servicios[0].nombre}`);
        
        // 2. Limpiar todos los turnos de agosto
        console.log('\n🧹 2. LIMPIANDO TURNOS DE AGOSTO:');
        const eliminados = await query(`
            DELETE FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        console.log(`   ✅ Turnos eliminados: ${eliminados.affectedRows}`);
        
        // 3. Crear nuevos turnos con precio correcto
        console.log('\n📅 3. CREANDO NUEVOS TURNOS CON PRECIO CORRECTO:');
        
        // Turnos para diferentes fechas de agosto
        const turnos = [
            // Hoy (18 de agosto)
            { fecha: '2025-08-18', hora: '09:00', duracion: 45, cliente: 1, servicio: 1 },
            { fecha: '2025-08-18', hora: '10:00', duracion: 60, cliente: 2, servicio: 2 },
            { fecha: '2025-08-18', hora: '11:15', duracion: 30, cliente: 3, servicio: 3 },
            
            // Ayer (17 de agosto)
            { fecha: '2025-08-17', hora: '09:00', duracion: 45, cliente: 4, servicio: 1 },
            { fecha: '2025-08-17', hora: '10:00', duracion: 60, cliente: 5, servicio: 2 },
            
            // Semana pasada
            { fecha: '2025-08-11', hora: '09:00', duracion: 45, cliente: 6, servicio: 1 },
            { fecha: '2025-08-12', hora: '10:00', duracion: 60, cliente: 7, servicio: 2 },
            { fecha: '2025-08-13', hora: '11:00', duracion: 30, cliente: 8, servicio: 3 },
            
            // Más fechas para probar todos los períodos
            { fecha: '2025-08-05', hora: '09:00', duracion: 45, cliente: 1, servicio: 1 },
            { fecha: '2025-08-06', hora: '10:00', duracion: 60, cliente: 2, servicio: 2 },
            { fecha: '2025-08-07', hora: '11:00', duracion: 30, cliente: 3, servicio: 3 },
            { fecha: '2025-08-08', hora: '09:00', duracion: 45, cliente: 4, servicio: 1 },
            { fecha: '2025-08-09', hora: '10:00', duracion: 60, cliente: 5, servicio: 2 },
            
            { fecha: '2025-08-19', hora: '09:00', duracion: 45, cliente: 6, servicio: 1 },
            { fecha: '2025-08-20', hora: '10:00', duracion: 60, cliente: 7, servicio: 2 },
            { fecha: '2025-08-21', hora: '11:00', duracion: 30, cliente: 8, servicio: 3 },
            { fecha: '2025-08-22', hora: '09:00', duracion: 45, cliente: 1, servicio: 1 },
            { fecha: '2025-08-23', hora: '10:00', duracion: 60, cliente: 2, servicio: 2 },
            
            { fecha: '2025-08-26', hora: '09:00', duracion: 45, cliente: 3, servicio: 1 },
            { fecha: '2025-08-27', hora: '10:00', duracion: 60, cliente: 4, servicio: 2 },
            { fecha: '2025-08-28', hora: '11:00', duracion: 30, cliente: 5, servicio: 3 },
            { fecha: '2025-08-29', hora: '09:00', duracion: 45, cliente: 6, servicio: 1 },
            { fecha: '2025-08-30', hora: '10:00', duracion: 60, cliente: 7, servicio: 2 }
        ];
        
        let turnosInsertados = 0;
        
        for (const turno of turnos) {
            // Calcular hora de fin
            const horaInicio = new Date(`2025-08-01T${turno.hora}:00`);
            const horaFin = new Date(horaInicio.getTime() + (turno.duracion * 60000));
            const horaFinStr = horaFin.toTimeString().slice(0, 5);
            
            // Estado: 90% completado, 8% confirmado, 2% en_proceso
            const randomEstado = Math.random();
            let estado;
            
            if (randomEstado < 0.90) {
                estado = 'completado';
            } else if (randomEstado < 0.98) {
                estado = 'confirmado';
            } else {
                estado = 'en_proceso';
            }
            
            await query(`
                INSERT INTO turnos (
                    fecha, hora_inicio, hora_fin, estado, precio_final,
                    id_cliente, id_servicio, id_usuario
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                turno.fecha, turno.hora, horaFinStr, estado,
                precioCorrecto, turno.cliente, turno.servicio, 1
            ]);
            
            turnosInsertados++;
        }
        
        console.log(`   ✅ ${turnosInsertados} turnos insertados con precio correcto`);
        
        // 4. Verificar datos finales
        console.log('\n📊 4. VERIFICACIÓN FINAL:');
        
        const resumen = await query(`
            SELECT 
                COUNT(*) as total_turnos,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
                COUNT(CASE WHEN estado = 'confirmado' THEN 1 END) as confirmados,
                COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos_completados
            FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        
        const datos = resumen[0];
        console.log(`   📅 Período: Agosto 2025`);
        console.log(`   📊 Total turnos: ${datos.total_turnos}`);
        console.log(`   ✅ Completados: ${datos.completados}`);
        console.log(`   ⏳ Confirmados: ${datos.confirmados}`);
        console.log(`   🔄 En proceso: ${datos.en_proceso}`);
        console.log(`   💰 Ingresos completados: $${datos.ingresos_completados}`);
        console.log(`   💰 Precio por turno: $${precioCorrecto}`);
        
        // 5. Verificar períodos de reportes
        console.log('\n🧪 5. VERIFICACIÓN DE PERÍODOS:');
        
        // Hoy
        const turnosHoy = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = CURDATE()
        `);
        
        // Ayer
        const turnosAyer = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Esta semana
        const turnosSemana = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEARWEEK(fecha) = YEARWEEK(CURDATE())
        `);
        
        // Este mes
        const turnosMes = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())
        `);
        
        console.log(`   📅 Hoy: ${turnosHoy[0].total} turnos, $${turnosHoy[0].ingresos || 0}`);
        console.log(`   📅 Ayer: ${turnosAyer[0].total} turnos, $${turnosAyer[0].ingresos || 0}`);
        console.log(`   📅 Esta Semana: ${turnosSemana[0].total} turnos, $${turnosSemana[0].ingresos || 0}`);
        console.log(`   📅 Este Mes: ${turnosMes[0].total} turnos, $${turnosMes[0].ingresos || 0}`);
        
        console.log('\n✅ PRECIOS CORREGIDOS EXITOSAMENTE!');
        console.log('\n🧪 AHORA PUEDES PROBAR LOS REPORTES:');
        console.log('   1. 📊 Ve a la sección de Reportes');
        console.log('   2. 📅 Prueba: Hoy, Ayer, Esta Semana, Este Mes');
        console.log('   3. 📈 Verifica que los ingresos sean correctos ($20,000 por turno)');
        console.log('   4. 💡 Revisa los insights del negocio');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Ejecutar corrección
corregirPreciosAgosto().then(() => {
    console.log('\n✅ Script de corrección completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
