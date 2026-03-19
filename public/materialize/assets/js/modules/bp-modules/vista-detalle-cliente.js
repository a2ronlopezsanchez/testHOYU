/* =====================================================
   VISTA DETALLE CLIENTE — Black Production
   vista-detalle-cliente.js
   ===================================================== */

'use strict';

/* =====================================================
   1. CONFIGURACIÓN GLOBAL
   ===================================================== */

const BP_DetalleCliente = {
  API_BASE:  '/clientes',
  clienteId: null,
  cliente:   null
};

const MOCK_COTIZACIONES_CLIENTE = [
  {
    id: 'COT-001', folio: 'BP-2025-001',
    nombre: 'Boda García & López',
    fecha: '2025-01-10', vigencia: '2025-01-25',
    total: 85000, status: 'Aprobada',
    eventoId: 'EVT-001', notas: 'DATOS DE PRUEBA · Incluye transporte'
  },
  {
    id: 'COT-002', folio: 'BP-2025-002',
    nombre: 'Sesión Corporativa Q1',
    fecha: '2025-01-18', vigencia: '2025-02-01',
    total: 42000, status: 'En Proceso',
    eventoId: null, notas: 'DATOS DE PRUEBA'
  },
  {
    id: 'COT-003', folio: 'BP-2024-089',
    nombre: 'Evento Navideño 2024',
    fecha: '2024-11-05', vigencia: '2024-11-20',
    total: 95000, status: 'Aprobada',
    eventoId: 'EVT-002', notas: 'DATOS DE PRUEBA'
  }
];

const MOCK_COBRANZA_CLIENTE = [
  {
    id: 'COB-001',
    eventoId: 'EVT-001',
    eventoNombre: 'Boda García & López · DATOS DE PRUEBA',
    total: 85000,
    pagos: [
      { id: 'PAG-001', concepto: 'Anticipo 50%', monto: 42500,
        fechaVencimiento: '2025-01-20', fechaPago: '2025-01-18',
        status: 'Pagado' },
      { id: 'PAG-002', concepto: 'Pago Final 50%', monto: 42500,
        fechaVencimiento: '2025-02-10', fechaPago: null,
        status: 'Pendiente' }
    ]
  },
  {
    id: 'COB-002',
    eventoId: 'EVT-002',
    eventoNombre: 'Evento Navideño Nike 2024 · DATOS DE PRUEBA',
    total: 95000,
    pagos: [
      { id: 'PAG-003', concepto: 'Anticipo 40%', monto: 38000,
        fechaVencimiento: '2024-11-15', fechaPago: '2024-11-14',
        status: 'Pagado' },
      { id: 'PAG-004', concepto: 'Segundo Pago 30%', monto: 28500,
        fechaVencimiento: '2024-12-01', fechaPago: '2024-11-30',
        status: 'Pagado' },
      { id: 'PAG-005', concepto: 'Pago Final 30%', monto: 28500,
        fechaVencimiento: '2024-12-16', fechaPago: '2024-12-20',
        status: 'Pagado' }
    ]
  }
];

const MOCK_FACTURAS_CLIENTE = [
  {
    id: 'FAC-001', folio: 'A-0042',
    eventoNombre: 'Evento Navideño Nike 2024 · DATOS DE PRUEBA',
    fecha: '2024-12-16', monto: 95000,
    status: 'Timbrada', uuid: 'ABCD-1234-EFGH-5678'
  },
  {
    id: 'FAC-002', folio: 'A-0038',
    eventoNombre: 'Sesión Corporativa Marzo · DATOS DE PRUEBA',
    fecha: '2024-03-22', monto: 55000,
    status: 'Timbrada', uuid: 'IJKL-9012-MNOP-3456'
  }
];

/* =====================================================
   2. CAPA DE API
   ===================================================== */

