const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middleware/auth');

router.get('/metrics', requireAdmin, async (req, res) => {
    try {
        const db = req.app.locals.db;
        
        const [
            { totalUsuarios },
            { totalDiarios },
            { totalEventos },
            { totalFotos }
        ] = await Promise.all([
            db.get('SELECT COUNT(*) as totalUsuarios FROM usuarios'),
            db.get('SELECT COUNT(*) as totalDiarios FROM diarios'),
            db.get('SELECT COUNT(*) as totalEventos FROM eventos'),
            db.get('SELECT COUNT(*) as totalFotos FROM eventos WHERE media_path IS NOT NULL')
        ]);
        
        res.json({ totalUsuarios, totalDiarios, totalEventos, totalFotos });
    } catch (error) {
        console.error('Error getting metrics:', error);
        res.status(500).json({ error: 'Error getting metrics' });
    }
});

router.get('/config', requireAdmin, async (req, res) => {
    try {
        const config = await req.app.locals.db.get(
            'SELECT site_global_name, allow_new_registrations FROM site_config WHERE id = 1'
        );
        res.json(config);
    } catch (error) {
        console.error('Error getting config:', error);
        res.status(500).json({ error: 'Error getting config' });
    }
});

router.put('/config', requireAdmin, async (req, res) => {
    try {
        const { site_global_name, allow_new_registrations } = req.body;
        
        await req.app.locals.db.run(
            'UPDATE site_config SET site_global_name = ?, allow_new_registrations = ? WHERE id = 1',
            [site_global_name, allow_new_registrations]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Error updating config:', error);
        res.status(500).json({ error: 'Error updating config' });
    }
});

router.get('/users', requireAdmin, async (req, res) => {
    try {
        const users = await req.app.locals.db.all(
            'SELECT id, nombre, email, rol FROM usuarios ORDER BY creado_en DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Error getting users' });
    }
});

router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        if (req.session.user.id === parseInt(id)) {
            return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
        }
        
        await req.app.locals.db.run('DELETE FROM usuarios WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Error deleting user' });
    }
});

module.exports = router;