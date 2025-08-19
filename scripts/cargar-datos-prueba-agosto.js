const { query } = require('../config/db');

async function cargarDatosPruebaAgosto() {
    console.log('🚀 CARGANDO DATOS DE PRUEBA PARA AGOSTO 2025');
    console.log('=' .repeat(60));
    
    try {
        // 1. Verificar servicios disponibles
        console.log('\n📋 1. VERIFICANDO SERVICIOS DISPONIBLES:');
        const servicios = await query(`
            SELECT id, nombre, precio, duracion 
            FROM servicios 
            WHERE estado = 'activo'
            ORDER BY precio DESC
        `);
        
        if (servicios.length === 0) {
            console.log('   ❌ No hay servicios activos. Creando servicios de prueba...');
            
            // Crear servicios de prueba
            await query(`
                INSERT INTO servicios (nombre, precio, duracion, id_usuario, estado, descripcion) VALUES
                ('Corte Clásico', 25000, 45, 1, 'activo', 'Corte tradicional de cabello'),
                ('Corte + Barba', 35000, 60, 1, 'activo', 'Corte completo con arreglo de barba'),
                ('Barba', 15000, 30, 1, 'activo', 'Arreglo y modelado de barba'),
                ('Corte Degradado', 30000, 50, 1, 'activo', 'Corte moderno con degradado'),
                ('Corte + Tinte', 45000, 75, 1, 'activo', 'Corte con aplicación de tinte')
            `);
            
            console.log('   ✅ Servicios de prueba creados');
        } else {
            console.log(`   ✅ Servicios encontrados: ${servicios.length}`);
            servicios.forEach(servicio => {
                console.log(`      - ${servicio.nombre}: $${servicio.precio} (${servicio.duracion} min)`);
            });
        }
        
        // 2. Verificar clientes disponibles
        console.log('\n👥 2. VERIFICANDO CLIENTES DISPONIBLES:');
        const clientes = await query(`
            SELECT id, nombre, apellido, telefono 
            FROM clientes 
            WHERE estado = 'activo'
            ORDER BY id
            LIMIT 10
        `);
        
        if (clientes.length === 0) {
            console.log('   ❌ No hay clientes activos. Creando clientes de prueba...');
            
            // Crear clientes de prueba
            await query(`
                INSERT INTO clientes (nombre, apellido, telefono, email, estado) VALUES
                ('Juan', 'Pérez', '123456789', 'juan@email.com', 'activo'),
                ('Carlos', 'González', '234567890', 'carlos@email.com', 'activo'),
                ('Miguel', 'Rodríguez', '345678901', 'miguel@email.com', 'activo'),
                ('Luis', 'Martínez', '456789012', 'luis@email.com', 'activo'),
                ('Roberto', 'López', '567890123', 'roberto@email.com', 'activo'),
                ('Fernando', 'Hernández', '678901234', 'fernando@email.com', 'activo'),
                ('Diego', 'García', '789012345', 'diego@email.com', 'activo'),
                ('Andrés', 'Morales', '890123456', 'andres@email.com', 'activo'),
                ('Ricardo', 'Jiménez', '901234567', 'ricardo@email.com', 'activo'),
                ('Eduardo', 'Moreno', '012345678', 'eduardo@email.com', 'activo')
            `);
            
            console.log('   ✅ 10 clientes de prueba creados');
        } else {
            console.log(`   ✅ Clientes encontrados: ${clientes.length}`);
        }
        
        // 3. Limpiar turnos existentes de agosto (para evitar duplicados)
        console.log('\n🧹 3. LIMPIANDO TURNOS EXISTENTES DE AGOSTO:');
        const turnosEliminados = await query(`
            DELETE FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        console.log(`   ✅ Turnos de agosto eliminados: ${turnosEliminados.affectedRows}`);
        
        // 4. Cargar turnos completados para agosto
        console.log('\n📅 4. CARGANDO TURNOS COMPLETADOS PARA AGOSTO:');
        
        const serviciosDisponibles = await query('SELECT id, precio, duracion FROM servicios WHERE estado = "activo"');
        const clientesDisponibles = await query('SELECT id FROM clientes WHERE estado = "activo" LIMIT 10');
        
        if (serviciosDisponibles.length === 0 || clientesDisponibles.length === 0) {
            throw new Error('No hay servicios o clientes disponibles');
        }
        
        // Generar turnos para todo agosto
        const turnosGenerados = [];
        const fechasAgosto = [];
        
        // Generar todas las fechas de agosto (lunes a sábado, excluyendo domingos)
        for (let dia = 1; dia <= 31; dia++) {
            const fecha = new Date(2025, 7, dia); // Mes 7 = Agosto (0-indexed)
            const diaSemana = fecha.getDay();
            
            // Solo lunes a sábado (1-6)
            if (diaSemana >= 1 && diaSemana <= 6) {
                fechasAgosto.push(fecha.toISOString().split('T')[0]);
            }
        }
        
        console.log(`   📅 Fechas laborables de agosto: ${fechasAgosto.length} días`);
        
        let totalTurnos = 0;
        let totalIngresos = 0;
        
        // Generar turnos para cada fecha laborable
        for (const fecha of fechasAgosto) {
            // Generar entre 3 y 8 turnos por día
            const turnosPorDia = Math.floor(Math.random() * 6) + 3;
            
            for (let i = 0; i < turnosPorDia; i++) {
                const servicio = serviciosDisponibles[Math.floor(Math.random() * serviciosDisponibles.length)];
                const cliente = clientesDisponibles[Math.floor(Math.random() * clientesDisponibles.length)];
                
                // Hora de inicio entre 9:00 y 18:00
                const horaInicio = 9 + Math.floor(Math.random() * 9);
                const minutoInicio = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
                
                const horaInicioStr = `${horaInicio.toString().padStart(2, '0')}:${minutoInicio.toString().padStart(2, '0')}`;
                
                // Calcular hora de fin basada en la duración del servicio
                const horaFin = new Date(`2025-08-01T${horaInicioStr}:00`);
                horaFin.setMinutes(horaFin.getMinutes() + servicio.duracion);
                const horaFinStr = horaFin.toTimeString().slice(0, 5);
                
                // Estado: 80% completado, 15% confirmado, 5% en_proceso
                const randomEstado = Math.random();
                let estado, precioFinal;
                
                if (randomEstado < 0.8) {
                    estado = 'completado';
                    precioFinal = servicio.precio;
                    totalIngresos += servicio.precio;
                } else if (randomEstado < 0.95) {
                    estado = 'confirmado';
                    precioFinal = servicio.precio;
                } else {
                    estado = 'en_proceso';
                    precioFinal = servicio.precio;
                }
                
                const turno = {
                    fecha: fecha,
                    hora_inicio: horaInicioStr,
                    hora_fin: horaFinStr,
                    estado: estado,
                    precio_final: precioFinal,
                    id_cliente: cliente.id,
                    id_servicio: servicio.id,
                    id_usuario: 1, // Alexis
                    notas: estado === 'completado' ? 'Servicio completado satisfactoriamente' : null
                };
                
                turnosGenerados.push(turno);
                totalTurnos++;
            }
        }
        
        // Insertar todos los turnos
        console.log(`   📊 Insertando ${turnosGenerados.length} turnos...`);
        
        for (const turno of turnosGenerados) {
            await query(`
                INSERT INTO turnos (
                    fecha, hora_inicio, hora_fin, estado, precio_final,
                    id_cliente, id_servicio, id_usuario, notas
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                turno.fecha, turno.hora_inicio, turno.hora_fin, turno.estado,
                turno.precio_final, turno.id_cliente, turno.id_servicio,
                turno.id_usuario, turno.notas
            ]);
        }
        
        console.log(`   ✅ ${turnosGenerados.length} turnos insertados exitosamente`);
        
        // 5. Resumen de datos cargados
        console.log('\n📊 5. RESUMEN DE DATOS CARGADOS:');
        
        const resumen = await query(`
            SELECT 
                COUNT(CASE WHEN estado = 'completado' THEN 1 END) as completados,
                COUNT(CASE WHEN estado = 'confirmado' THEN 1 END) as confirmados,
                COUNT(CASE WHEN estado = 'en_proceso' THEN 1 END) as en_proceso,
                SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos_completados,
                SUM(CASE WHEN estado IN ('confirmado', 'en_proceso') THEN precio_final ELSE 0 END) as ingresos_pendientes
            FROM turnos 
            WHERE fecha >= '2025-08-01' AND fecha <= '2025-08-31'
        `);
        
        const datos = resumen[0];
        console.log(`   📅 Período: Agosto 2025`);
        console.log(`   ✅ Turnos completados: ${datos.completados}`);
        console.log(`   ⏳ Turnos confirmados: ${datos.confirmados}`);
        console.log(`   🔄 Turnos en proceso: ${datos.en_proceso}`);
        console.log(`   💰 Ingresos de completados: $${datos.ingresos_completados}`);
        console.log(`   💳 Ingresos pendientes: $${datos.ingresos_pendientes}`);
        console.log(`   📊 Total turnos: ${datos.completados + datos.confirmados + datos.en_proceso}`);
        
        // 6. Verificar períodos de reportes
        console.log('\n🧪 6. VERIFICACIÓN DE PERÍODOS DE REPORTES:');
        
        const hoy = new Date();
        const ayer = new Date(hoy);
        ayer.setDate(hoy.getDate() - 1);
        
        // Verificar "Hoy"
        const turnosHoy = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = CURDATE()
        `);
        
        // Verificar "Ayer"
        const turnosAyer = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE fecha = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
        `);
        
        // Verificar "Esta Semana"
        const turnosSemana = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEARWEEK(fecha) = YEARWEEK(CURDATE())
        `);
        
        // Verificar "Este Mes"
        const turnosMes = await query(`
            SELECT COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as ingresos
            FROM turnos 
            WHERE YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())
        `);
        
        console.log(`   📅 Hoy (${hoy.toISOString().split('T')[0]}): ${turnosHoy[0].total} turnos, $${turnosHoy[0].ingresos || 0}`);
        console.log(`   📅 Ayer (${ayer.toISOString().split('T')[0]}): ${turnosAyer[0].total} turnos, $${turnosAyer[0].ingresos || 0}`);
        console.log(`   📅 Esta Semana: ${turnosSemana[0].total} turnos, $${turnosSemana[0].ingresos || 0}`);
        console.log(`   📅 Este Mes: ${turnosMes[0].total} turnos, $${turnosMes[0].ingresos || 0}`);
        
        console.log('\n🎯 DATOS DE PRUEBA CARGADOS EXITOSAMENTE!');
        console.log('\n🧪 AHORA PUEDES PROBAR:');
        console.log('   1. 📊 Ve a la sección de Reportes');
        console.log('   2. 📅 Prueba todos los períodos: Hoy, Ayer, Esta Semana, Este Mes');
        console.log('   3. 📈 Verifica las nuevas métricas de rentabilidad');
        console.log('   4. 💡 Revisa los insights del negocio');
        console.log('   5. 📊 Compara los gráficos semanales');
        
    } catch (error) {
        console.error('❌ Error cargando datos de prueba:', error);
        throw error;
    }
}

// Ejecutar la carga de datos
cargarDatosPruebaAgosto().then(() => {
    console.log('\n✅ Script de carga de datos completado');
    process.exit(0);
}).catch(error => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
});
