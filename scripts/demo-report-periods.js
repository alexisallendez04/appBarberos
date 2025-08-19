const ReportsController = require('../controllers/reportsController');

async function demoReportPeriods() {
    console.log('🎯 DEMOSTRACIÓN DE PERÍODOS DE REPORTES\n');
    console.log('=' .repeat(60));
    
    // 1. HOY
    console.log('\n📅 PERÍODO: HOY');
    console.log('-'.repeat(30));
    const todayRange = ReportsController.calculateDateRange('today');
    console.log(`Rango: ${todayRange.start.toLocaleDateString('es-ES')} - ${todayRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('today')}`);
    
    // 2. AYER
    console.log('\n📆 PERÍODO: AYER');
    console.log('-'.repeat(30));
    const yesterdayRange = ReportsController.calculateDateRange('yesterday');
    console.log(`Rango: ${yesterdayRange.start.toLocaleDateString('es-ES')} - ${yesterdayRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('yesterday')}`);
    
    // 3. ESTA SEMANA
    console.log('\n📊 PERÍODO: ESTA SEMANA');
    console.log('-'.repeat(30));
    const weekRange = ReportsController.calculateDateRange('week');
    console.log(`Rango: ${weekRange.start.toLocaleDateString('es-ES')} - ${weekRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('week')}`);
    
    // 4. ESTE MES
    console.log('\n📈 PERÍODO: ESTE MES');
    console.log('-'.repeat(30));
    const monthRange = ReportsController.calculateDateRange('month');
    console.log(`Rango: ${monthRange.start.toLocaleDateString('es-ES')} - ${monthRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('month')}`);
    
    // 5. ESTE TRIMESTRE
    console.log('\n📉 PERÍODO: ESTE TRIMESTRE');
    console.log('-'.repeat(30));
    const quarterRange = ReportsController.calculateDateRange('quarter');
    console.log(`Rango: ${quarterRange.start.toLocaleDateString('es-ES')} - ${quarterRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('quarter')}`);
    
    // 6. ESTE AÑO
    console.log('\n🎯 PERÍODO: ESTE AÑO');
    console.log('-'.repeat(30));
    const yearRange = ReportsController.calculateDateRange('year');
    console.log(`Rango: ${yearRange.start.toLocaleDateString('es-ES')} - ${yearRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('year')}`);
    
    // 7. PERSONALIZADO
    console.log('\n⚙️ PERÍODO: PERSONALIZADO');
    console.log('-'.repeat(30));
    const customRange = ReportsController.calculateDateRange('custom', '2025-08-01', '2025-08-15');
    console.log(`Rango: ${customRange.start.toLocaleDateString('es-ES')} - ${customRange.end.toLocaleDateString('es-ES')}`);
    console.log(`Etiqueta: ${ReportsController.getPeriodLabel('custom')}`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ Demostración completada');
    console.log('\n💡 USO EN LA INTERFAZ:');
    console.log('1. Selecciona el período deseado en el dropdown');
    console.log('2. Para períodos personalizados, ingresa fechas de inicio y fin');
    console.log('3. Haz clic en "Actualizar" para generar el reporte');
    console.log('4. Los gráficos y métricas se actualizarán automáticamente');
}

// Ejecutar demostración
demoReportPeriods().catch(console.error);
