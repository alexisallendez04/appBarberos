const AuthService = require('../services/authService');
const User = require('../models/User');
const { query } = require('../config/db');

async function testDashboard() {
    try {
        console.log('🧪 Probando dashboard...\n');

        // 1. Verificar si hay usuarios en la base de datos
        console.log('1️⃣ Verificando usuarios existentes...');
        const users = await User.findAll(10, 0);
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos');
            console.log('💡 Primero debes registrar un usuario');
            return;
        }

        console.log(`✅ Se encontraron ${users.length} usuarios`);

        // 2. Probar login con el primer usuario
        console.log('\n2️⃣ Probando login...');
        const testUser = users[0];
        console.log(`   Usando usuario: ${testUser.email}`);

        // Buscar el usuario completo para obtener la contraseña
        const fullUser = await User.findByEmail(testUser.email);
        
        if (!fullUser) {
            console.log('❌ No se pudo obtener información completa del usuario');
            return;
        }

        // Verificar si la contraseña está hasheada
        const isHashed = fullUser.password.startsWith('$2b$');
        console.log(`   Contraseña hasheada: ${isHashed ? '✅ Sí' : '❌ No'}`);

        if (!isHashed) {
            console.log('⚠️  La contraseña no está hasheada. Esto puede causar problemas.');
            console.log('💡 Deberías eliminar el usuario y registrarlo nuevamente');
            return;
        }

        // 3. Probar login (necesitamos una contraseña válida)
        console.log('\n3️⃣ Probando login...');
        console.log('⚠️  No podemos probar el login sin conocer la contraseña original');
        console.log('💡 Para probar el login, necesitas registrar un usuario con una contraseña conocida');

        // 4. Probar verificación de token
        console.log('\n4️⃣ Probando verificación de token...');
        console.log('⚠️  No podemos probar la verificación sin un token válido');

        // 5. Verificar estructura de la base de datos
        console.log('\n5️⃣ Verificando estructura de la base de datos...');
        
        // Verificar tabla usuarios
        const userColumns = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' AND TABLE_NAME = 'usuarios'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(`   Tabla usuarios: ${userColumns.length} columnas`);

        // Verificar tabla configuracion_barbero
        const configColumns = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' AND TABLE_NAME = 'configuracion_barbero'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(`   Tabla configuracion_barbero: ${configColumns.length} columnas`);

        // Verificar tabla turnos
        const turnosColumns = await query(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = 'barberia_db' AND TABLE_NAME = 'turnos'
            ORDER BY ORDINAL_POSITION
        `);
        console.log(`   Tabla turnos: ${turnosColumns.length} columnas`);

        // 6. Verificar configuración del barbero
        console.log('\n6️⃣ Verificando configuración del barbero...');
        const configs = await query('SELECT COUNT(*) as count FROM configuracion_barbero');
        console.log(`   Configuraciones existentes: ${configs[0].count}`);

        // 7. Verificar turnos
        console.log('\n7️⃣ Verificando turnos...');
        const turnos = await query('SELECT COUNT(*) as count FROM turnos');
        console.log(`   Turnos existentes: ${turnos[0].count}`);

        // 8. Crear un usuario de prueba para verificar el flujo completo
        console.log('\n8️⃣ Creando usuario de prueba para verificar flujo completo...');
        const testUserData = {
            nombre: 'Test',
            apellido: 'Dashboard',
            email: 'test-dashboard@example.com',
            telefono: '1234567890',
            nombreBarberia: 'Test Barbería',
            direccion: 'Test Address',
            descripcion: 'Test Description',
            password: 'TestPassword123'
        };

        try {
            // Registrar usuario
            const registerResult = await AuthService.register(testUserData);
            console.log('✅ Usuario de prueba registrado');
            console.log(`   ID: ${registerResult.user.id}`);
            console.log(`   Token: ${registerResult.token ? 'Generado' : 'No generado'}`);

            // Probar login
            const loginResult = await AuthService.login(testUserData.email, testUserData.password);
            console.log('✅ Login exitoso');
            console.log(`   Token de login: ${loginResult.token ? 'Generado' : 'No generado'}`);

            // Probar verificación de token
            const verifyResult = await AuthService.verifyToken(loginResult.token);
            console.log('✅ Verificación de token exitosa');
            console.log(`   Usuario verificado: ${verifyResult.user.nombre} ${verifyResult.user.apellido}`);

            // Limpiar usuario de prueba
            await User.delete(registerResult.user.id);
            console.log('✅ Usuario de prueba eliminado');

            console.log('\n🎉 Dashboard funcionando correctamente');

        } catch (error) {
            console.log('❌ Error en el flujo de prueba:');
            console.log(`   ${error.message}`);
        }

    } catch (error) {
        console.error('❌ Error en la prueba del dashboard:', error.message);
    }
}

// Ejecutar la prueba
testDashboard(); 