// api.js - Configuración y funciones para conectar el frontend con el backend

const API_URL = 'http://localhost:3000/api';

// Función auxiliar para hacer peticiones
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en API:', error);
    throw error;
  }
}

// ==========================================
// CLIENTES API
// ==========================================
const ClientesAPI = {
  // Obtener todos los clientes
  getAll: async () => {
    return await fetchAPI('/clientes');
  },

  // Obtener un cliente por ID
  getById: async (id) => {
    return await fetchAPI(`/clientes/${id}`);
  },

  // Buscar clientes
  search: async (query) => {
    return await fetchAPI(`/clientes/buscar/${encodeURIComponent(query)}`);
  },

  // Crear nuevo cliente
  create: async (clienteData) => {
    return await fetchAPI('/clientes', {
      method: 'POST',
      body: JSON.stringify(clienteData)
    });
  },

  // Actualizar cliente
  update: async (id, clienteData) => {
    return await fetchAPI(`/clientes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clienteData)
    });
  },

  // Eliminar cliente
  delete: async (id) => {
    return await fetchAPI(`/clientes/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// VISITAS API
// ==========================================
const VisitasAPI = {
  // Obtener todas las visitas
  getAll: async () => {
    return await fetchAPI('/visitas');
  },

  // Obtener visitas de un cliente
  getByCliente: async (clienteId) => {
    return await fetchAPI(`/visitas/cliente/${clienteId}`);
  },

  // Crear nueva visita
  create: async (visitaData) => {
    return await fetchAPI('/visitas', {
      method: 'POST',
      body: JSON.stringify(visitaData)
    });
  },

  // Actualizar visita
  update: async (id, visitaData) => {
    return await fetchAPI(`/visitas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(visitaData)
    });
  },

  // Eliminar visita
  delete: async (id) => {
    return await fetchAPI(`/visitas/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// CASOS API
// ==========================================
const CasosAPI = {
  // Obtener todos los casos
  getAll: async () => {
    return await fetchAPI('/casos');
  },

  // Obtener un caso por ID
  getById: async (id) => {
    return await fetchAPI(`/casos/${id}`);
  },

  // Crear nuevo caso
  create: async (casoData) => {
    return await fetchAPI('/casos', {
      method: 'POST',
      body: JSON.stringify(casoData)
    });
  },

  // Actualizar caso
  update: async (id, casoData) => {
    return await fetchAPI(`/casos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(casoData)
    });
  },

  // Eliminar caso
  delete: async (id) => {
    return await fetchAPI(`/casos/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// PROMOCIONES API
// ==========================================
const PromocionesAPI = {
  // Obtener todas las promociones
  getAll: async () => {
    return await fetchAPI('/promociones');
  },

  // Crear nueva promoción
  create: async (promoData) => {
    return await fetchAPI('/promociones', {
      method: 'POST',
      body: JSON.stringify(promoData)
    });
  },

  // Actualizar promoción
  update: async (id, promoData) => {
    return await fetchAPI(`/promociones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(promoData)
    });
  },

  // Eliminar promoción
  delete: async (id) => {
    return await fetchAPI(`/promociones/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// ASIGNACIONES API
// ==========================================
const AsignacionesAPI = {
  // Obtener todas las asignaciones
  getAll: async () => {
    return await fetchAPI('/asignaciones');
  },

  // Crear nueva asignación
  create: async (asignacionData) => {
    return await fetchAPI('/asignaciones', {
      method: 'POST',
      body: JSON.stringify(asignacionData)
    });
  },

  // Eliminar asignación
  delete: async (id) => {
    return await fetchAPI(`/asignaciones/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==========================================
// REPORTES API
// ==========================================
const ReportesAPI = {
  // Obtener reporte consolidado
  getConsolidado: async (tipo = 'todos', periodo = 'ultimo-mes') => {
    return await fetchAPI(`/reportes/consolidado?tipo=${tipo}&periodo=${periodo}`);
  },

  // Búsqueda avanzada
  busqueda: async (query, tipo = 'todos') => {
    return await fetchAPI(`/busqueda?query=${encodeURIComponent(query)}&tipo=${tipo}`);
  },

  // Estadísticas generales
  getEstadisticas: async () => {
    return await fetchAPI('/estadisticas');
  }
};

// ==========================================
// EJEMPLO DE USO EN LOS ARCHIVOS DASHBOARD
// ==========================================

// Para usar en dashboard.js, reemplazar los arrays estáticos por llamadas a la API:

/*
EJEMPLO PARA CLIENTES:

// En lugar de:
const clientes = [
  { nombre: "María González", dni: "12345678", ... }
];

// Usar:
let clientes = [];

async function cargarClientes() {
  try {
    clientes = await ClientesAPI.getAll();
    renderClientes();
  } catch (error) {
    alert('Error al cargar clientes: ' + error.message);
  }
}

// Llamar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  // ... código existente ...
  cargarClientes();
});

// Para guardar nuevo cliente:
async function guardarNuevoCliente() {
  const nuevo = {
    nombre: document.getElementById("nuevoNombre").value,
    dni: document.getElementById("nuevoDNI").value,
    email: document.getElementById("nuevoEmail").value,
    telefono: document.getElementById("nuevoTelefono").value,
    estado: document.getElementById("nuevoEstado").value
  };
  
  try {
    await ClientesAPI.create(nuevo);
    await cargarClientes(); // Recargar lista
    cerrarModal("modalNuevoCliente");
    alert('Cliente creado exitosamente');
  } catch (error) {
    alert('Error al crear cliente: ' + error.message);
  }
}

// Para actualizar cliente:
async function actualizarCliente() {
  const idx = document.getElementById("modalEditarCliente").dataset.index;
  const cliente = clientes[idx];
  
  const actualizado = {
    nombre: document.getElementById("editarNombre").value,
    dni: document.getElementById("editarDNI").value,
    email: document.getElementById("editarEmail").value,
    telefono: document.getElementById("editarTelefono").value,
    estado: document.getElementById("editarEstado").value
  };
  
  try {
    await ClientesAPI.update(cliente.id, actualizado);
    await cargarClientes();
    cerrarModal("modalEditarCliente");
    alert('Cliente actualizado exitosamente');
  } catch (error) {
    alert('Error al actualizar cliente: ' + error.message);
  }
}

// Para eliminar cliente:
async function eliminarCliente(index) {
  if (confirm("¿Deseas eliminar este cliente?")) {
    const cliente = clientes[index];
    try {
      await ClientesAPI.delete(cliente.id);
      await cargarClientes();
      alert('Cliente eliminado exitosamente');
    } catch (error) {
      alert('Error al eliminar cliente: ' + error.message);
    }
  }
}
*/