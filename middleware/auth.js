// middleware/auth.js
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'No autorizado. Por favor inicie sesión.' });
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.rol !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de administrador.' });
    }
    next();
};

const requireDiaryAccess = (roles = ['propietario', 'editor']) => {
    return async (req, res, next) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const { diarioId } = req.params;
        if (!diarioId) {
            return res.status(400).json({ error: 'ID de diario no proporcionado' });
        }

        const db = req.app.locals.db;
        const access = await db.get(
            'SELECT rol FROM diarios_acceso WHERE diario_id = ? AND usuario_id = ?',
            [diarioId, req.session.user.id]
        );

        if (!access || !roles.includes(access.rol)) {
            return res.status(403).json({ error: 'No tienes acceso a este diario' });
        }

        next();
    };
};

module.exports = { requireAuth, requireAdmin, requireDiaryAccess };