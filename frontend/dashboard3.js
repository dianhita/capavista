
// DASHBOARD 3 - GERENTE GENERAL
// =======================

// =======================
// INICIALIZACIÓN
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  // Verificar usuario logueado
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  // Mostrar nombre de usuario
  document.getElementById("userNameSpan").textContent = user.name;

  // Configurar botón de logout
  document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("user");
    window.location.href = "index.html";
  };

  // Mostrar primera sección
  mostrarSeccion("reportesConsolidados");

  // Cargar datos iniciales
  await actualizarConsolidado();
  await cargarEstadisticasGenerales();
});

// =======================
// UTILIDADES DE UI
// =======================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const seccion = document.getElementById(id);
  if (seccion) seccion.classList.add("activa");
}

function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function capitalize(s) {
  return (s || "").charAt(0).toUpperCase() + (s || "").slice(1);
}

function mostrarCargando(elementId) {
  const el = document.getElementById(elementId);
  if (el) el.textContent = "...";
}

// =======================
// REPORTES CONSOLIDADOS
// =======================
function generarConsolidado() {
  alert("📊 Reporte consolidado generado correctamente con los datos actuales.");
}

async function actualizarConsolidado() {
  const tipo = document.getElementById("tipoReporte")?.value || "clientes";
  const periodo = document.getElementById("periodoConsolidado")?.value || "ultimo-mes";

  // Mostrar cargando
  ["rc_total", "rc_activos", "rc_inactivos", "rc_nuevos"].forEach(id => mostrarCargando(id));

  try {
    const stats = await ReportesAPI.getEstadisticas();
    
    // Presets base según tipo
    const presets = {
      clientes: {
        total: stats.clientes.total,
        activos: stats.clientes.activos,
        inactivos: stats.clientes.inactivos,
        nuevos: stats.clientes.nuevos
      },
      promociones: {
        total: 24,
        activos: 12,
        inactivos: 8,
        nuevos: 4
      },
      incidencias: {
        total: stats.casos.total,
        activos: stats.casos.abiertos,
        inactivos: stats.casos.total - stats.casos.abiertos,
        nuevos: Math.round(stats.casos.abiertos * 0.5)
      },
      visitas: {
        total: stats.visitas,
        activos: Math.round(stats.visitas * 0.6),
        inactivos: Math.round(stats.visitas * 0.4),
        nuevos: Math.round(stats.visitas * 0.15)
      }
    };

    // Factor de ajuste por período
    const factor = {
      "ultimo-mes": 1,
      "ultima-semana": 0.25,
      "trimestre": 3,
      "medio-ano": 6,
      "ultimo-ano": 12
    }[periodo] || 1;

    const base = presets[tipo] || presets.clientes;
    const datos = {
      total: Math.round(base.total * factor),
      activos: Math.round(base.activos * factor),
      inactivos: Math.round(base.inactivos * factor),
      nuevos: Math.round(base.nuevos * factor)
    };

    // Actualizar métricas
    document.getElementById("rc_total").textContent = datos.total;
    document.getElementById("rc_activos").textContent = datos.activos;
    document.getElementById("rc_inactivos").textContent = datos.inactivos;
    document.getElementById("rc_nuevos").textContent = datos.nuevos;

    // Actualizar top clientes
    renderTopClientes(generarTopClientes(periodo));

  } catch (error) {
    console.error("Error al actualizar consolidado:", error);
    ["rc_total", "rc_activos", "rc_inactivos", "rc_nuevos"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "Error";
    });
  }
}

