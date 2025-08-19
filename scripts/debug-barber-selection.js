/**
 * Script para diagnosticar el problema de selección de barbero
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Alexis83',
    password: process.env.DB_PASSWORD || 'TukiTuki12',
    port: process.env.DB_PORT || 3308,
    database: process.env.DB_NAME || 'barberia_db'
};

async function debugBarberSelection() {
    let connection;
    
    try {
        console.log('🔍 Iniciando diagnóstico de selección de barbero...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida');
        
        // 1. Verificar el orden de los barberos en la API
        console.log('\n👥 Verificando orden de barberos en la API...');
        const [barberos] = await connection.execute(`
            SELECT 
                id, nombre, apellido, rol, estado,
                nombre_barberia
            FROM usuarios 
            WHERE (rol = 'barbero' OR rol = 'admin') AND estado = 'activo'
            ORDER BY rol DESC, nombre, apellido
        `);
        
        console.log(`✅ Barberos encontrados (${barberos.length}):`);
        barberos.forEach((barbero, index) => {
            console.log(`   ${index + 1}. ID: ${barbero.id} - ${barbero.nombre} ${barbero.apellido} (${barbero.rol})`);
        });
        
        // 2. Simular la API de servicios
        console.log('\n🔌 Simulando API de servicios...');
        const barberosConServicios = [];
        
        for (const barbero of barberos) {
            const [servicios] = await connection.execute(`
                SELECT id, nombre, precio, descripcion, estado
                FROM servicios 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY nombre
            `, [barbero.id]);
            
            if (servicios.length > 0) {
                barberosConServicios.push({
                    barbero: {
                        id: barbero.id,
                        nombre: barbero.nombre,
                        apellido: barbero.apellido,
                        nombre_completo: `${barbero.nombre} ${barbero.apellido}`,
                        nombre_barberia: barbero.nombre_barberia,
                        rol: barbero.rol
                    },
                    servicios: servicios
                });
            }
        }
        
        console.log(`✅ Barberos con servicios: ${barberosConServicios.length}`);
        barberosConServicios.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.barbero.nombre_completo}: ${item.servicios.length} servicios`);
        });
        
        // 3. Verificar qué barbero se selecciona por defecto
        console.log('\n🎯 Verificando selección por defecto...');
        if (barberosConServicios.length > 0) {
            const primerBarbero = barberosConServicios[0];
            console.log(`   ⚠️  PROBLEMA: El primer barbero seleccionado por defecto es: ${primerBarbero.barbero.nombre_completo}`);
            console.log(`   ⚠️  Esto significa que si el usuario no cambia la selección, siempre se usará: ${primerBarbero.barbero.nombre_completo}`);
        }
        
        // 4. Verificar horarios de cada barbero
        console.log('\n⏰ Verificando horarios por barbero...');
        for (const item of barberosConServicios) {
            const barbero = item.barbero;
            console.log(`\n   🔍 ${barbero.nombre_completo} (ID: ${barbero.id}):`);
            
            const [horarios] = await connection.execute(`
                SELECT dia_semana, hora_inicio, hora_fin, estado
                FROM horarios_laborales 
                WHERE id_usuario = ? AND estado = 'activo'
                ORDER BY FIELD(dia_semana, 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo')
            `, [barbero.id]);
            
            if (horarios.length > 0) {
                console.log(`     ✅ Horarios: ${horarios.length} días laborales`);
                horarios.forEach(horario => {
                    console.log(`        - ${horario.dia_semana}: ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
            } else {
                console.log(`     ❌ Sin horarios configurados`);
            }
        }
        
        // 5. Simular la selección de Alexis Allendez
        console.log('\n🧪 Simulando selección de Alexis Allendez...');
        const alexis = barberosConServicios.find(item => 
            item.barbero.nombre === 'Alexis' && item.barbero.apellido === 'Allendez'
        );
        
        if (alexis) {
            console.log(`✅ Alexis Allendez encontrado en la lista`);
            console.log(`   - Posición en la lista: ${barberosConServicios.findIndex(item => item.barbero.id === alexis.barbero.id) + 1}`);
            console.log(`   - ID: ${alexis.barbero.id}`);
            console.log(`   - Servicios: ${alexis.servicios.length}`);
            
            // Verificar horarios para lunes
            const [horariosLunes] = await connection.execute(`
                SELECT hora_inicio, hora_fin
                FROM horarios_laborales 
                WHERE id_usuario = ? AND dia_semana = 'lunes' AND estado = 'activo'
            `, [alexis.barbero.id]);
            
            if (horariosLunes.length > 0) {
                console.log(`   - Horarios para lunes: ${horariosLunes.length}`);
                horariosLunes.forEach(horario => {
                    console.log(`     * ${horario.hora_inicio} - ${horario.hora_fin}`);
                });
            } else {
                console.log(`   ❌ Sin horarios para lunes`);
            }
        } else {
            console.log(`❌ Alexis Allendez NO encontrado en la lista de barberos con servicios`);
        }
        
        // 6. Identificar el problema
        console.log('\n🔍 IDENTIFICANDO EL PROBLEMA...');
        console.log('   El problema está en el frontend:');
        console.log('   1. Se carga el primer barbero por defecto (probablemente Juan Perez)');
        console.log('   2. Si el usuario no cambia la selección, se mantiene ese barbero');
        console.log('   3. Al seleccionar fecha, se usan los horarios del barbero por defecto');
        console.log('   4. Por eso aparece el mensaje de "Juan" en lugar de "Alexis"');
        
        console.log('\n💡 SOLUCIÓN:');
        console.log('   1. Verificar que selectedBarberId se actualice correctamente');
        console.log('   2. Asegurar que la selección del usuario sobrescriba el valor por defecto');
        console.log('   3. Verificar que el evento change del select funcione correctamente');
        
        console.log('\n🔧 Para probar:');
        console.log('   1. Abre la consola del navegador');
        console.log('   2. Selecciona a Alexis Allendez');
        console.log('   3. Verifica que console.log muestre el ID correcto');
        console.log('   4. Selecciona una fecha');
        console.log('   5. Verifica que la API reciba el barbero_id correcto');
        
    } catch (error) {
        console.error('❌ Error durante el diagnóstico:', error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión a la base de datos cerrada');
        }
    }
}

// Ejecutar el diagnóstico
if (require.main === module) {
    debugBarberSelection();
}

module.exports = { debugBarberSelection };
