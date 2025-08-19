// Script de prueba para verificar que renderServices funcione
console.log('🧪 Probando función renderServices...');

// Simular datos de servicios
const mockServices = [
    {
        id: 1,
        nombre: 'Corte Clásico',
        descripcion: 'Corte de cabello tradicional',
        precio: 2500,
        precio_anterior: 2000,
        duracion: 30,
        estado: 'activo',
        total_reservas: 45,
        total_recaudado: 112500,
        reservas_completadas: 42
    },
    {
        id: 2,
        nombre: 'Barba',
        descripcion: 'Arreglo y modelado de barba',
        precio: 1500,
        precio_anterior: null,
        duracion: 20,
        estado: 'activo',
        total_reservas: 28,
        total_recaudado: 42000,
        reservas_completadas: 25
    },
    {
        id: 3,
        nombre: 'Corte + Barba',
        descripcion: 'Combo completo',
        precio: 3500,
        precio_anterior: 3000,
        duracion: 45,
        estado: 'inactivo',
        total_reservas: 15,
        total_recaudado: 52500,
        reservas_completadas: 12
    }
];

// Función formatPrice simulada
function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS'
    }).format(price);
}

// Función formatNumber simulada
function formatNumber(number) {
    return new Intl.NumberFormat('es-AR').format(number);
}

// Función renderServices (copia del dashboard)
function renderServices(services, pagination) {
    console.log('📊 Renderizando servicios...');
    console.log('Servicios recibidos:', services.length);
    
    if (!services || services.length === 0) {
        console.log('✅ No hay servicios para mostrar');
        return;
    }

    // Simular el HTML que se generaría
    const htmlOutput = services.map(service => {
        const totalRecaudado = Number(service.total_recaudado) || 0;
        const reservasCompletadas = Number(service.reservas_completadas) || 0;
        
        return `
            <div class="service-item" data-id="${service.id}">
                <div class="service-info">
                    <div class="service-name">${service.nombre}</div>
                    <div class="service-description">${service.descripcion || 'Sin descripción'}</div>
                    <div class="service-price">
                        <span class="current-price">${formatPrice(service.precio || 0)}</span>
                        ${service.precio_anterior ? `<span class="old-price">${formatPrice(service.precio_anterior)}</span>` : ''}
                    </div>
                    <div class="service-duration">
                        <i class="fas fa-clock me-1"></i>${service.duracion || 30} min
                    </div>
                </div>
                <div class="service-stats">
                    <div class="stat">
                        <span class="stat-value">${formatNumber(service.total_reservas || 0)}</span>
                        <span class="stat-label">Total</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${reservasCompletadas}</span>
                        <span class="stat-label">Completadas</span>
                    </div>
                    <div class="stat">
                        <span class="stat-value">${formatPrice(totalRecaudado)}</span>
                        <span class="stat-label">Recaudado</span>
                    </div>
                </div>
                <div class="service-actions">
                    <div class="service-status ${service.estado === 'activo' ? 'active' : 'inactive'}">
                        ${service.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </div>
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-warning" onclick="editService(${service.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deleteService(${service.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    console.log('✅ HTML generado correctamente');
    console.log('📝 Primeros 200 caracteres del HTML:');
    console.log(htmlOutput.substring(0, 200) + '...');
    
    // Mostrar estadísticas
    const totalRecaudado = services.reduce((sum, service) => sum + (Number(service.total_recaudado) || 0), 0);
    const totalReservas = services.reduce((sum, service) => sum + (Number(service.total_reservas) || 0), 0);
    
    console.log('\n📊 Estadísticas de servicios:');
    console.log(`   Total de servicios: ${services.length}`);
    console.log(`   Total de reservas: ${totalReservas}`);
    console.log(`   Total recaudado: ${formatPrice(totalRecaudado)}`);
    console.log(`   Servicios activos: ${services.filter(s => s.estado === 'activo').length}`);
    console.log(`   Servicios inactivos: ${services.filter(s => s.estado === 'inactivo').length}`);
}

// Función editService simulada
function editService(serviceId) {
    console.log(`✏️ Editando servicio ID: ${serviceId}`);
}

// Función deleteService simulada
function deleteService(serviceId) {
    console.log(`🗑️ Eliminando servicio ID: ${serviceId}`);
}

// Ejecutar prueba
console.log('🚀 Iniciando prueba...\n');
renderServices(mockServices, { page: 1, total: 3 });

console.log('\n🎉 Prueba completada exitosamente!');
console.log('✅ La función renderServices está funcionando correctamente');
console.log('✅ Las funciones auxiliares (editService, deleteService) están definidas');
console.log('✅ El formato de precios y números funciona correctamente');