function generarTopClientes(periodo) {
  const bases = {
    "ultima-semana": [
      { cliente: "María González López", visitas: 4 },
      { cliente: "Camila Martínez Salpe", visitas: 4 },
      { cliente: "Ana Martínez Cruz", visitas: 3 }
    ],
    "trimestre": [
      { cliente: "María González López", visitas: 15 },
      { cliente: "Camila Martínez Salpe", visitas: 13 },
      { cliente: "Ana Martínez Cruz", visitas: 12 }
    ],
    "medio-ano": [
      { cliente: "María González López", visitas: 29 },
      { cliente: "Camila Martínez Salpe", visitas: 26 },
      { cliente: "Ana Martínez Cruz", visitas: 24 }
    ],
    "ultimo-ano": [
      { cliente: "María González López", visitas: 55 },
      { cliente: "Camila Martínez Salpe", visitas: 52 },
      { cliente: "Ana Martínez Cruz", visitas: 49 }
    ]
  };

  return bases[periodo] || [
    { cliente: "María González López", visitas: 9 },
    { cliente: "Camila Martínez Salpe", visitas: 8 },
    { cliente: "Ana Martínez Cruz", visitas: 8 }
  ];
}

function renderTopClientes(lista) {
  const tbody = document.getElementById("rc_topClientes");
  if (!tbody) return;
  
  if (lista.length === 0) {
    tbody.innerHTML = '<tr><td colspan="2" class="text-center">No hay datos disponibles</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  lista.forEach(item => {
    tbody.innerHTML += `<tr><td>${item.cliente}</td><td>${item.visitas}</td></tr>`;
  });
}

