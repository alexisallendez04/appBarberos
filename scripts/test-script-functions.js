// Script para verificar que las funciones del script.js estén accesibles
console.log('🧪 Verificando funciones del script.js...');

// Simular el contexto del navegador
global.window = {};
global.document = {
    getElementById: (id) => {
        console.log(`🔍 Buscando elemento: ${id}`);
        return {
            innerHTML: '',
            style: { display: 'block' }
        };
    }
};

// Simular funciones auxiliares
global.formatPrice = (price) => `$${price}`;
global.formatNumber = (number) => number.toString();
global.showInfo = (msg) => console.log(`ℹ️ ${msg}`);
global.showError = (msg) => console.log(`❌ ${msg}`);

// Cargar el script.js
try {
    const scriptContent = require('fs').readFileSync('views/dashboard/script.js', 'utf8');
    console.log('✅ Archivo script.js cargado correctamente');
    
    // Verificar que las funciones clave estén presentes
    const functionsToCheck = [
        'loadServices',
        'renderServices', 
        'editService',
        'deleteService'
    ];
    
    functionsToCheck.forEach(funcName => {
        if (scriptContent.includes(`function ${funcName}`)) {
            console.log(`✅ Función ${funcName} encontrada`);
        } else {
            console.log(`❌ Función ${funcName} NO encontrada`);
        }
    });
    
    // Verificar que no haya duplicados
    const renderServicesCount = (scriptContent.match(/function renderServices/g) || []).length;
    console.log(`📊 Definiciones de renderServices encontradas: ${renderServicesCount}`);
    
    if (renderServicesCount === 1) {
        console.log('✅ Solo hay una definición de renderServices');
    } else {
        console.log('❌ Hay múltiples definiciones de renderServices');
    }
    
} catch (error) {
    console.error('❌ Error cargando script.js:', error.message);
}

console.log('\n🎉 Verificación completada');
