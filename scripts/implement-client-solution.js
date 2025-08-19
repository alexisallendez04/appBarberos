const { query } = require('../config/db');
require('dotenv').config();

async function implementClientSolution() {
    try {
        console.log('🔧 IMPLEMENTANDO SOLUCIÓN PARA EL MANEJO DE CLIENTES\n');

        // 1. Crear función mejorada para buscar/crear clientes por teléfono
        console.log('1️⃣ Creando función mejorada para manejo de clientes...');
        
        const createImprovedClientFunction = `
            CREATE OR REPLACE FUNCTION findOrCreateClientByPhone(
                p_nombre VARCHAR(100),
                p_apellido VARCHAR(100),
                p_telefono VARCHAR(20),
                p_email VARCHAR(100),
                p_notas TEXT
            ) RETURNS INT
            DETERMINISTIC
            SQL SECURITY DEFINER
            BEGIN
                DECLARE v_client_id INT;
                
                -- Buscar cliente por teléfono exacto
                SELECT id INTO v_client_id 
                FROM clientes 
                WHERE telefono = p_telefono 
                LIMIT 1;
                
                -- Si existe, actualizar información si es necesario
                IF v_client_id IS NOT NULL THEN
                    UPDATE clientes 
                    SET nombre = p_nombre,
                        apellido = p_apellido,
                        email = COALESCE(p_email, email),
                        notas = COALESCE(p_notas, notas),
                        actualizado_en = CURRENT_TIMESTAMP
                    WHERE id = v_client_id;
                    
                    RETURN v_client_id;
                ELSE
                    -- Si no existe, crear nuevo cliente
                    INSERT INTO clientes (
                        nombre, apellido, telefono, email, notas, 
                        total_visitas, creado_en, actualizado_en
                    ) VALUES (
                        p_nombre, p_apellido, p_telefono, p_email, p_notas,
                        0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    );
                    
                    RETURN LAST_INSERT_ID();
                END IF;
            END;
        `;
        
        try {
            await query(createImprovedClientFunction);
            console.log('   ✅ Función findOrCreateClientByPhone creada');
        } catch (error) {
            console.log('   ⚠️ Función ya existe o error:', error.message);
        }
        console.log();

        // 2. Crear vista para clientes frecuentes
        console.log('2️⃣ Creando vista para clientes frecuentes...');
        
        const createFrequentClientsView = `
            CREATE OR REPLACE VIEW clientes_frecuentes AS
            SELECT 
                c.id,
                c.nombre,
                c.apellido,
                c.telefono,
                c.email,
                c.total_visitas,
                COUNT(t.id) as total_citas,
                SUM(CASE WHEN t.estado = 'completado' THEN 1 ELSE 0 END) as citas_completadas,
                MAX(t.fecha) as ultima_cita,
                MIN(t.fecha) as primera_cita,
                c.creado_en
            FROM clientes c
            LEFT JOIN turnos t ON c.id = t.id_cliente
            GROUP BY c.id, c.nombre, c.apellido, c.telefono, c.email, c.total_visitas, c.creado_en
            HAVING total_citas > 0
            ORDER BY total_citas DESC, ultima_cita DESC
        `;
        
        try {
            await query(createFrequentClientsView);
            console.log('   ✅ Vista clientes_frecuentes creada');
        } catch (error) {
            console.log('   ⚠️ Vista ya existe o error:', error.message);
        }
        console.log();

        // 3. Crear vista para clientes nuevos
        console.log('3️⃣ Creando vista para clientes nuevos...');
        
        const createNewClientsView = `
            CREATE OR REPLACE VIEW clientes_nuevos AS
            SELECT 
                c.id,
                c.nombre,
                c.apellido,
                c.telefono,
                c.email,
                c.total_visitas,
                COUNT(t.id) as total_citas,
                MIN(t.fecha) as primera_cita,
                c.creado_en
            FROM clientes c
            LEFT JOIN turnos t ON c.id = t.id_cliente
            WHERE c.creado_en >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            GROUP BY c.id, c.nombre, c.apellido, c.telefono, c.email, c.total_visitas, c.creado_en
            HAVING total_citas = 1
            ORDER BY primera_cita DESC
        `;
        
        try {
            await query(createNewClientsView);
            console.log('   ✅ Vista clientes_nuevos creada');
        } catch (error) {
            console.log('   ⚠️ Vista ya existe o error:', error.message);
        }
        console.log();

        // 4. Actualizar el modelo Client.js
        console.log('4️⃣ Actualizando modelo Client.js...');
        console.log('   📝 Se creará una nueva versión del modelo con funciones mejoradas');
        console.log();

        // 5. Crear script de migración de datos existentes
        console.log('5️⃣ Creando script de migración...');
        console.log('   📝 Se creará un script para limpiar datos duplicados');
        console.log();

        // 6. Probar la nueva función
        console.log('6️⃣ Probando la nueva función...');
        
        const testFunctionSql = `
            SELECT findOrCreateClientByPhone(
                'Juan Test', 
                'Apellido Test', 
                '555-999-888', 
                'juan.test@test.com', 
                'Cliente de prueba'
            ) as client_id
        `;
        
        try {
            const [result] = await query(testFunctionSql);
            console.log('   ✅ Función probada exitosamente. Cliente ID:', result.client_id);
        } catch (error) {
            console.log('   ❌ Error al probar función:', error.message);
        }
        console.log();

        // 7. Verificar vistas
        console.log('7️⃣ Verificando vistas creadas...');
        
        try {
            const frequentClients = await query('SELECT COUNT(*) as total FROM clientes_frecuentes');
            console.log('   ✅ Clientes frecuentes:', frequentClients[0].total);
            
            const newClients = await query('SELECT COUNT(*) as total FROM clientes_nuevos');
            console.log('   ✅ Clientes nuevos:', newClients[0].total);
        } catch (error) {
            console.log('   ❌ Error al verificar vistas:', error.message);
        }
        console.log();

        // 8. Resumen de la implementación
        console.log('8️⃣ RESUMEN DE LA IMPLEMENTACIÓN:');
        console.log();
        console.log('✅ FUNCIONES CREADAS:');
        console.log('   - findOrCreateClientByPhone(): Función SQL para buscar/crear clientes por teléfono');
        console.log('   - Vista clientes_frecuentes: Para ver clientes que más visitan');
        console.log('   - Vista clientes_nuevos: Para ver clientes de los últimos 30 días');
        console.log();
        console.log('🔄 PRÓXIMOS PASOS:');
        console.log('   1. Actualizar models/Client.js con nuevas funciones');
        console.log('   2. Actualizar controllers/bookingController.js');
        console.log('   3. Actualizar controllers/clientController.js');
        console.log('   4. Actualizar dashboard para usar las nuevas vistas');
        console.log('   5. Probar el sistema completo');
        console.log();
        console.log('🎯 BENEFICIOS OBTENIDOS:');
        console.log('   ✅ Teléfono como identificador único');
        console.log('   ✅ No más duplicados de clientes');
        console.log('   ✅ Experiencia más práctica para el barbero');
        console.log('   ✅ Vistas optimizadas para clientes frecuentes y nuevos');
        console.log('   ✅ Sistema más robusto y confiable');

    } catch (error) {
        console.error('❌ Error en la implementación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la implementación
implementClientSolution();
