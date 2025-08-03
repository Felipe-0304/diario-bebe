const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { requireAuth } = require('../middleware/auth'); // Importa el middleware

// Ruta para obtener el perfil del usuario autenticado
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    // Validación básica
    if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const db = req.app.locals.db;

    try {
        // 1. Buscar usuario
        const user = await new Promise((resolve, reject) => {
            db.get('SELECT * FROM usuarios WHERE email = ?', [email.trim().toLowerCase()], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });

        if (!user) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 2. Comparar contraseñas
        const match = await bcrypt.compare(password.trim(), user.password);
        if (!match) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 3. Crear sesión
        req.session.user = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol
        };

        res.json({ 
            success: true, 
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                rol: user.rol
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error en el servidor. Por favor intente nuevamente.' });
    }
});

router.post('/logout', requireAuth, (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

router.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const db = req.app.locals.db;

    try {
        // Verificar si los registros están permitidos
        const config = await new Promise((resolve, reject) => {
            db.get('SELECT allow_new_registrations FROM site_config WHERE id = 1', 
            (err, row) => err ? reject(err) : resolve(row));
        });
        
        if (!config.allow_new_registrations) {
            return res.status(403).json({ error: 'Los registros están deshabilitados' });
        }
        
        // Verificar si el email ya existe
        const exists = await new Promise((resolve, reject) => {
            db.get('SELECT id FROM usuarios WHERE email = ?', [email], 
            (err, row) => err ? reject(err) : resolve(row));
        });
        
        if (exists) {
            return res.status(400).json({ error: 'Este email ya está registrado' });
        }
        
        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar nuevo usuario
        await new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)',
                [nombre, email, hashedPassword],
                (err) => err ? reject(err) : resolve()
            );
        });
        
        res.json({ success: true, message: 'Usuario registrado exitosamente' });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

module.exports = router;