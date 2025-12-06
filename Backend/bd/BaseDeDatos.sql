-- basededatos.sql
-- Script para crear la base de datos y las tablas necesarias para el Proyecto Integrado
-- Compatible con MySQL (InnoDB, utf8mb4)

-- Elimina base de datos previa si existe (útil para pruebas)
-- DROP DATABASE IF EXISTS proyecto_integrado;
CREATE DATABASE proyecto_integrado CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE proyecto_integrado;

-- ----------------------------------------------------------
-- Tabla: usuarios (usuarios: ofertantes y consumidores)
-- ----------------------------------------------------------
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,          -- almacenar hash (ej. password_hash() de PHP)
  api_token VARCHAR(128) DEFAULT NULL,
  rol ENUM('ofertante','consumidor','admin') NOT NULL DEFAULT 'consumidor',
  nombre VARCHAR(80) NOT NULL,
  apellidos VARCHAR(120),
  ciudad VARCHAR(100),
  telefono VARCHAR(30),
  descripcion TEXT,
  esta_activo TINYINT(1) NOT NULL DEFAULT 1,
  num_ofertas INT NOT NULL DEFAULT 0,            -- contador de ofertas creadas (trigger mantiene)
  num_peticiones INT NOT NULL DEFAULT 0,          -- contador de peticiones creadas (trigger mantiene)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- Tabla: ofertas (actividades ofertadas por ofertantes)
-- ----------------------------------------------------------
CREATE TABLE ofertas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,                          -- ofertante que crea la oferta (FK -> usuarios.id)
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  actividad_tipo VARCHAR(100),                   -- e.g., "Senderismo", "Visita guiada", "BTT"
  lugar_ciudad VARCHAR(100),
  fechahora_inicio DATETIME NOT NULL,              -- día y hora de inicio
  tarifa DECIMAL(9,2) DEFAULT 0.00,
  preparacion_fisica ENUM('Baja','Media','Alta') DEFAULT 'Media',
  duracion_horas DECIMAL(4,2) DEFAULT 1.0,
  material_necesario TINYINT(1) DEFAULT 0,       -- 0=no,1=sí
  material_ofertado TEXT,                        -- texto describiendo material ofertado
  plazas_min INT DEFAULT 1,
  plazas_max INT DEFAULT 10,
  transport_incluido TINYINT(1) DEFAULT 0,
  estado ENUM('publicada','cancelada','completada','borrador') DEFAULT 'publicada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ofertas_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices de búsqueda rápidos
CREATE INDEX idx_ofertas_tipo ON ofertas (actividad_tipo);
CREATE INDEX idx_ofertas_ciudad ON ofertas (lugar_ciudad);
CREATE INDEX idx_ofertas_inicio ON ofertas (fechahora_inicio);

-- ----------------------------------------------------------
-- Tabla: peticiones (demandas / solicitudes realizadas por consumidores)
-- ----------------------------------------------------------
CREATE TABLE peticiones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,                          -- consumidor que crea la petición (FK -> usuarios.id)
  titulo VARCHAR(200) NOT NULL,
  descripcion TEXT,
  actividad_tipo VARCHAR(100),
  lugar_ciudad VARCHAR(100),
  fechahora_deseada DATETIME,                   -- fecha y hora deseada (puede ser NULL si rango)
  duracion_horas DECIMAL(4,2) DEFAULT 1.0,
  necesidades_concretas TEXT,
  presupuesto_min DECIMAL(9,2) DEFAULT NULL,
  presupuesto_max DECIMAL(9,2) DEFAULT NULL,
  contacto_telefono VARCHAR(30),
  estado ENUM('activa','atendida','cancelada') DEFAULT 'activa',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_peticiones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_peticiones_tipo ON peticiones (actividad_tipo);
CREATE INDEX idx_peticiones_ciudad ON peticiones (lugar_ciudad);
CREATE INDEX idx_peticiones_pref ON peticiones (fechahora_deseada);

-- ----------------------------------------------------------
-- Triggers: mantener contadores num_ofertas y num_peticiones en usuarios
-- ----------------------------------------------------------
DELIMITER $$

-- Ofertas: al insertar -> incrementar num_ofertas
CREATE TRIGGER trg_ofertas_after_insert
AFTER INSERT ON ofertas
FOR EACH ROW
BEGIN
  UPDATE usuarios SET num_ofertas = num_ofertas + 1 WHERE id = NEW.usuario_id;
END$$

-- Ofertas: al borrar -> decrementar num_ofertas
CREATE TRIGGER trg_ofertas_after_delete
AFTER DELETE ON ofertas
FOR EACH ROW
BEGIN
  UPDATE usuarios SET num_ofertas = GREATEST(num_ofertas - 1, 0) WHERE id = OLD.usuario_id;
