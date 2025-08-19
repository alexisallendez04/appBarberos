const http = require('http');

// Configuración para la petición
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/reports/test',
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
};

console.log('🧪 Probando endpoint de reportes...');
console.log('📡 URL:', `http://${options.hostname}:${options.port}${options.path}`);

// Hacer la petición
const req = http.request(options, (res) => {
    console.log(`📊 Status: ${res.statusCode}`);
    console.log(`📊 Headers:`, res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            console.log('✅ Respuesta del servidor:');
            console.log(JSON.stringify(response, null, 2));
        } catch (error) {
            console.log('📄 Respuesta (no es JSON):', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error en la petición:', error.message);
});

req.end();

console.log('🔄 Petición enviada...');
