const { query } = require('../config/db');
require('dotenv').config();

async function analyzeClients() {
    try {
        console.log('🔍 ANALIZANDO EL MANEJO ACTUAL DE CLIENTES\n');

        // 1. Estadísticas generales de clientes
        console.log('1️⃣ Estadísticas generales de clientes:');
        const statsSql = `
            SELECT 
                COUNT(*) as total_clientes,
                COUNT(CASE WHEN email IS NOT NULL AND email != '' THEN 1 END) as con_email,
                COUNT(CASE WHEN email IS NULL OR email = '' THEN 1 END) as sin_email,
                COUNT(CASE WHEN fecha_nacimiento IS NOT NULL THEN 1 END) as con_fecha_nacimiento,
                COUNT(CASE WHEN notas IS NOT NULL AND notas != '' THEN 1 END) as con_notas,
                AVG(total_visitas) as promedio_visitas,
                MAX(total_visitas) as max_visitas
            FROM clientes
        `;
        
        const [stats] = await query(statsSql);
        console.log(`   Total de clientes: ${stats.total_clientes}`);
        console.log(`   Con email: ${stats.con_email} (${((stats.con_email/stats.total_clientes)*100).toFixed(1)}%)`);
        console.log(`   Sin email: ${stats.sin_email} (${((stats.sin_email/stats.total_clientes)*100).toFixed(1)}%)`);
        console.log(`   Con fecha de nacimiento: ${stats.con_fecha_nacimiento}`);
        console.log(`   Con notas: ${stats.con_notas}`);
        console.log(`   Promedio de visitas: ${stats.promedio_visitas ? parseFloat(stats.promedio_visitas).toFixed(1) : 0}`);
        console.log(`   Máximo de visitas: ${stats.max_visitas || 0}`);
        console.log();

        // 2. Análisis de duplicados potenciales
        console.log('2️⃣ Análisis de duplicados potenciales:');
        const duplicatesSql = `
            SELECT 
                telefono,
                COUNT(*) as cantidad,
                GROUP_CONCAT(CONCAT(nombre, ' ', apellido) SEPARATOR ', ') as nombres
            FROM clientes 
            WHERE telefono IS NOT NULL AND telefono != ''
            GROUP BY telefono 
            HAVING COUNT(*) > 1
            ORDER BY cantidad DESC
        `;
        
        const duplicates = await query(duplicatesSql);
        console.log(`   Teléfonos duplicados: ${duplicates.length}`);
        if (duplicates.length > 0) {
            duplicates.forEach((dup, index) => {
                console.log(`   ${index + 1}. Teléfono ${dup.telefono}: ${dup.cantidad} clientes (${dup.nombres})`);
            });
        }
        console.log();

        // 3. Análisis de clientes por barbero
        console.log('3️⃣ Análisis de clientes por barbero:');
        const barberClientsSql = `
            SELECT 
                u.nombre as barbero_nombre,
                u.apellido as barbero_apellido,
                COUNT(DISTINCT t.id_cliente) as clientes_unicos,
                COUNT(t.id) as total_citas,
                AVG(client_stats.total_citas_por_cliente) as promedio_citas_por_cliente
            FROM usuarios u
            LEFT JOIN turnos t ON u.id = t.id_usuario
            LEFT JOIN (
                SELECT 
                    t2.id_usuario,
                    t2.id_cliente,
                    COUNT(*) as total_citas_por_cliente
                FROM turnos t2
                GROUP BY t2.id_usuario, t2.id_cliente
            ) client_stats ON u.id = client_stats.id_usuario AND t.id_cliente = client_stats.id_cliente
            WHERE u.rol IN ('barbero', 'admin')
            GROUP BY u.id, u.nombre, u.apellido
            ORDER BY clientes_unicos DESC
        `;
        
        const barberClients = await query(barberClientsSql);
        barberClients.forEach((barber, index) => {
            console.log(`   ${index + 1}. ${barber.barbero_nombre} ${barber.barbero_apellido}:`);
            console.log(`      - Clientes únicos: ${barber.clientes_unicos}`);
            console.log(`      - Total citas: ${barber.total_citas}`);
            console.log(`      - Promedio citas por cliente: ${barber.promedio_citas_por_cliente?.toFixed(1) || 0}`);
        });
        console.log();

        // 4. Análisis de calidad de datos
        console.log('4️⃣ Análisis de calidad de datos:');
        const qualitySql = `
            SELECT 
                COUNT(*) as clientes_completos,
                COUNT(CASE WHEN nombre IS NULL OR nombre = '' THEN 1 END) as sin_nombre,
                COUNT(CASE WHEN apellido IS NULL OR apellido = '' THEN 1 END) as sin_apellido,
                COUNT(CASE WHEN telefono IS NULL OR telefono = '' THEN 1 END) as sin_telefono,
                COUNT(CASE WHEN LENGTH(telefono) < 8 THEN 1 END) as telefono_corto,
                COUNT(CASE WHEN creado_en IS NULL THEN 1 END) as sin_fecha_creacion
            FROM clientes
        `;
        
        const [quality] = await query(qualitySql);
        console.log(`   Clientes con datos completos: ${quality.clientes_completos}`);
        console.log(`   Sin nombre: ${quality.sin_nombre}`);
        console.log(`   Sin apellido: ${quality.sin_apellido}`);
        console.log(`   Sin teléfono: ${quality.sin_telefono}`);
        console.log(`   Teléfono muy corto: ${quality.telefono_corto}`);
        console.log(`   Sin fecha de creación: ${quality.sin_fecha_creacion}`);
        console.log();

        // 5. Análisis de uso reciente
        console.log('5️⃣ Análisis de uso reciente:');
        const recentSql = `
            SELECT 
                COUNT(DISTINCT c.id) as clientes_ultimos_30_dias,
                COUNT(DISTINCT c.id) as clientes_ultimos_7_dias,
                COUNT(DISTINCT c.id) as clientes_hoy
            FROM clientes c
            LEFT JOIN turnos t ON c.id = t.id_cliente
            WHERE t.fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `;
        
        const [recent] = await query(recentSql);
        console.log(`   Clientes en últimos 30 días: ${recent.clientes_ultimos_30_dias}`);
        console.log(`   Clientes en últimos 7 días: ${recent.clientes_ultimos_7_dias}`);
        console.log(`   Clientes hoy: ${recent.clientes_hoy}`);
        console.log();

        // 6. Recomendaciones
        console.log('6️⃣ RECOMENDACIONES PARA MEJORAR EL MANEJO DE CLIENTES:');
        console.log();
        console.log('🔧 PROBLEMAS IDENTIFICADOS:');
        console.log('   1. Sistema complejo de gestión de clientes');
        console.log('   2. Posibles duplicados por teléfono');
        console.log('   3. Datos incompletos en muchos clientes');
        console.log('   4. Experiencia poco práctica para el barbero');
        console.log();
        console.log('💡 SOLUCIÓN PROPUESTA:');
        console.log('   Simplificar el sistema eliminando la tabla "clientes"');
        console.log('   y manejar los datos directamente en cada reserva.');
        console.log();
        console.log('✅ BENEFICIOS DE LA SIMPLIFICACIÓN:');
        console.log('   1. Experiencia más directa y práctica');
        console.log('   2. Menos complejidad en la base de datos');
        console.log('   3. No hay problemas de duplicados');
        console.log('   4. Cada reserva es independiente');
        console.log('   5. Más fácil de mantener y usar');
        console.log();
        console.log('🔄 MIGRACIÓN PROPUESTA:');
        console.log('   1. Agregar campos nombre, apellido, telefono, email a la tabla turnos');
        console.log('   2. Migrar datos existentes');
        console.log('   3. Eliminar tabla clientes y dependencias');
        console.log('   4. Simplificar formularios y lógica');

    } catch (error) {
        console.error('❌ Error al analizar clientes:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar el análisis
analyzeClients();
