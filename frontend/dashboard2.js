// DASHBOARD 2 - GERENCIA DE MARKETING
// =======================

let promociones = [];
let asignaciones = [];
let clientes = [];
let promocionesOriginales = [];
let asignacionesOriginales = [];
let editingPromoIndex = null;
let editingAsignIndex = null;

// =======================
// INICIALIZACIÓN
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  const userSpan = document.getElementById("userNameSpan");
  if (userSpan) userSpan.textContent = user.name;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    };
  }

  mostrarSeccion("promociones");
  await cargarTodosDatos();
});

async function cargarTodosDatos() {
  await Promise.all([
    cargarClientes(),
    cargarPromociones(),
    cargarAsignaciones()
  ]);
  actualizarPeriodo();
}

// =======================
// UTILIDADES DE UI
// =======================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const target = document.getElementById(id);
  if (target) target.classList.add("activa");
}

function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function normalizar(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mostrarCargando(tablaId) {
  const tbody = document.getElementById(tablaId);
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center loading">Cargando datos...</td></tr>';
  }
}

// =======================
// CARGAR DATOS
// =======================
async function cargarClientes() {
  try {
    clientes = await ClientesAPI.getAll();
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    clientes = [];
  }
}

async function cargarPromociones() {
  mostrarCargando("tablaPromociones");
  try {
    promociones = await PromocionesAPI.getAll();
    promocionesOriginales = [...promociones];
    renderPromociones();
  } catch (error) {
    console.error("Error al cargar promociones:", error);
    promociones = [];
    renderPromociones();
  }
}

async function cargarAsignaciones() {
  mostrarCargando("tablaAsignaciones");
  try {
    asignaciones = await AsignacionesAPI.getAll();
    asignacionesOriginales = [...asignaciones];
    renderAsignaciones();
  } catch (error) {
    console.error("Error al cargar asignaciones:", error);
    asignaciones = [];
    renderAsignaciones();
  }
}

// =======================
// PROMOCIONES (CRUD + FILTRO)
// =======================
function renderPromociones() {
  const tbody = document.getElementById("tablaPromociones");
  if (!tbody) return;
  
  if (promociones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center">No hay promociones registradas</td></tr>';
    return;
  }

  const filtroNombre = normalizar(document.getElementById("buscarPromoNombre")?.value || "");

  tbody.innerHTML = "";
  promociones
    .filter(p => normalizar(p.nombre).includes(filtroNombre))
    .forEach((p, index) => {
      const estadoClass = `estado-${p.estado.toLowerCase()}`;
      tbody.innerHTML += `
        <tr>
          <td>${p.nombre}</td>
          <td class="descuento">${p.descuento}%</td>
          <td>${new Date(p.fecha_inicio).toLocaleDateString()}</td>
          <td>${new Date(p.fecha_fin).toLocaleDateString()}</td>
          <td class="${estadoClass}">${p.estado}</td>
          <td>${p.asignados || 0}</td>
          <td>
            <button title="Ver" onclick="verPromocion(${index})">👁️</button>
            <button title="Editar" onclick="editarPromocion(${index})">✏️</button>
            <button title="Eliminar" onclick="eliminarPromocion(${index})">🗑️</button>
          </td>
        </tr>
      `;
    });
}

function filtrarPromociones() {
  renderPromociones();
}

async function guardarNuevaPromocion() {
  const nombre = document.getElementById("promoNombre").value.trim();
  const descuento = Number(document.getElementById("promoDescuento").value);
  const inicio = document.getElementById("promoInicio").value;
  const fin = document.getElementById("promoFin").value;
  const estado = document.getElementById("promoEstado").value;

  if (!nombre || isNaN(descuento) || !inicio || !fin || !estado) {
    alert("Complete todos los campos de la promoción.");
    return;
  }

  const promoData = {
    nombre,
    descuento,
    fecha_inicio: inicio,
    fecha_fin: fin,
    estado
  };

  try {
    if (editingPromoIndex !== null) {
      const p = promociones[editingPromoIndex];
      await PromocionesAPI.update(p.id, promoData);
      alert("Promoción actualizada exitosamente");
      editingPromoIndex = null;
    } else {
      await PromocionesAPI.create(promoData);
      alert("Promoción creada exitosamente");
    }

    await cargarPromociones();
    cerrarModal("modalNuevaPromo");

    // Limpiar formulario
    document.getElementById("promoNombre").value = "";
    document.getElementById("promoDescuento").value = "";
    document.getElementById("promoInicio").value = "";
    document.getElementById("promoFin").value = "";
    document.getElementById("promoEstado").value = "Programada";
  } catch (error) {
    console.error("Error al guardar promoción:", error);
    alert("Error al guardar promoción: " + error.message);
  }
}

