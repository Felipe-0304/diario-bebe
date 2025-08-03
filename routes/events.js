const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { requireAuth, requireDiaryAccess } = require('../middleware/auth');

// Configuración de Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const diarioId = req.params.diarioId || req.body.diario_id;
        const dir = `public/media/diarios/${diarioId}`;
        
        fs.ensureDirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

const upload = multer({ 
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter
});

// Crear evento con multimedia
router.post('/', requireAuth, upload.single('media'), async (req, res) => {
    try {
        const { titulo, descripcion, tipo, fecha, diario_id } = req.body;
        const mediaPath = req.file ? req.file.filename : null;
        
        await req.app.locals.db.run(
            `INSERT INTO eventos 
            (diario_id, titulo, descripcion, tipo, fecha, media_path) 
            VALUES (?, ?, ?, ?, ?, ?)`,
            [diario_id, titulo, descripcion, tipo, fecha, mediaPath]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Error creating event' });
    }
});

// Obtener eventos por diario
router.get('/:diarioId', requireAuth, requireDiaryAccess(), async (req, res) => {
    try {
        const { diarioId } = req.params;
        
        const events = await req.app.locals.db.all(
            `SELECT id, titulo, descripcion, tipo, fecha, media_path 
             FROM eventos 
             WHERE diario_id = ? 
             ORDER BY fecha DESC`,
            [diarioId]
        );
        
        res.json(events);
    } catch (error) {
        console.error('Error getting events:', error);
        res.status(500).json({ error: 'Error getting events' });
    }
});

// Obtener eventos por mes/año
router.get('/mes/:year/:month', requireAuth, async (req, res) => {
    try {
        const { year, month } = req.params;
        
        const events = await req.app.locals.db.all(
            `SELECT e.id, e.titulo, e.descripcion, e.tipo, e.fecha, e.media_path, e.diario_id
             FROM eventos e
             JOIN diarios_acceso da ON e.diario_id = da.diario_id
             WHERE da.usuario_id = ?
             AND strftime('%Y', e.fecha) = ?
             AND strftime('%m', e.fecha) = ?
             ORDER BY e.fecha DESC`,
            [req.session.user.id, year, month.padStart(2, '0')]
        );
        
        res.json(events);
    } catch (error) {
        console.error('Error getting monthly events:', error);
        res.status(500).json({ error: 'Error getting monthly events' });
    }
});

// Obtener fotos recientes
router.get('/fotos', requireAuth, async (req, res) => {
    try {
        const { type = 'all', date = 'all' } = req.query;
        
        let query = `
            SELECT e.id, e.titulo, e.descripcion, e.fecha, e.media_path, e.diario_id
            FROM eventos e
            JOIN diarios_acceso da ON e.diario_id = da.diario_id
            WHERE da.usuario_id = ?
            AND e.media_path IS NOT NULL
        `;
        
        const params = [req.session.user.id];
        
        if (type !== 'all') {
            query += ' AND e.tipo = ?';
            params.push(type);
        }
        
        if (date !== 'all') {
            const now = new Date();
            let startDate;
            
            if (date === 'month') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            } else if (date === 'year') {
                startDate = new Date(now.getFullYear(), 0, 1);
            }
            
            query += ' AND e.fecha >= ?';
            params.push(startDate.toISOString());
        }
        
        query += ' ORDER BY e.fecha DESC LIMIT 50';
        
        const photos = await req.app.locals.db.all(query, params);
        res.json(photos);
    } catch (error) {
        console.error('Error getting photos:', error);
        res.status(500).json({ error: 'Error getting photos' });
    }
});

// Obtener años con eventos
router.get('/years', requireAuth, async (req, res) => {
    try {
        const years = await req.app.locals.db.all(
            `SELECT DISTINCT strftime('%Y', fecha) as year
             FROM eventos e
             JOIN diarios_acceso da ON e.diario_id = da.diario_id
             WHERE da.usuario_id = ?
             ORDER BY year DESC`,
            [req.session.user.id]
        );
        
        res.json(years.map(y => y.year));
    } catch (error) {
        console.error('Error getting years:', error);
        res.status(500).json({ error: 'Error getting years' });
    }
});

// Obtener eventos para línea de tiempo
router.get('/timeline', requireAuth, async (req, res) => {
    try {
        const { type = 'all', year = 'all' } = req.query;
        
        let query = `
            SELECT e.id, e.titulo, e.descripcion, e.tipo, e.fecha, e.media_path, e.diario_id
            FROM eventos e
            JOIN diarios_acceso da ON e.diario_id = da.diario_id
            WHERE da.usuario_id = ?
        `;
        
        const params = [req.session.user.id];
        
        if (type !== 'all') {
            query += ' AND e.tipo = ?';
            params.push(type);
        }
        
        if (year !== 'all') {
            query += ' AND strftime("%Y", e.fecha) = ?';
            params.push(year);
        }
        
        query += ' ORDER BY e.fecha DESC';
        
        const events = await req.app.locals.db.all(query, params);
        res.json(events);
    } catch (error) {
        console.error('Error getting timeline events:', error);
        res.status(500).json({ error: 'Error getting timeline events' });
    }
});

// Eliminar evento
router.delete('/:eventoId', requireAuth, async (req, res) => {
    try {
        const { eventoId } = req.params;
        
        // Verificar que el usuario tiene acceso al diario del evento
        const event = await req.app.locals.db.get(
            `SELECT e.diario_id 
             FROM eventos e
             JOIN diarios_acceso da ON e.diario_id = da.diario_id
             WHERE e.id = ? AND da.usuario_id = ?`,
            [eventoId, req.session.user.id]
        );
        
        if (!event) {
            return res.status(404).json({ error: 'Evento no encontrado o no tienes acceso' });
        }
        
        // Eliminar archivo multimedia si existe
        const eventWithMedia = await req.app.locals.db.get(
            'SELECT media_path, diario_id FROM eventos WHERE id = ?',
            [eventoId]
        );
        
        if (eventWithMedia.media_path) {
            const filePath = `public/media/diarios/${eventWithMedia.diario_id}/${eventWithMedia.media_path}`;
            await fs.remove(filePath).catch(err => console.error('Error deleting media:', err));
        }
        
        await req.app.locals.db.run('DELETE FROM eventos WHERE id = ?', [eventoId]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Error deleting event' });
    }
});

module.exports = router;