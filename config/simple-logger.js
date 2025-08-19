// Sistema de logs simplificado para controlar la salida en terminal
const config = {
    // Nivel de logs (0=ERROR, 1=WARN, 2=INFO, 3=DEBUG)
    LOG_LEVEL: parseInt(process.env.LOG_LEVEL) || 1,
    
    // Mostrar logs de estadísticas
    SHOW_STATS: process.env.SHOW_STATS_LOGS === 'true' || false,
    
    // Mostrar logs de debug
    SHOW_DEBUG: process.env.SHOW_DEBUG_LOGS === 'true' || false
};

// Función para verificar si debe mostrar un log
function shouldLog(level) {
    return level <= config.LOG_LEVEL;
}

// Función para logs de estadísticas (solo si está habilitado)
function stats(message, ...args) {
    if (config.SHOW_STATS) {
        console.log('📊', message, ...args);
    }
}

// Función para logs de debug (solo si está habilitado)
function debug(message, ...args) {
    if (config.SHOW_DEBUG) {
        console.log('🔍', message, ...args);
    }
}

// Función para logs de API (solo si está habilitado)
function api(message, ...args) {
    if (config.SHOW_DEBUG) {
        console.log('🌐', message, ...args);
    }
}

// Función para mostrar configuración
function showConfig() {
    console.log('📋 Configuración de logs:');
    console.log(`   Nivel: ${config.LOG_LEVEL}`);
    console.log(`   Estadísticas: ${config.SHOW_STATS ? 'Activadas' : 'Desactivadas'}`);
    console.log(`   Debug: ${config.SHOW_DEBUG ? 'Activado' : 'Desactivado'}`);
}

// Función para cambiar configuración
function setConfig(newConfig) {
    Object.assign(config, newConfig);
    showConfig();
}

module.exports = {
    stats,
    debug,
    api,
    showConfig,
    setConfig,
    config
};
