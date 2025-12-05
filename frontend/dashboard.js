
// DASHBOARD 1 - ATENCIÓN AL CLIENTE
// =======================

// Variables globales
let clientes = [];
let visitas = [];
let casos = [];
let clientesOriginales = [];
let visitasOriginales = [];
let casosOriginales = [];

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
  const userNameSpan = document.getElementById("userNameSpan");
  if (userNameSpan) userNameSpan.textContent = user.name;

  // Configurar botón de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", cerrarSesion);

  // Mostrar primera sección
  mostrarSeccion("clientes");

  // Cargar datos iniciales
  await cargarTodosDatos();
});

// =======================
// FUNCIONES GENERALES
// =======================
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  const seccion = document.getElementById(id);
  if (seccion) seccion.classList.add("activa");
}

function abrirModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "flex";
}

function cerrarModal(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = "none";
}

function cerrarSesion() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

function normalizarTexto(texto) {
  return (texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function mostrarCargando(tablaId) {
  const tbody = document.getElementById(tablaId);
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="10" class="text-center loading">Cargando datos...</td></tr>';
  }
}

function mostrarError(tablaId, mensaje) {
  const tbody = document.getElementById(tablaId);
  if (tbody) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center" style="color: #e74c3c;">${mensaje}</td></tr>`;
  }
}

async function cargarTodosDatos() {
  await Promise.all([
    cargarClientes(),
    cargarVisitas(),
    cargarCasos()
  ]);
}

// =======================
// CLIENTES - API
// =======================
async function cargarClientes() {
  mostrarCargando("tablaClientes");
  try {
    clientes = await ClientesAPI.getAll();
    clientesOriginales = [...clientes];
    renderClientes();
    await cargarSelectoresClientes();
  } catch (error) {
    console.error("Error al cargar clientes:", error);
    mostrarError("tablaClientes", "Error al cargar clientes. Verifique la conexión con el servidor.");
  }
}

