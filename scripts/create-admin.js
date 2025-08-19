const User = require('../models/User');
const { hashPassword } = require('../utils/auth');
require('dotenv').config();

async function createFirstAdmin() {
    try {
        console.log('🔧 Creando primer administrador del sistema...');
        
        // Verificar si ya existe un admin
        const existingAdmin = await User.findByRole('admin');
        if (existingAdmin.length > 0) {
            console.log('⚠️  Ya existe un administrador en el sistema');
            console.log('📋 Administradores existentes:');
            existingAdmin.forEach(admin => {
                console.log(`   - ${admin.nombre} ${admin.apellido} (${admin.email})`);
            });
            return;
        }

        // Datos del primer administrador
        const adminData = {
            nombre: 'Administrador',
            apellido: 'Sistema',
            email: 'admin@barberia.com',
            telefono: '+1234567890',
            nombreBarberia: 'Barbería Principal',
            direccion: 'Dirección de la barbería',
            descripcion: 'Barbería principal del sistema',
            password: 'Admin123!',
            rol: 'admin'
        };

        // Verificar que el email no existe
        const existingUser = await User.findByEmail(adminData.email);
        if (existingUser) {
            console.log('❌ Ya existe un usuario con ese email');
            return;
        }

        // Crear el administrador
        const newAdmin = await User.create(adminData);
        
        console.log('✅ Administrador creado exitosamente!');
        console.log('📋 Detalles del administrador:');
        console.log(`   Nombre: ${newAdmin.nombre} ${newAdmin.apellido}`);
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log(`   Rol: ${newAdmin.rol}`);
        console.log('');
        console.log('🔐 Credenciales de acceso:');
        console.log(`   Email: ${newAdmin.email}`);
        console.log(`   Contraseña: ${adminData.password}`);
        console.log('');
        console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer inicio de sesión');
        console.log('');
        console.log('🔑 Códigos de registro configurados:');
        console.log(`   Código para barberos: ${process.env.REGISTRATION_CODE || 'ALEXIS2024'}`);
        console.log(`   Código para administradores: ${process.env.ADMIN_REGISTRATION_CODE || 'ADMIN2024'}`);

    } catch (error) {
        console.error('❌ Error al crear administrador:', error.message);
        process.exit(1);
    }
}

// Ejecutar el script
createFirstAdmin().then(() => {
    console.log('✅ Script completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
});