const BP_DetalleClienteAPI = {

  getHeaders() {
    return {
      'Accept': 'application/json',
      'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
    };
  },

  async handleResponse(res, defaultMessage) {
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      const validationErrors = payload?.errors
        ? Object.values(payload.errors).flat().join(' ')
        : '';
      throw new Error(validationErrors || payload?.message || defaultMessage);
    }
    return payload;
  },

  async getCliente(id) {
    const res = await fetch(`${BP_DetalleCliente.API_BASE}/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res, 'Cliente no encontrado');
  },

  async getCotizaciones() {
    return Promise.resolve([...MOCK_COTIZACIONES_CLIENTE]);
  },

  async getEventos() {
    const res = await fetch(
      `${BP_DetalleCliente.API_BASE}/${BP_DetalleCliente.clienteId}/eventos`,
      { headers: this.getHeaders() }
    );
    return this.handleResponse(res, 'No se pudieron cargar los eventos');
  },

  async createEvento(payload) {
    const res = await fetch(
      `${BP_DetalleCliente.API_BASE}/${BP_DetalleCliente.clienteId}/eventos`,
      {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    return this.handleResponse(res, 'No se pudo crear el evento');
  },

  async updateCliente(payload) {
    const res = await fetch(
      `${BP_DetalleCliente.API_BASE}/${BP_DetalleCliente.clienteId}`,
      {
        method: 'PUT',
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );
    return this.handleResponse(res, 'No se pudo actualizar el cliente');
  },

  async getCobranza() {
    return Promise.resolve([...MOCK_COBRANZA_CLIENTE]);
  },

  async getFacturas() {
    return Promise.resolve([...MOCK_FACTURAS_CLIENTE]);
  }
};
/* =====================================================
   3. HELPERS
   ===================================================== */

const BP_DetalleHelpers = {

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-MX', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  formatCurrency(num) {
    if (!num && num !== 0) return '—';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN',
      minimumFractionDigits: 0
    }).format(num);
  },

  initials(nombre) {
    if (!nombre) return '?';
    return nombre.trim().split(' ')
      .slice(0, 2).map(w => w[0]).join('').toUpperCase();
  },

  avatarClass(tipo) {
    return tipo === 'Persona Moral'
      ? 'cliente-avatar-moral'
      : 'cliente-avatar-fisica';
  },

  tipoBadge(tipo) {
    return tipo === 'Persona Moral'
      ? '<span class="badge-tipo-moral">Moral</span>'
      : '<span class="badge-tipo-fisica">Física</span>';
  },

  statusBadge(status) {
    const map = {
      'Activo':    '<span class="badge-cliente-activo">Activo</span>',
      'Prospecto': '<span class="badge-cliente-prospecto">Prospecto</span>',
      'VIP':       '<span class="badge-cliente-vip">⭐ VIP</span>',
      'Inactivo':  '<span class="badge-cliente-inactivo">Inactivo</span>'
    };
    return map[status] || `<span class="badge bg-secondary">${status}</span>`;
  },

  cotStatusBadge(status) {
    const map = {
      'Borrador':   '<span class="badge-cot-borrador">Borrador</span>',
      'En Proceso': '<span class="badge-cot-proceso">En Proceso</span>',
      'Aprobada':   '<span class="badge-cot-aprobada">Aprobada</span>',
      'Cancelada':  '<span class="badge-cot-cancelada">Cancelada</span>'
    };
    return map[status] || `<span class="badge bg-secondary">${status}</span>`;
  },

  evtStatusBadge(status) {
    const map = {
      'En Preparación': '<span class="badge-evt-preparacion">En Preparación</span>',
      'Realizado':      '<span class="badge-evt-realizado">Realizado</span>',
      'Cancelado':      '<span class="badge-evt-cancelado">Cancelado</span>',
      'PLANIFICADO':    '<span class="badge-evt-preparacion">Planificado</span>',
      'CONFIRMADO':     '<span class="badge-evt-preparacion">Confirmado</span>',
      'EN_CURSO':       '<span class="badge bg-info">En curso</span>',
      'COMPLETADO':     '<span class="badge-evt-realizado">Completado</span>',
      'FINALIZADO':     '<span class="badge-evt-realizado">Finalizado</span>',
      'CANCELADO':      '<span class="badge-evt-cancelado">Cancelado</span>'
    };
    return map[status] || `<span class="badge bg-secondary">${status}</span>`;
  },

  pagoStatusClass(status) {
    const map = {
      'Pagado':   'pago-pagado',
      'Pendiente':'pago-pendiente',
      'Vencido':  'pago-vencido'
    };
    return map[status] || 'pago-pendiente';
  },

  progressColor(pct) {
    if (pct >= 100) return '#28c76f';
    if (pct >= 50)  return '#ff9f43';
    return '#ea5455';
  },

  displayName(c) {
    return c.nombreColoquial ||
           c.contactoPrincipal?.nombre ||
           c.razonSocial || '—';
  },

  toast(icon, title) {
    if (typeof Swal === 'undefined') { alert(title); return; }
    Swal.fire({
      toast: true, position: 'top-end',
      icon, title,
      showConfirmButton: false,
      timer: 3000, timerProgressBar: true
    });
  },

  mockBadge() {
    return `
      <div class="alert alert-warning py-2 px-3 mb-3 small">
        <i class="mdi mdi-flask-outline me-1"></i>
        <strong>DATOS DE PRUEBA</strong>
      </div>`;
  }
};

const BP_DetalleEventoModal = {

  modalInstance: null,

  init() {
    const modalEl = document.getElementById('nuevoEventoClienteModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;

    this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);

    document.getElementById('nuevoEventoClienteForm')
      ?.addEventListener('submit', async event => {
        event.preventDefault();
        await this.submit();
      });
  },

  open() {
    if (!this.modalInstance || !BP_DetalleCliente.cliente) return;

    const form = document.getElementById('nuevoEventoClienteForm');
    form?.reset();
    document.getElementById('nuevoEventoClienteNombre').value =
      BP_DetalleHelpers.displayName(BP_DetalleCliente.cliente);
    this.clearErrors();
    this.modalInstance.show();
  },

  setLoading(isLoading) {
    const button = document.getElementById('guardarNuevoEventoClienteBtn');
    if (!button) return;

    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'
      : 'Guardar evento';
  },

  showErrors(message) {
    const container = document.getElementById('nuevoEventoClienteErrors');
    if (!container) return;

    container.classList.remove('d-none');
    container.innerHTML = `<div class="alert alert-danger mb-0">${message}</div>`;
  },

  clearErrors() {
    const container = document.getElementById('nuevoEventoClienteErrors');
    if (!container) return;

    container.classList.add('d-none');
    container.innerHTML = '';
  },

  async submit() {
    const form = document.getElementById('nuevoEventoClienteForm');
    if (!form) return;

    const payload = Object.fromEntries(new FormData(form).entries());
    this.clearErrors();
    this.setLoading(true);

    try {
      await BP_DetalleClienteAPI.createEvento(payload);
      this.modalInstance?.hide();
      BP_DetalleHelpers.toast('success', 'Evento creado correctamente');
      await BP_DetalleClienteInit.reloadEventos();
    } catch (error) {
      this.showErrors(error.message || 'No se pudo guardar el evento');
    } finally {
      this.setLoading(false);
    }
  }
};

const BP_DetalleContactosModal = {

  modalInstance: null,
  extraIds: [],

  init() {
    const modalEl = document.getElementById('editarContactosClienteModal');
    if (!modalEl || typeof bootstrap === 'undefined') return;

    this.modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    document.getElementById('editContactosBtn')
      ?.addEventListener('click', event => {
        event.preventDefault();
        this.open();
      });

    document.getElementById('modalToggleContactoAlt')
      ?.addEventListener('change', event => {
        const section = document.getElementById('modalSeccionContactoAlt');
        section?.classList.toggle('d-none', !event.target.checked);

        if (event.target.checked) {
          setTimeout(() => {
            section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 150);
        }
      });

    document.getElementById('modalAddContactoBtn')
      ?.addEventListener('click', () => this.addExtraContact());

    document.getElementById('editarContactosClienteForm')
      ?.addEventListener('submit', async event => {
        event.preventDefault();
        await this.submit();
      });
  },

  open() {
    if (!this.modalInstance || !BP_DetalleCliente.cliente) return;

    this.loadFromCliente(BP_DetalleCliente.cliente);
    this.clearErrors();
    this.modalInstance.show();
  },

  loadFromCliente(cliente) {
    const principal = cliente.contactoPrincipal || {};
    const alternativo = cliente.contactoAlternativo || null;

    this.extraIds = [];
    document.getElementById('modalContactosAdicionalesContainer').innerHTML = '';

    this.setVal('modalCp1Nombre', principal.nombre);
    this.setVal('modalCp1Cargo', principal.cargo);
    this.setVal('modalCp1Email', principal.email);
    this.setVal('modalCp1Tel', principal.tel);
    this.setVal('modalCp1Whatsapp', principal.whatsapp);
    this.setVal('modalCp1Cumpleanos', principal.cumpleanos);

    document.getElementById('modalToggleContactoAlt').checked = Boolean(alternativo);
    document.getElementById('modalSeccionContactoAlt')
      .classList.toggle('d-none', !alternativo);

    this.setVal('modalCp2Nombre', alternativo?.nombre);
    this.setVal('modalCp2Cargo', alternativo?.cargo);
    this.setVal('modalCp2Email', alternativo?.email);
    this.setVal('modalCp2Tel', alternativo?.tel);
    this.setVal('modalCp2Whatsapp', alternativo?.whatsapp);
    this.setVal('modalCp2Cumpleanos', alternativo?.cumpleanos);

    (cliente.contactosAdicionales || []).forEach(contacto => {
      this.addExtraContact(contacto);
    });
  },

  setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  },

  addExtraContact(contact = {}) {
    const id = `modal-contacto-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.extraIds.push(id);

    const container = document.getElementById('modalContactosAdicionalesContainer');
    const card = document.createElement('div');
    card.className = 'card shadow-none border mb-3';
    card.id = id;
    card.innerHTML = `
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Contacto adicional</h6>
        <button type="button" class="btn btn-sm btn-outline-danger" data-remove-contact="${id}">
          <i class="mdi mdi-delete-outline"></i>
        </button>
      </div>
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input type="text" class="form-control" data-field="nombre" value="${contact.nombre || ''}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Cargo</label>
            <input type="text" class="form-control" data-field="cargo" value="${contact.cargo || ''}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" data-field="email" value="${contact.email || ''}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Teléfono</label>
            <input type="text" class="form-control" data-field="tel" value="${contact.tel || ''}">
          </div>
          <div class="col-md-6">
            <label class="form-label">WhatsApp</label>
            <input type="text" class="form-control" data-field="whatsapp" value="${contact.whatsapp || ''}">
          </div>
          <div class="col-md-6">
            <label class="form-label">Cumpleaños</label>
            <input type="text" class="form-control" data-field="cumpleanos" placeholder="DD/MM" value="${contact.cumpleanos || ''}">
          </div>
        </div>
      </div>`;

    container.appendChild(card);
    card.querySelector('[data-remove-contact]')
      ?.addEventListener('click', () => this.removeExtraContact(id));

    setTimeout(() => {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  },

  removeExtraContact(id) {
    this.extraIds = this.extraIds.filter(item => item !== id);
    document.getElementById(id)?.remove();
  },

  collectExtraContacts() {
    return this.extraIds.map(id => {
      const card = document.getElementById(id);
      if (!card) return null;

      const get = field => card.querySelector(`[data-field="${field}"]`)?.value?.trim() || '';
      return this.normalizeOptionalContact({
        nombre: get('nombre'),
        cargo: get('cargo'),
        email: get('email'),
        tel: get('tel'),
        whatsapp: get('whatsapp'),
        cumpleanos: get('cumpleanos')
      });
    }).filter(contact =>
      contact && (contact.nombre || contact.email || contact.tel || contact.whatsapp)
    );
  },

  normalizeOptionalContact(contact) {
    const normalized = { ...contact };
    Object.keys(normalized).forEach(key => {
      normalized[key] = normalized[key] || null;
    });
    return normalized;
  },

  buildPayload() {
    const cliente = BP_DetalleCliente.cliente;
    const hasAlternativo = document.getElementById('modalToggleContactoAlt').checked;

    return {
      tipo: cliente.tipo,
      status: cliente.status,
      nombreColoquial: cliente.nombreColoquial,
      razonSocial: cliente.razonSocial,
      nombre: cliente.nombre,
      apellidoPaterno: cliente.apellidoPaterno,
      apellidoMaterno: cliente.apellidoMaterno,
      rfc: cliente.rfc,
      giro: cliente.giro,
      direccionFiscal: cliente.direccionFiscal || {},
      direccionFisica: cliente.direccionFisica || null,
      contactoPrincipal: {
        nombre: document.getElementById('modalCp1Nombre').value.trim(),
        cargo: document.getElementById('modalCp1Cargo').value.trim(),
        email: document.getElementById('modalCp1Email').value.trim(),
        tel: document.getElementById('modalCp1Tel').value.trim(),
        whatsapp: document.getElementById('modalCp1Whatsapp').value.trim(),
        cumpleanos: document.getElementById('modalCp1Cumpleanos').value.trim()
      },
      contactoAlternativo: hasAlternativo ? this.normalizeOptionalContact({
        nombre: document.getElementById('modalCp2Nombre').value.trim(),
        cargo: document.getElementById('modalCp2Cargo').value.trim(),
        email: document.getElementById('modalCp2Email').value.trim(),
        tel: document.getElementById('modalCp2Tel').value.trim(),
        whatsapp: document.getElementById('modalCp2Whatsapp').value.trim(),
        cumpleanos: document.getElementById('modalCp2Cumpleanos').value.trim()
      }) : null,
      contactosAdicionales: this.collectExtraContacts(),
      notas: cliente.notas,
      condicionesPago: cliente.condicionesPago,
      formaPago: cliente.formaPago,
      usoCfdi: cliente.usoCfdi,
      canalesComunicacion: cliente.canalesComunicacion || []
    };
  },

  setLoading(isLoading) {
    const button = document.getElementById('guardarContactosClienteBtn');
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...'
      : 'Guardar contactos';
  },

  showErrors(message) {
    const container = document.getElementById('editarContactosClienteErrors');
    if (!container) return;
    container.classList.remove('d-none');
    container.innerHTML = `<div class="alert alert-danger mb-0">${message}</div>`;
  },

  clearErrors() {
    const container = document.getElementById('editarContactosClienteErrors');
    if (!container) return;
    container.classList.add('d-none');
    container.innerHTML = '';
  },

  async submit() {
    this.clearErrors();
    this.setLoading(true);

    try {
      const response = await BP_DetalleClienteAPI.updateCliente(this.buildPayload());
      BP_DetalleCliente.cliente = response.client;

      BP_DetalleRenderHeader.renderSideContactos(response.client);
      BP_DetalleRenderHeader.render(response.client);

      this.modalInstance?.hide();
      BP_DetalleHelpers.toast('success', 'Contactos actualizados correctamente');
    } catch (error) {
      this.showErrors(error.message || 'No se pudieron guardar los contactos');
    } finally {
      this.setLoading(false);
    }
  }
};

/* =====================================================
   4. RENDER — CABECERA Y PANEL LATERAL
   ===================================================== */

const BP_DetalleRenderHeader = {

  render(c) {
    const nombre = BP_DetalleHelpers.displayName(c);

    // Avatar
    const avatarEl = document.getElementById('headerAvatar');
    avatarEl.textContent = BP_DetalleHelpers.initials(nombre);
    avatarEl.className   = `cliente-avatar ${BP_DetalleHelpers.avatarClass(c.tipo)}`;
    avatarEl.style.cssText = 'width:52px;height:52px;font-size:1.1rem;';

    // Nombre y badges
    document.getElementById('headerNombre').textContent = nombre;
    document.getElementById('headerRazonSocial').textContent =
      c.razonSocial || '';
    document.getElementById('headerTipoBadge').innerHTML =
      BP_DetalleHelpers.tipoBadge(c.tipo);
    document.getElementById('headerStatusBadge').innerHTML =
      BP_DetalleHelpers.statusBadge(c.status);

    // Botones header
    document.getElementById('headerEditBtn').href = `/clientes/${c.id}/editar`;
    document.getElementById('headerEditBtn').onclick = null;

    document.getElementById('headerNuevaCotBtn').href = 'javascript:void(0);';
    document.getElementById('headerNuevaCotBtn').onclick = () =>
    BP_DetalleHelpers.toast('info', 'Nueva cotización próximamente');

    // Acciones panel lateral
    document.getElementById('accionNuevaCot').href = 'javascript:void(0);';
    document.getElementById('accionNuevaCot').onclick = () =>
    BP_DetalleHelpers.toast('info', 'Nueva cotización próximamente');

    document.getElementById('accionNuevoEvt').href = 'javascript:void(0);';
    document.getElementById('accionNuevoEvt').onclick = () =>
      BP_DetalleEventoModal.open();

    document.getElementById('accionEditarCliente').href = `/clientes/${c.id}/editar`;
    document.getElementById('accionEditarCliente').onclick = null;

    document.getElementById('nuevaCotBtn').href = 'javascript:void(0);';
    document.getElementById('nuevaCotBtn').onclick = () =>
    BP_DetalleHelpers.toast('info', 'Nueva cotización próximamente');

    document.getElementById('nuevoEvtBtn').href = 'javascript:void(0);';
    document.getElementById('nuevoEvtBtn').onclick = () =>
      BP_DetalleEventoModal.open();

    document.getElementById('editContactosBtn').href = 'javascript:void(0);';
    document.getElementById('editContactosBtn').onclick = () =>
      BP_DetalleContactosModal.open();

    // Title
    document.title = `${nombre} | Black Production`;
  },

  renderSideInfo(c) {
    document.getElementById('sideInfoGeneral').innerHTML = `
      <div class="side-info-row">
        <span class="side-info-label">RFC</span>
        <span class="side-info-value rfc-text">${c.rfc || '—'}</span>
      </div>
      <div class="side-info-row">
        <span class="side-info-label">Tipo</span>
        <span class="side-info-value">${c.tipo}</span>
      </div>
      ${c.giro ? `
      <div class="side-info-row">
        <span class="side-info-label">Giro</span>
        <span class="side-info-value">${c.giro}</span>
      </div>` : ''}
      <div class="side-info-row">
        <span class="side-info-label">Alta</span>
        <span class="side-info-value">
          ${BP_DetalleHelpers.formatDate(c.creadoEn)}
        </span>
      </div>
      ${c.direccionFiscal?.regimenFiscal ? `
      <div class="side-info-row">
        <span class="side-info-label">Régimen</span>
        <span class="side-info-value small">
          ${c.direccionFiscal.regimenFiscal}
        </span>
      </div>` : ''}
      ${c.notas ? `
      <div class="mt-3 p-2 rounded" style="background:#f8f8ff;font-size:0.78rem;">
        <i class="mdi mdi-note-text-outline me-1 text-primary"></i>
        ${c.notas}
      </div>` : ''}`;
  },

  renderSideContactos(c) {
    const contactos = [];
    if (c.contactoPrincipal) {
      contactos.push({ ...c.contactoPrincipal, tipo: 'Principal' });
    }
    if (c.contactoAlternativo) {
      contactos.push({ ...c.contactoAlternativo, tipo: 'Alternativo' });
    }
    if (c.contactosAdicionales?.length) {
      c.contactosAdicionales.forEach((ct, i) =>
        contactos.push({ ...ct, tipo: `Adicional ${i + 1}` })
      );
    }

    if (!contactos.length) {
      document.getElementById('sideContactos').innerHTML =
        '<div class="p-3 text-muted small">Sin contactos registrados</div>';
      return;
    }

    document.getElementById('sideContactos').innerHTML =
      contactos.map(ct => `
        <div class="side-contacto-item">
          <div class="d-flex justify-content-between align-items-start">
            <div class="side-contacto-name">${ct.nombre || '—'}</div>
            <small class="text-muted">${ct.tipo}</small>
          </div>
          ${ct.cargo
            ? `<div class="side-contacto-cargo">${ct.cargo}</div>`
            : ''}
          ${ct.email ? `
          <div class="side-contacto-meta">
            <i class="mdi mdi-email-outline me-1"></i>
            <a href="mailto:${ct.email}">${ct.email}</a>
          </div>` : ''}
          ${ct.tel ? `
          <div class="side-contacto-meta">
            <i class="mdi mdi-phone-outline me-1"></i>
            <a href="tel:${ct.tel}">${ct.tel}</a>
          </div>` : ''}
          ${ct.whatsapp ? `
          <div class="side-contacto-meta">
            <i class="mdi mdi-whatsapp me-1"></i>
            <a href="https://wa.me/${ct.whatsapp.replace(/\D/g,'')}"
               target="_blank">${ct.whatsapp}</a>
          </div>` : ''}
        </div>`
      ).join('');
  },

  renderSideDirecciones(c) {
    let html = '';

    if (c.direccionFiscal) {
      const d = c.direccionFiscal;
      html += `
        <div class="mb-3">
          <small class="text-muted text-uppercase fw-semibold"
                 style="font-size:0.7rem;letter-spacing:.5px;">
            Fiscal
          </small>
          <div class="small mt-1">
            ${d.calle || ''},
            ${d.colonia || ''},
            ${d.ciudad || ''},
            ${d.estado || ''}
            ${d.cp ? `CP ${d.cp}` : ''}
          </div>
        </div>`;
    }

    if (c.direccionFisica) {
      const d = c.direccionFisica;
      html += `
        <hr class="my-2">
        <div>
          <small class="text-muted text-uppercase fw-semibold"
                 style="font-size:0.7rem;letter-spacing:.5px;">
            Física
          </small>
          <div class="small mt-1">
            ${d.calle || ''},
            ${d.colonia || ''},
            ${d.ciudad || ''},
            ${d.estado || ''}
            ${d.cp ? `CP ${d.cp}` : ''}
          </div>
        </div>`;
    }

    if (!html) {
      html = '<div class="text-muted small">Sin direcciones registradas</div>';
    }

    document.getElementById('sideDirecciones').innerHTML = html;
  },

  renderSidePreferencias(c) {
    const canales = c.canalesComunicacion || [];
    const iconMap = {
      'Email':      'mdi-email-outline',
      'WhatsApp':   'mdi-whatsapp',
      'Teléfono':   'mdi-phone-outline',
      'Presencial': 'mdi-account-outline'
    };

    document.getElementById('sidePreferencias').innerHTML = `
      ${c.formaPago ? `
      <div class="side-info-row">
        <span class="side-info-label">Forma Pago</span>
        <span class="side-info-value">${c.formaPago}</span>
      </div>` : ''}
      ${c.usoCfdi ? `
      <div class="side-info-row">
        <span class="side-info-label">Uso CFDI</span>
        <span class="side-info-value">${c.usoCfdi}</span>
      </div>` : ''}
      ${c.condicionesPago ? `
      <div class="side-info-row">
        <span class="side-info-label">Cond. Pago</span>
        <span class="side-info-value small text-muted">
          ${c.condicionesPago}
        </span>
      </div>` : ''}
      ${canales.length ? `
      <div class="mt-3">
        <small class="text-muted d-block mb-2">Canales preferidos</small>
        <div>
          ${canales.map(canal => `
            <span class="canal-badge">
              <i class="mdi ${iconMap[canal] || 'mdi-message-outline'}"></i>
              ${canal}
            </span>`).join('')}
        </div>
      </div>` : ''}`;
  }
};

/* =====================================================
   5. RENDER — STATS
   ===================================================== */

const BP_DetalleRenderStats = {

  render(c, cobranza) {
    // Calcular saldo pendiente
    let pendiente = 0;
    cobranza.forEach(cob => {
      cob.pagos.forEach(p => {
        if (p.status !== 'Pagado') pendiente += p.monto;
      });
    });

    const ticket = c.totalEventos
      ? Math.round(c.revenueTotal / c.totalEventos)
      : 0;

    document.getElementById('statEventos').textContent =
      c.totalEventos || 0;
    document.getElementById('statRevenue').textContent =
      BP_DetalleHelpers.formatCurrency(c.revenueTotal);
    document.getElementById('statPendiente').textContent =
      BP_DetalleHelpers.formatCurrency(pendiente);
    document.getElementById('statTicket').textContent =
      BP_DetalleHelpers.formatCurrency(ticket);
  }
};
/* =====================================================
   6. RENDER — TABS
   ===================================================== */

const BP_DetalleRenderTabs = {

  renderCotizaciones(cotizaciones) {
    document.getElementById('badgeCotizaciones').textContent =
      cotizaciones.length;

    if (!cotizaciones.length) {
      document.getElementById('cotizacionesList').innerHTML = `
        <div class="detalle-empty">
          <i class="mdi mdi-file-document-outline"></i>
          Sin cotizaciones registradas
        </div>`;
      return;
    }

    document.getElementById('cotizacionesList').innerHTML = `
      ${BP_DetalleHelpers.mockBadge()}
      <div class="detalle-timeline">
        ${cotizaciones.map(c => `
          <div class="detalle-timeline-item status-${c.status.toLowerCase().replace(' ','-')}">
            <div class="timeline-item-header">
              <div>
                <div class="timeline-item-title">
                  ${c.nombre}
                  <span class="ms-2">${BP_DetalleHelpers.cotStatusBadge(c.status)}</span>
                </div>
                <div class="timeline-item-meta">
                  <span class="font-monospace">${c.folio}</span>
                  <span class="mx-2">·</span>
                  <i class="mdi mdi-calendar-outline me-1"></i>
                  ${BP_DetalleHelpers.formatDate(c.fecha)}
                  <span class="mx-2">·</span>
                  Vigencia: ${BP_DetalleHelpers.formatDate(c.vigencia)}
                </div>
                ${c.notas ? `
                <div class="text-muted small mt-1">
                  <i class="mdi mdi-note-outline me-1"></i>${c.notas}
                </div>` : ''}
              </div>
              <div class="text-end">
                <div class="timeline-item-amount">
                  ${BP_DetalleHelpers.formatCurrency(c.total)}
                </div>
                <div class="d-flex gap-1 mt-1 justify-content-end">
                  <a href="/cotizaciones/vista-detalle-cotizacion.html?id=${c.id}"
                     class="btn btn-xs btn-outline-secondary"
                     style="font-size:.72rem;padding:2px 8px;">
                    <i class="mdi mdi-eye-outline me-1"></i>Ver
                  </a>
                  ${c.eventoId ? `
                  <a href="/eventos/vista-detalle-evento.html?id=${c.eventoId}"
                     class="btn btn-xs btn-outline-success"
                     style="font-size:.72rem;padding:2px 8px;">
                    <i class="mdi mdi-calendar-star me-1"></i>Evento
                  </a>` : ''}
                </div>
              </div>
            </div>
          </div>`
        ).join('')}
      </div>`;
  },

  renderEventos(eventos) {
    document.getElementById('badgeEventos').textContent = eventos.length;

    if (!eventos.length) {
      document.getElementById('eventosList').innerHTML = `
        <div class="detalle-empty">
          <i class="mdi mdi-calendar-blank-outline"></i>
          Sin eventos registrados
        </div>`;
      return;
    }

    document.getElementById('eventosList').innerHTML = `
      <div class="detalle-timeline">
        ${eventos.map(ev => `
          <div class="detalle-timeline-item status-${
            ev.status === 'Realizado' ? 'realizado' :
            ev.status === 'Cancelado' ? 'cancelada' : 'proceso'
          }">
            <div class="timeline-item-header">
              <div>
                <div class="timeline-item-title">
                  ${ev.nombre}
                  <span class="ms-2">
                    ${BP_DetalleHelpers.evtStatusBadge(ev.status)}
                  </span>
                </div>
                <div class="timeline-item-meta">
                  <i class="mdi mdi-calendar-outline me-1"></i>
                  ${BP_DetalleHelpers.formatDate(ev.fecha)}
                  <span class="mx-2">·</span>
                  <i class="mdi mdi-map-marker-outline me-1"></i>
                  ${ev.venue || '—'}
                </div>
                ${ev.cotizacionId ? `
                <div class="text-muted small mt-1">
                  <i class="mdi mdi-file-document-outline me-1"></i>
                  Cotización vinculada
                </div>` : ''}
              </div>
              <div class="text-end">
                <div class="timeline-item-amount">
                  ${BP_DetalleHelpers.formatCurrency(ev.total)}
                </div>
                <div class="d-flex gap-1 mt-1 justify-content-end">
                  <a href="/eventos/vista-detalle-evento.html?id=${ev.id}"
                     class="btn btn-xs btn-outline-secondary"
                     style="font-size:.72rem;padding:2px 8px;">
                    <i class="mdi mdi-eye-outline me-1"></i>Ver
                  </a>
                </div>
              </div>
            </div>
          </div>`
        ).join('')}
      </div>`;
  },

  renderCobranza(cobranza) {
    const pendientes = cobranza.reduce((acc, cob) =>
      acc + cob.pagos.filter(p => p.status !== 'Pagado').length, 0
    );
    document.getElementById('badgeCobranza').textContent = pendientes;

    if (!cobranza.length) {
      document.getElementById('cobranzaList').innerHTML = `
        <div class="detalle-empty">
          <i class="mdi mdi-cash-off"></i>
          Sin registros de cobranza
        </div>`;
      return;
    }

    document.getElementById('cobranzaList').innerHTML =
      `${BP_DetalleHelpers.mockBadge()}${cobranza.map(cob => {
        const pagado = cob.pagos
          .filter(p => p.status === 'Pagado')
          .reduce((a, p) => a + p.monto, 0);
        const pct = Math.round((pagado / cob.total) * 100);

        return `
          <div class="cobranza-card">
            <div class="cobranza-card-header">
              <div class="cobranza-evento-name">${cob.eventoNombre}</div>
              <div class="fw-bold text-primary">
                ${BP_DetalleHelpers.formatCurrency(cob.total)}
              </div>
            </div>
            <div class="cobranza-progress-row">
              <span>Cobrado: ${BP_DetalleHelpers.formatCurrency(pagado)}</span>
              <span>${pct}%</span>
            </div>
            <div class="cobranza-progress-bar">
              <div class="fill"
                   style="width:${pct}%;
                          background:${BP_DetalleHelpers.progressColor(pct)};">
              </div>
            </div>
            <div class="cobranza-pagos">
              ${cob.pagos.map(p => `
                <span class="pago-chip ${BP_DetalleHelpers.pagoStatusClass(p.status)}"
                      title="${p.concepto} — ${BP_DetalleHelpers.formatDate(p.fechaVencimiento)}">
                  ${p.concepto}: ${BP_DetalleHelpers.formatCurrency(p.monto)}
                  ${p.status !== 'Pagado'
                    ? `<i class="mdi mdi-clock-outline ms-1"></i>`
                    : `<i class="mdi mdi-check ms-1"></i>`}
                </span>`
              ).join('')}
            </div>
          </div>`;
      }).join('')}`;
  },

  renderRevenue(cliente, eventos) {
    const porAnio = {};
    eventos.forEach(ev => {
      if (ev.status !== 'Realizado') return;
      const anio = ev.fecha?.substring(0, 4) || 'Sin fecha';
      porAnio[anio] = (porAnio[anio] || 0) + ev.total;
    });

    const maxVal = Math.max(...Object.values(porAnio), 1);
    const anios  = Object.keys(porAnio).sort().reverse();

    document.getElementById('revenueContent').innerHTML = `
      ${BP_DetalleHelpers.mockBadge()}
      <!-- Resumen -->
      <div class="row g-3 mb-4">
        <div class="col-md-4">
          <div class="revenue-summary-box">
            <div class="revenue-summary-num">
              ${BP_DetalleHelpers.formatCurrency(cliente.revenueTotal)}
            </div>
            <div class="revenue-summary-label">Revenue Total</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="revenue-summary-box">
            <div class="revenue-summary-num">
              ${BP_DetalleHelpers.formatCurrency(
                cliente.totalEventos
                  ? Math.round(cliente.revenueTotal / cliente.totalEventos)
                  : 0
              )}
            </div>
            <div class="revenue-summary-label">Ticket Promedio</div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="revenue-summary-box">
            <div class="revenue-summary-num">${cliente.totalEventos || 0}</div>
            <div class="revenue-summary-label">Eventos Realizados</div>
          </div>
        </div>
      </div>

      <!-- Barras por año -->
      ${anios.length ? `
      <h6 class="text-muted text-uppercase small fw-semibold mb-3">
        Revenue por Año
      </h6>
      ${anios.map(anio => {
        const pct = Math.round((porAnio[anio] / maxVal) * 100);
        return `
          <div class="revenue-bar-row">
            <div class="revenue-bar-label">${anio}</div>
            <div class="revenue-bar-track">
              <div class="revenue-bar-fill" style="width:${pct}%"></div>
            </div>
            <div class="revenue-bar-amount">
              ${BP_DetalleHelpers.formatCurrency(porAnio[anio])}
            </div>
          </div>`;
      }).join('')}` : `
      <div class="detalle-empty">
        <i class="mdi mdi-chart-line"></i>
        Sin datos de revenue disponibles
      </div>`}`;
  },

  renderFacturacion(facturas) {
    if (!facturas.length) {
      document.getElementById('facturacionList').innerHTML = `
        <div class="detalle-empty">
          <i class="mdi mdi-receipt-text-outline"></i>
          Sin facturas registradas
        </div>`;
      return;
    }

    document.getElementById('facturacionList').innerHTML =
      `${BP_DetalleHelpers.mockBadge()}${facturas.map(f => `
        <div class="factura-row">
          <div>
            <div class="factura-folio">${f.folio}</div>
            <div class="small text-muted">${f.eventoNombre}</div>
            <div class="small text-muted font-monospace"
                 style="font-size:0.68rem;">
              UUID: ${f.uuid}
            </div>
          </div>
          <div class="text-end">
            <div class="fw-bold text-success">
              ${BP_DetalleHelpers.formatCurrency(f.monto)}
            </div>
            <div class="small text-muted">
              ${BP_DetalleHelpers.formatDate(f.fecha)}
            </div>
            <span class="badge-cot-aprobada">${f.status}</span>
          </div>
        </div>`
      ).join('')}`;
  }
};

/* =====================================================
   7. INICIALIZACIÓN
   ===================================================== */

const BP_DetalleClienteInit = {

  async reloadEventos() {
    const eventos = await BP_DetalleClienteAPI.getEventos();
    BP_DetalleRenderTabs.renderEventos(eventos);

    if (BP_DetalleCliente.cliente) {
      BP_DetalleCliente.cliente.totalEventos = eventos.length;
      BP_DetalleCliente.cliente.ultimoEvento = eventos[0]?.fecha || null;
      document.getElementById('statEventos').textContent = eventos.length;
    }
  },

  async run() {
    BP_DetalleCliente.clienteId =
      new URLSearchParams(window.location.search).get('id');

    if (!BP_DetalleCliente.clienteId) {
      window.location.href = '/clientes/catalogo';
      return;
    }

    this.bindEvents();
    await this.loadAll();
  },

  bindEvents() {
    document.getElementById('accionExportarCliente')
      .addEventListener('click', () => {
        BP_DetalleHelpers.toast('info', 'Función próximamente disponible');
      });
  },

  async loadAll() {
    try {
      BP_DetalleEventoModal.init();
      BP_DetalleContactosModal.init();

      // Cargar cliente
      const cliente = await BP_DetalleClienteAPI.getCliente(
        BP_DetalleCliente.clienteId
      );
      if (!cliente) throw new Error('Cliente no encontrado');
      BP_DetalleCliente.cliente = cliente;

      // Render cabecera y panel lateral
      BP_DetalleRenderHeader.render(cliente);
      BP_DetalleRenderHeader.renderSideInfo(cliente);
      BP_DetalleRenderHeader.renderSideContactos(cliente);
      BP_DetalleRenderHeader.renderSideDirecciones(cliente);
      BP_DetalleRenderHeader.renderSidePreferencias(cliente);

      // Cargar tabs en paralelo
      const [cotizaciones, eventos, cobranza, facturas] =
        await Promise.all([
          BP_DetalleClienteAPI.getCotizaciones(cliente.id),
          BP_DetalleClienteAPI.getEventos(cliente.id),
          BP_DetalleClienteAPI.getCobranza(cliente.id),
          BP_DetalleClienteAPI.getFacturas(cliente.id)
        ]);

      const revenueMock = eventos.reduce((acc, ev) => {
        return ev.status === 'Realizado' ? acc + (ev.total || 0) : acc;
      }, 0);
      cliente.revenueTotal = revenueMock;

      // Render stats
      BP_DetalleRenderStats.render(cliente, cobranza);

      // Render tabs
      BP_DetalleRenderTabs.renderCotizaciones(cotizaciones);
      BP_DetalleRenderTabs.renderEventos(eventos);
      BP_DetalleRenderTabs.renderCobranza(cobranza);
      BP_DetalleRenderTabs.renderRevenue(cliente, eventos);
      BP_DetalleRenderTabs.renderFacturacion(facturas);

    } catch (err) {
      console.error('[BP] Error loadAll:', err);
      BP_DetalleHelpers.toast('error',
        err.message || 'Error al cargar el cliente'
      );
      document.getElementById('headerNombre').textContent =
        'Error al cargar cliente';
    }
  }
};

/* =====================================================
   8. ARRANQUE
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  BP_DetalleClienteInit.run();
});