function renderClientes() {
  const tbody = document.getElementById("tablaClientes");
  if (!tbody) return;
  
  if (clientes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay clientes registrados</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  clientes.forEach((c, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${c.nombre}</td>
        <td>${c.dni}</td>
        <td>${c.email}</td>
        <td>${c.telefono || "—"}</td>
        <td><span class="estado-${c.estado.toLowerCase()}">${c.estado}</span></td>
        <td>
          <button onclick="verCliente(${index})" title="Ver">👁️</button>
          <button onclick="editarCliente(${index})" title="Editar">✏️</button>
          <button onclick="eliminarCliente(${index})" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `;
  });
}

function filtrarClientes() {
  const nombreFiltro = normalizarTexto(document.getElementById("buscarNombre")?.value || "");
  const dniFiltro = normalizarTexto(document.getElementById("buscarDNI")?.value || "");

  clientes = clientesOriginales.filter(c => {
    const coincideNombre = normalizarTexto(c.nombre).includes(nombreFiltro);
    const coincideDNI = normalizarTexto(c.dni).includes(dniFiltro);
    return coincideNombre && coincideDNI;
  });

  renderClientes();
}

function limpiarFiltroClientes() {
  const nombreInput = document.getElementById("buscarNombre");
  const dniInput = document.getElementById("buscarDNI");
  if (nombreInput) nombreInput.value = "";
  if (dniInput) dniInput.value = "";
  clientes = [...clientesOriginales];
  renderClientes();
}

function verCliente(index) {
  const c = clientes[index];
  const panel = document.getElementById("verClienteDatos");
  if (panel) {
    panel.innerHTML = `
      <p><strong>Nombre:</strong> ${c.nombre}</p>
      <p><strong>DNI:</strong> ${c.dni}</p>
      <p><strong>Email:</strong> ${c.email}</p>
      <p><strong>Teléfono:</strong> ${c.telefono || "—"}</p>
      <p><strong>Estado:</strong> ${c.estado}</p>
      <p><strong>Registrado:</strong> ${new Date(c.created_at).toLocaleDateString()}</p>
    `;
  }
  document.getElementById("modalEditarCliente").dataset.index = index;
  document.getElementById("modalEditarCliente").dataset.id = c.id;
  abrirModal("modalVerCliente");
}

function editarClienteDesdeVer() {
  const modal = document.getElementById("modalEditarCliente");
  const index = modal.dataset.index;
  cerrarModal("modalVerCliente");
  editarCliente(index);
}

function editarCliente(index) {
  const c = clientes[index];
  document.getElementById("editarNombre").value = c.nombre;
  document.getElementById("editarDNI").value = c.dni;
  document.getElementById("editarEmail").value = c.email;
  document.getElementById("editarTelefono").value = c.telefono || "";
  document.getElementById("editarEstado").value = c.estado;
  document.getElementById("modalEditarCliente").dataset.index = index;
  document.getElementById("modalEditarCliente").dataset.id = c.id;
  abrirModal("modalEditarCliente");
}

async function actualizarCliente() {
  const modal = document.getElementById("modalEditarCliente");
  const id = modal.dataset.id;

  const clienteData = {
    nombre: document.getElementById("editarNombre").value.trim(),
    dni: document.getElementById("editarDNI").value.trim(),
    email: document.getElementById("editarEmail").value.trim(),
    telefono: document.getElementById("editarTelefono").value.trim(),
    estado: document.getElementById("editarEstado").value
  };

  if (!clienteData.nombre || !clienteData.dni || !clienteData.email) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    await ClientesAPI.update(id, clienteData);
    alert("Cliente actualizado exitosamente");
    await cargarClientes();
    cerrarModal("modalEditarCliente");
    cerrarModal("modalVerCliente");
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    alert("Error al actualizar cliente: " + error.message);
  }
}

async function eliminarCliente(index) {
  if (!confirm("¿Está seguro de eliminar este cliente? Esta acción también eliminará sus visitas asociadas.")) {
    return;
  }

  const cliente = clientes[index];
  try {
    await ClientesAPI.delete(cliente.id);
    alert("Cliente eliminado exitosamente");
    await cargarClientes();
    await cargarVisitas();
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    alert("Error al eliminar cliente: " + error.message);
  }
}

async function guardarNuevoCliente() {
  const clienteData = {
    nombre: document.getElementById("nuevoNombre").value.trim(),
    dni: document.getElementById("nuevoDNI").value.trim(),
    email: document.getElementById("nuevoEmail").value.trim(),
    telefono: document.getElementById("nuevoTelefono").value.trim(),
    estado: document.getElementById("nuevoEstado").value
  };

  if (!clienteData.nombre || !clienteData.dni || !clienteData.email) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    await ClientesAPI.create(clienteData);
    alert("Cliente creado exitosamente");
    await cargarClientes();
    cerrarModal("modalNuevoCliente");
    
    // Limpiar formulario
    document.getElementById("nuevoNombre").value = "";
    document.getElementById("nuevoDNI").value = "";
    document.getElementById("nuevoEmail").value = "";
    document.getElementById("nuevoTelefono").value = "";
    document.getElementById("nuevoEstado").value = "Activo";
  } catch (error) {
    console.error("Error al crear cliente:", error);
    alert("Error al crear cliente: " + error.message);
  }
}

// =======================
// VISITAS - API
// =======================
async function cargarVisitas() {
  mostrarCargando("tablaVisitas");
  try {
    visitas = await VisitasAPI.getAll();
    visitasOriginales = [...visitas];
    renderVisitas();
  } catch (error) {
    console.error("Error al cargar visitas:", error);
    mostrarError("tablaVisitas", "Error al cargar visitas. Verifique la conexión con el servidor.");
  }
}

function renderVisitas() {
  const tbody = document.getElementById("tablaVisitas");
  if (!tbody) return;
  
  if (visitas.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay visitas registradas</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  visitas.forEach((v, index) => {
    tbody.innerHTML += `
      <tr>
        <td>${v.nombre}</td>
        <td>${v.dni}</td>
        <td>${new Date(v.fecha).toLocaleDateString()}</td>
        <td>${v.servicio}</td>
        <td>
          <button onclick="verVisita(${index})" title="Ver">👁️</button>
          <button onclick="editarVisita(${index})" title="Editar">✏️</button>
          <button onclick="eliminarVisita(${index})" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `;
  });
}

function filtrarVisitas() {
  const nombreFiltro = normalizarTexto(document.getElementById("buscarVisitaNombre")?.value || "");
  const dniFiltro = normalizarTexto(document.getElementById("buscarVisitaIDM")?.value || "");

  visitas = visitasOriginales.filter(v => {
    const coincideNombre = normalizarTexto(v.nombre).includes(nombreFiltro);
    const coincideDNI = normalizarTexto(v.dni).includes(dniFiltro);
    return coincideNombre && coincideDNI;
  });

  renderVisitas();
}

function limpiarFiltroVisitas() {
  const nombreInput = document.getElementById("buscarVisitaNombre");
  const dniInput = document.getElementById("buscarVisitaIDM");
  if (nombreInput) nombreInput.value = "";
  if (dniInput) dniInput.value = "";
  visitas = [...visitasOriginales];
  renderVisitas();
}

function verVisita(index) {
  const v = visitas[index];
  const panel = document.getElementById("verVisitaDatos");
  if (panel) {
    panel.innerHTML = `
      <p><strong>Cliente:</strong> ${v.nombre}</p>
      <p><strong>DNI:</strong> ${v.dni}</p>
      <p><strong>Fecha:</strong> ${new Date(v.fecha).toLocaleDateString()}</p>
      <p><strong>Servicio:</strong> ${v.servicio}</p>
    `;
  }
  document.getElementById("modalEditarVisita").dataset.index = index;
  document.getElementById("modalEditarVisita").dataset.id = v.id;
  abrirModal("modalVerVisita");
}

function editarVisitaDesdeVer() {
  const modal = document.getElementById("modalEditarVisita");
  const index = modal.dataset.index;
  cerrarModal("modalVerVisita");
  editarVisita(index);
}

async function editarVisita(index) {
  const v = visitas[index];
  await cargarSelectoresClientes();
  
  document.getElementById("editarVisitaClienteId").value = v.cliente_id;
  document.getElementById("editarVisitaFecha").value = v.fecha.split('T')[0];
  document.getElementById("editarVisitaServicio").value = v.servicio;
  document.getElementById("modalEditarVisita").dataset.index = index;
  document.getElementById("modalEditarVisita").dataset.id = v.id;
  abrirModal("modalEditarVisita");
}

async function actualizarVisita() {
  const modal = document.getElementById("modalEditarVisita");
  const id = modal.dataset.id;

  const visitaData = {
    cliente_id: document.getElementById("editarVisitaClienteId").value,
    fecha: document.getElementById("editarVisitaFecha").value,
    servicio: document.getElementById("editarVisitaServicio").value.trim()
  };

  if (!visitaData.cliente_id || !visitaData.fecha || !visitaData.servicio) {
    alert("Por favor, complete todos los campos");
    return;
  }

  try {
    await VisitasAPI.update(id, visitaData);
    alert("Visita actualizada exitosamente");
    await cargarVisitas();
    cerrarModal("modalEditarVisita");
    cerrarModal("modalVerVisita");
  } catch (error) {
    console.error("Error al actualizar visita:", error);
    alert("Error al actualizar visita: " + error.message);
  }
}

async function eliminarVisita(index) {
  if (!confirm("¿Está seguro de eliminar esta visita?")) {
    return;
  }

  const visita = visitas[index];
  try {
    await VisitasAPI.delete(visita.id);
    alert("Visita eliminada exitosamente");
    await cargarVisitas();
  } catch (error) {
    console.error("Error al eliminar visita:", error);
    alert("Error al eliminar visita: " + error.message);
  }
}

// CORRECCIÓN PRINCIPAL: Esta función ahora usa los campos correctos
async function guardarNuevaVisita() {
  const visitaData = {
    cliente_id: document.getElementById("visitaClienteId").value,
    fecha: document.getElementById("visitaFecha").value,
    servicio: document.getElementById("visitaServicio").value.trim()
  };

  if (!visitaData.cliente_id || !visitaData.fecha || !visitaData.servicio) {
    alert("Por favor, complete todos los campos");
    return;
  }

  try {
    await VisitasAPI.create(visitaData);
    alert("Visita registrada exitosamente");
    await cargarVisitas();
    cerrarModal("modalNuevaVisita");
    
    // Limpiar formulario
    document.getElementById("visitaClienteId").value = "";
    document.getElementById("visitaFecha").value = "";
    document.getElementById("visitaServicio").value = "";
  } catch (error) {
    console.error("Error al registrar visita:", error);
    alert("Error al registrar visita: " + error.message);
  }
}

// Cargar selectores de clientes
async function cargarSelectoresClientes() {
  try {
    const selectores = [
      document.getElementById("visitaClienteId"),
      document.getElementById("editarVisitaClienteId")
    ];

    selectores.forEach(select => {
      if (select) {
        const valorActual = select.value;
        select.innerHTML = '<option value="">Seleccione un cliente</option>';
        clientesOriginales.forEach(cliente => {
          select.innerHTML += `<option value="${cliente.id}">${cliente.nombre} - ${cliente.dni}</option>`;
        });
        if (valorActual) select.value = valorActual;
      }
    });
  } catch (error) {
    console.error("Error al cargar selectores:", error);
  }
}

// =======================
// CASOS - API
// =======================
async function cargarCasos() {
  mostrarCargando("tablaCasos");
  try {
    casos = await CasosAPI.getAll();
    casosOriginales = [...casos];
    renderCasos();
  } catch (error) {
    console.error("Error al cargar casos:", error);
    mostrarError("tablaCasos", "Error al cargar casos. Verifique la conexión con el servidor.");
  }
}

function renderCasos() {
  const tbody = document.getElementById("tablaCasos");
  if (!tbody) return;
  
  if (casos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-center">No hay casos registrados</td></tr>';
    return;
  }

  tbody.innerHTML = "";
  casos.forEach((c, index) => {
    const tipoClass = c.tipo === "Reclamo" ? "tipo-reclamo" : 
                      c.tipo === "Sugerencia" ? "tipo-sugerencia" : "tipo-incidencia";
    const prioridadClass = c.prioridad === "Alta" ? "prioridad-alta" : 
                           c.prioridad === "Media" ? "prioridad-media" : "prioridad-baja";

    tbody.innerHTML += `
      <tr>
        <td>${c.codigo}</td>
        <td>${c.cliente}</td>
        <td><span class="${tipoClass}">${c.tipo}</span></td>
        <td>${c.asunto}</td>
        <td><span class="${prioridadClass}">${c.prioridad}</span></td>
        <td>${c.estado}</td>
        <td>${new Date(c.fecha).toLocaleDateString()}</td>
        <td>${c.responsable || "—"}</td>
        <td>
          <button onclick="verCaso(${index})" title="Ver">👁️</button>
          <button onclick="editarCaso(${index})" title="Editar">✏️</button>
          <button onclick="eliminarCaso(${index})" title="Eliminar">🗑️</button>
        </td>
      </tr>
    `;
  });
}

function filtrarCasos() {
  const clienteFiltro = normalizarTexto(document.getElementById("buscarCasoCliente")?.value || "");
  const codigoFiltro = normalizarTexto(document.getElementById("buscarCasoCodigo")?.value || "");

  casos = casosOriginales.filter(c => {
    const coincideCliente = normalizarTexto(c.cliente).includes(clienteFiltro);
    const coincideCodigo = normalizarTexto(c.codigo).includes(codigoFiltro);
    return coincideCliente && coincideCodigo;
  });

  renderCasos();
}

function limpiarFiltroCasos() {
  const clienteInput = document.getElementById("buscarCasoCliente");
  const codigoInput = document.getElementById("buscarCasoCodigo");
  if (clienteInput) clienteInput.value = "";
  if (codigoInput) codigoInput.value = "";
  casos = [...casosOriginales];
  renderCasos();
}

function verCaso(index) {
  const c = casos[index];
  const panel = document.getElementById("verCasoDatos");
  if (panel) {
    panel.innerHTML = `
      <p><strong>Código:</strong> ${c.codigo}</p>
      <p><strong>Cliente:</strong> ${c.cliente}</p>
      <p><strong>Tipo:</strong> ${c.tipo}</p>
      <p><strong>Asunto:</strong> ${c.asunto}</p>
      <p><strong>Prioridad:</strong> ${c.prioridad}</p>
      <p><strong>Estado:</strong> ${c.estado}</p>
      <p><strong>Fecha:</strong> ${new Date(c.fecha).toLocaleDateString()}</p>
      <p><strong>Responsable:</strong> ${c.responsable || "—"}</p>
      <p><strong>Descripción:</strong> ${c.descripcion || "Sin descripción"}</p>
    `;
  }
  document.getElementById("modalEditarCaso").dataset.index = index;
  document.getElementById("modalEditarCaso").dataset.id = c.id;
  abrirModal("modalVerCaso");
}

function editarCasoDesdeVer() {
  const modal = document.getElementById("modalEditarCaso");
  const index = modal.dataset.index;
  cerrarModal("modalVerCaso");
  editarCaso(index);
}

function editarCaso(index) {
  const c = casos[index];
  document.getElementById("editarCodigo").value = c.codigo;
  document.getElementById("editarCliente").value = c.cliente;
  document.getElementById("editarTipo").value = c.tipo;
  document.getElementById("editarAsunto").value = c.asunto;
  document.getElementById("editarPrioridad").value = c.prioridad;
  document.getElementById("editarEstado").value = c.estado;
  document.getElementById("editarFecha").value = c.fecha.split('T')[0];
  document.getElementById("editarResponsable").value = c.responsable || "";
  document.getElementById("editarDescripcion").value = c.descripcion || "";
  document.getElementById("modalEditarCaso").dataset.index = index;
  document.getElementById("modalEditarCaso").dataset.id = c.id;
  abrirModal("modalEditarCaso");
}

async function actualizarCaso() {
  const modal = document.getElementById("modalEditarCaso");
  const id = modal.dataset.id;

  const casoData = {
    codigo: document.getElementById("editarCodigo").value.trim(),
    cliente: document.getElementById("editarCliente").value.trim(),
    tipo: document.getElementById("editarTipo").value,
    asunto: document.getElementById("editarAsunto").value.trim(),
    prioridad: document.getElementById("editarPrioridad").value,
    estado: document.getElementById("editarEstado").value,
    fecha: document.getElementById("editarFecha").value,
    responsable: document.getElementById("editarResponsable").value.trim(),
    descripcion: document.getElementById("editarDescripcion").value.trim()
  };

  if (!casoData.codigo || !casoData.cliente || !casoData.asunto || !casoData.fecha) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    await CasosAPI.update(id, casoData);
    alert("Caso actualizado exitosamente");
    await cargarCasos();
    cerrarModal("modalEditarCaso");
    cerrarModal("modalVerCaso");
  } catch (error) {
    console.error("Error al actualizar caso:", error);
    alert("Error al actualizar caso: " + error.message);
  }
}

async function eliminarCaso(index) {
  if (!confirm("¿Está seguro de eliminar este caso?")) {
    return;
  }

  const caso = casos[index];
  try {
    await CasosAPI.delete(caso.id);
    alert("Caso eliminado exitosamente");
    await cargarCasos();
  } catch (error) {
    console.error("Error al eliminar caso:", error);
    alert("Error al eliminar caso: " + error.message);
  }
}

async function guardarNuevoCaso() {
  const casoData = {
    codigo: document.getElementById("casoCodigo").value.trim(),
    cliente: document.getElementById("casoCliente").value.trim(),
    tipo: document.getElementById("casoTipo").value,
    asunto: document.getElementById("casoAsunto").value.trim(),
    prioridad: document.getElementById("casoPrioridad").value,
    estado: document.getElementById("casoEstado").value,
    fecha: document.getElementById("casoFecha").value,
    responsable: document.getElementById("casoResponsable").value.trim(),
    descripcion: document.getElementById("casoDescripcion").value.trim()
  };

  if (!casoData.codigo || !casoData.cliente || !casoData.asunto || !casoData.fecha) {
    alert("Por favor, complete todos los campos obligatorios");
    return;
  }

  try {
    await CasosAPI.create(casoData);
    alert("Caso registrado exitosamente");
    await cargarCasos();
    cerrarModal("modalNuevoCaso");
    
    // Limpiar formulario
    document.getElementById("casoCodigo").value = "";
    document.getElementById("casoCliente").value = "";
    document.getElementById("casoTipo").value = "Reclamo";
    document.getElementById("casoAsunto").value = "";
    document.getElementById("casoPrioridad").value = "Media";
    document.getElementById("casoEstado").value = "Abierto";
    document.getElementById("casoFecha").value = "";
    document.getElementById("casoResponsable").value = "";
    document.getElementById("casoDescripcion").value = "";
  } catch (error) {
    console.error("Error al crear caso:", error);
    alert("Error al crear caso: " + error.message);
  }
}