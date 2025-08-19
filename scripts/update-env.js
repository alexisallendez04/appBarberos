const fs = require('fs');
const path = require('path');

// Variables que necesitamos agregar
const newEnvVars = `
# Configuración de Registro y Roles
REGISTRATION_CODE=ALEXIS2024
ADMIN_REGISTRATION_CODE=ADMIN2024
DEFAULT_USER_ROLE=barbero
ALLOWED_ROLES=admin,barbero
`;

async function updateEnvFile() {
    try {
        const envPath = path.join(__dirname, '..', '.env');
        
        // Leer el archivo .env actual
        let envContent = '';
        if (fs.existsSync(envPath)) {
            envContent = fs.readFileSync(envPath, 'utf8');
        }
        
        // Verificar si las variables ya existen
        if (envContent.includes('REGISTRATION_CODE=')) {
            console.log('⚠️  Las variables de registro ya existen en el archivo .env');
            return;
        }
        
        // Agregar las nuevas variables al final del archivo
        const updatedContent = envContent + newEnvVars;
        
        // Escribir el archivo actualizado
        fs.writeFileSync(envPath, updatedContent, 'utf8');
        
        console.log('✅ Variables de registro agregadas al archivo .env');
        console.log('📋 Variables agregadas:');
        console.log('   REGISTRATION_CODE=ALEXIS2024');
        console.log('   ADMIN_REGISTRATION_CODE=ADMIN2024');
        console.log('   DEFAULT_USER_ROLE=barbero');
        console.log('   ALLOWED_ROLES=admin,barbero');
        console.log('');
        console.log('🔑 Códigos de registro:');
        console.log('   Para barberos: ALEXIS2024');
        console.log('   Para administradores: ADMIN2024');
        
    } catch (error) {
        console.error('❌ Error al actualizar el archivo .env:', error.message);
        process.exit(1);
    }
}

// Ejecutar el script
updateEnvFile().then(() => {
    console.log('✅ Script completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error en el script:', error);
    process.exit(1);
});
