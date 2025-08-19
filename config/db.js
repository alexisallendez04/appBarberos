const mysql = require('mysql2/promise');

// Configuración de la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'Alexis83',
    password: process.env.DB_PASSWORD || 'TukiTuki12',
    port: process.env.DB_PORT || 3308,
    charset: 'utf8mb4',
    // Configuración del pool de conexiones
    connectionLimit: 10,
    multipleStatements: true, // Permitir múltiples sentencias SQL
    // Configuración de SSL (opcional para producción)
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: false
    } : false
};

// Configuración para la base de datos específica
const databaseName = process.env.DB_NAME || 'barberia_db';

// Crear pool de conexiones sin especificar base de datos inicialmente
const pool = mysql.createPool(dbConfig);

// Función para crear la base de datos si no existe
async function createDatabaseIfNotExists() {
    try {
        const connection = await pool.getConnection();
        
        // Crear la base de datos si no existe - usar query directa para DDL
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
        console.log(`✅ Base de datos '${databaseName}' verificada/creada correctamente`);
        
        // Usar la base de datos - usar query directa para DDL
        await connection.query(`USE \`${databaseName}\``);
        console.log(`📊 Usando base de datos: ${databaseName}`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al crear/verificar la base de datos:', error.message);
        return false;
    }
}

// Función para probar la conexión
async function testConnection() {
    try {
        // Primero crear la base de datos si no existe
        const dbCreated = await createDatabaseIfNotExists();
        if (!dbCreated) {
            return false;
        }

        // Ahora probar la conexión con la base de datos específica
        const connection = await pool.getConnection();
        
        // Usar la base de datos específica - usar query directa para DDL
        await connection.query(`USE \`${databaseName}\``);
        
        console.log('✅ Conexión a la base de datos establecida correctamente');
        console.log(`📊 Base de datos: ${databaseName}`);
        console.log(`👤 Usuario: ${dbConfig.user}`);
        console.log(`🌐 Host: ${dbConfig.host}:${dbConfig.port}`);
        
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        console.error('🔧 Verifica:');
        console.error('   - Que MySQL esté corriendo');
        console.error('   - Que las credenciales sean correctas');
        console.error('   - Que el usuario tenga permisos para crear bases de datos');
        console.error('   - Que el puerto 3308 esté disponible');
        
        // Mostrar información de debug
        console.error('🔍 Información de debug:');
        console.error(`   Host: ${dbConfig.host}`);
        console.error(`   Usuario: ${dbConfig.user}`);
        console.error(`   Puerto: ${dbConfig.port}`);
        console.error(`   Base de datos: ${databaseName}`);
        
        return false;
    }
}

// Función para ejecutar consultas
async function query(sql, params = []) {
    try {
        // Asegurar que estamos usando la base de datos correcta
        const connection = await pool.getConnection();
        await connection.query(`USE \`${databaseName}\``);
        
        // Usar connection.query() en lugar de connection.execute() para evitar problemas con parámetros
        const [rows] = await connection.query(sql, params);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error en consulta SQL:', error);
        throw error;
    }
}

// Función para obtener una conexión individual
async function getConnection() {
    try {
        const connection = await pool.getConnection();
        // Asegurar que estamos usando la base de datos correcta
        await connection.query(`USE \`${databaseName}\``);
        return connection;
    } catch (error) {
        console.error('Error al obtener conexión:', error);
        throw error;
    }
}

// Función para verificar si las tablas existen
async function checkTables() {
    try {
        const connection = await getConnection();
        const [tables] = await connection.execute(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = ?
        `, [databaseName]);
        
        connection.release();
        
        if (tables.length === 0) {
            console.log('⚠️  No se encontraron tablas en la base de datos');
            console.log('📝 Ejecuta el archivo sql/schema.sql para crear las tablas');
            return false;
        }
        
        console.log(`✅ Se encontraron ${tables.length} tablas en la base de datos`);
        return true;
    } catch (error) {
        console.error('Error al verificar tablas:', error);
        return false;
    }
}

// Función para inicializar la base de datos completamente
async function initializeDatabase() {
    console.log('🚀 Inicializando base de datos...');
    
    // Probar conexión
    const connected = await testConnection();
    if (!connected) {
        return false;
    }
    
    // Verificar tablas
    const tablesExist = await checkTables();
    if (!tablesExist) {
        console.log('💡 Para crear las tablas, ejecuta: mysql -u root -p barberia_db < sql/schema.sql');
    }
    
    return true;
}

// Función para iniciar una transacción
async function beginTransaction() {
    const connection = await getConnection();
    await connection.beginTransaction();
    return connection;
}

// Función para hacer commit de una transacción
async function commitTransaction(connection) {
    try {
        await connection.commit();
        connection.release();
    } catch (error) {
        await rollbackTransaction(connection);
        throw error;
    }
}

// Función para hacer rollback de una transacción
async function rollbackTransaction(connection) {
    try {
        await connection.rollback();
        connection.release();
    } catch (error) {
        console.error('Error en rollback:', error);
    }
}

// Función para cerrar el pool de conexiones
async function closePool() {
    try {
        await pool.end();
        console.log('Pool de conexiones cerrado correctamente');
    } catch (error) {
        console.error('Error al cerrar el pool:', error);
    }
}

// Middleware para manejar errores de base de datos
function handleDatabaseError(error, req, res, next) {
    console.error('Error de base de datos:', error);
    
    if (res.headersSent) {
        return next(error);
    }
    
    if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
            success: false,
            message: 'El registro ya existe en la base de datos'
        });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
            success: false,
            message: 'Referencia inválida en la base de datos'
        });
    }
    
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(400).json({
            success: false,
            message: 'No se puede eliminar el registro porque está siendo utilizado'
        });
    }
    
    // Error genérico
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
    });
}

module.exports = {
    pool,
    query,
    getConnection,
    beginTransaction,
    commitTransaction,
    rollbackTransaction,
    closePool,
    testConnection,
    initializeDatabase,
    checkTables,
    handleDatabaseError
};
