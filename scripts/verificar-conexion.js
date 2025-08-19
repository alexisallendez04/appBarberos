const { query } = require('../config/db');

async function verificarConexion() {
    console.log('🔍 VERIFICANDO CONEXIÓN A LA BASE DE DATOS');
    console.log('=' .repeat(50));
    
    try {
        // 1. Verificar conexión básica
        console.log('\n📡 1. PRUEBA DE CONEXIÓN:');
        const resultado = await query('SELECT 1 as test');
        console.log('   ✅ Conexión exitosa:', resultado[0]);
        
        // 2. Verificar tablas principales
        console.log('\n📋 2. VERIFICANDO TABLAS:');
        
        const tablas = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);
        
        console.log('   ✅ Tablas encontradas:', tablas.length);
        tablas.forEach(tabla => {
            console.log(`      - ${tabla.TABLE_NAME}`);
        });
        
        // 3. Verificar servicios
        console.log('\n✂️ 3. VERIFICANDO SERVICIOS:');
        const servicios = await query('SELECT COUNT(*) as total FROM servicios WHERE estado = "activo"');
        console.log(`   ✅ Servicios activos: ${servicios[0].total}`);
        
        // 4. Verificar clientes
        console.log('\n👥 4. VERIFICANDO CLIENTES:');
        const clientes = await query('SELECT COUNT(*) as total FROM clientes WHERE estado = "activo"');
        console.log(`   ✅ Clientes activos: ${clientes[0].total}`);
        
        // 5. Verificar turnos
        console.log('\n📅 5. VERIFICANDO TURNOS:');
        const turnos = await query('SELECT COUNT(*) as total FROM turnos');
        console.log(`   ✅ Total turnos: ${turnos[0].total}`);
        
        console.log('\n✅ VERIFICACIÓN COMPLETADA EXITOSAMENTE');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    }
}

// Ejecutar verificación
verificarConexion().then(() => {
    console.log('\n✅ Script de verificación completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
