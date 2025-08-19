// Script para probar el logger simplificado
const { stats, debug, api, showConfig, setConfig } = require('../config/simple-logger');

console.log('🧪 Probando logger simplificado...\n');

// Mostrar configuración inicial
showConfig();

console.log('\n' + '='.repeat(50));

// Probar logs con configuración por defecto
console.log('\n📝 Probando logs con configuración por defecto:');
stats('Este mensaje de estadísticas NO debería verse');
debug('Este mensaje de debug NO debería verse');
api('Este mensaje de API NO debería verse');

console.log('\n' + '='.repeat(50));

// Activar logs de estadísticas
console.log('\n🔄 Activando logs de estadísticas:');
setConfig({ SHOW_STATS: true });

console.log('\n📝 Probando logs con estadísticas activadas:');
stats('Este mensaje de estadísticas SÍ debería verse');
debug('Este mensaje de debug NO debería verse');
api('Este mensaje de API NO debería verse');

console.log('\n' + '='.repeat(50));

// Activar logs de debug
console.log('\n🔄 Activando logs de debug:');
setConfig({ SHOW_DEBUG: true });

console.log('\n📝 Probando logs con debug activado:');
stats('Este mensaje de estadísticas SÍ debería verse');
debug('Este mensaje de debug SÍ debería verse');
api('Este mensaje de API SÍ debería verse');

console.log('\n' + '='.repeat(50));

// Desactivar todos los logs
console.log('\n🔄 Desactivando todos los logs:');
setConfig({ SHOW_STATS: false, SHOW_DEBUG: false });

console.log('\n📝 Probando logs con todo desactivado:');
stats('Este mensaje de estadísticas NO debería verse');
debug('Este mensaje de debug NO debería verse');
api('Este mensaje de API NO debería verse');

console.log('\n' + '='.repeat(50));

// Restaurar configuración por defecto
console.log('\n🔄 Restaurando configuración por defecto:');
setConfig({ SHOW_STATS: false, SHOW_DEBUG: false });

console.log('\n🎉 Prueba del logger simplificado completada!');
console.log('\n💡 Para activar logs en producción:');
console.log('   - SHOW_STATS_LOGS=true: Activa logs de estadísticas');
console.log('   - SHOW_DEBUG_LOGS=true: Activa logs de debug y API');
console.log('\n💡 O cambiar dinámicamente desde el código:');
console.log('   setConfig({ SHOW_STATS: true, SHOW_DEBUG: true })');
