const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

const initDB = async () => {
    const db = new sqlite3.Database('./db/mi-pequeno-tesoro.db');
    
    // Ejecutar schema si no existe
    await new Promise((resolve, reject) => {
        db.exec(fs.readFileSync('./db/schema.sql', 'utf8'), (err) => {
            if (err) reject(err);
            resolve();
        });
    });
    
    return db;
};

module.exports = { initDB };