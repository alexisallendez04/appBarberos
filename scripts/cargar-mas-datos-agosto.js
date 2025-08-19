const { query } = require('../config/db');

async function cargarMasDatosAgosto() {
    console.log('🚀 CARGANDO MÁS DATOS DE PRUEBA PARA AGOSTO');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar conexión
        console.log('\n📡 1. VERIFICANDO CONEXIÓN:');
        await query('SELECT 1 as test');
        console.log('   ✅ Conexión exitosa');
        
        // 2. Cargar más turnos para diferentes fechas
        console.log('\n📅 2. CARGANDO TURNOS ADICIONALES:');
        
        // Turnos para diferentes días de agosto
        const turnosAdicionales = [
            // Semana del 5-9 de agosto
            { fecha: '2025-08-05', hora: '09:00', duracion: 45, precio: 25000, cliente: 1, servicio: 1 },
            { fecha: '2025-08-05', hora: '10:00', duracion: 60, precio: 35000, cliente: 2, servicio: 2 },
            { fecha: '2025-08-06', hora: '09:00', duracion: 30, precio: 15000, cliente: 3, servicio: 3 },
            { fecha: '2025-08-06', hora: '10:00', duracion: 50, precio: 30000, cliente: 4, servicio: 4 },
            { fecha: '2025-08-07', hora: '09:00', duracion: 45, precio: 25000, cliente: 5, servicio: 1 },
            { fecha: '2025-08-07', hora: '10:00', duracion: 75, precio: 45000, cliente: 6, servicio: 5 },
            { fecha: '2025-08-08', hora: '09:00', duracion: 60, precio: 35000, cliente: 7, servicio: 2 },
            { fecha: '2025-08-08', hora: '10:00', duracion: 45, precio: 25000, cliente: 8, servicio: 1 },
            { fecha: '2025-08-09', hora: '09:00', duracion: 30, precio: 15000, cliente: 9, servicio: 3 },
            
            // Semana del 12-16 de agosto
            { fecha: '2025-08-12', hora: '09:00', duracion: 45, precio: 25000, cliente: 1, servicio: 1 },
            { fecha: '2025-08-12', hora: '10:00', duracion: 60, precio: 35000, cliente: 2, servicio: 2 },
            { fecha: '2025-08-13', hora: '09:00', duracion: 50, precio: 30000, cliente: 3, servicio: 4 },
            { fecha: '2025-08-13', hora: '10:00', duracion: 75, precio: 45000, cliente: 4, servicio: 5 },
            { fecha: '2025-08-14', hora: '09:00', duracion: 45, precio: 25000, cliente: 5, servicio: 1 },
            { fecha: '2025-08-14', hora: '10:00', duracion: 30, precio: 15000, cliente: 6, servicio: 3 },
            { fecha: '2025-08-15', hora: '09:00', duracion: 60, precio: 35000, cliente: 7, servicio: 2 },
            { fecha: '2025-08-15', hora: '10:00', duracion: 45, precio: 25000, cliente: 8, servicio: 1 },
            { fecha: '2025-08-16', hora: '09:00', duracion: 50, precio: 30000, cliente: 9, servicio: 4 },
            
            // Semana del 19-23 de agosto
            { fecha: '2025-08-19', hora: '09:00', duracion: 45, precio: 25000, cliente: 1, servicio: 1 },
            { fecha: '2025-08-19', hora: '10:00', duracion: 60, precio: 35000, cliente: 2, servicio: 2 },
            { fecha: '2025-08-20', hora: '09:00', duracion: 30, precio: 15000, cliente: 3, servicio: 3 },
            { fecha: '2025-08-20', hora: '10:00', duracion: 75, precio: 45000, cliente: 4, servicio: 5 },
            { fecha: '2025-08-21', hora: '09:00', duracion: 45, precio: 25000, cliente: 5, servicio: 1 },
            { fecha: '2025-08-21', hora: '10:00', duracion: 50, precio: 30000, cliente: 6, servicio: 4 },
            { fecha: '2025-08-22', hora: '09:00', duracion: 60, precio: 35000, cliente: 7, servicio: 2 },
            { fecha: '2025-08-22', hora: '10:00', duracion: 45, precio: 25000, cliente: 8, servicio: 1 },
            { fecha: '2025-08-23', hora: '09:00', duracion: 30, precio: 15000, cliente: 9, servicio: 3 },
            
            // Semana del 26-30 de agosto
            { fecha: '2025-08-26', hora: '09:00', duracion: 45, precio: 25000, cliente: 1, servicio: 1 },
            { fecha: '2025-08-26', hora: '10:00', duracion: 60, precio: 35000, cliente: 2, servicio: 2 },
            { fecha: '2025-08-27', hora: '09:00', duracion: 50, precio: 30000, cliente: 3, servicio: 4 },
            { fecha: '2025-08-27', hora: '10:00', duracion: 75, precio: 45000, cliente: 4, servicio: 5 },
            { fecha: '2025-08-28', hora: '09:00', duracion: 45, precio: 25000, cliente: 5, servicio: 1 },
            { fecha: '2025-08-28', hora: '10:00', duracion: 30, precio: 15000, cliente: 6, servicio: 3 },
            { fecha: '2025-08-29', hora: '09:00', duracion: 60, precio: 35000, cliente: 7, servicio: 2 },
            { fecha: '2025-08-29', hora: '10:00', duracion: 45, precio: 25000, cliente: 8, servicio: 1 },
            { fecha: '2025-08-30', hora: '09:00', duracion: 50, precio: 30000, cliente: 9, servicio: 4 }
        ];
        
        let turnosInsertados = 0;
        
        for (const turno of turnosAdicionales) {
            // Calcular hora de fin
            const horaInicio = new Date(`2025-08-01T${turno.hora}:00`);
            const horaFin = new Date(horaInicio.getTime() + (turno.duracion * 60000));
            const horaFinStr = horaFin.toTimeString().slice(0, 5);
            
            // Estado: 85% completado, 10% confirmado, 5% en_proceso
            const randomEstado = Math.random();
            let estado;
            
            if (randomEstado < 0.85) {
                estado = 'completado';
            } else if (randomEstado < 0.95) {
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
                turno.precio, turno.cliente, turno.servicio, 1
            ]);
            
            turnosInsertados++;
        }
        
        console.log(`   ✅ ${turnosInsertados} turnos adicionales insertados`);
        
        // 3. Resumen final
        console.log('\n📊 3. RESUMEN FINAL DE DATOS:');
        
        const resumenFinal = await query(`
            SELECT 
                COUNT(*) as total_turnos,
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
                COUNT(CASE WHEN estado = 'confirmado' THEN 1 END) as confirmados,
                COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos_completados,
                SUM(CASE WHEN estado IN ('confirmado', 'en_proceso') THEN precio_final ELSE 0 END) as ingresos_pendientes
            FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        
        const datos = resumenFinal[0];
        console.log(`   📅 Período: Agosto 2025`);
        console.log(`   📊 Total turnos: ${datos.total_turnos}`);
        console.log(`   ✅ Completados: ${datos.completados}`);
        console.log(`   ⏳ Confirmados: ${datos.confirmados}`);
        console.log(`   🔄 En proceso: ${datos.en_proceso}`);
        console.log(`   💰 Ingresos completados: $${datos.ingresos_completados}`);
        console.log(`   💳 Ingresos pendientes: $${datos.ingresos_pendientes}`);
        
        // 4. Verificar períodos de reportes
        console.log('\n🧪 4. VERIFICACIÓN DE PERÍODOS DE REPORTES:');
        
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        
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
        
        // Este trimestre
        const turnosTrimestre = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha >= DATE_FORMAT(NOW(), '%Y-01-01') 
            AND fecha < DATE_ADD(DATE_FORMAT(NOW(), '%Y-01-01'), INTERVAL 3 MONTH)
        `);
        
        // Este año
        const turnosAno = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEAR(fecha) = YEAR(CURDATE())
        `);
        
        console.log(`   📅 Hoy (${hoy.toISOString().split('T')[0]}): ${turnosHoy[0].total} turnos, $${turnosHoy[0].ingresos || 0}`);
        console.log(`   📅 Ayer (${ayer.toISOString().split('T')[0]}): ${turnosAyer[0].total} turnos, $${turnosAyer[0].ingresos || 0}`);
        console.log(`   📅 Esta Semana: ${turnosSemana[0].total} turnos, $${turnosSemana[0].ingresos || 0}`);
        console.log(`   📅 Este Mes: ${turnosMes[0].total} turnos, $${turnosMes[0].ingresos || 0}`);
        console.log(`   📅 Este Trimestre: ${turnosTrimestre[0].total} turnos, $${turnosTrimestre[0].ingresos || 0}`);
        console.log(`   📅 Este Año: ${turnosAno[0].total} turnos, $${turnosAno[0].ingresos || 0}`);
        
        console.log('\n🎯 DATOS DE PRUEBA COMPLETOS CARGADOS!');
        console.log('\n🧪 AHORA PUEDES PROBAR TODOS LOS PERÍODOS:');
        console.log('   1. 📊 Ve a la sección de Reportes');
        console.log('   2. 📅 Prueba: Hoy, Ayer, Esta Semana, Este Mes, Este Trimestre, Este Año');
        console.log('   3. 📈 Verifica las nuevas métricas de rentabilidad');
        console.log('   4. 💡 Revisa los insights del negocio');
        console.log('   5. 📊 Compara los gráficos semanales');
        console.log('   6. 🎯 Analiza las tendencias y recomendaciones');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    }
}

// Ejecutar
cargarMasDatosAgosto().then(() => {
    console.log('\n✅ Script completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
