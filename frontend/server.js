// =========================================
// SERVIDOR BACKEND - CASINO ATLANTIC CRM
// =========================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

// =========================================
// MIDDLEWARE
// =========================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =========================================
// CONFIGURACIÓN DE BASE DE DATOS
// =========================================
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '123456',
  database: process.env.DB_NAME || 'casino_atlantic_crm',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Verificar conexión
async function verificarConexion() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL');
    connection.release();
  } catch (error) {
    console.error('❌ Error de conexión a MySQL:', error.message);
    process.exit(1);
  }
}

// =========================================
// RUTA RAÍZ
// =========================================
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API Casino Atlantic CRM',
    version: '1.0.0',
    endpoints: {
      clientes: '/api/clientes',
      visitas: '/api/visitas',
      casos: '/api/casos',
      promociones: '/api/promociones',
      asignaciones: '/api/asignaciones',
      reportes: '/api/reportes/consolidado',
      busqueda: '/api/busqueda',
      estadisticas: '/api/estadisticas'
    }
  });
});

// =========================================
// ENDPOINTS - CLIENTES
// =========================================

// GET: Obtener todos los clientes
app.get('/api/clientes', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes ORDER BY created_at DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener clientes' });
  }
});

// GET: Obtener un cliente por ID
app.get('/api/clientes/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener cliente' });
  }
});

// GET: Buscar clientes
app.get('/api/clientes/buscar/:query', async (req, res) => {
  try {
    const query = `%${req.params.query}%`;
    const [rows] = await pool.query(
      'SELECT * FROM clientes WHERE nombre LIKE ? OR dni LIKE ? OR email LIKE ?',
      [query, query, query]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al buscar clientes:', error);
    res.status(500).json({ error: 'Error al buscar clientes' });
  }
});

// POST: Crear nuevo cliente
app.post('/api/clientes', async (req, res) => {
  try {
    const { nombre, dni, email, telefono, estado } = req.body;
    
    // Validaciones
    if (!nombre || !dni || !email) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO clientes (nombre, dni, email, telefono, estado) VALUES (?, ?, ?, ?, ?)',
      [nombre, dni, email, telefono, estado || 'Activo']
    );
    
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Cliente creado exitosamente'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error al crear cliente:', error);
    res.status(500).json({ error: 'Error al crear cliente' });
  }
});

// PUT: Actualizar cliente
app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { nombre, dni, email, telefono, estado } = req.body;
    
    const [result] = await pool.query(
      'UPDATE clientes SET nombre = ?, dni = ?, email = ?, telefono = ?, estado = ? WHERE id = ?',
      [nombre, dni, email, telefono, estado, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ mensaje: 'Cliente actualizado exitosamente' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar cliente' });
  }
});

// DELETE: Eliminar cliente
app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM clientes WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json({ mensaje: 'Cliente eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar cliente:', error);
    res.status(500).json({ error: 'Error al eliminar cliente' });
  }
});

// =========================================
// ENDPOINTS - VISITAS
// =========================================

// GET: Obtener todas las visitas
app.get('/api/visitas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT v.*, c.nombre, c.dni 
      FROM visitas v
      INNER JOIN clientes c ON v.cliente_id = c.id
      ORDER BY v.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    res.status(500).json({ error: 'Error al obtener visitas' });
  }
});

// GET: Obtener visitas de un cliente
app.get('/api/visitas/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM visitas WHERE cliente_id = ? ORDER BY fecha DESC',
      [req.params.clienteId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    res.status(500).json({ error: 'Error al obtener visitas del cliente' });
  }
});

// POST: Crear nueva visita
app.post('/api/visitas', async (req, res) => {
  try {
    const { cliente_id, fecha, servicio } = req.body;
    
    if (!cliente_id || !fecha || !servicio) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO visitas (cliente_id, fecha, servicio) VALUES (?, ?, ?)',
      [cliente_id, fecha, servicio]
    );
    
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Visita registrada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear visita:', error);
    res.status(500).json({ error: 'Error al registrar visita' });
  }
});

