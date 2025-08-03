require('dotenv').config();
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const helmet = require('helmet');
const csrf = require('csurf');
const path = require('path');
const fs = require('fs-extra');
const { initDB } = require('./db');

const app = express();
const port = process.env.PORT || 3000;

// Configuración inicial
async function startServer() {
    try {
        // Inicializar la base de datos
        const db = await initDB();
        
        // Hacer que la conexión a DB esté disponible en toda la app
        app.locals.db = db;

        // Configuración de seguridad
        app.use(helmet());
        const csrfProtection = csrf({ cookie: false });

        // Configuración de sesión
        app.use(session({
            store: new SQLiteStore({ db: 'sessions.db', dir: './db' }),
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 24 * 60 * 60 * 1000, // 24 horas
                sameSite: 'strict'
            }
        }));

        // Middlewares
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));
        app.use(express.static('public'));

        // Rutas
        app.use('/api/auth', require('./routes/auth'));
        app.use('/api/admin', require('./routes/admin'));
        app.use('/api/diarios', require('./routes/diaries'));
        app.use('/api/eventos', require('./routes/events'));

        // Manejo de errores
        app.use((err, req, res, next) => {
            console.error(err.stack);
            res.status(500).json({ error: 'Ocurrió un error inesperado.' });
        });

        // Iniciar servidor
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });

    } catch (error) {
        console.error('Error al iniciar el servidor:', error);
        process.exit(1);
    }
}

startServer();