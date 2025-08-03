const express = require('express');
const router = express.Router();
const { requireAuth, requireDiaryAccess } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const diarios = await req.app.locals.db.all(
            `SELECT d.id, d.baby_name, u.nombre as creator_name, 
             da.rol, da.last_accessed_at,
             CASE WHEN d.id = ? THEN 1 ELSE 0 END as active
             FROM diarios d
             JOIN diarios_acceso da ON d.id = da.diario_id
             JOIN usuarios u ON da.usuario_id = u.id
             WHERE da.usuario_id = ?`,
            [req.session.user.active_diario_id || 0, req.session.user.id]
        );
        
        res.json(diarios);
    } catch (error) {
        console.error('Error obteniendo diarios:', error);
        res.status(500).json({ error: 'Error obteniendo diarios' });
    }
});

router.post('/', requireAuth, async (req, res) => {
    const { baby_name } = req.body;
    
    try {
        const result = await req.app.locals.db.run(
            'INSERT INTO diarios (baby_name) VALUES (?)',
            [baby_name]
        );
        
        await req.app.locals.db.run(
            'INSERT INTO diarios_acceso (diario_id, usuario_id, rol) VALUES (?, ?, ?)',
            [result.lastID, req.session.user.id, 'propietario']
        );
        
        res.json({ id: result.lastID, baby_name });
    } catch (error) {
        console.error('Error creando diario:', error);
        res.status(500).json({ error: 'Error creando diario' });
    }
});

router.put('/activo', requireAuth, async (req, res) => {
    const { diarioId } = req.body;
    
    try {
        // Verificar acceso al diario
        const access = await req.app.locals.db.get(
            'SELECT 1 FROM diarios_acceso WHERE diario_id = ? AND usuario_id = ?',
            [diarioId, req.session.user.id]
        );
        
        if (!access) {
            return res.status(403).json({ error: 'No tienes acceso a este diario' });
        }
        
        // Actualizar last_accessed_at
        await req.app.locals.db.run(
            'UPDATE diarios_acceso SET last_accessed_at = CURRENT_TIMESTAMP WHERE diario_id = ? AND usuario_id = ?',
            [diarioId, req.session.user.id]
        );
        
        // Establecer como activo en la sesión
        req.session.user.active_diario_id = diarioId;
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error actualizando diario activo:', error);
        res.status(500).json({ error: 'Error actualizando diario activo' });
    }
});

module.exports = router;