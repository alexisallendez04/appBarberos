const ReportsController = require('../controllers/reportsController');

async function testReportPeriods() {
    console.log('🧪 Probando períodos de reportes...\n');
    
    const periods = [
        'today',
        'yesterday', 
        'week',
        'month',
        'quarter',
        'year',
        'custom'
    ];
    
    for (const period of periods) {
        try {
            console.log(`📊 Probando período: ${period}`);
            
            let startDate, endDate;
            if (period === 'custom') {
                startDate = '2025-08-01';
                endDate = '2025-08-31';
            }
            
            const { start, end } = ReportsController.calculateDateRange(period, startDate, endDate);
            const label = ReportsController.getPeriodLabel(period);
            
            console.log(`   ✅ Rango: ${start.toISOString().split('T')[0]} - ${end.toISOString().split('T')[0]}`);
            console.log(`   📝 Etiqueta: ${label}`);
            
            // Probar obtención de métricas
            const metrics = await ReportsController.getMetricsForPeriod(start, end);
            console.log(`   📈 Métricas: ${metrics.totalTurnos} turnos, $${metrics.totalRevenue} ingresos`);
            
            console.log('');
            
        } catch (error) {
            console.error(`   ❌ Error en período ${period}:`, error.message);
        }
    }
    
    console.log('🎉 Prueba de períodos completada');
}

// Ejecutar prueba
testReportPeriods().catch(console.error);