function descargarConsolidado() {
  const tipo = document.getElementById("tipoReporte")?.value || "clientes";
  const periodo = document.getElementById("periodoConsolidado")?.value || "ultimo-mes";
  
  const filas = [
    ["Reporte Consolidado - Casino Atlantic CRM", ""],
    ["Tipo de Reporte", capitalize(tipo)],
    ["Período", periodo.replace('-', ' ')],
    ["Fecha de Generación", new Date().toLocaleDateString()],
    [],
    ["Sección", "Valor"],
    ["Total", document.getElementById("rc_total").textContent],
    ["Activos", document.getElementById("rc_activos").textContent],
    ["Inactivos", document.getElementById("rc_inactivos").textContent],
    ["Nuevos", document.getElementById("rc_nuevos").textContent],
    [],
    ["Top Clientes", "Visitas"]
  ];

  const tabla = document.querySelectorAll("#rc_topClientes tr");
  tabla.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    if (tds.length === 2) {
      filas.push([tds[0].textContent, tds[1].textContent]);
    }
  });

  const csv = filas.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `reporte_consolidado_${tipo}_${periodo}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// =======================
// BÚSQUEDA AVANZADA
// =======================
async function ejecutarBusqueda() {
  const query = document.getElementById("ba_query")?.value.trim();
  const tipo = document.getElementById("ba_tipo")?.value || "todos";
  const tbody = document.getElementById("ba_resultados");

  if (!query) {
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #e67e22;">Por favor, ingrese un término de búsqueda</td></tr>';
    }
    return;
  }

  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center loading">Buscando...</td></tr>';
  }

  try {
    const resultados = await ReportesAPI.busqueda(query, tipo);
    renderResultadosBusqueda(resultados);
  } catch (error) {
    console.error("Error en búsqueda:", error);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" class="text-center" style="color: #e74c3c;">Error al realizar la búsqueda. Verifique la conexión.</td></tr>';
    }
  }
}

function renderResultadosBusqueda(items) {
  const tbody = document.getElementById("ba_resultados");
  if (!tbody) return;

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center">No se encontraron resultados. Intente con otros términos o tipo de búsqueda.</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  items.forEach(i => {
    const fecha = i.fecha ? new Date(i.fecha).toLocaleDateString() : "—";
    tbody.innerHTML += `
      <tr>
        <td data-tipo="${i.tipo}">${capitalize(i.tipo)}</td>
        <td>${i.nombre || "—"} ${i.dni ? '/ ' + i.dni : ''}</td>
        <td>${i.estado_detalle || "—"}</td>
        <td>${fecha}</td>
      </tr>
    `;
  });
}

// =======================
// ESTADÍSTICAS GENERALES
// =======================
async function cargarEstadisticasGenerales() {
  // Mostrar cargando
  const ids = [
    "stat_total_clientes", "stat_clientes_activos", "stat_clientes_inactivos",
    "stat_nuevos_clientes", "stat_total_visitas", "stat_total_casos",
    "stat_casos_abiertos", "stat_tasa_resolucion"
  ];
  ids.forEach(id => mostrarCargando(id));

  try {
    const stats = await ReportesAPI.getEstadisticas();

    // Actualizar clientes
    document.getElementById("stat_total_clientes").textContent = stats.clientes.total;
    document.getElementById("stat_clientes_activos").textContent = stats.clientes.activos;
    document.getElementById("stat_clientes_inactivos").textContent = stats.clientes.inactivos;
    document.getElementById("stat_nuevos_clientes").textContent = stats.clientes.nuevos;

    // Actualizar visitas y casos
    document.getElementById("stat_total_visitas").textContent = stats.visitas;
    document.getElementById("stat_total_casos").textContent = stats.casos.total;
    document.getElementById("stat_casos_abiertos").textContent = stats.casos.abiertos;

    // Calcular tasa de resolución
    const tasaResolucion = stats.casos.total > 0 
      ? Math.round(((stats.casos.total - stats.casos.abiertos) / stats.casos.total) * 100)
      : 0;
    document.getElementById("stat_tasa_resolucion").textContent = tasaResolucion + "%";

    // Actualizar tabla resumen
    actualizarTablaResumen(stats);

  } catch (error) {
    console.error("Error al cargar estadísticas:", error);
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = "Error";
    });
  }
}

function actualizarTablaResumen(stats) {
  const tbody = document.getElementById("tablaResumenSistema");
  if (!tbody) return;

  const tasaActividad = stats.clientes.total > 0
    ? Math.round((stats.clientes.activos / stats.clientes.total) * 100)
    : 0;

  const tasaCrecimiento = stats.clientes.total > 0
    ? Math.round((stats.clientes.nuevos / stats.clientes.total) * 100)
    : 0;

  const tasaResolucion = stats.casos.total > 0
    ? Math.round(((stats.casos.total - stats.casos.abiertos) / stats.casos.total) * 100)
    : 0;

  const promedioVisitas = stats.clientes.activos > 0
    ? (stats.visitas / stats.clientes.activos).toFixed(1)
    : 0;

  tbody.innerHTML = `
    <tr>
      <td>Clientes</td>
      <td>Tasa de Actividad</td>
      <td>${tasaActividad}%</td>
      <td><span style="color: ${tasaActividad >= 70 ? '#27ae60' : '#e67e22'}">
        ${tasaActividad >= 70 ? '✅ Excelente' : '⚠️ Mejorar'}
      </span></td>
    </tr>
    <tr>
      <td>Clientes</td>
      <td>Tasa de Crecimiento</td>
      <td>${tasaCrecimiento}%</td>
      <td><span style="color: ${tasaCrecimiento >= 10 ? '#27ae60' : '#95a5a6'}">
        ${tasaCrecimiento >= 10 ? '✅ Positivo' : 'ℹ️ Normal'}
      </span></td>
    </tr>
    <tr>
      <td>Casos</td>
      <td>Tasa de Resolución</td>
      <td>${tasaResolucion}%</td>
      <td><span style="color: ${tasaResolucion >= 80 ? '#27ae60' : '#e74c3c'}">
        ${tasaResolucion >= 80 ? '✅ Buena' : '❌ Crítico'}
      </span></td>
    </tr>
    <tr>
      <td>Visitas</td>
      <td>Promedio por Cliente Activo</td>
      <td>${promedioVisitas}</td>
      <td><span style="color: ${promedioVisitas >= 3 ? '#27ae60' : '#95a5a6'}">
        ${promedioVisitas >= 3 ? '✅ Alto' : 'ℹ️ Normal'}
      </span></td>
    </tr>
    <tr>
      <td>Sistema</td>
      <td>Total de Registros</td>
      <td>${stats.clientes.total + stats.visitas + stats.casos.total}</td>
      <td><span style="color: #3498db">ℹ️ Operacional</span></td>
    </tr>
  `;
}