// PUT: Actualizar visita
app.put('/api/visitas/:id', async (req, res) => {
  try {
    const { cliente_id, fecha, servicio } = req.body;
    
    const [result] = await pool.query(
      'UPDATE visitas SET cliente_id = ?, fecha = ?, servicio = ? WHERE id = ?',
      [cliente_id, fecha, servicio, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visita no encontrada' });
    }
    
    res.json({ mensaje: 'Visita actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar visita:', error);
    res.status(500).json({ error: 'Error al actualizar visita' });
  }
});

// DELETE: Eliminar visita
app.delete('/api/visitas/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM visitas WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Visita no encontrada' });
    }
    
    res.json({ mensaje: 'Visita eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar visita:', error);
    res.status(500).json({ error: 'Error al eliminar visita' });
  }
});

// =========================================
// ENDPOINTS - CASOS
// =========================================

// GET: Obtener todos los casos
app.get('/api/casos', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM casos ORDER BY fecha DESC'
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    res.status(500).json({ error: 'Error al obtener casos' });
  }
});

// GET: Obtener un caso por ID
app.get('/api/casos/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM casos WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener caso:', error);
    res.status(500).json({ error: 'Error al obtener caso' });
  }
});

// POST: Crear nuevo caso
app.post('/api/casos', async (req, res) => {
  try {
    const { codigo, cliente, tipo, asunto, descripcion, prioridad, estado, fecha, responsable } = req.body;
    
    if (!codigo || !cliente || !tipo || !asunto || !fecha) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO casos (codigo, cliente, tipo, asunto, descripcion, prioridad, estado, fecha, responsable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [codigo, cliente, tipo, asunto, descripcion, prioridad || 'Media', estado || 'Abierto', fecha, responsable]
    );
    
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Caso creado exitosamente'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'El código del caso ya existe' });
    }
    console.error('Error al crear caso:', error);
    res.status(500).json({ error: 'Error al crear caso' });
  }
});

// PUT: Actualizar caso
app.put('/api/casos/:id', async (req, res) => {
  try {
    const { codigo, cliente, tipo, asunto, descripcion, prioridad, estado, fecha, responsable } = req.body;
    
    const [result] = await pool.query(
      'UPDATE casos SET codigo = ?, cliente = ?, tipo = ?, asunto = ?, descripcion = ?, prioridad = ?, estado = ?, fecha = ?, responsable = ? WHERE id = ?',
      [codigo, cliente, tipo, asunto, descripcion, prioridad, estado, fecha, responsable, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }
    
    res.json({ mensaje: 'Caso actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar caso:', error);
    res.status(500).json({ error: 'Error al actualizar caso' });
  }
});

// DELETE: Eliminar caso
app.delete('/api/casos/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM casos WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Caso no encontrado' });
    }
    
    res.json({ mensaje: 'Caso eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar caso:', error);
    res.status(500).json({ error: 'Error al eliminar caso' });
  }
});

// =========================================
// ENDPOINTS - PROMOCIONES
// =========================================

// GET: Obtener todas las promociones
app.get('/api/promociones', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, 
             COUNT(a.id) as asignados
      FROM promociones p
      LEFT JOIN asignaciones a ON p.id = a.promocion_id
      GROUP BY p.id
      ORDER BY p.fecha_inicio DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener promociones:', error);
    res.status(500).json({ error: 'Error al obtener promociones' });
  }
});

// POST: Crear nueva promoción
app.post('/api/promociones', async (req, res) => {
  try {
    const { nombre, descuento, fecha_inicio, fecha_fin, estado } = req.body;
    
    if (!nombre || !descuento || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO promociones (nombre, descuento, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)',
      [nombre, descuento, fecha_inicio, fecha_fin, estado || 'Programada']
    );
    
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Promoción creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear promoción:', error);
    res.status(500).json({ error: 'Error al crear promoción' });
  }
});

