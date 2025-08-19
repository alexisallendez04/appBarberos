const User = require('../models/User');
const { query } = require('../config/db');

async function checkUsers() {
    try {
        console.log('🔍 Verificando usuarios en la base de datos...\n');

        // Obtener todos los usuarios
        const users = await User.findAll(100, 0);
        
        if (users.length === 0) {
            console.log('📭 No hay usuarios en la base de datos');
            return;
        }

        console.log(`📊 Se encontraron ${users.length} usuarios:\n`);

        for (let i = 0; i < users.length; i++) {
            const user = users[i];
            console.log(`${i + 1}. Usuario ID: ${user.id}`);
            console.log(`   📧 Email: ${user.email}`);
            console.log(`   👤 Nombre: ${user.nombre} ${user.apellido}`);
            console.log(`   🏪 Barbería: ${user.nombre_barberia || 'No especificada'}`);
            console.log(`   📱 Teléfono: ${user.telefono || 'No especificado'}`);
            console.log(`   🏷️  Rol: ${user.rol || 'No especificado'}`);
            console.log(`   📊 Estado: ${user.estado || 'No especificado'}`);
            console.log(`   📅 Creado: ${user.creado_en || 'No especificado'}`);
            console.log('');
        }

        // Verificar contraseñas hasheadas
        console.log('🔐 Verificando contraseñas...\n');
        
        for (const user of users) {
            const fullUser = await User.findByEmail(user.email);
            if (fullUser) {
                const isHashed = fullUser.password.startsWith('$2b$');
                console.log(`   ${user.email}: ${isHashed ? '✅ Hasheada' : '❌ No hasheada'}`);
                
                if (!isHashed) {
                    console.log(`      ⚠️  Contraseña en texto plano: ${fullUser.password}`);
                }
            }
        }

        console.log('\n🎉 Verificación completada');

    } catch (error) {
        console.error('❌ Error verificando usuarios:', error.message);
    }
}

// Ejecutar la verificación
checkUsers(); 