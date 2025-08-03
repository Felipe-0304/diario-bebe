const fs = require('fs-extra');
const path = require('path');

// Función para inicializar directorios necesarios
async function initDirectories() {
    const directories = [
        'public/media/diarios',
        'db'
    ];
    
    for (const dir of directories) {
        await fs.ensureDir(dir);
    }
}

// Función para limpiar archivos temporales
async function cleanTempFiles() {
    const tempDir = path.join(__dirname, '../temp');
    if (await fs.pathExists(tempDir)) {
        await fs.emptyDir(tempDir);
    }
}

// Función para validar entradas
function validateInput(input, type = 'string', options = {}) {
    if (input === undefined || input === null) return false;
    
    switch (type) {
        case 'string':
            return typeof input === 'string' && 
                   input.trim().length >= (options.minLength || 1) && 
                   input.trim().length <= (options.maxLength || 255);
        case 'email':
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return typeof input === 'string' && emailRegex.test(input);
        case 'number':
            return !isNaN(input) && 
                   (options.min === undefined || input >= options.min) && 
                   (options.max === undefined || input <= options.max);
        case 'date':
            return !isNaN(Date.parse(input));
        default:
            return false;
    }
}

// Función para generar respuestas consistentes
function apiResponse(success, data = null, error = null) {
    return {
        success,
        data,
        error
    };
}

module.exports = {
    initDirectories,
    cleanTempFiles,
    validateInput,
    apiResponse
};