const { query } = require('../config/db');

async function testReportsFix() {
    console.log('🧪 PRUEBA DE CORRECCIÓN DE REPORTES');
    console.log('=' .repeat(50));
    
    try {
        // 1. Verificar turnos en la base de datos
        console.log('\n📋 1. VERIFICACIÓN DE TURNOS EN LA BASE DE DATOS:');
        const turnos = await query(`
            SELECT 
                id,
                fecha,
                hora_inicio,
                estado,
                precio_final,
                id_cliente,
                id_servicio
            FROM turnos 
            WHERE estado IN ('completado', 'confirmado', 'reservado', 'en_proceso')
            ORDER BY fecha DESC, hora_inicio DESC
            LIMIT 10
        `);
        
        if (turnos.length > 0) {
            console.log(`   ✅ Encontrados ${turnos.length} turnos activos:`);
            turnos.forEach(turno => {
                console.log(`      - ID: ${turno.id} | Fecha: ${turno.fecha} | Hora: ${turno.hora_inicio} | Estado: ${turno.estado} | Precio: $${turno.precio_final}`);
            });
        } else {
            console.log('   ℹ️  No hay turnos activos en la base de datos');
        }
        
        // 2. Simular cálculo de métricas (como lo hace el controlador)
        console.log('\n📊 2. SIMULACIÓN DE CÁLCULO DE MÉTRICAS:');
        
        // Obtener fecha de hace 30 días y hoy
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        const startStr = thirtyDaysAgo.toISOString().slice(0, 19).replace('T', ' ');
        const endStr = today.toISOString().slice(0, 19).replace('T', ' ');
        
        console.log(`   📅 Período: ${startStr} a ${endStr}`);
        
        // Consulta ANTES de la corrección (problemática)
        const metricsBeforeFix = await query(`
            SELECT 
                COUNT(CASE WHEN estado IN ('completado', 'confirmado') THEN 1 END) as totalTurnos,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completedTurnos,
                SUM(CASE WHEN estado IN ('reservado', 'en_proceso') THEN 1 ELSE 0 END) as pendingTurnos,
                SUM(CASE WHEN estado IN ('completado', 'confirmado') THEN precio_final ELSE 0 END) as totalRevenue
            FROM turnos 
            WHERE CONCAT(fecha, ' ', hora_inicio) >= ? AND CONCAT(fecha, ' ', hora_inicio) < ?
            AND estado NOT IN ('cancelado', 'no_show')
        `, [startStr, endStr]);
        
        // Consulta DESPUÉS de la corrección (correcta)
        const metricsAfterFix = await query(`
            SELECT 
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as totalTurnos,
                SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completedTurnos,
                SUM(CASE WHEN estado IN ('reservado', 'en_proceso') THEN 1 ELSE 0 END) as pendingTurnos,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as totalRevenue
            FROM turnos 
            WHERE CONCAT(fecha, ' ', hora_inicio) >= ? AND CONCAT(fecha, ' ', hora_inicio) < ?
            AND estado NOT IN ('cancelado', 'no_show')
        `, [startStr, endStr]);
        
        console.log('\n   ❌ ANTES de la corrección (PROBLEMÁTICO):');
        console.log(`      - Total turnos: ${metricsBeforeFix[0].totalTurnos}`);
        console.log(`      - Turnos completados: ${metricsBeforeFix[0].completedTurnos}`);
        console.log(`      - Turnos pendientes: ${metricsBeforeFix[0].pendingTurnos}`);
        console.log(`      - Ingresos totales: $${metricsBeforeFix[0].totalRevenue}`);
        
        console.log('\n   ✅ DESPUÉS de la corrección (CORRECTO):');
        console.log(`      - Total turnos: ${metricsAfterFix[0].totalTurnos}`);
        console.log(`      - Turnos completados: ${metricsAfterFix[0].completedTurnos}`);
        console.log(`      - Turnos pendientes: ${metricsAfterFix[0].pendingTurnos}`);
        console.log(`      - Ingresos totales: $${metricsAfterFix[0].totalRevenue}`);
        
        // 3. Análisis del problema
        console.log('\n🔍 3. ANÁLISIS DEL PROBLEMA:');
        const diferencia = (metricsBeforeFix[0].totalRevenue || 0) - (metricsAfterFix[0].totalRevenue || 0);
        
        if (diferencia > 0) {
            console.log(`   ⚠️  PROBLEMA IDENTIFICADO:`);
            console.log(`      - Ingresos duplicados: $${diferencia}`);
            console.log(`      - Causa: Turnos 'confirmado' se estaban contando como facturados`);
            console.log(`      - Solución: Solo contar turnos 'completado'`);
        } else {
            console.log(`   ✅ No hay duplicación de ingresos`);
        }
        
        // 4. Verificar estados de turnos específicos
        console.log('\n📋 4. VERIFICACIÓN DE ESTADOS DE TURNOS:');
        const estadosTurnos = await query(`
            SELECT 
                estado,
                COUNT(*) as cantidad,
                SUM(precio_final) as total_precio
            FROM turnos 
            WHERE CONCAT(fecha, ' ', hora_inicio) >= ? AND CONCAT(fecha, ' ', hora_inicio) < ?
            AND estado NOT IN ('cancelado', 'no_show')
            GROUP BY estado
            ORDER BY estado
        `, [startStr, endStr]);
        
        estadosTurnos.forEach(estado => {
            console.log(`      - ${estado.estado}: ${estado.cantidad} turnos, $${estado.total_precio} total`);
        });
        
        console.log('\n✅ PRUEBA COMPLETADA');
        console.log('\n🎯 RESULTADO ESPERADO:');
        console.log('   - Los reportes ahora solo mostrarán ingresos de turnos COMPLETADOS');
        console.log('   - No más duplicación de ingresos por turnos confirmados');
        console.log('   - Métricas más precisas y realistas');
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
    }
}

// Ejecutar la prueba
testReportsFix().then(() => {
    console.log('\n✅ Script de prueba completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
