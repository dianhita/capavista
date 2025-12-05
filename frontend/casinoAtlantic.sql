-- =========================================
-- CASINO ATLANTIC CRM - BASE DE DATOS MYSQL
-- =========================================

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS casino_atlantic_crm 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE casino_atlantic_crm;

-- =========================================
-- TABLA: CLIENTES
-- =========================================
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(50),
  estado ENUM('Activo', 'Inactivo') DEFAULT 'Activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_dni (dni),
  INDEX idx_nombre (nombre),
  INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLA: VISITAS
-- =========================================
CREATE TABLE IF NOT EXISTS visitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  fecha DATE NOT NULL,
  servicio VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  INDEX idx_cliente (cliente_id),
  INDEX idx_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLA: CASOS (Reclamos, Sugerencias, Incidencias)
-- =========================================
CREATE TABLE IF NOT EXISTS casos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL UNIQUE,
  cliente VARCHAR(255) NOT NULL,
  tipo ENUM('Reclamo', 'Sugerencia', 'Incidencia') NOT NULL,
  asunto VARCHAR(255) NOT NULL,
  descripcion TEXT,
  prioridad ENUM('Alta', 'Media', 'Baja') DEFAULT 'Media',
  estado ENUM('Abierto', 'En Proceso', 'Completado') DEFAULT 'Abierto',
  fecha DATE NOT NULL,
  responsable VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_codigo (codigo),
  INDEX idx_cliente (cliente),
  INDEX idx_estado (estado),
  INDEX idx_tipo (tipo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLA: PROMOCIONES
-- =========================================
CREATE TABLE IF NOT EXISTS promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descuento DECIMAL(5,2) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado ENUM('Programada', 'Activa', 'Finalizada') DEFAULT 'Programada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nombre (nombre),
  INDEX idx_estado (estado),
  INDEX idx_fechas (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- TABLA: ASIGNACIONES DE PROMOCIONES
-- =========================================
CREATE TABLE IF NOT EXISTS asignaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  promocion_id INT NOT NULL,
  fecha_asignacion DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE CASCADE,
  INDEX idx_cliente (cliente_id),
  INDEX idx_promocion (promocion_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================
-- DATOS DE EJEMPLO
-- =========================================

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, dni, email, telefono, estado) VALUES
('María González López', '12345678', 'maria.gonzalez@email.com', '987654321', 'Activo'),
('Carlos Ramírez Soto', '87654321', 'carlos.ramirez@email.com', '912345678', 'Activo'),
('Ana Martínez Cruz', '45678901', 'ana.martinez@email.com', '923456789', 'Activo'),
('Camila Martínez Salpe', '34567890', 'camila.martinez@email.com', '934567890', 'Activo'),
('Luis Fernández', '23456789', 'luis.fernandez@email.com', '945678901', 'Inactivo'),
('Patricia Torres', '56789012', 'patricia.torres@email.com', '956789012', 'Activo');

-- Insertar visitas de ejemplo
INSERT INTO visitas (cliente_id, fecha, servicio) VALUES
(1, '2024-11-20', 'Consulta sobre membresía VIP'),
(1, '2024-11-25', 'Solicitud de promociones'),
(2, '2024-11-22', 'Reclamo por servicio'),
(2, '2024-11-28', 'Consulta sobre eventos'),
(3, '2024-11-25', 'Registro de nueva membresía'),
(3, '2024-11-30', 'Consulta sobre puntos'),
(4, '2024-11-18', 'Solicitud de información'),
(4, '2024-11-27', 'Participación en torneo');

-- Insertar casos de ejemplo
INSERT INTO casos (codigo, cliente, tipo, asunto, descripcion, prioridad, estado, fecha, responsable) VALUES
('CASO-001', 'María González López', 'Reclamo', 'Demora en atención', 'Cliente reporta espera prolongada en caja', 'Alta', 'En Proceso', '2024-11-20', 'Juan Pérez'),
('CASO-002', 'Carlos Ramírez Soto', 'Sugerencia', 'Mejora en servicio', 'Sugiere ampliar horario de atención', 'Media', 'Abierto', '2024-11-22', 'Ana Silva'),
('CASO-003', 'Ana Martínez Cruz', 'Incidencia', 'Error en sistema', 'Problema con registro de puntos', 'Alta', 'Completado', '2024-11-25', 'Pedro Gómez'),
('CASO-004', 'Camila Martínez Salpe', 'Reclamo', 'Calidad de servicio', 'Insatisfacción con atención recibida', 'Media', 'En Proceso', '2024-11-27', 'María López');

-- Insertar promociones de ejemplo
INSERT INTO promociones (nombre, descuento, fecha_inicio, fecha_fin, estado) VALUES
('Descuento Viernes 25%', 25.00, '2024-11-16', '2024-11-30', 'Activa'),
('Black Friday 25%', 25.00, '2024-11-24', '2024-11-24', 'Finalizada'),
('Beneficio Nuevos Clientes', 30.00, '2024-12-01', '2024-12-31', 'Programada'),
('Promoción Navideña', 35.00, '2024-12-15', '2024-12-25', 'Programada');

-- Insertar asignaciones de ejemplo
INSERT INTO asignaciones (cliente_id, promocion_id, fecha_asignacion) VALUES
(1, 1, '2024-11-20'),
(2, 2, '2024-11-22'),
(3, 3, '2024-11-25'),
(4, 1, '2024-11-26'),
(6, 3, '2024-11-28');

-- =========================================
-- VISTAS ÚTILES
-- =========================================

-- Vista: Clientes con estadísticas
CREATE OR REPLACE VIEW v_clientes_stats AS
SELECT 
  c.id,
  c.nombre,
  c.dni,
  c.email,
  c.telefono,
  c.estado,
  c.created_at,
  COUNT(DISTINCT v.id) as total_visitas,
  COUNT(DISTINCT a.id) as total_promociones
FROM clientes c
LEFT JOIN visitas v ON c.id = v.cliente_id
LEFT JOIN asignaciones a ON c.id = a.cliente_id
GROUP BY c.id;

-- Vista: Visitas con información de cliente
CREATE OR REPLACE VIEW v_visitas_detalle AS
SELECT 
  v.id,
  v.cliente_id,
  c.nombre,
  c.dni,
  v.fecha,
  v.servicio,
  v.created_at
FROM visitas v
INNER JOIN clientes c ON v.cliente_id = c.id;

-- Vista: Promociones con conteo de asignaciones
CREATE OR REPLACE VIEW v_promociones_stats AS
SELECT 
  p.id,
  p.nombre,
  p.descuento,
  p.fecha_inicio,
  p.fecha_fin,
  p.estado,
  COUNT(a.id) as asignados
FROM promociones p
LEFT JOIN asignaciones a ON p.id = a.promocion_id
GROUP BY p.id;

-- Vista: Asignaciones con detalles completos
CREATE OR REPLACE VIEW v_asignaciones_detalle AS
SELECT 
  a.id,
  a.cliente_id,
  c.nombre as cliente_nombre,
  c.dni as cliente_dni,
  a.promocion_id,
  p.nombre as promocion_nombre,
  p.descuento,
  a.fecha_asignacion
FROM asignaciones a
INNER JOIN clientes c ON a.cliente_id = c.id
INNER JOIN promociones p ON a.promocion_id = p.id;

-- =========================================
-- PROCEDIMIENTOS ALMACENADOS
-- =========================================

-- Procedimiento: Obtener estadísticas generales
DELIMITER //
CREATE PROCEDURE sp_estadisticas_generales()
BEGIN
  SELECT 
    (SELECT COUNT(*) FROM clientes) as total_clientes,
    (SELECT COUNT(*) FROM clientes WHERE estado = 'Activo') as clientes_activos,
    (SELECT COUNT(*) FROM clientes WHERE estado = 'Inactivo') as clientes_inactivos,
    (SELECT COUNT(*) FROM clientes WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)) as nuevos_clientes,
    (SELECT COUNT(*) FROM visitas) as total_visitas,
    (SELECT COUNT(*) FROM casos) as total_casos,
    (SELECT COUNT(*) FROM casos WHERE estado = 'Abierto') as casos_abiertos,
    (SELECT COUNT(*) FROM promociones WHERE estado = 'Activa') as promociones_activas;
END //
DELIMITER ;

-- Procedimiento: Buscar registros
DELIMITER //
CREATE PROCEDURE sp_buscar_registros(
  IN p_query VARCHAR(255),
  IN p_tipo VARCHAR(50)
)
BEGIN
  -- Crear tabla temporal para resultados
  CREATE TEMPORARY TABLE IF NOT EXISTS temp_resultados (
    tipo VARCHAR(50),
    nombre VARCHAR(255),
    dni VARCHAR(50),
    estado_detalle VARCHAR(255),
    fecha DATE
  );
  
  -- Limpiar tabla temporal
  TRUNCATE TABLE temp_resultados;
  
  -- Buscar en clientes
  IF p_tipo IN ('todos', 'cliente') THEN
    INSERT INTO temp_resultados
    SELECT 
      'cliente' as tipo,
      nombre,
      dni,
      estado as estado_detalle,
      DATE(created_at) as fecha
    FROM clientes
    WHERE nombre LIKE CONCAT('%', p_query, '%')
       OR dni LIKE CONCAT('%', p_query, '%');
  END IF;
  
  -- Buscar en visitas
  IF p_tipo IN ('todos', 'visita') THEN
    INSERT INTO temp_resultados
    SELECT 
      'visita' as tipo,
      c.nombre,
      c.dni,
      v.servicio as estado_detalle,
      v.fecha
    FROM visitas v
    INNER JOIN clientes c ON v.cliente_id = c.id
    WHERE c.nombre LIKE CONCAT('%', p_query, '%')
       OR c.dni LIKE CONCAT('%', p_query, '%');
  END IF;
  
  -- Buscar en casos
  IF p_tipo IN ('todos', 'caso') THEN
    INSERT INTO temp_resultados
    SELECT 
      'caso' as tipo,
      cliente as nombre,
      codigo as dni,
      CONCAT(tipo, ' - ', estado) as estado_detalle,
      fecha
    FROM casos
    WHERE cliente LIKE CONCAT('%', p_query, '%')
       OR codigo LIKE CONCAT('%', p_query, '%');
  END IF;
  
  -- Retornar resultados
  SELECT * FROM temp_resultados
  ORDER BY fecha DESC;
  
  -- Limpiar
  DROP TEMPORARY TABLE IF EXISTS temp_resultados;
END //
DELIMITER ;

-- =========================================
-- ÍNDICES ADICIONALES PARA OPTIMIZACIÓN
-- =========================================

-- Índice para búsquedas de texto
ALTER TABLE clientes ADD FULLTEXT INDEX idx_fulltext_nombre (nombre);
ALTER TABLE casos ADD FULLTEXT INDEX idx_fulltext_cliente (cliente);

-- =========================================
-- PERMISOS Y USUARIO (OPCIONAL)
-- =========================================

-- Crear usuario para la aplicación
-- CREATE USER 'casino_admin'@'localhost' IDENTIFIED BY 'password_seguro';
-- GRANT ALL PRIVILEGES ON casino_atlantic_crm.* TO 'casino_admin'@'localhost';
-- FLUSH PRIVILEGES;

-- =========================================
-- INFORMACIÓN DE LA BASE DE DATOS
-- =========================================

SELECT 'Base de datos creada exitosamente' AS mensaje;
SELECT COUNT(*) as total_clientes FROM clientes;
SELECT COUNT(*) as total_visitas FROM visitas;
SELECT COUNT(*) as total_casos FROM casos;
SELECT COUNT(*) as total_promociones FROM promociones;