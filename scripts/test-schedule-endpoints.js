const fetch = require('node-fetch');

// Configuración
const BASE_URL = 'http://localhost:3000';
const TEST_USER = {
    email: 'admin@barberia.com',
    password: 'admin123'
};

let authToken = '';

// Función para hacer login y obtener token
async function login() {
    try {
        console.log('🔐 Iniciando sesión...');
        
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(TEST_USER)
        });

        if (!response.ok) {
            throw new Error(`Error en login: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            // Extraer token de las cookies
            const cookies = response.headers.get('set-cookie');
            if (cookies) {
                const tokenMatch = cookies.match(/token=([^;]+)/);
                if (tokenMatch) {
                    authToken = tokenMatch[1];
                    console.log('✅ Login exitoso');
                    return true;
                }
            }
            throw new Error('No se pudo obtener el token');
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error en login:', error.message);
        return false;
    }
}

// Función para hacer requests autenticados
async function authenticatedRequest(url, options = {}) {
    const defaultOptions = {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `token=${authToken}`
        }
    };
    
    return fetch(url, { ...defaultOptions, ...options });
}

// Test 1: Obtener configuración de horarios
async function testGetScheduleConfig() {
    try {
        console.log('\n📋 Test 1: Obtener configuración de horarios');
        
        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/config`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Configuración obtenida:', result.data);
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error obteniendo configuración:', error.message);
        return null;
    }
}

// Test 2: Actualizar configuración de horarios
async function testUpdateScheduleConfig() {
    try {
        console.log('\n📋 Test 2: Actualizar configuración de horarios');
        
        const configData = {
            intervalo_turnos: 45,
            anticipacion_reserva: 2880,
            max_reservas_dia: 25,
            permitir_reservas_mismo_dia: false
        };

        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/config`, {
            method: 'PUT',
            body: JSON.stringify(configData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Configuración actualizada exitosamente');
            return true;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error actualizando configuración:', error.message);
        return false;
    }
}

// Test 3: Obtener horarios laborales
async function testGetWorkingHours() {
    try {
        console.log('\n📋 Test 3: Obtener horarios laborales');
        
        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/working-hours`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Horarios laborales obtenidos:', result.data.length, 'horarios');
            result.data.forEach(horario => {
                console.log(`   - ${horario.dia_semana}: ${horario.hora_inicio} - ${horario.hora_fin} (${horario.estado})`);
            });
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error obteniendo horarios laborales:', error.message);
        return [];
    }
}

// Test 4: Crear horario laboral
async function testCreateWorkingHour() {
    try {
        console.log('\n📋 Test 4: Crear horario laboral');
        
        const horarioData = {
            dia_semana: 'lunes',
            hora_inicio: '08:00',
            hora_fin: '17:00',
            pausa_inicio: '12:00',
            pausa_fin: '13:00',
            estado: 'activo'
        };

        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/working-hours`, {
            method: 'POST',
            body: JSON.stringify(horarioData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Horario laboral creado exitosamente');
            return result.data.id;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error creando horario laboral:', error.message);
        return null;
    }
}

// Test 5: Obtener días especiales
async function testGetSpecialDays() {
    try {
        console.log('\n📋 Test 5: Obtener días especiales');
        
        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/special-days`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Días especiales obtenidos:', result.data.length, 'días');
            result.data.forEach(dia => {
                console.log(`   - ${dia.fecha}: ${dia.tipo} - ${dia.descripcion}`);
            });
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error obteniendo días especiales:', error.message);
        return [];
    }
}

// Test 6: Crear día especial
async function testCreateSpecialDay() {
    try {
        console.log('\n📋 Test 6: Crear día especial');
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const fecha = tomorrow.toISOString().split('T')[0];
        
        const specialDayData = {
            fecha: fecha,
            tipo: 'vacaciones',
            descripcion: 'Día de prueba',
            todo_dia: true,
            hora_inicio: null,
            hora_fin: null
        };

        const response = await authenticatedRequest(`${BASE_URL}/api/schedule/special-days`, {
            method: 'POST',
            body: JSON.stringify(specialDayData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            console.log('✅ Día especial creado exitosamente');
            return result.data.id;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('❌ Error creando día especial:', error.message);
        return null;
    }
}

// Función principal de pruebas
async function runTests() {
    console.log('🚀 Iniciando pruebas de endpoints de horarios...\n');

    // Login
    const loginSuccess = await login();
    if (!loginSuccess) {
        console.error('❌ No se pudo hacer login. Abortando pruebas.');
        return;
    }

    // Ejecutar pruebas
    await testGetScheduleConfig();
    await testUpdateScheduleConfig();
    await testGetWorkingHours();
    await testCreateWorkingHour();
    await testGetSpecialDays();
    await testCreateSpecialDay();

    console.log('\n✅ Todas las pruebas completadas');
}

// Ejecutar pruebas
runTests().catch(error => {
    console.error('❌ Error en las pruebas:', error);
    process.exit(1);
}); 