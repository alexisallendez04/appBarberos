const { initializeDatabase } = require('../config/db');
const { initializeDatabase: initDbComplete } = require('../config/initDb');

async function testDatabaseInitialization() {
    try {
        console.log('🧪 Probando inicialización de base de datos...\n');
        
        // Paso 1: Inicializar conexión básica
        console.log('1️⃣ Inicializando conexión básica...');
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
            console.error('❌ No se pudo inicializar la conexión básica');
            return false;
        }
        console.log('✅ Conexión básica establecida\n');
        
        // Paso 2: Verificar tablas
        console.log('2️⃣ Verificando tablas existentes...');
        const { checkTables } = require('../config/db');
        const tablesExist = await checkTables();
        
        if (tablesExist) {
            console.log('✅ Las tablas ya existen');
            return true;
        }
        
        console.log('⚠️  No se encontraron tablas\n');
        
        // Paso 3: Crear esquema completo
        console.log('3️⃣ Creando esquema completo...');
        const schemaCreated = await initDbComplete();
        if (!schemaCreated) {
            console.error('❌ No se pudo crear el esquema');
            return false;
        }
        console.log('✅ Esquema creado exitosamente\n');
        
        // Paso 4: Verificar tablas nuevamente
        console.log('4️⃣ Verificando tablas después de la creación...');
        const tablesExistAfter = await checkTables();
        if (tablesExistAfter) {
            console.log('✅ Tablas creadas correctamente');
            return true;
        } else {
            console.error('❌ Las tablas no se crearon correctamente');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error durante la prueba:', error);
        return false;
    }
}

// Ejecutar la prueba
testDatabaseInitialization()
    .then(success => {
        if (success) {
            console.log('\n🎉 Prueba completada exitosamente');
            process.exit(0);
        } else {
            console.log('\n❌ Prueba falló');
            process.exit(1);
        }
    })
    .catch(error => {
        console.error('\n❌ Error inesperado:', error);
        process.exit(1);
    }); 