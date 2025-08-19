const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

// Configuración de la base de datos
const dbConfig = {
    host: 'localhost',
    user: 'Alexis83',
    password: 'TukiTuki12',
    port: 3308,
    database: 'barberia_db',
    charset: 'utf8mb4'
};

async function insertSampleData() {
    let connection;
    
    try {
        console.log('🚀 Iniciando inserción de datos de ejemplo...\n');
        
        // Conectar a la base de datos
        connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conexión a la base de datos establecida\n');

        // Obtener el primer usuario (asumiendo que ya existe)
        const [users] = await connection.execute('SELECT id, nombre FROM usuarios LIMIT 1');
        
        if (users.length === 0) {
            console.log('❌ No hay usuarios en la base de datos. Primero registra un usuario.');
            return;
        }

        const userId = users[0].id;
        console.log(`👤 Usando usuario: ${users[0].nombre} (ID: ${userId})\n`);

        // 1. INSERTAR SERVICIOS
        console.log('✂️  Insertando servicios...');
        const servicios = [
            {
                nombre: 'Corte Clásico',
                descripcion: 'Corte de cabello tradicional con tijera y peine',
                duracion: 30,
                precio: 25.00
            },
            {
                nombre: 'Corte + Barba',
                descripcion: 'Corte de cabello completo con arreglo de barba',
                duracion: 45,
                precio: 40.00
            },
            {
                nombre: 'Barba',
                descripcion: 'Arreglo y modelado de barba',
                duracion: 20,
                precio: 20.00
            },
            {
                nombre: 'Corte Degradado',
                descripcion: 'Corte moderno con degradado',
                duracion: 35,
                precio: 30.00
            },
            {
                nombre: 'Corte + Barba + Diseño',
                descripcion: 'Corte completo con barba y diseño personalizado',
                duracion: 60,
                precio: 50.00
            }
        ];

        for (const servicio of servicios) {
            await connection.execute(`
                INSERT INTO servicios (nombre, descripcion, duracion, precio, id_usuario) 
                VALUES (?, ?, ?, ?, ?)
            `, [servicio.nombre, servicio.descripcion, servicio.duracion, servicio.precio, userId]);
        }
        console.log(`✅ ${servicios.length} servicios insertados\n`);

        // 2. INSERTAR CLIENTES
        console.log('👥 Insertando clientes...');
        const clientes = [
            {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan.perez@email.com',
                telefono: '123-456-7890',
                fecha_nacimiento: '1990-05-15'
            },
            {
                nombre: 'Carlos',
                apellido: 'García',
                email: 'carlos.garcia@email.com',
                telefono: '098-765-4321',
                fecha_nacimiento: '1985-08-22'
            },
            {
                nombre: 'Miguel',
                apellido: 'López',
                email: 'miguel.lopez@email.com',
                telefono: '555-123-4567',
                fecha_nacimiento: '1992-12-10'
            },
            {
                nombre: 'Roberto',
                apellido: 'Martínez',
                email: 'roberto.martinez@email.com',
                telefono: '444-987-6543',
                fecha_nacimiento: '1988-03-25'
            },
            {
                nombre: 'Fernando',
                apellido: 'Rodríguez',
                email: 'fernando.rodriguez@email.com',
                telefono: '333-555-7777',
                fecha_nacimiento: '1995-07-18'
            },
            {
                nombre: 'Diego',
                apellido: 'Hernández',
                email: 'diego.hernandez@email.com',
                telefono: '222-888-9999',
                fecha_nacimiento: '1987-11-30'
            },
            {
                nombre: 'Luis',
                apellido: 'González',
                email: 'luis.gonzalez@email.com',
                telefono: '111-222-3333',
                fecha_nacimiento: '1993-04-12'
            },
            {
                nombre: 'Andrés',
                apellido: 'Morales',
                email: 'andres.morales@email.com',
                telefono: '999-888-7777',
                fecha_nacimiento: '1991-09-05'
            }
        ];

        for (const cliente of clientes) {
            await connection.execute(`
                INSERT INTO clientes (nombre, apellido, email, telefono, fecha_nacimiento) 
                VALUES (?, ?, ?, ?, ?)
            `, [cliente.nombre, cliente.apellido, cliente.email, cliente.telefono, cliente.fecha_nacimiento]);
        }
        console.log(`✅ ${clientes.length} clientes insertados\n`);

        // 3. INSERTAR TURNOS (CITAS)
        console.log('📅 Insertando turnos...');
        
        // Obtener IDs de servicios y clientes
        const [serviciosIds] = await connection.execute('SELECT id, duracion FROM servicios WHERE id_usuario = ?', [userId]);
        const [clientesIds] = await connection.execute('SELECT id FROM clientes');
        
        // Generar fechas para los últimos 30 días y próximos 7 días
        const turnos = [];
        const today = new Date();
        
        // Turnos pasados (últimos 30 días)
        for (let i = 0; i < 30; i++) {
            const fecha = new Date(today);
            fecha.setDate(fecha.getDate() - i);
            
            // Generar 1-3 turnos por día
            const numTurnos = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numTurnos; j++) {
                const servicio = serviciosIds[Math.floor(Math.random() * serviciosIds.length)];
                const cliente = clientesIds[Math.floor(Math.random() * clientesIds.length)];
                
                // Hora aleatoria entre 9:00 y 18:00
                const hora = 9 + Math.floor(Math.random() * 9);
                const minuto = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
                
                const horaInicio = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
                const horaFin = new Date(`2000-01-01 ${horaInicio}`);
                horaFin.setMinutes(horaFin.getMinutes() + servicio.duracion);
                const horaFinStr = horaFin.toTimeString().slice(0, 8);
                
                // Estado aleatorio (más completados para fechas pasadas)
                const estados = ['completado', 'completado', 'completado', 'cancelado', 'no_show'];
                const estado = estados[Math.floor(Math.random() * estados.length)];
                
                // Precio final (con pequeña variación)
                const precioBase = servicio.precio || 25;
                const precioFinal = precioBase + (Math.random() - 0.5) * 5;
                
                turnos.push({
                    fecha: fecha.toISOString().split('T')[0],
                    hora_inicio: horaInicio,
                    hora_fin: horaFinStr,
                    id_cliente: cliente.id,
                    id_servicio: servicio.id,
                    precio_final: Math.round(precioFinal * 100) / 100,
                    estado: estado,
                    pagado: estado === 'completado' ? Math.random() > 0.1 : false // 90% pagado si completado
                });
            }
        }
        
        // Turnos futuros (próximos 7 días)
        for (let i = 1; i <= 7; i++) {
            const fecha = new Date(today);
            fecha.setDate(fecha.getDate() + i);
            
            // Generar 1-4 turnos por día
            const numTurnos = Math.floor(Math.random() * 4) + 1;
            
            for (let j = 0; j < numTurnos; j++) {
                const servicio = serviciosIds[Math.floor(Math.random() * serviciosIds.length)];
                const cliente = clientesIds[Math.floor(Math.random() * clientesIds.length)];
                
                // Hora aleatoria entre 9:00 y 18:00
                const hora = 9 + Math.floor(Math.random() * 9);
                const minuto = Math.floor(Math.random() * 4) * 15;
                
                const horaInicio = `${hora.toString().padStart(2, '0')}:${minuto.toString().padStart(2, '0')}:00`;
                const horaFin = new Date(`2000-01-01 ${horaInicio}`);
                horaFin.setMinutes(horaFin.getMinutes() + servicio.duracion);
                const horaFinStr = horaFin.toTimeString().slice(0, 8);
                
                // Estado para turnos futuros
                const estados = ['reservado', 'confirmado'];
                const estado = estados[Math.floor(Math.random() * estados.length)];
                
                const precioBase = servicio.precio || 25;
                const precioFinal = precioBase + (Math.random() - 0.5) * 5;
                
                turnos.push({
                    fecha: fecha.toISOString().split('T')[0],
                    hora_inicio: horaInicio,
                    hora_fin: horaFinStr,
                    id_cliente: cliente.id,
                    id_servicio: servicio.id,
                    precio_final: Math.round(precioFinal * 100) / 100,
                    estado: estado,
                    pagado: false
                });
            }
        }
        
        // Insertar turnos
        for (const turno of turnos) {
            await connection.execute(`
                INSERT INTO turnos (fecha, hora_inicio, hora_fin, id_cliente, id_usuario, id_servicio, precio_final, estado, pagado) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [turno.fecha, turno.hora_inicio, turno.hora_fin, turno.id_cliente, userId, turno.id_servicio, turno.precio_final, turno.estado, turno.pagado]);
        }
        console.log(`✅ ${turnos.length} turnos insertados\n`);

        // 4. INSERTAR HORARIOS LABORALES
        console.log('🕐 Insertando horarios laborales...');
        const horarios = [
            { dia: 'lunes', inicio: '09:00:00', fin: '18:00:00' },
            { dia: 'martes', inicio: '09:00:00', fin: '18:00:00' },
            { dia: 'miercoles', inicio: '09:00:00', fin: '18:00:00' },
            { dia: 'jueves', inicio: '09:00:00', fin: '18:00:00' },
            { dia: 'viernes', inicio: '09:00:00', fin: '18:00:00' },
            { dia: 'sabado', inicio: '09:00:00', fin: '16:00:00' }
        ];

        for (const horario of horarios) {
            await connection.execute(`
                INSERT INTO horarios_laborales (id_usuario, dia_semana, hora_inicio, hora_fin) 
                VALUES (?, ?, ?, ?)
            `, [userId, horario.dia, horario.inicio, horario.fin]);
        }
        console.log(`✅ ${horarios.length} horarios laborales insertados\n`);

        // 5. ACTUALIZAR ESTADÍSTICAS DE CLIENTES
        console.log('📊 Actualizando estadísticas de clientes...');
        await connection.execute(`
            UPDATE clientes c 
            SET total_visitas = (
                SELECT COUNT(*) 
                FROM turnos t 
                WHERE t.id_cliente = c.id AND t.estado = 'completado'
            ),
            ultima_visita = (
                SELECT MAX(t.fecha) 
                FROM turnos t 
                WHERE t.id_cliente = c.id AND t.estado = 'completado'
            )
        `);
        console.log('✅ Estadísticas de clientes actualizadas\n');

        // 6. INSERTAR MÉTRICAS DIARIAS
        console.log('📈 Insertando métricas diarias...');
        const [turnosCompletados] = await connection.execute(`
            SELECT fecha, COUNT(*) as total, 
                   SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completados,
                   SUM(CASE WHEN estado = 'cancelado' THEN 1 ELSE 0 END) as cancelados,
                   SUM(CASE WHEN estado = 'completado' THEN precio_final ELSE 0 END) as recaudado
            FROM turnos 
            WHERE id_usuario = ? 
            GROUP BY fecha
        `, [userId]);

        for (const metrica of turnosCompletados) {
            await connection.execute(`
                INSERT INTO metricas_diarias (id_usuario, fecha, total_turnos, turnos_completados, turnos_cancelados, total_recaudado) 
                VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                total_turnos = VALUES(total_turnos),
                turnos_completados = VALUES(turnos_completados),
                turnos_cancelados = VALUES(turnos_cancelados),
                total_recaudado = VALUES(total_recaudado)
            `, [userId, metrica.fecha, metrica.total, metrica.completados, metrica.cancelados, metrica.recaudado]);
        }
        console.log(`✅ ${turnosCompletados.length} métricas diarias insertadas\n`);

        console.log('🎉 ¡Datos de ejemplo insertados exitosamente!');
        console.log('\n📋 Resumen:');
        console.log(`   - ${servicios.length} servicios`);
        console.log(`   - ${clientes.length} clientes`);
        console.log(`   - ${turnos.length} turnos`);
        console.log(`   - ${horarios.length} horarios laborales`);
        console.log(`   - ${turnosCompletados.length} métricas diarias`);
        console.log('\n✨ Ahora el dashboard debería mostrar datos reales');

    } catch (error) {
        console.error('❌ Error durante la inserción de datos:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Ejecutar la inserción de datos
insertSampleData(); 