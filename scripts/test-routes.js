const express = require('express');
const path = require('path');

// Crear una aplicación de prueba
const app = express();
const PORT = 3001;

// Configuración de archivos estáticos (igual que en app.js)
app.use('/public', express.static('public'));

// Middleware para servir archivos estáticos de las vistas
app.use((req, res, next) => {
    // Manejar archivos CSS y JS de las vistas
    if (req.path.endsWith('.css') || req.path.endsWith('.js')) {
        const pathParts = req.path.split('/');
        
        console.log(`🔍 Probando ruta: ${req.path}`);
        console.log(`   Path parts:`, pathParts);
        
        // Si la ruta es /auth/styles.css, servir desde views/login/styles.css
        if (pathParts[1] === 'auth' && pathParts[2] === 'styles.css') {
            console.log(`✅ Sirviendo CSS de login: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'login', 'styles.css'));
        }
        if (pathParts[1] === 'auth' && pathParts[2] === 'script.js') {
            console.log(`✅ Sirviendo JS de login: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'login', 'script.js'));
        }
        
        // Si la ruta es /auth/register/styles.css, servir desde views/register/styles.css
        if (pathParts[1] === 'auth' && pathParts[2] === 'register' && pathParts[3] === 'styles.css') {
            console.log(`✅ Sirviendo CSS de register: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'register', 'styles.css'));
        }
        if (pathParts[1] === 'auth' && pathParts[2] === 'register' && pathParts[3] === 'script.js') {
            console.log(`✅ Sirviendo JS de register: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'register', 'script.js'));
        }
        
        // Si la ruta es /register/styles.css, servir desde views/register/styles.css (fallback)
        if (pathParts[1] === 'register' && pathParts[2] === 'styles.css') {
            console.log(`✅ Sirviendo CSS de register (fallback): ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'register', 'styles.css'));
        }
        if (pathParts[1] === 'register' && pathParts[2] === 'script.js') {
            console.log(`✅ Sirviendo JS de register (fallback): ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'register', 'script.js'));
        }
        
        // Si la ruta es /dashboard/styles.css, servir desde views/dashboard/styles.css
        if (pathParts[1] === 'dashboard' && pathParts[2] === 'styles.css') {
            console.log(`✅ Sirviendo CSS de dashboard: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'dashboard', 'styles.css'));
        }
        if (pathParts[1] === 'dashboard' && pathParts[2] === 'script.js') {
            console.log(`✅ Sirviendo JS de dashboard: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'dashboard', 'script.js'));
        }
        if (pathParts[1] === 'dashboard' && pathParts[2] === 'schedule.js') {
            console.log(`✅ Sirviendo schedule.js de dashboard: ${req.path}`);
            return res.sendFile(path.join(__dirname, 'views', 'dashboard', 'schedule.js'));
        }
        
        console.log(`❌ Ruta no manejada: ${req.path}`);
    }
    
    next();
});

// Servir directorios completos para otras rutas
app.use('/views', express.static('views'));

// Ruta de prueba
app.get('/test', (req, res) => {
    res.send(`
        <h1>Test de Rutas de Archivos Estáticos</h1>
        <p>Prueba estas rutas en el navegador:</p>
        <ul>
            <li><a href="/auth/styles.css">/auth/styles.css</a></li>
            <li><a href="/auth/script.js">/auth/script.js</a></li>
            <li><a href="/auth/register/styles.css">/auth/register/styles.css</a></li>
            <li><a href="/auth/register/script.js">/auth/register/script.js</a></li>
            <li><a href="/dashboard/styles.css">/dashboard/styles.css</a></li>
            <li><a href="/dashboard/script.js">/dashboard/script.js</a></li>
            <li><a href="/dashboard/schedule.js">/dashboard/schedule.js</a></li>
        </ul>
    `);
});

// Iniciar servidor de prueba
app.listen(PORT, () => {
    console.log(`🧪 Servidor de prueba corriendo en http://localhost:${PORT}`);
    console.log(`📋 Ve a http://localhost:${PORT}/test para probar las rutas`);
});

module.exports = app; 