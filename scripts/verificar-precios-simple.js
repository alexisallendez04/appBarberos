const { query } = require('../config/db');

async function verificarPreciosSimple() {
    console.log('🔍 VERIFICANDO PRECIOS DE SERVICIOS');
    console.log('=' .repeat(50));
    
    try {
        // Verificar servicios y sus precios
        const servicios = await query(`
            SELECT id, nombre, precio, duracion, estado
            FROM servicios 
            ORDER BY precio DESC
        `);
        
        console.log(`✅ Servicios encontrados: ${servicios.length}`);
        console.log('');
        
        servicios.forEach(servicio => {
            console.log(`📋 ${servicio.nombre}`);
            console.log(`   💰 Precio: $${servicio.precio}`);
            console.log(`   ⏱️  Duración: ${servicio.duracion} min`);
            console.log(`   📊 Estado: ${servicio.estado}`);
            console.log('');
        });
        
        // Verificar si hay turnos con precios diferentes
        const turnosInconsistentes = await query(`
            SELECT COUNT(*) as total
            FROM turnos t
            JOIN servicios s ON t.id_servicio = s.id
            WHERE t.precio_final != s.precio
        `);
        
        if (turnosInconsistentes[0].total > 0) {
            console.log(`⚠️  Se encontraron ${turnosInconsistentes[0].total} turnos con precios inconsistentes`);
        } else {
            console.log('✅ Todos los turnos tienen precios consistentes');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

verificarPreciosSimple().then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