// PUT: Actualizar promoción
app.put('/api/promociones/:id', async (req, res) => {
  try {
    const { nombre, descuento, fecha_inicio, fecha_fin, estado } = req.body;
    
    const [result] = await pool.query(
      'UPDATE promociones SET nombre = ?, descuento = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id = ?',
      [nombre, descuento, fecha_inicio, fecha_fin, estado, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }
    
    res.json({ mensaje: 'Promoción actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar promoción:', error);
    res.status(500).json({ error: 'Error al actualizar promoción' });
  }
});

// DELETE: Eliminar promoción
app.delete('/api/promociones/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM promociones WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Promoción no encontrada' });
    }
    
    res.json({ mensaje: 'Promoción eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar promoción:', error);
    res.status(500).json({ error: 'Error al eliminar promoción' });
  }
});

// =========================================
// ENDPOINTS - ASIGNACIONES
// =========================================

// GET: Obtener todas las asignaciones
app.get('/api/asignaciones', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             c.nombre, c.dni,
             p.nombre as promo, p.descuento
      FROM asignaciones a
      INNER JOIN clientes c ON a.cliente_id = c.id
      INNER JOIN promociones p ON a.promocion_id = p.id
      ORDER BY a.fecha_asignacion DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener asignaciones:', error);
    res.status(500).json({ error: 'Error al obtener asignaciones' });
  }
});

// POST: Crear nueva asignación
app.post('/api/asignaciones', async (req, res) => {
  try {
    const { cliente_id, promocion_id, fecha_asignacion } = req.body;
    
    if (!cliente_id || !promocion_id || !fecha_asignacion) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO asignaciones (cliente_id, promocion_id, fecha_asignacion) VALUES (?, ?, ?)',
      [cliente_id, promocion_id, fecha_asignacion]
    );
    
    res.status(201).json({
      id: result.insertId,
      mensaje: 'Asignación creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear asignación:', error);
    res.status(500).json({ error: 'Error al crear asignación' });
  }
});

// DELETE: Eliminar asignación
app.delete('/api/asignaciones/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM asignaciones WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Asignación no encontrada' });
    }
    
    res.json({ mensaje: 'Asignación eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar asignación:', error);
    res.status(500).json({ error: 'Error al eliminar asignación' });
  }
});

// =========================================
// ENDPOINTS - BÚSQUEDA Y REPORTES
// =========================================

// GET: Búsqueda avanzada
app.get('/api/busqueda', async (req, res) => {
  try {
    const { query, tipo } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Debe proporcionar un término de búsqueda' });
    }
    
    const [rows] = await pool.query(
      'CALL sp_buscar_registros(?, ?)',
      [query, tipo || 'todos']
    );
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error en búsqueda:', error);
    res.status(500).json({ error: 'Error al realizar la búsqueda' });
  }
});

// GET: Estadísticas generales
app.get('/api/estadisticas', async (req, res) => {
  try {
    const [rows] = await pool.query('CALL sp_estadisticas_generales()');
    const stats = rows[0][0];
    
    res.json({
      clientes: {
        total: stats.total_clientes,
        activos: stats.clientes_activos,
        inactivos: stats.clientes_inactivos,
        nuevos: stats.nuevos_clientes
      },
      visitas: stats.total_visitas,
      casos: {
        total: stats.total_casos,
        abiertos: stats.casos_abiertos
      },
      promociones: {
        activas: stats.promociones_activas
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
});

// =========================================
// MANEJO DE ERRORES 404
// =========================================
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// =========================================
// INICIAR SERVIDOR
// =========================================
async function iniciarServidor() {
  try {
    await verificarConexion();
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
      console.log(`📊 API Casino Atlantic CRM iniciada correctamente`);
      console.log(`📅 Fecha: ${new Date().toLocaleString()}`);
    });
  } catch (error) {
    console.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n⚠️ Cerrando servidor...');
  await pool.end();
  process.exit(0);
});