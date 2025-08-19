const { query } = require('../config/db');

async function verificarPreciosServicios() {
    console.log('🔍 VERIFICANDO PRECIOS DE SERVICIOS');
    console.log('=' .repeat(50));
    
    try {
        // 1. Verificar servicios y sus precios
        console.log('\n✂️ 1. SERVICIOS Y PRECIOS ACTUALES:');
        const servicios = await query(`
            SELECT id, nombre, precio, duracion, estado, descripcion
            FROM servicios 
            ORDER BY precio DESC
        `);
        
        if (servicios.length === 0) {
            console.log('   ❌ No hay servicios en la base de datos');
            return;
        }
        
        console.log(`   ✅ Servicios encontrados: ${servicios.length}`);
        servicios.forEach(servicio => {
            console.log(`      - ID: ${servicio.id} | ${servicio.nombre}`);
            console.log(`        Precio: $${servicio.precio} | Duración: ${servicio.duracion} min`);
            console.log(`        Estado: ${servicio.estado} | Descripción: ${servicio.descripcion || 'Sin descripción'}`);
            console.log('');
        });
        
        // 2. Verificar turnos existentes y sus precios
        console.log('\n📅 2. VERIFICANDO PRECIOS EN TURNOS EXISTENTES:');
        const turnos = await query(`
            SELECT 
                t.id,
                t.fecha,
                t.hora_inicio,
                t.precio_final,
                s.nombre as servicio_nombre,
                s.precio as servicio_precio_original
            FROM turnos t
            JOIN servicios s ON t.id_servicio = s.id
            WHERE t.fecha >= '2025-08-01'
            ORDER BY t.fecha, t.hora_inicio
            LIMIT 10
        `);
        
        if (turnos.length > 0) {
            console.log(`   📊 Turnos encontrados en agosto: ${turnos.length} (mostrando primeros 10)`);
            turnos.forEach(turno => {
                const diferencia = turno.precio_final - turno.servicio_precio_original;
                const estado = diferencia === 0 ? '✅' : '⚠️';
                console.log(`      ${estado} ${turno.fecha} ${turno.hora_inicio} | ${turno.servicio_nombre}`);
                console.log(`        Precio final: $${turno.precio_final} | Precio servicio: $${turno.servicio_precio_original}`);
                if (diferencia !== 0) {
                    console.log(`        ⚠️  DIFERENCIA: $${diferencia}`);
                }
                console.log('');
            });
        } else {
            console.log('   📊 No hay turnos en agosto para verificar');
        }
        
        // 3. Resumen de precios
        console.log('\n💰 3. RESUMEN DE PRECIOS:');
        const preciosUnicos = [...new Set(servicios.map(s => s.precio))].sort((a, b) => a - b);
        console.log(`   📊 Precios únicos encontrados: ${preciosUnicos.length}`);
        preciosUnicos.forEach(precio => {
            const serviciosConPrecio = servicios.filter(s => s.precio === precio);
            console.log(`      $${precio}: ${serviciosConPrecio.length} servicio(s)`);
            serviciosConPrecio.forEach(servicio => {
                console.log(`        - ${servicio.nombre}`);
            });
        });
        
        // 4. Verificar si hay inconsistencias
        console.log('\n🔍 4. ANÁLISIS DE INCONSISTENCIAS:');
        const turnosConDiferencia = await query(`
            SELECT COUNT(*) as total
            FROM turnos t
            JOIN servicios s ON t.id_servicio = s.id
            WHERE t.precio_final != s.precio
        `);
        
        if (turnosConDiferencia[0].total > 0) {
            console.log(`   ⚠️  Se encontraron ${turnosConDiferencia[0].total} turnos con precios diferentes al servicio original`);
        } else {
            console.log('   ✅ Todos los turnos tienen precios consistentes con sus servicios');
        }
        
        console.log('\n✅ VERIFICACIÓN COMPLETADA');
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        throw error;
    }
}

// Ejecutar verificación
verificarPreciosServicios().then(() => {
    console.log('\n✅ Script de verificación completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
