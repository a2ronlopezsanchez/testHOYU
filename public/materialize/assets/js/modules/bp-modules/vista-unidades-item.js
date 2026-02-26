/* =====================================================
   VISTA UNIDADES ITEM — Black Production
   vista-unidades-item.js
   ===================================================== */

'use strict';

/* =====================================================
   1. CONFIGURACIÓN GLOBAL
   ===================================================== */

const BP_Units = {

  // ── Cambiar a false cuando tengas API real ──
  USE_MOCK: true,

  // ── URL base de tu API ──
  API_BASE: '/api/v1',

  // ── ID del ítem actual (se lee de la URL) ──
  itemId: null,

  // ── Datos en memoria ──
  currentItem: null,
  allUnits: [],
  filteredUnits: [],

  // ── Paginación ──
  pagination: {
    currentPage: 1,
    perPage: 10,
    total: 0
  },

  // ── Filtros activos ──
  filters: {
    search: '',
    status: 'all',
    condition: 'all'
  }
};

/* =====================================================
   2. DATOS MOCK
   ===================================================== */

const MOCK_ITEM = {
  id: 'ITEM-001',
  name: 'Tripié de Aluminio Pro',
  brand: 'Manfrotto',
  model: '055XPRO3',
  sku: 'TPP-MAN-055',
  category: 'Soportes',
  description: 'Tripié profesional de aluminio de 3 secciones con cabeza ball incluida. Ideal para fotografía y video en exteriores.',
  image: '/public/materialize/assets/img/products/card-weekly-sales-watch.png',
  specs: [
    { label: 'Material', value: 'Aluminio 6061' },
    { label: 'Altura máx.', value: '190 cm' },
    { label: 'Carga máx.', value: '8 kg' },
    { label: 'Peso', value: '2.1 kg' },
    { label: 'Secciones', value: '3' }
  ],
  totalUnits: 12,
  stats: {
    total: 12,
    available: 7,
    assigned: 3,
    maintenance: 2
  },
  maintenance: {
    total: 5,
    current: 2,
    lastDate: '2025-01-15'
  },
  upcomingEvents: [
    { id: 'EVT-001', name: 'Boda García & López', date: '2025-02-10', unitsNeeded: 4 },
    { id: 'EVT-002', name: 'Sesión Corporativa Nike', date: '2025-02-18', unitsNeeded: 2 },
    { id: 'EVT-003', name: 'Fashion Show Primavera', date: '2025-03-05', unitsNeeded: 6 }
  ],
  alerts: [
    { type: 'warning', message: '2 unidades sin mantenimiento hace +90 días' },
    { type: 'info', message: '1 unidad con RFID sin asignar' }
  ]
};

const MOCK_UNITS = [
  { id: 'U-001', serial: 'TPP-001', rfid: 'RF-L-0001', status: 'Disponible',    condition: 'Excelente',    location: 'Almacén A-1', lastUse: '2025-01-20', nextEvent: null,          notes: '' },
  { id: 'U-002', serial: 'TPP-002', rfid: 'RF-L-0002', status: 'Disponible',    condition: 'Bueno',        location: 'Almacén A-1', lastUse: '2025-01-15', nextEvent: null,          notes: '' },
  { id: 'U-003', serial: 'TPP-003', rfid: 'RF-L-0003', status: 'Asignado',      condition: 'Bueno',        location: 'Evento EVT-001', lastUse: '2025-02-01', nextEvent: 'Boda García', notes: '' },
  { id: 'U-004', serial: 'TPP-004', rfid: 'RF-L-0004', status: 'Asignado',      condition: 'Excelente',    location: 'Evento EVT-001', lastUse: '2025-02-01', nextEvent: 'Boda García', notes: '' },
  { id: 'U-005', serial: 'TPP-005', rfid: 'RF-L-0005', status: 'En Mantenimiento', condition: 'En Reparación', location: 'Taller',     lastUse: '2024-12-10', nextEvent: null,          notes: 'Pata rota' },
  { id: 'U-006', serial: 'TPP-006', rfid: 'RF-L-0006', status: 'Disponible',    condition: 'Bueno',        location: 'Almacén A-2', lastUse: '2025-01-28', nextEvent: null,          notes: '' },
  { id: 'U-007', serial: 'TPP-007', rfid: 'RF-L-0007', status: 'Disponible',    condition: 'Regular',      location: 'Almacén A-2', lastUse: '2025-01-05', nextEvent: null,          notes: 'Revisar tornillo' },
  { id: 'U-008', serial: 'TPP-008', rfid: 'RF-L-0008', status: 'Asignado',      condition: 'Excelente',    location: 'Evento EVT-002', lastUse: '2025-02-02', nextEvent: 'Sesión Nike', notes: '' },
  { id: 'U-009', serial: 'TPP-009', rfid: 'RF-L-0009', status: 'Disponible',    condition: 'Bueno',        location: 'Almacén A-1', lastUse: '2025-01-22', nextEvent: null,          notes: '' },
  { id: 'U-010', serial: 'TPP-010', rfid: 'RF-L-0010', status: 'Disponible',    condition: 'Excelente',    location: 'Almacén A-3', lastUse: '2025-01-30', nextEvent: null,          notes: '' },
  { id: 'U-011', serial: 'TPP-011', rfid: 'RF-L-0011', status: 'En Mantenimiento', condition: 'Regular',   location: 'Taller',       lastUse: '2024-11-20', nextEvent: null,          notes: 'Cambio de cabeza' },
  { id: 'U-012', serial: 'TPP-012', rfid: '',           status: 'Disponible',    condition: 'Bueno',        location: 'Almacén A-3', lastUse: '2025-01-18', nextEvent: null,          notes: 'Sin RFID asignado' }
];

/* =====================================================
   3. CAPA DE DATOS (API o MOCK)
   ===================================================== */

