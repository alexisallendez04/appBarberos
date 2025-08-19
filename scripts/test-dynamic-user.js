const UserService = require('../services/userService');

async function testDynamicUser() {
    try {
        console.log('🧪 Probando sistema dinámico de usuario principal...\n');

        // Limpiar caché para forzar nueva detección
        UserService.clearCache();

        // Obtener usuario principal
        console.log('📋 Obteniendo usuario principal...');
        const mainUserId = await UserService.getMainUserId();
        console.log(`✅ Usuario principal detectado: ID ${mainUserId}`);

        // Obtener datos completos del usuario principal
        console.log('\n📋 Obteniendo datos completos del usuario principal...');
        const mainUserData = await UserService.getMainUserData();
        console.log('✅ Datos del usuario principal:');
        console.log(`   ID: ${mainUserData.id}`);
        console.log(`   Nombre: ${mainUserData.nombre} ${mainUserData.apellido}`);
        console.log(`   Email: ${mainUserData.email}`);
        console.log(`   Barbería: ${mainUserData.nombre_barberia || 'No especificada'}`);

        // Obtener todos los barberos
        console.log('\n📋 Obteniendo todos los barberos...');
        const allBarbers = await UserService.getAllBarbers();
        console.log('✅ Barberos encontrados:');
        allBarbers.forEach(barber => {
            console.log(`   ID: ${barber.id} | ${barber.nombre} ${barber.apellido} | ${barber.email} | Estado: ${barber.estado} | Servicios: ${barber.servicios_count} | Horarios: ${barber.horarios_count}`);
        });

        // Verificar si el usuario principal es correcto
        console.log('\n📋 Verificando si el usuario principal es correcto...');
        const isMainUser = await UserService.isMainUser(mainUserId);
        console.log(`✅ ¿Es el usuario principal? ${isMainUser ? 'Sí' : 'No'}`);

        // Probar caché
        console.log('\n📋 Probando caché...');
        const startTime = Date.now();
        const cachedUserId = await UserService.getMainUserId();
        const endTime = Date.now();
        console.log(`✅ Usuario desde caché: ID ${cachedUserId} (${endTime - startTime}ms)`);

        console.log('\n🎉 Prueba completada exitosamente!');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    }
}

// Ejecutar la prueba
testDynamicUser(); 