END$$

-- Peticiones: al insertar -> incrementar num_peticiones
CREATE TRIGGER trg_peticiones_after_insert
AFTER INSERT ON peticiones
FOR EACH ROW
BEGIN
  UPDATE usuarios SET num_peticiones = num_peticiones + 1 WHERE id = NEW.usuario_id;
END$$

-- Peticiones: al borrar -> decrementar num_peticiones
CREATE TRIGGER trg_peticiones_after_delete
AFTER DELETE ON peticiones
FOR EACH ROW
BEGIN
  UPDATE usuarios SET num_peticiones = GREATEST(num_peticiones - 1, 0) WHERE id = OLD.usuario_id;
END$$

DELIMITER ;

-- ----------------------------------------------------------
-- Datos iniciales (seed) - Usuarios (2 ofertantes, 2 consumidores)
-- ----------------------------------------------------------
-- Nota: usamos SHA2() para generar un hash de ejemplo en la columna password_hash.
-- En producción usar password_hash() de PHP (bcrypt) y password_verify() para verificar.
INSERT INTO usuarios (email, password_hash, rol, nombre, apellidos, ciudad, telefono, descripcion)
VALUES
('aventurasur@example.com', SHA2('123456',256), 'ofertante', 'Antonio', 'García', 'Sevilla', '600111222', 'Guía de actividades de montaña y aventura. +10 años de experiencia.'),
('rutassevilla@example.com', SHA2('123456',256), 'ofertante', 'Laura', 'Martínez', 'Sevilla', '600333444', 'Especialista en rutas culturales y gastronómicas por Sevilla.'),
('maria.lopez@example.com', SHA2('123456',256), 'consumidor', 'María', 'López', 'Sevilla', '600555666', 'Apasionada de las rutas al aire libre.'),
('juan.perez@example.com', SHA2('123456',256), 'consumidor', 'Juan', 'Pérez', 'Sevilla', '600777888', 'Interesado en actividades de fin de semana y deportes aventura.');

-- ----------------------------------------------------------
-- Datos iniciales - Ofertas (ejemplos)
-- ----------------------------------------------------------
INSERT INTO ofertas (usuario_id, titulo, descripcion, actividad_tipo, lugar_ciudad, fechahora_inicio, tarifa, preparacion_fisica, duracion_horas, material_necesario, material_ofertado, plazas_min, plazas_max, transport_incluido)
VALUES
(1, 'Ruta Barranquismo en Sierra Norte', 'Descenso de barrancos con guía. Nivel medio-alto. Incluye práctica y seguridad.', 'Barranquismo', 'Sevilla', '2025-11-22 09:00:00', 65.00, 'Alta', 5.0, 1, 'Arnés, casco y cuerda (opcionales)', 4, 12, 1),
(2, 'Ruta Tapas y Historia por Triana', 'Paseo cultural por Triana con paradas en 5 bares para degustar tapas y aprender su historia.', 'Ruta cultural', 'Sevilla', '2025-11-29 18:30:00', 28.50, 'Baja', 2.0, 0, NULL, 4, 20, 0);

-- ----------------------------------------------------------
-- Datos iniciales - Peticiones (ejemplos)
-- ----------------------------------------------------------
INSERT INTO peticiones (usuario_id, titulo, descripcion, actividad_tipo, lugar_ciudad, fechahora_deseada, duracion_horas, necesidades_concretas, presupuesto_min, presupuesto_max, contacto_telefono)
VALUES
(3, 'Salida BTT para principiantes', 'Busco guía para una ruta BTT fácil de 15 km para grupo de 6 personas (principiantes). Preferencia sábado por la mañana.', 'BTT', 'Sevilla', '2025-11-30 09:00:00', 3.0, 'Necesitamos que el guía tenga experiencia con principiantes y ofrezca opción de alquiler de bicicletas.', 0.00, 30.00, '600555666'),
(4, 'Gymkana de equipo para despedida', 'Buscamos una gymkana urbana para despedida de soltera, aprox 2 horas, actividades lúdicas y pistas.', 'Yincana', 'Sevilla', '2025-12-06 17:00:00', 2.0, 'Actividad para 12 personas, con pruebas no peligrosas y posibilidad de adaptación por edades.', 150.00, 300.00, '600777888');

-- ----------------------------------------------------------
-- Ejemplo de consulta útil (no ejecutarse en import automático)
-- SELECT * FROM usuarios;
-- SELECT * FROM ofertas ORDER BY start_datetime;
-- SELECT * FROM peticiones ORDER BY fechahora_deseada;
-- ----------------------------------------------------------