function verPromocion(index) {
  const p = promociones[index];
  alert(
    `Promoción:\n` +
    `Nombre: ${p.nombre}\n` +
    `Descuento: ${p.descuento}%\n` +
    `Inicio: ${new Date(p.fecha_inicio).toLocaleDateString()}\n` +
    `Fin: ${new Date(p.fecha_fin).toLocaleDateString()}\n` +
    `Estado: ${p.estado}\n` +
    `Asignados: ${p.asignados || 0}`
  );
}

function editarPromocion(index) {
  const p = promociones[index];
  editingPromoIndex = index;
  document.getElementById("promoNombre").value = p.nombre;
  document.getElementById("promoDescuento").value = p.descuento;
  document.getElementById("promoInicio").value = p.fecha_inicio.split('T')[0];
  document.getElementById("promoFin").value = p.fecha_fin.split('T')[0];
  document.getElementById("promoEstado").value = p.estado;
  abrirModal("modalNuevaPromo");
}

async function eliminarPromocion(index) {
  if (!confirm("¿Eliminar esta promoción?")) return;
  
  const promo = promociones[index];
  try {
    await PromocionesAPI.delete(promo.id);
    alert("Promoción eliminada exitosamente");
    await cargarPromociones();
  } catch (error) {
    console.error("Error al eliminar promoción:", error);
    alert("Error al eliminar promoción: " + error.message);
  }
}

// =======================
// ASIGNACIONES (CRUD + FILTROS)
// =======================
function renderAsignaciones() {
  const tbody = document.getElementById("tablaAsignaciones");
  if (!tbody) return;
  
  if (asignaciones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay asignaciones registradas</td></tr>';
    return;
  }

  const fNombre = normalizar(document.getElementById("filtroAsignNombre")?.value || "");
  const fDni = normalizar(document.getElementById("filtroAsignDni")?.value || "");

  tbody.innerHTML = "";
  asignaciones
    .filter(a => normalizar(a.nombre).includes(fNombre) && normalizar(a.dni).includes(fDni))
    .forEach((a, index) => {
      tbody.innerHTML += `
        <tr>
          <td>${a.nombre}</td>
          <td>${a.dni}</td>
          <td>${a.promo}</td>
          <td class="descuento">${a.descuento}%</td>
          <td>${new Date(a.fecha_asignacion).toLocaleDateString()}</td>
          <td>
            <button title="Ver" onclick="verAsignacion(${index})">👁️</button>
            <button title="Eliminar" onclick="eliminarAsignacion(${index})">🗑️</button>
          </td>
        </tr>
      `;
    });
}

async function guardarAsignacion() {
  const clienteId = document.getElementById("asignarClienteId").value;
  const promoId = document.getElementById("asignarPromoId").value;
  const fecha = document.getElementById("asignarFecha").value;

  if (!clienteId || !promoId || !fecha) {
    alert("Complete todos los campos de la asignación.");
    return;
  }

  try {
    await AsignacionesAPI.create({
      cliente_id: clienteId,
      promocion_id: promoId,
      fecha_asignacion: fecha
    });

    alert("Promoción asignada exitosamente");
    await cargarAsignaciones();
    await cargarPromociones();
    cerrarModal("modalNuevaAsignacion");

    // Limpiar formulario
    document.getElementById("asignarClienteId").value = "";
    document.getElementById("asignarPromoId").value = "";
    document.getElementById("asignarFecha").value = "";
  } catch (error) {
    console.error("Error al asignar promoción:", error);
    alert("Error al asignar promoción: " + error.message);
  }
}

function verAsignacion(index) {
  const a = asignaciones[index];
  alert(
    `Asignación:\n` +
    `Cliente: ${a.nombre}\n` +
    `DNI: ${a.dni}\n` +
    `Promoción: ${a.promo}\n` +
    `Descuento: ${a.descuento}%\n` +
    `Fecha: ${new Date(a.fecha_asignacion).toLocaleDateString()}`
  );
}

async function eliminarAsignacion(index) {
  if (!confirm("¿Eliminar esta asignación?")) return;
  
  const asig = asignaciones[index];
  try {
    await AsignacionesAPI.delete(asig.id);
    alert("Asignación eliminada exitosamente");
    await cargarAsignaciones();
    await cargarPromociones();
  } catch (error) {
    console.error("Error al eliminar asignación:", error);
    alert("Error al eliminar asignación: " + error.message);
  }
}

