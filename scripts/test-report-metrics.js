// Script para probar la función updateMetrics
console.log('🧪 Probando función updateMetrics...');

// Simular datos del dashboard
const testData = {
    totalRevenue: 40010,
    completedTurnos: 5,
    newClients: 2,
    averagePerTurno: 8002,
    todayRevenue: 40010,
    pendingTurnos: 1
};

console.log('📊 Datos de prueba:', testData);

// Verificar si la función updateMetrics está disponible
if (typeof window.updateMetrics === 'function') {
    console.log('✅ Función updateMetrics disponible');
    
    // Verificar si los elementos del HTML existen
    const elements = [
        'totalRevenue',
        'completedTurnos', 
        'newClients',
        'averagePerTurno',
        'todayRevenue'
    ];
    
    console.log('🔍 Verificando elementos del HTML:');
    elements.forEach(id => {
        const element = document.getElementById(id);
        console.log(`  - ${id}: ${element ? '✅ Encontrado' : '❌ No encontrado'}`);
    });
    
    // Llamar a la función
    console.log('🔄 Llamando a updateMetrics...');
    window.updateMetrics(testData);
    
} else {
    console.log('❌ Función updateMetrics no disponible');
    console.log('🔍 Funciones disponibles en window:', Object.keys(window).filter(key => key.includes('update')));
}

console.log('✅ Prueba completada');
