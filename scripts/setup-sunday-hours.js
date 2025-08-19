const { query } = require('../config/db');
require('dotenv').config();

async function setupSundayHours() {
    try {
        console.log('🔧 Configurando horarios laborales para el domingo\n');

        // Obtener el barbero principal
        const barberoSql = `
            SELECT 
                u.id,
                u.nombre,
                u.apellido,
                u.rol
            FROM usuarios u
            WHERE (u.rol = 'barbero' OR u.rol = 'admin') AND u.estado = 'activo'
            ORDER BY u.id
            LIMIT 1
        `;
        
        const [barbero] = await query(barberoSql);
        if (!barbero) {
            console.log('❌ No se encontró ningún barbero activo');
            return;
        }
        
        console.log(`✅ Barbero: ${barbero.nombre} ${barbero.apellido} (ID: ${barbero.id}, Rol: ${barbero.rol})\n`);

        // Verificar si ya existe horario para domingo
        const checkSundaySql = `
            SELECT id, hora_inicio, hora_fin, estado
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = 'domingo'
        `;
        
        const [existingSunday] = await query(checkSundaySql, [barbero.id]);
        
        if (existingSunday) {
            console.log('📅 Horario de domingo ya existe:');
            console.log(`   ${existingSunday.hora_inicio} - ${existingSunday.hora_fin} (${existingSunday.estado})`);
            
            // Preguntar si actualizar
            console.log('\n¿Deseas actualizar el horario de domingo? (S/N)');
            // Por ahora, asumimos que sí
            const update = true;
            
            if (update) {
                const updateSql = `
                    UPDATE horarios_laborales
                    SET hora_inicio = '09:00:00', hora_fin = '18:00:00', estado = 'activo'
                    WHERE id_usuario = ? AND dia_semana = 'domingo'
                `;
                
                await query(updateSql, [barbero.id]);
                console.log('✅ Horario de domingo actualizado: 09:00 - 18:00');
            }
        } else {
            // Crear horario para domingo
            const insertSql = `
                INSERT INTO horarios_laborales (id_usuario, dia_semana, hora_inicio, hora_fin, estado)
                VALUES (?, 'domingo', '09:00:00', '18:00:00', 'activo')
            `;
            
            await query(insertSql, [barbero.id]);
            console.log('✅ Horario de domingo creado: 09:00 - 18:00');
        }

        // Verificar que se creó correctamente
        const verifySql = `
            SELECT dia_semana, hora_inicio, hora_fin, estado
            FROM horarios_laborales
            WHERE id_usuario = ? AND dia_semana = 'domingo'
        `;
        
        const [sundayHours] = await query(verifySql, [barbero.id]);
        
        if (sundayHours) {
            console.log('\n✅ Verificación exitosa:');
            console.log(`   Domingo: ${sundayHours.hora_inicio} - ${sundayHours.hora_fin} (${sundayHours.estado})`);
        } else {
            console.log('\n❌ Error: No se pudo verificar el horario de domingo');
        }

    } catch (error) {
        console.error('❌ Error al configurar horarios de domingo:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la configuración
setupSundayHours();
