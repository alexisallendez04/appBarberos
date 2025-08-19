const fs = require('fs').promises;
const path = require('path');

async function debugSchemaFile() {
    try {
        console.log('🔍 Debug del archivo schema.sql...\n');
        
        // Leer el archivo schema.sql
        const schemaPath = path.join(__dirname, 'sql', 'schema.sql');
        const schemaContent = await fs.readFile(schemaPath, 'utf8');
        
        console.log('📄 Contenido del archivo (primeras 500 caracteres):');
        console.log('=' .repeat(50));
        console.log(schemaContent.substring(0, 500));
        console.log('=' .repeat(50));
        
        // Dividir el contenido en consultas individuales
        const queries = schemaContent
            .split(';')
            .map(query => query.trim())
            .filter(query => {
                return query.length > 0 && 
                       !query.startsWith('--') && 
                       !query.startsWith('/*') &&
                       !query.startsWith('*/');
            });
        
        console.log(`\n📊 Total de consultas encontradas: ${queries.length}`);
        
        console.log('\n🔍 Todas las consultas encontradas:');
        queries.forEach((query, index) => {
            console.log(`\n${index + 1}. ${query.substring(0, 100)}...`);
        });
        
        // Verificar si hay CREATE TABLE
        const createTableQueries = queries.filter(q => q.toUpperCase().includes('CREATE TABLE'));
        console.log(`\n📋 Consultas CREATE TABLE encontradas: ${createTableQueries.length}`);
        
        // Verificar si hay CREATE INDEX
        const createIndexQueries = queries.filter(q => q.toUpperCase().includes('CREATE INDEX'));
        console.log(`📋 Consultas CREATE INDEX encontradas: ${createIndexQueries.length}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

debugSchemaFile(); 