const { query } = require('../config/db');
require('dotenv').config();

async function checkWorkingHours() {
    try {
        console.log('🔍 Verificando horarios laborales configurados\n');

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

        // Obtener horarios laborales
        const workingHoursSql = `
            SELECT 
                dia_semana,
                hora_inicio,
                hora_fin,
                pausa_inicio,
                pausa_fin,
                estado
            FROM horarios_laborales
            WHERE id_usuario = ?
            ORDER BY 
                CASE dia_semana
                    WHEN 'lunes' THEN 1
                    WHEN 'martes' THEN 2
                    WHEN 'miercoles' THEN 3
                    WHEN 'jueves' THEN 4
                    WHEN 'viernes' THEN 5
                    WHEN 'sabado' THEN 6
                    WHEN 'domingo' THEN 7
                END
        `;
        
        const workingHours = await query(workingHoursSql, [barbero.id]);
        
        console.log(`📊 Horarios laborales configurados: ${workingHours.length}\n`);
        
        if (workingHours.length === 0) {
            console.log('❌ No hay horarios laborales configurados');
            console.log('💡 Esto explica por qué no se generan slots disponibles');
            return;
        }

        const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        
        diasSemana.forEach(dia => {
            const horario = workingHours.find(h => h.dia_semana === dia);
            if (horario) {
                console.log(`✅ ${dia.charAt(0).toUpperCase() + dia.slice(1)}: ${horario.hora_inicio} - ${horario.hora_fin} (${horario.estado})`);
                if (horario.pausa_inicio && horario.pausa_fin) {
                    console.log(`   Pausa: ${horario.pausa_inicio} - ${horario.pausa_fin}`);
                }
            } else {
                console.log(`❌ ${dia.charAt(0).toUpperCase() + dia.slice(1)}: No configurado`);
            }
        });

        // Verificar específicamente el domingo
        console.log('\n🔍 Verificando específicamente el domingo...');
        const domingo = workingHours.find(h => h.dia_semana === 'domingo');
        if (domingo) {
            console.log(`✅ Domingo configurado: ${domingo.hora_inicio} - ${domingo.hora_fin} (${domingo.estado})`);
        } else {
            console.log('❌ Domingo no está configurado');
            console.log('💡 Esto explica por qué no se generan slots para el 11/08/2025 (domingo)');
        }

    } catch (error) {
        console.error('❌ Error al verificar horarios laborales:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la verificación
checkWorkingHours();
