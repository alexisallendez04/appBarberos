// Simular exactamente la lógica del frontend para identificar el problema de timing
console.log('🔍 SIMULACIÓN DE LÓGICA DEL FRONTEND');
console.log('=' .repeat(50));

// Simular los datos que vienen del backend
const backendSlots = [
    { hora_inicio: '09:00', hora_fin: '09:45', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '09:50', hora_fin: '10:35', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '10:40', hora_fin: '11:25', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '11:30', hora_fin: '12:15', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '14:00', hora_fin: '14:45', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '14:50', hora_fin: '15:35', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '15:40', hora_fin: '16:25', disponible: true, duracion: 45, tiempo_total: '45 min' },
    { hora_inicio: '16:30', hora_fin: '17:15', disponible: true, duracion: 45, tiempo_total: '45 min' }
];

console.log('📋 SLOTS DEL BACKEND (CORRECTOS):');
backendSlots.forEach((slot, index) => {
    console.log(`   ${index + 1}. ${slot.hora_inicio} - ${slot.hora_fin} (${slot.tiempo_total})`);
});

// Simular diferentes algoritmos que podrían estar causando el problema
console.log('\n🔍 ANÁLISIS DE POSIBLES CAUSAS:');

// 1. Verificar si hay algún cálculo de diferencia entre slots
console.log('\n📋 1. CÁLCULO DE DIFERENCIAS ENTRE SLOTS:');
for (let i = 0; i < backendSlots.length - 1; i++) {
    const current = backendSlots[i];
    const next = backendSlots[i + 1];
    
    const currentTime = new Date(`2000-01-01T${current.hora_inicio}`);
    const nextTime = new Date(`2000-01-01T${next.hora_inicio}`);
    
    const diffMinutes = (nextTime - currentTime) / (1000 * 60);
    console.log(`   ${current.hora_inicio} → ${next.hora_inicio}: ${diffMinutes} minutos`);
}

// 2. Simular diferentes configuraciones de buffer
console.log('\n📋 2. SIMULACIÓN CON DIFERENTES BUFFERS:');
const buffers = [5, 10, 15, 20, 25, 30];
const serviceDuration = 45;

buffers.forEach(buffer => {
    const totalInterval = serviceDuration + buffer;
    console.log(`   Buffer ${buffer} min + Servicio ${serviceDuration} min = ${totalInterval} min total`);
    
    // Generar slots con este buffer
    let currentTime = new Date('2000-01-01T09:00:00');
    const slots = [];
    
    for (let i = 0; i < 5; i++) {
        const slotStart = currentTime.toTimeString().slice(0, 5);
        const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
        const slotEndStr = slotEnd.toTimeString().slice(0, 5);
        
        slots.push(`${slotStart} - ${slotEndStr}`);
        
        // Avanzar al siguiente slot
        currentTime = new Date(slotEnd.getTime() + (buffer * 60000));
    }
    
    console.log(`     Slots: ${slots.join(', ')}`);
});

// 3. Verificar si hay algún problema con el intervalo configurado en la base de datos
console.log('\n📋 3. ANÁLISIS DEL INTERVALO CONFIGURADO:');
const configuredInterval = 30; // Valor de la base de datos
console.log(`   Intervalo configurado en BD: ${configuredInterval} minutos`);
console.log(`   Duración del servicio: ${serviceDuration} minutos`);
console.log(`   Buffer configurado: 5 minutos`);
console.log(`   Intervalo real generado: ${serviceDuration + 5} minutos`);

// 4. Simular el problema reportado (75 minutos)
console.log('\n📋 4. SIMULACIÓN DEL PROBLEMA REPORTADO (75 min):');
let currentTime = new Date('2000-01-01T09:00:00');
const problematicSlots = [];

for (let i = 0; i < 5; i++) {
    const slotStart = currentTime.toTimeString().slice(0, 5);
    const slotEnd = new Date(currentTime.getTime() + (serviceDuration * 60000));
    const slotEndStr = slotEnd.toTimeString().slice(0, 5);
    
    problematicSlots.push(`${slotStart} - ${slotEndStr}`);
    
    // Avanzar 75 minutos (PROBLEMA)
    currentTime = new Date(currentTime.getTime() + (75 * 60000));
}

console.log(`   Slots con problema (75 min): ${problematicSlots.join(', ')}`);

// 5. Identificar la causa del problema
console.log('\n🔍 IDENTIFICACIÓN DE LA CAUSA:');
console.log('   PROBLEMA: Frontend muestra slots cada 75 minutos');
console.log('   CAUSA MÁS PROBABLE: El frontend está usando el intervalo configurado (30 min)');
console.log('   en lugar de la duración del servicio + buffer (45 + 5 = 50 min)');
console.log('   RESULTADO: 30 + 45 = 75 minutos (¡EXACTO!)');

console.log('\n✅ CONCLUSIÓN:');
console.log('   El problema está en que el frontend está calculando:');
console.log('   - Intervalo configurado (30 min) + Duración servicio (45 min) = 75 min');
console.log('   - En lugar de: Duración servicio (45 min) + Buffer (5 min) = 50 min');
console.log('   ');
console.log('   SOLUCIÓN: Modificar la lógica del frontend para NO usar el intervalo configurado');
console.log('   para el cálculo de slots, solo para el buffer entre turnos.');
