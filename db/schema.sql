-- Elimina la tabla si existe
DROP TABLE IF EXISTS usuarios;

-- Crea la tabla
CREATE TABLE usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'usuario',
    creado_en DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserta el usuario admin con el nuevo hash
INSERT INTO usuarios (id, nombre, email, password, rol) 
VALUES (
    1, 
    'Administrador', 
    'admin@example.com', 
    '$2b$10$nOQN3vWz8YQbKz7XwL5Zz9mTdFgH2jKlp6RtVcS1Pw3XyZ8lMn7C', 
    'admin'
);