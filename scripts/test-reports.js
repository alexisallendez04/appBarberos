const fetch = require('node-fetch');

async function testReports() {
    console.log('=== PRUEBA DE REPORTES ===\n');
    
    // Primero necesitamos hacer login para obtener el token
    console.log('1. Iniciando sesión...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: 'admin@barberia.com',
            password: 'admin123'
        })
    });
    
    const loginResult = await loginResponse.json();
    if (!loginResult.success) {
        console.error('❌ Error al iniciar sesión:', loginResult.message);
        return;
    }
    
    console.log('✅ Sesión iniciada correctamente');
    
    // Obtener cookies de la respuesta
    const cookies = loginResponse.headers.get('set-cookie');
    const authCookie = cookies ? cookies.split(';')[0] : '';
    
    console.log('\n2. Probando reporte general (mes actual)...');
    try {
        const reportResponse = await fetch('http://localhost:3000/api/reports/general?period=month', {
            headers: {
                'Cookie': authCookie
            }
        });
        
        const reportResult = await reportResponse.json();
        
        if (reportResult.success) {
            console.log('✅ Reporte general generado correctamente');
            console.log('📊 Métricas obtenidas:');
            console.log(`   - Ingresos totales: $${reportResult.data.metrics.totalRevenue}`);
            console.log(`   - Citas completadas: ${reportResult.data.metrics.completedAppointments}`);
            console.log(`   - Nuevos clientes: ${reportResult.data.metrics.newClients}`);
            console.log(`   - Promedio por cita: $${reportResult.data.metrics.averagePerAppointment}`);
            
            console.log('\n📈 Datos de gráficos:');
            console.log(`   - Puntos de datos en gráfico de ingresos: ${reportResult.data.charts.revenueByDay.labels.length}`);
            console.log(`   - Servicios en gráfico de servicios: ${reportResult.data.charts.servicesPerformance.labels.length}`);
            
            console.log('\n📋 Datos de tablas:');
            console.log(`   - Top clientes: ${reportResult.data.tables.topClients.length}`);
            console.log(`   - Reporte detallado: ${reportResult.data.tables.detailedReport.length} registros`);
            
        } else {
            console.error('❌ Error al generar reporte:', reportResult.message);
        }
    } catch (error) {
        console.error('❌ Error al obtener reporte:', error.message);
    }
    
    console.log('\n3. Probando diferentes períodos...');
    const periods = ['today', 'week', 'month', 'quarter', 'year'];
    
    for (const period of periods) {
        try {
            const response = await fetch(`http://localhost:3000/api/reports/general?period=${period}`, {
                headers: {
                    'Cookie': authCookie
                }
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log(`✅ Período "${period}": ${result.data.metrics.completedAppointments} citas, $${result.data.metrics.totalRevenue} ingresos`);
            } else {
                console.log(`❌ Período "${period}": ${result.message}`);
            }
        } catch (error) {
            console.log(`❌ Período "${period}": ${error.message}`);
        }
    }
    
    console.log('\n4. Probando exportación de reporte...');
    try {
        const exportResponse = await fetch('http://localhost:3000/api/reports/export?period=month', {
            headers: {
                'Cookie': authCookie
            }
        });
        
        if (exportResponse.ok) {
            const csvContent = await exportResponse.text();
            console.log('✅ Exportación exitosa');
            console.log(`📄 Contenido CSV (primeras 200 caracteres): ${csvContent.substring(0, 200)}...`);
        } else {
            console.error('❌ Error en exportación:', exportResponse.status);
        }
    } catch (error) {
        console.error('❌ Error al exportar:', error.message);
    }
    
    console.log('\n=== PRUEBA COMPLETADA ===');
}

// Ejecutar la prueba
testReports().catch(console.error); 