// Cargar selectores
function cargarSelectoresAsignacion() {
  const selectCliente = document.getElementById("asignarClienteId");
  const selectPromo = document.getElementById("asignarPromoId");

  if (selectCliente) {
    selectCliente.innerHTML = '<option value="">Seleccione un cliente</option>';
    clientes.forEach(c => {
      selectCliente.innerHTML += `<option value="${c.id}">${c.nombre} - ${c.dni}</option>`;
    });
  }

  if (selectPromo) {
    selectPromo.innerHTML = '<option value="">Seleccione una promoción</option>';
    promociones.forEach(p => {
      selectPromo.innerHTML += `<option value="${p.id}">${p.nombre} (${p.descuento}%)</option>`;
    });
  }
}

// Abrir modal de asignación con selectores cargados
function abrirModalAsignacion() {
  cargarSelectoresAsignacion();
  abrirModal("modalNuevaAsignacion");
}

// =======================
// REPORTES (Métricas + Top + Acciones)
// =======================
function generarReporte() {
  alert("📊 Reporte generado correctamente.");
}

function actualizarPeriodo() {
  const periodo = document.getElementById("periodoReporte").value;
  let datos = {};
  let topClientes = [];

  if (periodo === "ultimo-mes") {
    datos = { total: 1247, activos: 1098, inactivos: 149, nuevos: 89 };
    topClientes = [
      { nombre: "María González López", visitas: 6 },
      { nombre: "Carlos Ramírez Soto", visitas: 6 },
      { nombre: "Ana Martínez Cruz", visitas: 6 }
    ];
  } else if (periodo === "ultima-semana") {
    datos = { total: 320, activos: 280, inactivos: 40, nuevos: 25 };
    topClientes = [
      { nombre: "María González López", visitas: 3 },
      { nombre: "Carlos Ramírez Soto", visitas: 2 },
      { nombre: "Ana Martínez Cruz", visitas: 2 }
    ];
  } else if (periodo === "trimestre") {
    datos = { total: 3600, activos: 3100, inactivos: 500, nuevos: 270 };
    topClientes = [
      { nombre: "María González López", visitas: 15 },
      { nombre: "Carlos Ramírez Soto", visitas: 13 },
      { nombre: "Ana Martínez Cruz", visitas: 12 }
    ];
  } else if (periodo === "medio-ano") {
    datos = { total: 7200, activos: 6200, inactivos: 1000, nuevos: 540 };
    topClientes = [
      { nombre: "María González López", visitas: 29 },
      { nombre: "Carlos Ramírez Soto", visitas: 26 },
      { nombre: "Ana Martínez Cruz", visitas: 24 }
    ];
  } else if (periodo === "ultimo-ano") {
    datos = { total: 14400, activos: 12400, inactivos: 2000, nuevos: 1080 };
    topClientes = [
      { nombre: "María González López", visitas: 55 },
      { nombre: "Carlos Ramírez Soto", visitas: 52 },
      { nombre: "Ana Martínez Cruz", visitas: 49 }
    ];
  }

  document.getElementById("totalClientes").textContent = datos.total;
  document.getElementById("clientesActivos").textContent = datos.activos;
  document.getElementById("clientesInactivos").textContent = datos.inactivos;
  document.getElementById("nuevosClientes").textContent = datos.nuevos;

  const tbody = document.getElementById("tablaTopClientes");
  tbody.innerHTML = "";
  topClientes.forEach(cliente => {
    tbody.innerHTML += `<tr><td>${cliente.nombre}</td><td>${cliente.visitas}</td></tr>`;
  });
}

function descargarReporte() {
  const filas = [
    ["Métrica", "Valor", "Descripción"],
    ["Total Clientes", document.getElementById("totalClientes").textContent, "Clientes registrados"],
    ["Clientes Activos", document.getElementById("clientesActivos").textContent, "Con actividad"],
    ["Clientes Inactivos", document.getElementById("clientesInactivos").textContent, "Sin actividad"],
    ["Nuevos Clientes", document.getElementById("nuevosClientes").textContent, "Registrados en el período"],
    [],
    ["Top Clientes por Actividad", "", ""],
    ["Cliente", "Visitas", ""]
  ];

  const tabla = document.querySelectorAll("#tablaTopClientes tr");
  tabla.forEach(tr => {
    const tds = tr.querySelectorAll("td");
    if (tds.length === 2) {
      filas.push([tds[0].textContent, tds[1].textContent, ""]);
    }
  });

  const csv = filas.map(fila => fila.map(valor => `"${valor}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "reporte_clientes.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}