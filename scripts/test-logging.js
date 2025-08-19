// Script para probar el nuevo sistema de logs
const { logger, configureLogger, LOG_LEVELS } = require('../config/logging');

console.log('🧪 Probando sistema de logs configurable...\n');

// Mostrar configuración inicial
logger.showConfig();

console.log('\n' + '='.repeat(60));

// Probar diferentes niveles de logs
console.log('\n📝 Probando diferentes tipos de logs:');

logger.error('Este es un mensaje de ERROR');
logger.warn('Este es un mensaje de ADVERTENCIA');
logger.info('Este es un mensaje de INFORMACIÓN');
logger.debug('Este es un mensaje de DEBUG');
logger.stats('Este es un mensaje de ESTADÍSTICAS');
logger.success('Este es un mensaje de ÉXITO');
logger.start('Este es un mensaje de INICIO');
logger.db('Este es un mensaje de BASE DE DATOS');
logger.api('Este es un mensaje de API');

console.log('\n' + '='.repeat(60));

// Probar cambio de nivel dinámicamente
console.log('\n🔄 Cambiando nivel de log a ERROR (solo errores):');
logger.setLevel(LOG_LEVELS.ERROR);

logger.error('ERROR - Debería verse');
logger.warn('WARN - NO debería verse');
logger.info('INFO - NO debería verse');
logger.debug('DEBUG - NO debería verse');
logger.stats('STATS - NO debería verse');

console.log('\n' + '='.repeat(60));

// Cambiar a nivel INFO
console.log('\n🔄 Cambiando nivel de log a INFO:');
logger.setLevel(LOG_LEVELS.INFO);

logger.error('ERROR - Debería verse');
logger.warn('WARN - Debería verse');
logger.info('INFO - Debería verse');
logger.debug('DEBUG - NO debería verse');
logger.stats('STATS - NO debería verse');

console.log('\n' + '='.repeat(60));

// Cambiar a nivel DEBUG
console.log('\n🔄 Cambiando nivel de log a DEBUG:');
logger.setLevel(LOG_LEVELS.DEBUG);

logger.error('ERROR - Debería verse');
logger.warn('WARN - Debería verse');
logger.info('INFO - Debería verse');
logger.debug('DEBUG - Debería verse');
logger.stats('STATS - Debería verse');

console.log('\n' + '='.repeat(60));

// Restaurar nivel por defecto
console.log('\n🔄 Restaurando nivel de log por defecto:');
logger.setLevel(LOG_LEVELS.INFO);

console.log('\n🎉 Prueba de logs completada!');
console.log('\n💡 Para controlar los logs en producción:');
console.log('   - LOG_LEVEL=0: Solo errores');
console.log('   - LOG_LEVEL=1: Errores y advertencias');
console.log('   - LOG_LEVEL=2: Información básica (recomendado)');
console.log('   - LOG_LEVEL=3: Debug completo');
console.log('   - LOG_LEVEL=4: Todo tipo de información');
