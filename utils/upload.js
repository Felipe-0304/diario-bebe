const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Configuración de almacenamiento para Multer
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

// Filtro de tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        'image/jpeg', 
        'image/png', 
        'image/gif', 
        'video/mp4', 
        'video/webm', 
        'video/ogg'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido'), false);
    }
};

// Configuración de Multer
const upload = multer({ 
    storage,
    limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
    fileFilter
});

module.exports = upload;