const BP_API = {

  /**
   * Obtiene el ítem con sus stats
   */
  async getItem(itemId) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve({ ...MOCK_ITEM, id: itemId }), 400);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}`);
    if (!res.ok) throw new Error('Error al cargar el ítem');
    return res.json();
  },

  /**
   * Obtiene todas las unidades de un ítem
   */
  async getUnits(itemId) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve([...MOCK_UNITS]), 600);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}/units`);
    if (!res.ok) throw new Error('Error al cargar unidades');
    return res.json();
  },

  /**
   * Crea una nueva unidad
   */
  async createUnit(itemId, data) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        const newUnit = {
          id: 'U-' + String(MOCK_UNITS.length + 1).padStart(3, '0'),
          serial: data.serial || '',
          rfid: data.rfid || '',
          status: data.status || 'Disponible',
          condition: data.condition || 'Bueno',
          location: data.location || '',
          lastUse: null,
          nextEvent: null,
          notes: data.notes || '',
          purchaseDate: data.purchaseDate || null
        };
        MOCK_UNITS.push(newUnit);
        setTimeout(() => resolve(newUnit), 300);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al crear unidad');
    return res.json();
  },

  /**
   * Actualiza una unidad existente
   */
  async updateUnit(itemId, unitId, data) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        const idx = MOCK_UNITS.findIndex(u => u.id === unitId);
        if (idx !== -1) {
          MOCK_UNITS[idx] = { ...MOCK_UNITS[idx], ...data };
        }
        setTimeout(() => resolve(MOCK_UNITS[idx] || null), 300);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}/units/${unitId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Error al actualizar unidad');
    return res.json();
  },

  /**
   * Elimina una unidad
   */
  async deleteUnit(itemId, unitId) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        const idx = MOCK_UNITS.findIndex(u => u.id === unitId);
        if (idx !== -1) MOCK_UNITS.splice(idx, 1);
        setTimeout(() => resolve({ success: true }), 300);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}/units/${unitId}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error al eliminar unidad');
    return res.json();
  },

  /**
   * Obtiene el historial de una unidad
   */
  async getUnitHistory(itemId, unitId) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        const history = [
          { date: '2025-02-01', action: 'Asignado a evento', detail: 'Boda García & López', user: 'Nach Díaz' },
          { date: '2025-01-20', action: 'Regresó a almacén', detail: 'Sesión Corporativa', user: 'Nach Díaz' },
          { date: '2025-01-05', action: 'Mantenimiento preventivo', detail: 'Limpieza y ajuste de cabeza', user: 'Técnico 1' },
          { date: '2024-12-15', action: 'Asignado a evento', detail: 'Quinceañera Martínez', user: 'Nach Díaz' },
          { date: '2024-12-01', action: 'Ingresó al inventario', detail: 'Compra inicial', user: 'Admin' }
        ];
        setTimeout(() => resolve(history), 400);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items/${itemId}/units/${unitId}/history`);
    if (!res.ok) throw new Error('Error al cargar historial');
    return res.json();
  }
};
/* =====================================================
   4. HELPERS / UTILIDADES
   ===================================================== */

const BP_Helpers = {

  /**
   * Lee parámetro de la URL
   */
  getUrlParam(param) {
    const url = new URLSearchParams(window.location.search);
    return url.get(param);
  },

  /**
   * Formatea fecha legible
   */
  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  },

  /**
   * Badge HTML según estado
   */
  statusBadge(status) {
    const map = {
      'Disponible':       '<span class="badge-status-disponible">Disponible</span>',
      'Asignado':         '<span class="badge-status-asignado">Asignado</span>',
      'En Mantenimiento': '<span class="badge-status-mantenimiento">En Mantenimiento</span>'
    };
    return map[status] || `<span class="badge bg-secondary">${status}</span>`;
  },

  /**
   * Badge HTML según condición
   */
  conditionBadge(condition) {
    const map = {
      'Excelente':    '<span class="badge-condition-excelente">Excelente</span>',
      'Bueno':        '<span class="badge-condition-bueno">Bueno</span>',
      'Regular':      '<span class="badge-condition-regular">Regular</span>',
      'En Reparación':'<span class="badge-condition-reparacion">En Reparación</span>'
    };
    return map[condition] || `<span class="badge bg-secondary">${condition}</span>`;
  },

  /**
   * Muestra toast de éxito o error usando SweetAlert2
   */
  toast(icon, title) {
    if (typeof Swal === 'undefined') {
      alert(title);
      return;
    }
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  },

  /**
   * Confirmación con SweetAlert2
   */
  async confirm(title, text, confirmText = 'Sí, continuar') {
    if (typeof Swal === 'undefined') {
      return window.confirm(title + '\n' + text);
    }
    const result = await Swal.fire({
      title,
      text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#696cff',
      cancelButtonColor: '#8592a3'
    });
    return result.isConfirmed;
  },

  /**
   * Trunca texto largo
   */
  truncate(str, max = 30) {
    if (!str) return '—';
    return str.length > max ? str.substring(0, max) + '…' : str;
  }
};

/* =====================================================
   5. RENDER — CABECERA E INFO DEL ÍTEM
   ===================================================== */

const BP_RenderItem = {

  render(item) {
    // Cabecera
    document.getElementById('pageItemName').textContent    = item.name;
    document.getElementById('pageItemBrand').textContent   = item.brand;
    document.getElementById('pageItemCategory').textContent = item.category;
    document.getElementById('pageItemTotal').textContent   = item.stats.total;

    // Info general
    document.getElementById('infoCategory').textContent    = item.category;
    document.getElementById('infoBrand').textContent       = item.brand;
    document.getElementById('infoModel').textContent       = item.model;
    document.getElementById('infoSku').textContent         = item.sku;
    document.getElementById('infoDescription').textContent = item.description;

    // Imagen
    if (item.image) {
      document.getElementById('itemMainImage').src = item.image;
    }

    // Especificaciones
    const specsEl = document.getElementById('infoSpecs');
    if (item.specs && item.specs.length) {
      specsEl.innerHTML = item.specs.map(s =>
        `<li class="mb-1">
          <span class="text-muted">${s.label}:</span>
          <span class="ms-1 fw-medium">${s.value}</span>
        </li>`
      ).join('');
    } else {
      specsEl.innerHTML = '<li class="text-muted">Sin especificaciones</li>';
    }

    // Stats rápidas
    document.getElementById('statTotal').textContent       = item.stats.total;
    document.getElementById('statAvailable').textContent   = item.stats.available;
    document.getElementById('statAssigned').textContent    = item.stats.assigned;
    document.getElementById('statMaintenance').textContent = item.stats.maintenance;

    // Panel mantenimiento
    document.getElementById('sideMaintenanceTotal').textContent   = item.maintenance.total;
    document.getElementById('sideMaintenanceCurrent').textContent = item.maintenance.current;
    document.getElementById('sideMaintenanceLast').textContent    =
      BP_Helpers.formatDate(item.maintenance.lastDate);

    // Próximos eventos
    this.renderUpcomingEvents(item.upcomingEvents);

    // Alertas
    this.renderAlerts(item.alerts);

    // Botón editar
    document.getElementById('editItemBtn').addEventListener('click', () => {
      window.location.href = `formulario-item-completo.html?mode=edit&id=${item.id}`;
    });
  },

  renderUpcomingEvents(events) {
    const el = document.getElementById('sideUpcomingEvents');
    if (!events || events.length === 0) {
      el.innerHTML = `
        <li class="list-group-item text-center py-3 text-muted">
          <i class="mdi mdi-calendar-blank-outline mdi-24px d-block mb-1"></i>
          Sin eventos próximos
        </li>`;
      return;
    }
    el.innerHTML = events.map(ev => `
      <li class="list-group-item">
        <div class="side-event-name">${BP_Helpers.truncate(ev.name, 28)}</div>
        <div class="d-flex justify-content-between align-items-center mt-1">
          <span class="side-event-date">
            <i class="mdi mdi-calendar-outline me-1"></i>
            ${BP_Helpers.formatDate(ev.date)}
          </span>
          <span class="side-event-units">
            <i class="mdi mdi-package-variant me-1"></i>
            ${ev.unitsNeeded} uds.
          </span>
        </div>
      </li>`
    ).join('');
  },

  renderAlerts(alerts) {
    const el = document.getElementById('sideAlerts');
    if (!alerts || alerts.length === 0) {
      el.innerHTML = `
        <li class="list-group-item text-center py-3 text-muted">
          <i class="mdi mdi-check-circle-outline mdi-24px d-block mb-1 text-success"></i>
          Sin alertas activas
        </li>`;
      return;
    }
    const iconMap = {
      warning: 'mdi-alert-outline text-warning',
      info:    'mdi-information-outline text-info',
      danger:  'mdi-close-circle-outline text-danger'
    };
    el.innerHTML = alerts.map(a => `
      <li class="list-group-item">
        <i class="mdi ${iconMap[a.type] || 'mdi-bell-outline'} alert-item-icon"></i>
        ${a.message}
      </li>`
    ).join('');
  }
};

/* =====================================================
   6. RENDER — TABLA DE UNIDADES
   ===================================================== */

const BP_RenderUnits = {

  /**
   * Aplica filtros y recalcula paginación
   */
  applyFilters() {
    const { search, status, condition } = BP_Units.filters;
    const q = search.toLowerCase().trim();

    BP_Units.filteredUnits = BP_Units.allUnits.filter(u => {
      const matchSearch = !q ||
        u.serial.toLowerCase().includes(q) ||
        u.rfid.toLowerCase().includes(q) ||
        (u.location || '').toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q);

      const matchStatus    = status === 'all'    || u.status === status;
      const matchCondition = condition === 'all' || u.condition === condition;

      return matchSearch && matchStatus && matchCondition;
    });

    BP_Units.pagination.total       = BP_Units.filteredUnits.length;
    BP_Units.pagination.currentPage = 1;
    this.render();
  },

  /**
   * Renderiza la tabla con paginación
   */
  render() {
    const { currentPage, perPage, total } = BP_Units.pagination;
    const start  = (currentPage - 1) * perPage;
    const end    = Math.min(start + perPage, total);
    const pageUnits = BP_Units.filteredUnits.slice(start, end);

    const tbody = document.getElementById('unitsTableBody');

    if (pageUnits.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="units-empty-state">
              <i class="mdi mdi-package-variant-closed-remove"></i>
              No se encontraron unidades con los filtros aplicados
            </div>
          </td>
        </tr>`;
    } else {
      tbody.innerHTML = pageUnits.map((u, i) => `
        <tr data-unit-id="${u.id}">
          <td class="text-muted">${start + i + 1}</td>
          <td>
            <div class="fw-medium font-monospace small">${u.serial || '—'}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              ${u.rfid ? `<i class="mdi mdi-nfc me-1"></i>${u.rfid}` : '<span class="text-danger">Sin RFID</span>'}
            </div>
          </td>
          <td>${BP_Helpers.statusBadge(u.status)}</td>
          <td>${BP_Helpers.conditionBadge(u.condition)}</td>
          <td>
            <span title="${u.location || ''}">${BP_Helpers.truncate(u.location, 22)}</span>
          </td>
          <td class="text-muted small">${BP_Helpers.formatDate(u.lastUse)}</td>
          <td class="small">
            ${u.nextEvent
              ? `<span class="text-primary">${BP_Helpers.truncate(u.nextEvent, 18)}</span>`
              : '<span class="text-muted">—</span>'}
          </td>
          <td class="text-center">
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-icon btn-sm btn-outline-secondary unit-action-btn"
                      title="Ver historial"
                      onclick="BP_Actions.openHistory('${u.id}')">
                <i class="mdi mdi-history"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-outline-primary unit-action-btn"
                      title="Editar unidad"
                      onclick="BP_Actions.openEditUnit('${u.id}')">
                <i class="mdi mdi-pencil-outline"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-outline-danger unit-action-btn"
                      title="Eliminar unidad"
                      onclick="BP_Actions.deleteUnit('${u.id}')">
                <i class="mdi mdi-trash-can-outline"></i>
              </button>
            </div>
          </td>
        </tr>`
      ).join('');
    }

    // Contador label
    document.getElementById('unitsCountLabel').textContent =
      `${total} unidad${total !== 1 ? 'es' : ''} encontrada${total !== 1 ? 's' : ''}`;

    // Footer paginación
    document.getElementById('showingFrom').textContent  = total === 0 ? 0 : start + 1;
    document.getElementById('showingTo').textContent    = end;
    document.getElementById('totalUnits').textContent   = total;

    this.renderPagination();
  },

  /**
   * Renderiza los botones de paginación
   */
  renderPagination() {
    const { currentPage, perPage, total } = BP_Units.pagination;
    const totalPages = Math.ceil(total / perPage) || 1;
    const pagination = document.getElementById('unitsPagination');

    let html = `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}" id="prevUnitPage">
        <a class="page-link" href="javascript:void(0);" onclick="BP_RenderUnits.goToPage(${currentPage - 1})">
          <i class="mdi mdi-chevron-left"></i>
        </a>
      </li>`;

    const range = this.pageRange(currentPage, totalPages);
    range.forEach(p => {
      if (p === '...') {
        html += `<li class="page-item disabled"><a class="page-link">…</a></li>`;
      } else {
        html += `
          <li class="page-item ${p === currentPage ? 'active' : ''}">
            <a class="page-link" href="javascript:void(0);"
               onclick="BP_RenderUnits.goToPage(${p})">${p}</a>
          </li>`;
      }
    });

    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}" id="nextUnitPage">
        <a class="page-link" href="javascript:void(0);" onclick="BP_RenderUnits.goToPage(${currentPage + 1})">
          <i class="mdi mdi-chevron-right"></i>
        </a>
      </li>`;

    pagination.innerHTML = html;
  },

  /**
   * Genera rango de páginas con elipsis
   */
  pageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', current-1, current, current+1, '...', total];
  },

  /**
   * Cambia de página
   */
  goToPage(page) {
    const totalPages = Math.ceil(BP_Units.pagination.total / BP_Units.pagination.perPage) || 1;
    if (page < 1 || page > totalPages) return;
    BP_Units.pagination.currentPage = page;
    this.render();
  }
};
/* =====================================================
   7. ACCIONES — MODAL AGREGAR / EDITAR UNIDAD
   ===================================================== */

const BP_Actions = {

  /**
   * Abre modal para agregar nueva unidad
   */
  openAddUnit() {
    document.getElementById('unitModalTitle').textContent = 'Agregar Unidad';
    document.getElementById('unitForm').reset();
    document.getElementById('unitFormId').value = '';
    document.getElementById('unitCondition').value = 'Bueno';
    document.getElementById('unitStatus').value = 'Disponible';
    const modal = new bootstrap.Modal(document.getElementById('unitModal'));
    modal.show();
  },

  /**
   * Abre modal para editar unidad existente
   */
  openEditUnit(unitId) {
    const unit = BP_Units.allUnits.find(u => u.id === unitId);
    if (!unit) {
      BP_Helpers.toast('error', 'Unidad no encontrada');
      return;
    }
    document.getElementById('unitModalTitle').textContent = `Editar Unidad — ${unit.serial || unitId}`;
    document.getElementById('unitFormId').value        = unit.id;
    document.getElementById('unitSerial').value        = unit.serial || '';
    document.getElementById('unitRfid').value          = unit.rfid || '';
    document.getElementById('unitStatus').value        = unit.status || 'Disponible';
    document.getElementById('unitCondition').value     = unit.condition || 'Bueno';
    document.getElementById('unitLocation').value      = unit.location || '';
    document.getElementById('unitPurchaseDate').value  = unit.purchaseDate || '';
    document.getElementById('unitNotes').value         = unit.notes || '';
    const modal = new bootstrap.Modal(document.getElementById('unitModal'));
    modal.show();
  },

  /**
   * Guarda unidad (crear o actualizar)
   */
  async saveUnit() {
    const unitId = document.getElementById('unitFormId').value;
    const data = {
      serial:       document.getElementById('unitSerial').value.trim(),
      rfid:         document.getElementById('unitRfid').value.trim(),
      status:       document.getElementById('unitStatus').value,
      condition:    document.getElementById('unitCondition').value,
      location:     document.getElementById('unitLocation').value.trim(),
      purchaseDate: document.getElementById('unitPurchaseDate').value,
      notes:        document.getElementById('unitNotes').value.trim()
    };

    // Validación básica
    if (!data.serial) {
      BP_Helpers.toast('warning', 'El número de serie es obligatorio');
      document.getElementById('unitSerial').focus();
      return;
    }

    const saveBtn = document.getElementById('saveUnitBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

    try {
      if (unitId) {
        // Editar
        await BP_API.updateUnit(BP_Units.itemId, unitId, data);
        BP_Helpers.toast('success', 'Unidad actualizada correctamente');
      } else {
        // Crear
        await BP_API.createUnit(BP_Units.itemId, data);
        BP_Helpers.toast('success', 'Unidad agregada correctamente');
      }

      // Cerrar modal y recargar
      bootstrap.Modal.getInstance(document.getElementById('unitModal')).hide();
      await BP_Init.loadUnits();
      await BP_Init.loadItem();

    } catch (err) {
      BP_Helpers.toast('error', err.message || 'Error al guardar la unidad');
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<i class="mdi mdi-content-save me-1"></i>Guardar Unidad';
    }
  },

  /**
   * Elimina una unidad con confirmación
   */
  async deleteUnit(unitId) {
    const unit = BP_Units.allUnits.find(u => u.id === unitId);
    const label = unit ? unit.serial || unitId : unitId;

    const confirmed = await BP_Helpers.confirm(
      '¿Eliminar unidad?',
      `Se eliminará la unidad "${label}" permanentemente. Esta acción no se puede deshacer.`,
      'Sí, eliminar'
    );
    if (!confirmed) return;

    try {
      await BP_API.deleteUnit(BP_Units.itemId, unitId);
      BP_Helpers.toast('success', `Unidad "${label}" eliminada`);
      await BP_Init.loadUnits();
      await BP_Init.loadItem();
    } catch (err) {
      BP_Helpers.toast('error', err.message || 'Error al eliminar la unidad');
    }
  },

  /**
   * Abre modal de historial de una unidad
   */
  async openHistory(unitId) {
    const unit = BP_Units.allUnits.find(u => u.id === unitId);
    const label = unit ? `${unit.serial || unitId}` : unitId;

    document.getElementById('unitHistoryTitle').textContent = `Historial — ${label}`;
    document.getElementById('unitHistoryBody').innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary"></div>
        <p class="text-muted mt-2 small">Cargando historial...</p>
      </div>`;

    const modal = new bootstrap.Modal(document.getElementById('unitHistoryModal'));
    modal.show();

    try {
      const history = await BP_API.getUnitHistory(BP_Units.itemId, unitId);
      this.renderHistory(history, unit);
    } catch (err) {
      document.getElementById('unitHistoryBody').innerHTML = `
        <div class="alert alert-danger">
          <i class="mdi mdi-alert-circle-outline me-2"></i>
          Error al cargar el historial: ${err.message}
        </div>`;
    }
  },

  /**
   * Renderiza el contenido del modal de historial
   */
  renderHistory(history, unit) {
    const infoHtml = unit ? `
      <div class="d-flex gap-3 align-items-center mb-4 p-3 bg-light rounded">
        <div>
          <div class="fw-semibold">${unit.serial || unit.id}</div>
          <div class="small text-muted">
            ${BP_Helpers.statusBadge(unit.status)}
            <span class="ms-1">${BP_Helpers.conditionBadge(unit.condition)}</span>
          </div>
        </div>
        <div class="ms-auto text-end small text-muted">
          <div><i class="mdi mdi-nfc me-1"></i>${unit.rfid || 'Sin RFID'}</div>
          <div><i class="mdi mdi-map-marker-outline me-1"></i>${unit.location || '—'}</div>
        </div>
      </div>` : '';

    if (!history || history.length === 0) {
      document.getElementById('unitHistoryBody').innerHTML = infoHtml + `
        <div class="text-center py-3 text-muted">
          <i class="mdi mdi-history mdi-36px d-block mb-2"></i>
          Sin historial registrado
        </div>`;
      return;
    }

    const timelineHtml = `
      <div class="history-timeline">
        ${history.map(h => `
          <div class="history-timeline-item">
            <div class="history-action">${h.action}</div>
            <div class="history-detail">${h.detail || ''}</div>
            <div class="d-flex justify-content-between mt-1">
              <span class="history-date">
                <i class="mdi mdi-clock-outline me-1"></i>${BP_Helpers.formatDate(h.date)}
              </span>
              ${h.user ? `<span class="history-date">
                <i class="mdi mdi-account-outline me-1"></i>${h.user}
              </span>` : ''}
            </div>
          </div>`
        ).join('')}
      </div>`;

    document.getElementById('unitHistoryBody').innerHTML = infoHtml + timelineHtml;
  },

  /**
   * Exporta unidades a CSV
   */
  exportUnits() {
    const units = BP_Units.filteredUnits;
    if (!units.length) {
      BP_Helpers.toast('warning', 'No hay unidades para exportar');
      return;
    }
    const headers = ['ID', 'Serial', 'RFID', 'Estado', 'Condición', 'Ubicación', 'Último Uso', 'Notas'];
    const rows = units.map(u => [
      u.id, u.serial, u.rfid, u.status, u.condition,
      u.location, u.lastUse || '', u.notes || ''
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `unidades-${BP_Units.itemId}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    BP_Helpers.toast('success', 'Exportación completada');
  }
};

/* =====================================================
   8. INICIALIZACIÓN
   ===================================================== */

const BP_Init = {

  /**
   * Carga datos del ítem y renderiza cabecera
   */
  async loadItem() {
    try {
      const item = await BP_API.getItem(BP_Units.itemId);
      BP_Units.currentItem = item;
      BP_RenderItem.render(item);
    } catch (err) {
      document.getElementById('pageItemName').textContent = 'Error al cargar ítem';
      console.error('[BP] Error loadItem:', err);
    }
  },

  /**
   * Carga unidades y renderiza tabla
   */
  async loadUnits() {
    document.getElementById('unitsTableBody').innerHTML = `
      <tr class="units-loading-row">
        <td colspan="8">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          <span class="text-muted">Cargando unidades...</span>
        </td>
      </tr>`;
    try {
      const units = await BP_API.getUnits(BP_Units.itemId);
      BP_Units.allUnits = units;
      BP_Units.filteredUnits = [...units];
      BP_Units.pagination.total = units.length;
      BP_RenderUnits.applyFilters();
    } catch (err) {
      document.getElementById('unitsTableBody').innerHTML = `
        <tr>
          <td colspan="8">
            <div class="alert alert-danger m-3">
              <i class="mdi mdi-alert-circle-outline me-2"></i>
              Error al cargar unidades: ${err.message}
            </div>
          </td>
        </tr>`;
      console.error('[BP] Error loadUnits:', err);
    }
  },

  /**
   * Registra todos los event listeners
   */
  bindEvents() {

    // Botones agregar unidad
    document.getElementById('addUnitBtn')
      .addEventListener('click', () => BP_Actions.openAddUnit());
    document.getElementById('sideAddUnitBtn')
      .addEventListener('click', () => BP_Actions.openAddUnit());

    // Guardar unidad (modal)
    document.getElementById('saveUnitBtn')
      .addEventListener('click', () => BP_Actions.saveUnit());

    // Exportar
    document.getElementById('exportUnitsBtn')
      .addEventListener('click', () => BP_Actions.exportUnits());

    // Búsqueda con debounce
    let searchTimer;
    document.getElementById('unitsSearchInput')
      .addEventListener('input', function () {
        const clearBtn = document.getElementById('clearUnitsSearch');
        clearBtn.classList.toggle('d-none', !this.value);
        clearTimer();
        searchTimer = setTimeout(() => {
          BP_Units.filters.search = this.value;
          BP_RenderUnits.applyFilters();
        }, 300);
      });

    function clearTimer() {
      if (searchTimer) clearTimeout(searchTimer);
    }

    // Limpiar búsqueda
    document.getElementById('clearUnitsSearch')
      .addEventListener('click', function () {
        document.getElementById('unitsSearchInput').value = '';
        this.classList.add('d-none');
        BP_Units.filters.search = '';
        BP_RenderUnits.applyFilters();
      });

    // Filtro estado
    document.getElementById('statusFilterSelect')
      .addEventListener('change', function () {
        BP_Units.filters.status = this.value;
        BP_RenderUnits.applyFilters();
      });

    // Filtro condición
    document.getElementById('conditionFilterSelect')
      .addEventListener('change', function () {
        BP_Units.filters.condition = this.value;
        BP_RenderUnits.applyFilters();
      });

    // Limpiar todos los filtros
    document.getElementById('clearAllUnitsFilters')
      .addEventListener('click', () => {
        document.getElementById('unitsSearchInput').value = '';
        document.getElementById('clearUnitsSearch').classList.add('d-none');
        document.getElementById('statusFilterSelect').value = 'all';
        document.getElementById('conditionFilterSelect').value = 'all';
        BP_Units.filters = { search: '', status: 'all', condition: 'all' };
        BP_RenderUnits.applyFilters();
      });

    // Botones placeholder panel lateral
    document.getElementById('assignToEventBtn')
      .addEventListener('click', () => BP_Helpers.toast('info', 'Función próximamente disponible'));
    document.getElementById('printRfidBtn')
      .addEventListener('click', () => BP_Helpers.toast('info', 'Función próximamente disponible'));
    document.getElementById('generateReportBtn')
      .addEventListener('click', () => BP_Helpers.toast('info', 'Función próximamente disponible'));
  },

  /**
   * Punto de entrada principal
   */
  async run() {
    // Leer ID del ítem desde URL (?id=ITEM-001)
    BP_Units.itemId = BP_Helpers.getUrlParam('id') || 'ITEM-001';

    // Registrar eventos
    this.bindEvents();

    // Cargar datos en paralelo
    await Promise.all([
      this.loadItem(),
      this.loadUnits()
    ]);
  }
};

/* =====================================================
   9. ARRANQUE
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  BP_Init.run();
});
/* =====================================================
   MÓDULO: SELECCIONAR ÍTEM DEL CATÁLOGO
   ===================================================== */

/* ─────────────────────────────────────────────────────
   1. DATOS MOCK DEL CATÁLOGO
   (Reemplazar con fetch a tu API cuando esté lista)
───────────────────────────────────────────────────── */

const MOCK_CATALOG = [
  { id: 'FA001', sku: 'BP100202', name: 'MAQUINA DE HUMO | ANTARI | ID FA001',         category: 'FX',             active: true  },
  { id: 'GG335', sku: 'BP100469', name: 'CHAVETA | GENERICO | GROUND SUPPORT | ID GG335', category: 'GROUND SUPPORT', active: true  },
  { id: 'MS092', sku: 'BP100740', name: 'MICROFONO DINAMICO | SAMSON | QTOM | ID MS092',  category: 'MICROFONIA',     active: true  },
  { id: 'GG422', sku: 'BP100826', name: 'CHAVETA | GENERICO | GROUND SUPPORT | ID GG422', category: 'GROUND SUPPORT', active: true  },
  { id: 'AG694', sku: 'BP101419', name: 'CARGADOR DE 160 CM | GENERICO | ID AG694',       category: 'ACCESORIOS',     active: true  },
  { id: 'LT011', sku: 'BP100311', name: 'CABEZA MOVIL | ROBE | ROBIN 600 | ID LT011',     category: 'ILUMINACION',    active: true  },
  { id: 'LT042', sku: 'BP100388', name: 'PAR LED | CHAUVET | COLORADO 1 | ID LT042',      category: 'ILUMINACION',    active: true  },
  { id: 'AU019', sku: 'BP100512', name: 'CONSOLA DE AUDIO | YAMAHA | CL5 | ID AU019',     category: 'AUDIO',          active: true  },
  { id: 'AU033', sku: 'BP100601', name: 'MONITOR DE PISO | QSC | K12.2 | ID AU033',       category: 'AUDIO',          active: true  },
  { id: 'VD007', sku: 'BP100755', name: 'PANTALLA LED | ROE | CB5 | ID VD007',            category: 'VIDEO',          active: true  },
  { id: 'GG101', sku: 'BP100830', name: 'TRUSS CUADRADO | GLOBAL TRUSS | F34 | ID GG101', category: 'GROUND SUPPORT', active: false },
  { id: 'FX022', sku: 'BP100944', name: 'LANZADOR DE CO2 | MAGIC FX | ID FX022',          category: 'FX',             active: true  },
  { id: 'AC055', sku: 'BP101100', name: 'CABLE XLR | NEUTRIK | 10M | ID AC055',           category: 'ACCESORIOS',     active: true  },
  { id: 'AC078', sku: 'BP101205', name: 'ADAPTADOR IEC | GENERICO | ID AC078',            category: 'ACCESORIOS',     active: true  },
  { id: 'LT088', sku: 'BP101322', name: 'STROBO | CHAUVET | HURRICANE HAZE | ID LT088',   category: 'ILUMINACION',    active: false }
];

/* ─────────────────────────────────────────────────────
   2. ESTADO DEL MÓDULO CATÁLOGO
───────────────────────────────────────────────────── */

const BP_Catalog = {
  allItems:      [],
  filteredItems: [],
  selectedItem:  null,
  filters: {
    search:   '',
    category: 'all'
  }
};

/* ─────────────────────────────────────────────────────
   3. API DEL CATÁLOGO
───────────────────────────────────────────────────── */

const BP_CatalogAPI = {

  /**
   * Carga la lista de ítems del catálogo
   * USE_MOCK: true  → usa MOCK_CATALOG
   * USE_MOCK: false → llama a tu API real
   */
  async getItems() {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        setTimeout(() => resolve([...MOCK_CATALOG]), 350);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/items?active=all`);
    if (!res.ok) throw new Error('Error al cargar el catálogo');
    return res.json();
  }
};

