const express = require('express');
const path = require('path');

// Crear una aplicación de prueba
const app = express();
const PORT = 3002;

// Configuración de archivos estáticos (igual que en app.js)
app.use('/public', express.static('public'));

// Middleware para servir archivos estáticos de la página pública
app.use((req, res, next) => {
    // Manejar archivos CSS y JS de la página pública (desde la raíz)
    if (req.path === '/styles.css') {
        console.log(`📁 Sirviendo CSS público: ${req.path}`);
        return res.sendFile(path.join(__dirname, 'public', 'styles.css'));
    }
    if (req.path === '/script.js') {
        console.log(`📁 Sirviendo JS público: ${req.path}`);
        return res.sendFile(path.join(__dirname, 'public', 'script.js'));
    }
    
    next();
});

// Ruta principal (pública)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de prueba
app.get('/test', (req, res) => {
    res.send(`
        <h1>Test de Rutas Públicas</h1>
        <p>Prueba estas rutas en el navegador:</p>
        <ul>
            <li><a href="/">Página principal</a></li>
            <li><a href="/styles.css">CSS público</a></li>
            <li><a href="/public/styles.css">CSS público (ruta alternativa)</a></li>
            <li><a href="/auth/login">Login (redirigirá)</a></li>
            <li><a href="/auth/register">Registro (redirigirá)</a></li>
        </ul>
        
        <h2>Verificación de archivos:</h2>
        <ul>
            <li>public/index.html: ${require('fs').existsSync('public/index.html') ? '✅ Existe' : '❌ No existe'}</li>
            <li>public/styles.css: ${require('fs').existsSync('public/styles.css') ? '✅ Existe' : '❌ No existe'}</li>
        </ul>
    `);
});

// Iniciar servidor de prueba
app.listen(PORT, () => {
    console.log(`🧪 Servidor de prueba pública corriendo en http://localhost:${PORT}`);
    console.log(`📋 Ve a http://localhost:${PORT}/test para probar las rutas`);
    console.log(`🏠 Página principal: http://localhost:${PORT}/`);
});

module.exports = app; 