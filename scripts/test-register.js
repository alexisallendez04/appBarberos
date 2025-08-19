const AuthService = require('../services/authService');
const User = require('../models/User');
const { query } = require('../config/db');

async function testRegister() {
    try {
        console.log('🧪 Probando proceso de registro...\n');

        // 1. Verificar conexión a la base de datos
        console.log('1️⃣ Verificando conexión a la base de datos...');
        const connection = await query('SELECT 1 as test');
        console.log('✅ Conexión a la base de datos establecida');

        // 2. Verificar si la tabla usuarios existe
        console.log('\n2️⃣ Verificando tabla usuarios...');
        const tables = await query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = 'barberia_db' AND TABLE_NAME = 'usuarios'
        `);
        
        if (tables.length === 0) {
            console.log('❌ La tabla usuarios no existe');
            return;
        }
        console.log('✅ La tabla usuarios existe');

        // 3. Verificar estructura de la tabla
        console.log('\n3️⃣ Verificando estructura de la tabla usuarios...');
        const columns = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' AND TABLE_NAME = 'usuarios'
            ORDER BY ORDINAL_POSITION
        `);
        
        console.log('📋 Columnas de la tabla usuarios:');
        columns.forEach(col => {
            console.log(`   - ${col.COLUMN_NAME}: ${col.DATA_TYPE} (${col.IS_NULLABLE === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });

        // 4. Verificar si hay usuarios existentes
        console.log('\n4️⃣ Verificando usuarios existentes...');
        const existingUsers = await User.count();
        console.log(`📊 Usuarios existentes: ${existingUsers}`);

        // 5. Probar creación de usuario usando el servicio de autenticación
        console.log('\n5️⃣ Probando creación de usuario con AuthService...');
        const testUserData = {
            nombre: 'Test',
            apellido: 'User',
            email: 'test@example.com',
            telefono: '1234567890',
            nombreBarberia: 'Test Barbería',
            direccion: 'Test Address',
            descripcion: 'Test Description',
            password: 'TestPassword123'
        };

        try {
            const registerResult = await AuthService.register(testUserData);
            console.log('✅ Usuario registrado exitosamente usando AuthService');
            console.log(`   ID: ${registerResult.user.id}`);
            console.log(`   Email: ${registerResult.user.email}`);
            console.log(`   Nombre: ${registerResult.user.nombre} ${registerResult.user.apellido}`);
            console.log(`   Token generado: ${registerResult.token ? 'Sí' : 'No'}`);

            // 6. Verificar que el usuario se puede buscar
            console.log('\n6️⃣ Verificando búsqueda de usuario...');
            const foundUser = await User.findByEmail(testUserData.email);
            if (foundUser) {
                console.log('✅ Usuario encontrado por email');
                console.log(`   ID: ${foundUser.id}`);
                console.log(`   Estado: ${foundUser.estado}`);
                console.log(`   Contraseña hasheada: ${foundUser.password.startsWith('$2b$') ? 'Sí' : 'No'}`);
            } else {
                console.log('❌ Usuario no encontrado por email');
            }

            // 7. Probar login con el usuario creado
            console.log('\n7️⃣ Probando login con el usuario creado...');
            const loginResult = await AuthService.login(testUserData.email, testUserData.password);
            console.log('✅ Login exitoso');
            console.log(`   Token de login: ${loginResult.token ? 'Sí' : 'No'}`);

            // 8. Probar verificación de token
            console.log('\n8️⃣ Probando verificación de token...');
            const verifyResult = await AuthService.verifyToken(loginResult.token);
            console.log('✅ Verificación de token exitosa');
            console.log(`   Usuario verificado: ${verifyResult.user.nombre} ${verifyResult.user.apellido}`);

            // 9. Limpiar usuario de prueba
            console.log('\n9️⃣ Limpiando usuario de prueba...');
            await User.delete(registerResult.user.id);
            console.log('✅ Usuario de prueba eliminado');

        } catch (error) {
            console.log('❌ Error en el registro:');
            console.log(`   ${error.message}`);
            
            // Mostrar más detalles del error
            if (error.message.includes('ya está registrado')) {
                console.log('   💡 El usuario ya existe, intentando con otro email...');
                testUserData.email = 'test2@example.com';
                try {
                    const registerResult = await AuthService.register(testUserData);
                    console.log('✅ Usuario registrado con email alternativo');
                    console.log(`   ID: ${registerResult.user.id}`);
                    console.log(`   Token: ${registerResult.token ? 'Sí' : 'No'}`);
                    
                    // Limpiar usuario de prueba
                    await User.delete(registerResult.user.id);
                    console.log('✅ Usuario de prueba eliminado');
                } catch (error2) {
                    console.log(`   ❌ Error con email alternativo: ${error2.message}`);
                }
            }
        }

        console.log('\n🎉 Prueba completada');

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Ejecutar la prueba
testRegister(); 