/* ─────────────────────────────────────────────────────
   4. RENDER DEL CATÁLOGO
───────────────────────────────────────────────────── */

const BP_CatalogRender = {

  /**
   * Aplica filtros de búsqueda y categoría
   */
  applyFilters() {
    const q   = BP_Catalog.filters.search.toLowerCase().trim();
    const cat = BP_Catalog.filters.category;

    BP_Catalog.filteredItems = BP_Catalog.allItems.filter(item => {
      const matchSearch = !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)  ||
        item.id.toLowerCase().includes(q);
      const matchCat = cat === 'all' || item.category === cat;
      return matchSearch && matchCat;
    });

    this.renderTable();
  },

  /**
   * Renderiza las filas de la tabla del catálogo
   */
  renderTable() {
    const tbody = document.getElementById('catalogTableBody');
    const q     = BP_Catalog.filters.search.toLowerCase().trim();
    const items = BP_Catalog.filteredItems;

    // Contador
    document.getElementById('catalogResultCount').textContent =
      `${items.length} resultado${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6">
            <div class="catalog-empty">
              <i class="mdi mdi-magnify-close"></i>
              No se encontraron ítems con esos criterios
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = items.map(item => `
      <tr class="catalog-item-row"
          data-item-id="${item.id}"
          title="Clic para seleccionar y agregar unidad">
        <td>
          <span class="catalog-toggle"></span>
        </td>
        <td class="font-monospace fw-medium">${this.highlight(item.sku, q)}</td>
        <td>${this.highlight(item.name, q)}</td>
        <td>
          <span class="badge bg-label-secondary" style="font-size:0.7rem;">
            ${this.highlight(item.category, q)}
          </span>
        </td>
        <td class="font-monospace text-muted">${this.highlight(item.id, q)}</td>
        <td class="text-center">
          <button class="catalog-view-btn"
                  title="Seleccionar ítem"
                  onclick="BP_CatalogActions.selectItem('${item.id}')">
            <i class="mdi mdi-eye-outline"></i>
          </button>
        </td>
      </tr>`
    ).join('');

    // Click en toda la fila también selecciona
    tbody.querySelectorAll('.catalog-item-row').forEach(row => {
      row.addEventListener('click', function (e) {
        if (e.target.closest('.catalog-view-btn')) return;
        BP_CatalogActions.selectItem(this.dataset.itemId);
      });
    });
  },

  /**
   * Resalta el texto buscado dentro de una cadena
   */
  highlight(text, q) {
    if (!q || !text) return text || '';
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return (
      text.substring(0, idx) +
      `<span class="catalog-highlight">${text.substring(idx, idx + q.length)}</span>` +
      text.substring(idx + q.length)
    );
  },

  /**
   * Llena el select de categorías dinámicamente
   */
  populateCategories(items) {
    const cats = [...new Set(items.map(i => i.category))].sort();
    const sel  = document.getElementById('catalogCategoryFilter');
    sel.innerHTML = `<option value="all">Todas las categorías</option>` +
      cats.map(c => `<option value="${c}">${c}</option>`).join('');
  }
};
/* ─────────────────────────────────────────────────────
   5. ACCIONES DEL CATÁLOGO
───────────────────────────────────────────────────── */

const BP_CatalogActions = {

  /**
   * Abre el modal del catálogo y carga los ítems
   */
  async openCatalogModal() {
    // Limpiar estado previo
    BP_Catalog.selectedItem  = null;
    BP_Catalog.filters       = { search: '', category: 'all' };
    document.getElementById('catalogSearchInput').value    = '';
    document.getElementById('catalogCategoryFilter').value = 'all';
    document.getElementById('clearCatalogSearch').classList.add('d-none');

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('selectItemModal'));
    modal.show();

    // Mostrar spinner mientras carga
    document.getElementById('catalogTableBody').innerHTML = `
      <tr>
        <td colspan="6" class="text-center py-4">
          <div class="spinner-border spinner-border-sm text-primary me-2"></div>
          <span class="text-muted">Cargando catálogo...</span>
        </td>
      </tr>`;
    document.getElementById('catalogResultCount').textContent = '';

    try {
      const items          = await BP_CatalogAPI.getItems();
      BP_Catalog.allItems      = items;
      BP_Catalog.filteredItems = [...items];

      // Poblar categorías y renderizar tabla
      BP_CatalogRender.populateCategories(items);
      BP_CatalogRender.applyFilters();

    } catch (err) {
      document.getElementById('catalogTableBody').innerHTML = `
        <tr>
          <td colspan="6">
            <div class="alert alert-danger m-3">
              <i class="mdi mdi-alert-circle-outline me-2"></i>
              Error al cargar el catálogo: ${err.message}
            </div>
          </td>
        </tr>`;
    }
  },

  /**
   * Selecciona un ítem del catálogo y abre el formulario de nueva unidad
   */
  selectItem(itemId) {
    const item = BP_Catalog.allItems.find(i => i.id === itemId);
    if (!item) {
      BP_Helpers.toast('error', 'Ítem no encontrado');
      return;
    }

    // Marcar fila seleccionada visualmente
    document.querySelectorAll('#catalogTableBody tr').forEach(r =>
      r.classList.remove('catalog-row-selected')
    );
    const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
    if (row) row.classList.add('catalog-row-selected');

    BP_Catalog.selectedItem = item;

    // Pequeño delay para que el usuario vea la selección
    setTimeout(() => {
      // Cerrar modal catálogo
      bootstrap.Modal.getInstance(
        document.getElementById('selectItemModal')
      ).hide();

      // Abrir modal de agregar unidad con el ítem preseleccionado
      this.openAddUnitForItem(item);
    }, 250);
  },

  /**
   * Abre el modal de agregar unidad con el ítem ya identificado
   */
  openAddUnitForItem(item) {
    // Título del modal con el ítem seleccionado
    document.getElementById('unitModalTitle').innerHTML = `
      Agregar Unidad
      <span class="badge bg-label-primary ms-2" style="font-size:0.7rem;">
        ${item.id}
      </span>`;

    // Subtítulo informativo bajo el título
    let subtitleEl = document.getElementById('unitModalSubtitle');
    if (!subtitleEl) {
      subtitleEl = document.createElement('div');
      subtitleEl.id = 'unitModalSubtitle';
      subtitleEl.className = 'text-muted small mt-1';
      document.getElementById('unitModalTitle').after(subtitleEl);
    }
    subtitleEl.innerHTML = `
      <i class="mdi mdi-package-variant me-1"></i>
      <span class="fw-medium">${item.name}</span>
      <span class="text-muted ms-2">SKU: ${item.sku}</span>`;

    // Limpiar formulario
    document.getElementById('unitForm').reset();
    document.getElementById('unitFormId').value    = '';
    document.getElementById('unitCondition').value = 'Bueno';
    document.getElementById('unitStatus').value    = 'Disponible';

    // Guardar el itemId del catálogo seleccionado en un campo oculto
    let catalogItemIdEl = document.getElementById('unitCatalogItemId');
    if (!catalogItemIdEl) {
      catalogItemIdEl = document.createElement('input');
      catalogItemIdEl.type = 'hidden';
      catalogItemIdEl.id   = 'unitCatalogItemId';
      document.getElementById('unitForm').appendChild(catalogItemIdEl);
    }
    catalogItemIdEl.value = item.id;

    // Mostrar modal unidad
    const modal = new bootstrap.Modal(document.getElementById('unitModal'));
    modal.show();
  }
};

/* ─────────────────────────────────────────────────────
   6. MODIFICACIONES A BP_Actions.saveUnit
      para usar el ítem del catálogo seleccionado
───────────────────────────────────────────────────── */

/**
 * Sobreescribimos saveUnit para que use el itemId del catálogo
 * cuando se agregó desde el modal de selección
 */
BP_Actions.saveUnit = async function () {
  const unitId = document.getElementById('unitFormId').value;

  // Si viene del catálogo usa ese itemId, si no usa el de la página
  const catalogItemId = document.getElementById('unitCatalogItemId')?.value;
  const targetItemId  = (!unitId && catalogItemId) ? catalogItemId : BP_Units.itemId;

  const data = {
    serial:       document.getElementById('unitSerial').value.trim(),
    rfid:         document.getElementById('unitRfid').value.trim(),
    status:       document.getElementById('unitStatus').value,
    condition:    document.getElementById('unitCondition').value,
    location:     document.getElementById('unitLocation').value.trim(),
    purchaseDate: document.getElementById('unitPurchaseDate').value,
    notes:        document.getElementById('unitNotes').value.trim()
  };

  // Validación
  if (!data.serial) {
    BP_Helpers.toast('warning', 'El número de serie es obligatorio');
    document.getElementById('unitSerial').focus();
    return;
  }

  const saveBtn = document.getElementById('saveUnitBtn');
  saveBtn.disabled = true;
  saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';

  try {
    if (unitId) {
      await BP_API.updateUnit(BP_Units.itemId, unitId, data);
      BP_Helpers.toast('success', 'Unidad actualizada correctamente');
    } else {
      await BP_API.createUnit(targetItemId, data);
      BP_Helpers.toast('success',
        `Unidad agregada a ${BP_Catalog.selectedItem?.name || targetItemId}`
      );
    }

    // Limpiar ítem del catálogo seleccionado
    BP_Catalog.selectedItem = null;
    const catalogItemIdEl = document.getElementById('unitCatalogItemId');
    if (catalogItemIdEl) catalogItemIdEl.value = '';

    // Limpiar subtítulo del modal
    const subtitleEl = document.getElementById('unitModalSubtitle');
    if (subtitleEl) subtitleEl.remove();

    // Restaurar título del modal
    document.getElementById('unitModalTitle').textContent = 'Agregar Unidad';

    bootstrap.Modal.getInstance(document.getElementById('unitModal')).hide();

    // Solo recarga tabla si el ítem es el mismo de la página
    if (targetItemId === BP_Units.itemId) {
      await BP_Init.loadUnits();
      await BP_Init.loadItem();
    }

  } catch (err) {
    BP_Helpers.toast('error', err.message || 'Error al guardar la unidad');
  } finally {
    saveBtn.disabled = false;
    saveBtn.innerHTML = '<i class="mdi mdi-content-save me-1"></i>Guardar Unidad';
  }
};

/* ─────────────────────────────────────────────────────
   7. EVENTOS DEL MÓDULO CATÁLOGO
───────────────────────────────────────────────────── */

/**
 * Registra los eventos del modal catálogo.
 * Se llama desde BP_Init.bindEvents()
 */
function BP_CatalogBindEvents() {

  // Búsqueda en catálogo con debounce
  let catalogTimer;
  document.getElementById('catalogSearchInput')
    .addEventListener('input', function () {
      const clearBtn = document.getElementById('clearCatalogSearch');
      clearBtn.classList.toggle('d-none', !this.value);
      if (catalogTimer) clearTimeout(catalogTimer);
      catalogTimer = setTimeout(() => {
        BP_Catalog.filters.search = this.value;
        BP_CatalogRender.applyFilters();
      }, 250);
    });

  // Limpiar búsqueda catálogo
  document.getElementById('clearCatalogSearch')
    .addEventListener('click', function () {
      document.getElementById('catalogSearchInput').value = '';
      this.classList.add('d-none');
      BP_Catalog.filters.search = '';
      BP_CatalogRender.applyFilters();
    });

  // Filtro de categoría
  document.getElementById('catalogCategoryFilter')
    .addEventListener('change', function () {
      BP_Catalog.filters.category = this.value;
      BP_CatalogRender.applyFilters();
    });

  // Limpiar modal al cerrar (reset visual)
  document.getElementById('selectItemModal')
    .addEventListener('hidden.bs.modal', () => {
      BP_Catalog.selectedItem = null;
      document.querySelectorAll('#catalogTableBody tr')
        .forEach(r => r.classList.remove('catalog-row-selected'));
    });
}

/* ─────────────────────────────────────────────────────
   8. PATCH: REDIRIGIR BOTONES "AGREGAR UNIDAD"
      al nuevo flujo del catálogo
───────────────────────────────────────────────────── */

/**
 * Sobreescribimos el bindEvents original para que
 * los botones "Agregar Unidad" abran el catálogo
 * en lugar del modal directo
 */
const _originalBindEvents = BP_Init.bindEvents.bind(BP_Init);
BP_Init.bindEvents = function () {
  _originalBindEvents();

  // Redirigir botón principal de tabla
  const addUnitBtn = document.getElementById('addUnitBtn');
  addUnitBtn.replaceWith(addUnitBtn.cloneNode(true)); // limpia listeners
  document.getElementById('addUnitBtn')
    .addEventListener('click', () => BP_CatalogActions.openCatalogModal());

  // Redirigir botón del panel lateral
  const sideAddUnitBtn = document.getElementById('sideAddUnitBtn');
  sideAddUnitBtn.replaceWith(sideAddUnitBtn.cloneNode(true));
  document.getElementById('sideAddUnitBtn')
    .addEventListener('click', () => BP_CatalogActions.openCatalogModal());

  // Registrar eventos del catálogo
  BP_CatalogBindEvents();
};

/* =====================================================
   MÓDULO: ASIGNAR A EVENTO
   ===================================================== */

/* ─────────────────────────────────────────────────────
   1. DATOS MOCK DE EVENTOS
───────────────────────────────────────────────────── */

const MOCK_EVENTS = [
  {
    id: 'EVT-001',
    name: 'Boda García & López',
    client: 'Familia García',
    venue: 'Hacienda San Miguel',
    date: BP_EventHelpers_getRelativeDate(1),
    startTime: '18:00',
    endTime: '23:00',
    notes: 'Montaje desde las 14:00 hrs'
  },
  {
    id: 'EVT-002',
    name: 'Sesión Corporativa Nike',
    client: 'Nike México',
    venue: 'Torre Mayor P12',
    date: BP_EventHelpers_getRelativeDate(3),
    startTime: '09:00',
    endTime: '17:00',
    notes: 'Acceso por lobby norte'
  },
  {
    id: 'EVT-003',
    name: 'Fashion Show Primavera',
    client: 'Diseñadores MX',
    venue: 'Palacio de Hierro Pedregal',
    date: BP_EventHelpers_getRelativeDate(7),
    startTime: '20:00',
    endTime: '23:30',
    notes: ''
  },
  {
    id: 'EVT-004',
    name: 'Congreso Tech 2025',
    client: 'TechSummit',
    venue: 'Centro Banamex',
    date: BP_EventHelpers_getRelativeDate(0),
    startTime: '08:00',
    endTime: '18:00',
    notes: 'Evento de hoy'
  },
  {
    id: 'EVT-005',
    name: 'Quinceañera Martínez',
    client: 'Familia Martínez',
    venue: 'Salón Versalles',
    date: BP_EventHelpers_getRelativeDate(14),
    startTime: '19:00',
    endTime: '02:00',
    notes: ''
  },
  {
    id: 'EVT-006',
    name: 'Lanzamiento Audi Q8',
    client: 'Audi México',
    venue: 'Agencia Interlomas',
    date: BP_EventHelpers_getRelativeDate(21),
    startTime: '19:00',
    endTime: '22:00',
    notes: 'Confirmar acceso vehicular'
  },
  {
    id: 'EVT-007',
    name: 'Boda Hernández & Ruiz',
    client: 'Familia Hernández',
    venue: 'Villa Toscana',
    date: BP_EventHelpers_getRelativeDate(30),
    startTime: '17:00',
    endTime: '01:00',
    notes: ''
  }
];

/* ─────────────────────────────────────────────────────
   2. HELPER DE FECHAS (se declara antes del mock
      para poder usarlo en la inicialización)
───────────────────────────────────────────────────── */

function BP_EventHelpers_getRelativeDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

/* ─────────────────────────────────────────────────────
   3. ESTADO DEL MÓDULO
───────────────────────────────────────────────────── */

const BP_EventAssign = {
  allEvents:      [],
  filteredEvents: [],
  selectedEvent:  null,
  selectedUnits:  new Set(),
  filters: {
    search: '',
    month:  'all'
  }
};

/* ─────────────────────────────────────────────────────
   4. API DE EVENTOS
───────────────────────────────────────────────────── */

const BP_EventAPI = {

  async getUpcomingEvents() {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcoming = MOCK_EVENTS.filter(ev => {
          const evDate = new Date(ev.date + 'T00:00:00');
          return evDate >= today;
        }).sort((a, b) => new Date(a.date) - new Date(b.date));
        setTimeout(() => resolve(upcoming), 350);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/events?upcoming=true`);
    if (!res.ok) throw new Error('Error al cargar eventos');
    return res.json();
  },

  async assignUnitsToEvent(eventId, unitIds) {
    if (BP_Units.USE_MOCK) {
      return new Promise(resolve => {
        unitIds.forEach(uid => {
          const idx = MOCK_UNITS.findIndex(u => u.id === uid);
          if (idx !== -1) {
            MOCK_UNITS[idx].status    = 'Asignado';
            MOCK_UNITS[idx].nextEvent = BP_EventAssign.selectedEvent?.name || '';
            MOCK_UNITS[idx].location  = `Evento ${eventId}`;
          }
        });
        setTimeout(() => resolve({ success: true, assigned: unitIds.length }), 400);
      });
    }
    const res = await fetch(`${BP_Units.API_BASE}/events/${eventId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ unitIds })
    });
    if (!res.ok) throw new Error('Error al asignar unidades');
    return res.json();
  }
};

/* ─────────────────────────────────────────────────────
   5. HELPERS DE EVENTOS
───────────────────────────────────────────────────── */

const BP_EventHelpers = {

  isToday(dateStr) {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  },

  daysUntil(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const ev = new Date(dateStr + 'T00:00:00');
    return Math.round((ev - today) / (1000 * 60 * 60 * 24));
  },

  daysLeftBadge(dateStr) {
    const days = this.daysUntil(dateStr);
    if (days === 0) {
      return `<span class="days-left-badge days-left-today">Hoy</span>`;
    } else if (days <= 7) {
      return `<span class="days-left-badge days-left-soon">En ${days} día${days > 1 ? 's' : ''}</span>`;
    }
    return `<span class="days-left-badge days-left-normal">En ${days} días</span>`;
  },

  dateChip(dateStr) {
    const d     = new Date(dateStr + 'T00:00:00');
    const day   = d.getDate();
    const month = d.toLocaleDateString('es-MX', { month: 'short' }).replace('.', '');
    const isToday = this.isToday(dateStr);
    return `
      <div class="event-date-chip ${isToday ? 'event-today' : ''}">
        <span class="event-day">${day}</span>
        <span class="event-month">${month}</span>
      </div>`;
  },

  highlight(text, q) {
    if (!q || !text) return text || '';
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      text.substring(0, idx) +
      `<span class="event-highlight">${text.substring(idx, idx + q.length)}</span>` +
      text.substring(idx + q.length)
    );
  },

  formatTime(timeStr) {
    if (!timeStr) return '';
    return timeStr;
  },

  monthLabel(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  },

  monthKey(dateStr) {
    return dateStr.substring(0, 7);
  }
};
/* ─────────────────────────────────────────────────────
   6. RENDER DE EVENTOS
───────────────────────────────────────────────────── */

const BP_EventRender = {

  applyFilters() {
    const q     = BP_EventAssign.filters.search.toLowerCase().trim();
    const month = BP_EventAssign.filters.month;

    BP_EventAssign.filteredEvents = BP_EventAssign.allEvents.filter(ev => {
      const matchSearch = !q ||
        ev.name.toLowerCase().includes(q)   ||
        ev.client.toLowerCase().includes(q) ||
        ev.venue.toLowerCase().includes(q);
      const matchMonth = month === 'all' ||
        BP_EventHelpers.monthKey(ev.date) === month;
      return matchSearch && matchMonth;
    });

    this.renderTable();
  },

  renderTable() {
    const tbody = document.getElementById('eventCatalogTableBody');
    const q     = BP_EventAssign.filters.search.toLowerCase().trim();
    const items = BP_EventAssign.filteredEvents;

    document.getElementById('eventResultCount').textContent =
      `${items.length} evento${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="event-empty-state">
            <i class="mdi mdi-calendar-remove-outline"></i>
            No se encontraron eventos con esos criterios
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(ev => `
      <tr class="event-catalog-row" data-event-id="${ev.id}"
          title="Clic para seleccionar evento">
        <td>${BP_EventHelpers.dateChip(ev.date)}</td>
        <td>
          <div class="fw-medium">${BP_EventHelpers.highlight(ev.name, q)}</div>
          <div class="d-flex align-items-center gap-2 mt-1">
            ${BP_EventHelpers.daysLeftBadge(ev.date)}
            <small class="text-muted">
              <i class="mdi mdi-clock-outline me-1"></i>
              ${BP_EventHelpers.formatTime(ev.startTime)} – ${BP_EventHelpers.formatTime(ev.endTime)}
            </small>
          </div>
        </td>
        <td>
          <small class="text-muted">
            ${BP_EventHelpers.highlight(ev.client, q)}
          </small>
        </td>
        <td>
          <small class="text-muted">
            <i class="mdi mdi-map-marker-outline me-1"></i>
            ${BP_EventHelpers.highlight(ev.venue, q)}
          </small>
        </td>
        <td class="text-center">
          <button class="event-select-btn"
                  title="Seleccionar este evento"
                  onclick="BP_EventActions.selectEvent('${ev.id}')">
            <i class="mdi mdi-calendar-arrow-right"></i>
          </button>
        </td>
      </tr>`
    ).join('');

    tbody.querySelectorAll('.event-catalog-row').forEach(row => {
      row.addEventListener('click', function (e) {
        if (e.target.closest('.event-select-btn')) return;
        BP_EventActions.selectEvent(this.dataset.eventId);
      });
    });
  },

  populateMonths(events) {
    const months = [...new Set(events.map(e =>
      BP_EventHelpers.monthKey(e.date)
    ))].sort();
    const sel = document.getElementById('eventMonthFilter');
    sel.innerHTML = `<option value="all">Todos los meses</option>` +
      months.map(m => {
        const label = new Date(m + '-01T00:00:00')
          .toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
        return `<option value="${m}">${label.charAt(0).toUpperCase() + label.slice(1)}</option>`;
      }).join('');
  }
};

/* ─────────────────────────────────────────────────────
   7. RENDER DE UNIDADES A ASIGNAR
───────────────────────────────────────────────────── */

const BP_AssignUnitsRender = {

  render(event) {
    // Info bar del evento
    document.getElementById('assignEventInfoBar').innerHTML = `
      <div class="d-flex align-items-start gap-3">
        ${BP_EventHelpers.dateChip(event.date)}
        <div>
          <div class="assign-event-name">${event.name}</div>
          <div class="assign-event-meta mt-1">
            <span><i class="mdi mdi-account-outline"></i>${event.client}</span>
            <span class="ms-3"><i class="mdi mdi-map-marker-outline"></i>${event.venue}</span>
            <span class="ms-3"><i class="mdi mdi-clock-outline"></i>${event.startTime} – ${event.endTime}</span>
          </div>
          ${event.notes ? `<div class="assign-event-meta mt-1">
            <i class="mdi mdi-note-text-outline"></i>${event.notes}
          </div>` : ''}
        </div>
        <div class="ms-auto">${BP_EventHelpers.daysLeftBadge(event.date)}</div>
      </div>`;

    // Filtrar unidades elegibles
    const eligible = BP_Units.allUnits.filter(u =>
      u.status !== 'En Mantenimiento' && u.status !== 'Baja'
    );

    const tbody = document.getElementById('assignUnitsTableBody');

    if (eligible.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="assign-units-empty">
            <i class="mdi mdi-package-variant-closed-remove"></i>
            No hay unidades disponibles para asignar
          </div>
        </td></tr>`;
      document.getElementById('selectAllUnitsCheck').disabled = true;
      document.getElementById('confirmAssignBtn').disabled    = true;
      return;
    }

    document.getElementById('selectAllUnitsCheck').disabled = false;
    document.getElementById('confirmAssignBtn').disabled    = false;

    tbody.innerHTML = eligible.map(u => {
      const isAvailable = u.status === 'Disponible';
      return `
        <tr class="assign-unit-row ${BP_EventAssign.selectedUnits.has(u.id) ? 'unit-checked' : ''}"
            data-unit-id="${u.id}">
          <td>
            <div class="form-check mb-0">
              <input class="form-check-input assign-unit-check"
                     type="checkbox"
                     value="${u.id}"
                     id="chk-${u.id}"
                     ${BP_EventAssign.selectedUnits.has(u.id) ? 'checked' : ''}>
            </div>
          </td>
          <td>
            <div class="fw-medium font-monospace small">${u.serial || '—'}</div>
            <div class="text-muted" style="font-size:0.72rem;">
              ${u.rfid
                ? `<i class="mdi mdi-nfc me-1"></i>${u.rfid}`
                : '<span class="text-danger">Sin RFID</span>'}
            </div>
          </td>
          <td>${BP_Helpers.conditionBadge(u.condition)}</td>
          <td>
            <small class="text-muted">${u.location || '—'}</small>
            ${!isAvailable ? `<div class="mt-1">${BP_Helpers.statusBadge(u.status)}</div>` : ''}
          </td>
          <td class="text-muted small">${BP_Helpers.formatDate(u.lastUse)}</td>
        </tr>`;
    }).join('');

    this.updateSelectedCount();
    this.bindRowEvents();
  },

  bindRowEvents() {
    document.querySelectorAll('.assign-unit-row').forEach(row => {
      row.addEventListener('click', function (e) {
        if (e.target.classList.contains('assign-unit-check')) return;
        const chk = this.querySelector('.assign-unit-check');
        chk.checked = !chk.checked;
        chk.dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    document.querySelectorAll('.assign-unit-check').forEach(chk => {
      chk.addEventListener('change', function () {
        const row = this.closest('tr');
        if (this.checked) {
          BP_EventAssign.selectedUnits.add(this.value);
          row.classList.add('unit-checked');
        } else {
          BP_EventAssign.selectedUnits.delete(this.value);
          row.classList.remove('unit-checked');
        }
        BP_AssignUnitsRender.updateSelectedCount();
        BP_AssignUnitsRender.syncSelectAll();
      });
    });
  },

  updateSelectedCount() {
    const n = BP_EventAssign.selectedUnits.size;
    document.getElementById('assignSelectedCount').textContent =
      `${n} unidad${n !== 1 ? 'es' : ''} seleccionada${n !== 1 ? 's' : ''}`;
    document.getElementById('confirmAssignBtn').disabled = n === 0;
  },

  syncSelectAll() {
    const all  = document.querySelectorAll('.assign-unit-check');
    const chkd = document.querySelectorAll('.assign-unit-check:checked');
    const allChk = document.getElementById('selectAllUnitsCheck');
    allChk.checked       = all.length > 0 && chkd.length === all.length;
    allChk.indeterminate = chkd.length > 0 && chkd.length < all.length;
  }
};

/* ─────────────────────────────────────────────────────
   8. ACCIONES
───────────────────────────────────────────────────── */

const BP_EventActions = {

  async openEventModal() {
    BP_EventAssign.selectedEvent  = null;
    BP_EventAssign.selectedUnits  = new Set();
    BP_EventAssign.filters        = { search: '', month: 'all' };

    document.getElementById('eventSearchInput').value    = '';
    document.getElementById('eventMonthFilter').value   = 'all';
    document.getElementById('clearEventSearch').classList.add('d-none');

    const modal = new bootstrap.Modal(document.getElementById('selectEventModal'));
    modal.show();

    document.getElementById('eventCatalogTableBody').innerHTML = `
      <tr><td colspan="5" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div>
        <span class="text-muted">Cargando eventos...</span>
      </td></tr>`;
    document.getElementById('eventResultCount').textContent = '';

    try {
      const events = await BP_EventAPI.getUpcomingEvents();
      BP_EventAssign.allEvents      = events;
      BP_EventAssign.filteredEvents = [...events];
      BP_EventRender.populateMonths(events);
      BP_EventRender.applyFilters();
    } catch (err) {
      document.getElementById('eventCatalogTableBody').innerHTML = `
        <tr><td colspan="5">
          <div class="alert alert-danger m-3">
            <i class="mdi mdi-alert-circle-outline me-2"></i>
            Error al cargar eventos: ${err.message}
          </div>
        </td></tr>`;
    }
  },

  selectEvent(eventId) {
    const event = BP_EventAssign.allEvents.find(e => e.id === eventId);
    if (!event) { BP_Helpers.toast('error', 'Evento no encontrado'); return; }

    document.querySelectorAll('#eventCatalogTableBody tr')
      .forEach(r => r.classList.remove('event-row-selected'));
    const row = document.querySelector(`tr[data-event-id="${eventId}"]`);
    if (row) row.classList.add('event-row-selected');

    BP_EventAssign.selectedEvent = event;
    BP_EventAssign.selectedUnits = new Set();

    setTimeout(() => {
      bootstrap.Modal.getInstance(
        document.getElementById('selectEventModal')
      ).hide();
      this.openAssignUnitsModal(event);
    }, 250);
  },

  openAssignUnitsModal(event) {
    document.getElementById('assignUnitsTitle').innerHTML = `
      Seleccionar Unidades
      <span class="badge bg-label-success ms-2" style="font-size:0.7rem;">
        ${event.id}
      </span>`;

    document.getElementById('selectAllUnitsCheck').checked       = false;
    document.getElementById('selectAllUnitsCheck').indeterminate = false;
    document.getElementById('confirmAssignBtn').disabled         = true;

    BP_AssignUnitsRender.render(event);

    const modal = new bootstrap.Modal(document.getElementById('assignUnitsModal'));
    modal.show();
  },

  async confirmAssign() {
    const event   = BP_EventAssign.selectedEvent;
    const unitIds = [...BP_EventAssign.selectedUnits];

    if (!event || unitIds.length === 0) {
      BP_Helpers.toast('warning', 'Selecciona al menos una unidad');
      return;
    }

    const confirmed = await BP_Helpers.confirm(
      '¿Confirmar asignación?',
      `Se asignarán ${unitIds.length} unidad${unitIds.length > 1 ? 'es' : ''} al evento "${event.name}"`,
      'Sí, asignar'
    );
    if (!confirmed) return;

    const btn = document.getElementById('confirmAssignBtn');
    btn.disabled    = true;
    btn.innerHTML   = '<span class="spinner-border spinner-border-sm me-1"></span>Asignando...';

    try {
      await BP_EventAPI.assignUnitsToEvent(event.id, unitIds);
      BP_Helpers.toast('success',
        `${unitIds.length} unidad${unitIds.length > 1 ? 'es asignadas' : ' asignada'} a "${event.name}"`
      );
      bootstrap.Modal.getInstance(document.getElementById('assignUnitsModal')).hide();
      BP_EventAssign.selectedEvent = null;
      BP_EventAssign.selectedUnits = new Set();
      await BP_Init.loadUnits();
      await BP_Init.loadItem();
    } catch (err) {
      BP_Helpers.toast('error', err.message || 'Error al asignar unidades');
    } finally {
      btn.disabled  = false;
      btn.innerHTML = '<i class="mdi mdi-calendar-check me-1"></i>Confirmar Asignación';
    }
  }
};

/* ─────────────────────────────────────────────────────
   9. EVENTOS DEL MÓDULO
───────────────────────────────────────────────────── */

function BP_EventBindEvents() {

  // Búsqueda con debounce
  let evTimer;
  document.getElementById('eventSearchInput')
    .addEventListener('input', function () {
      document.getElementById('clearEventSearch')
        .classList.toggle('d-none', !this.value);
      if (evTimer) clearTimeout(evTimer);
      evTimer = setTimeout(() => {
        BP_EventAssign.filters.search = this.value;
        BP_EventRender.applyFilters();
      }, 250);
    });

  // Limpiar búsqueda
  document.getElementById('clearEventSearch')
    .addEventListener('click', function () {
      document.getElementById('eventSearchInput').value = '';
      this.classList.add('d-none');
      BP_EventAssign.filters.search = '';
      BP_EventRender.applyFilters();
    });

  // Filtro mes
  document.getElementById('eventMonthFilter')
    .addEventListener('change', function () {
      BP_EventAssign.filters.month = this.value;
      BP_EventRender.applyFilters();
    });

  // Seleccionar todas las unidades
  document.getElementById('selectAllUnitsCheck')
    .addEventListener('change', function () {
      const checks = document.querySelectorAll('.assign-unit-check');
      checks.forEach(chk => {
        chk.checked = this.checked;
        const row   = chk.closest('tr');
        if (this.checked) {
          BP_EventAssign.selectedUnits.add(chk.value);
          row.classList.add('unit-checked');
        } else {
          BP_EventAssign.selectedUnits.delete(chk.value);
          row.classList.remove('unit-checked');
        }
      });
      BP_AssignUnitsRender.updateSelectedCount();
    });

  // Confirmar asignación
  document.getElementById('confirmAssignBtn')
    .addEventListener('click', () => BP_EventActions.confirmAssign());

  // Botón volver a eventos
  document.getElementById('assignUnitsBackBtn')
    .addEventListener('click', () => {
      bootstrap.Modal.getInstance(
        document.getElementById('assignUnitsModal')
      ).hide();
      setTimeout(() => BP_EventActions.openEventModal(), 300);
    });

  // Reset al cerrar modales
  document.getElementById('selectEventModal')
    .addEventListener('hidden.bs.modal', () => {
      document.querySelectorAll('#eventCatalogTableBody tr')
        .forEach(r => r.classList.remove('event-row-selected'));
    });

  document.getElementById('assignUnitsModal')
    .addEventListener('hidden.bs.modal', () => {
      BP_EventAssign.selectedUnits = new Set();
      document.getElementById('selectAllUnitsCheck').checked       = false;
      document.getElementById('selectAllUnitsCheck').indeterminate = false;
    });

  // Patch botón "Asignar a Evento" del panel lateral
  const assignBtn = document.getElementById('assignToEventBtn');
  assignBtn.replaceWith(assignBtn.cloneNode(true));
  document.getElementById('assignToEventBtn')
    .addEventListener('click', () => BP_EventActions.openEventModal());
}

/* ─────────────────────────────────────────────────────
   10. REGISTRAR EN EL INIT
───────────────────────────────────────────────────── */

const _originalBindEvents2 = BP_Init.bindEvents.bind(BP_Init);
BP_Init.bindEvents = function () {
  _originalBindEvents2();
  BP_EventBindEvents();
};