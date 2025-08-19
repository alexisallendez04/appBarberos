// Script simple para probar la API del dashboard
const http = require('http');

// Configuración del servidor
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/dashboard/stats',
    method: 'GET',
    headers: {
        'User-Agent': 'Test-Script'
    }
};

console.log('🧪 Probando API del dashboard...');
console.log('📡 URL:', `http://${options.hostname}:${options.port}${options.path}`);

const req = http.request(options, (res) => {
    console.log('📡 Status:', res.statusCode);
    console.log('📡 Headers:', res.headers);
    
    let data = '';
    
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('📊 Datos recibidos:');
            console.log(JSON.stringify(jsonData, null, 2));
            
            if (jsonData.success) {
                console.log('✅ API funcionando correctamente');
                if (jsonData.stats && jsonData.stats.today) {
                    console.log('📈 Estadísticas de hoy:');
                    console.log('  - Total turnos:', jsonData.stats.today.total_turnos);
                    console.log('  - Completados:', jsonData.stats.today.turnos_completados);
                    console.log('  - Reservados:', jsonData.stats.today.turnos_reservados);
                    console.log('  - Confirmados:', jsonData.stats.today.turnos_confirmados);
                    console.log('  - Total recaudado:', jsonData.stats.today.total_recaudado);
                } else {
                    console.log('⚠️ No hay estadísticas de hoy');
                }
            } else {
                console.log('❌ API devolvió error:', jsonData.message);
            }
        } catch (error) {
            console.log('❌ Error parseando respuesta:', error.message);
            console.log('📄 Respuesta raw:', data);
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error de conexión:', error.message);
});

req.end();
