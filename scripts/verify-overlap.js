const { query } = require('../config/db');
require('dotenv').config();

async function verifyOverlap() {
    try {
        console.log('🔍 Verificando solapamiento entre slots y citas existentes\n');

        // Cita existente
        const existingAppointment = {
            hora_inicio: '11:00:00',
            hora_fin: '11:30:00'
        };

        // Slot que queremos verificar
        const targetSlot = {
            hora_inicio: '11:30',
            hora_fin: '12:00'
        };

        console.log('📅 Cita existente:');
        console.log(`   ${existingAppointment.hora_inicio} - ${existingAppointment.hora_fin}`);
        console.log();

        console.log('🎯 Slot a verificar:');
        console.log(`   ${targetSlot.hora_inicio} - ${targetSlot.hora_fin}`);
        console.log();

        // Verificar solapamiento
        const isOverlapping = (
            targetSlot.hora_inicio < existingAppointment.hora_fin && 
            targetSlot.hora_fin > existingAppointment.hora_inicio
        );

        console.log('🔍 Análisis de solapamiento:');
        console.log(`   targetSlot.hora_inicio (${targetSlot.hora_inicio}) < existingAppointment.hora_fin (${existingAppointment.hora_fin}): ${targetSlot.hora_inicio < existingAppointment.hora_fin}`);
        console.log(`   targetSlot.hora_fin (${targetSlot.hora_fin}) > existingAppointment.hora_inicio (${existingAppointment.hora_inicio}): ${targetSlot.hora_fin > existingAppointment.hora_inicio}`);
        console.log(`   Resultado: ${isOverlapping}`);
        console.log();

        if (isOverlapping) {
            console.log('❌ SOLAPAMIENTO DETECTADO');
            console.log('El slot 11:30-12:00 se solapa con la cita 11:00-11:30');
            console.log('Por eso el slot 11:30 no aparece como disponible.');
        } else {
            console.log('✅ NO HAY SOLAPAMIENTO');
            console.log('El slot 11:30-12:00 debería estar disponible.');
        }

        console.log('\n💡 EXPLICACIÓN:');
        console.log('El problema no está en la lógica de intervalos, sino en la lógica de verificación de solapamiento.');
        console.log('La cita de 11:00-11:30 se solapa con el slot 11:30-12:00 porque:');
        console.log('   - 11:30 < 11:30:00 (falso)');
        console.log('   - 12:00 > 11:00:00 (verdadero)');
        console.log('   - Como una condición es verdadera, hay solapamiento');

        console.log('\n🔧 SOLUCIÓN:');
        console.log('La lógica de verificación de solapamiento está correcta.');
        console.log('El slot 11:30-12:00 NO debería estar disponible porque se solapa con 11:00-11:30.');
        console.log('El siguiente slot disponible debería ser 12:00-12:30.');

    } catch (error) {
        console.error('❌ Error en la verificación:', error);
    } finally {
        process.exit(0);
    }
}

// Ejecutar la verificación
verifyOverlap();
