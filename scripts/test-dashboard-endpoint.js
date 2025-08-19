const http = require('http');

async function testDashboardEndpoint() {
    try {
        console.log('🔍 Probando endpoint del dashboard...\n');
        
        // Primero hacer login para obtener el token
        console.log('📝 Haciendo login...');
        
        const loginData = JSON.stringify({
            email: 'test@example.com',
            password: 'TestPassword123'
        });

        const loginOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const loginPromise = new Promise((resolve, reject) => {
            const req = http.request(loginOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: data, headers: res.headers });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.write(loginData);
            req.end();
        });

        const loginResult = await loginPromise;
        
        if (loginResult.status !== 200) {
            console.log('❌ Error en login:', loginResult.status);
            console.log('   Response:', loginResult.data);
            return;
        }

        const loginResponse = JSON.parse(loginResult.data);
        console.log('✅ Login exitoso');
        console.log('👤 Usuario:', loginResponse.user.nombre);
        console.log('🔑 Token obtenido:', loginResponse.token.substring(0, 20) + '...\n');

        // Probar el endpoint del dashboard
        console.log('📊 Probando endpoint /dashboard/stats...');
        
        const dashboardOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/dashboard/stats',
            method: 'GET',
            headers: {
                'Cookie': loginResult.headers['set-cookie'] ? loginResult.headers['set-cookie'].join('; ') : '',
                'Authorization': `Bearer ${loginResponse.token}`
            }
        };

        const dashboardPromise = new Promise((resolve, reject) => {
            const req = http.request(dashboardOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    resolve({ status: res.statusCode, data: data });
                });
            });

            req.on('error', (err) => {
                reject(err);
            });

            req.end();
        });

        const dashboardResult = await dashboardPromise;
        
        console.log('📈 Status del dashboard:', dashboardResult.status);

        if (dashboardResult.status === 200) {
            const dashboardData = JSON.parse(dashboardResult.data);
            console.log('✅ Datos del dashboard recibidos:');
            console.log('   - Success:', dashboardData.success);
            
            if (dashboardData.stats) {
                console.log('   - Stats de hoy:', dashboardData.stats.today);
                console.log('   - Stats de la semana:', dashboardData.stats.week);
                console.log('   - Stats del mes:', dashboardData.stats.month);
            }
            
            if (dashboardData.upcomingTurnos) {
                console.log('   - Próximos turnos:', dashboardData.upcomingTurnos.length);
            }
            
            if (dashboardData.popularServices) {
                console.log('   - Servicios populares:', dashboardData.popularServices.length);
            }
            
            if (dashboardData.topClients) {
                console.log('   - Clientes top:', dashboardData.topClients.length);
            }
        } else {
            console.log('❌ Error en dashboard:', dashboardResult.status);
            console.log('   Response:', dashboardResult.data);
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error.message);
    } finally {
        process.exit(0);
    }
}

testDashboardEndpoint(); 