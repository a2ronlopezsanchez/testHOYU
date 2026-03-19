/* =====================================================
   CATÁLOGO DE CLIENTES — Black Production
   catalogo-clientes.js
   ===================================================== */

'use strict';

/* =====================================================
   1. CONFIGURACIÓN GLOBAL
   ===================================================== */

const BP_Clientes = {
  API_BASE: '/clientes',
  allClientes:      [],
  filteredClientes: [],
  currentView:      'table', // 'table' | 'cards'
  pagination: {
    currentPage: 1,
    perPage:     10,
    total:       0
  },
  filters: {
    search:   '',
    tipo:     'all',
    status:   'all',
    orderBy:  'nombre'
  },
  deleteTargetId: null
};

/* =====================================================
   2. CAPA DE API
   ===================================================== */

const BP_ClientesAPI = {

  getHeaders(includeJson = false) {
    return {
      'Accept': 'application/json',
      ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
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

  async getAll() {
    const res = await fetch(`${BP_Clientes.API_BASE}/list`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res, 'Error al cargar clientes');
  },

  async getById(id) {
    const res = await fetch(`${BP_Clientes.API_BASE}/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res, 'Cliente no encontrado');
  },

  async delete(id) {
    const res = await fetch(`${BP_Clientes.API_BASE}/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res, 'Error al eliminar cliente');
  }
};
/* =====================================================
   3. HELPERS
   ===================================================== */

const BP_ClientesHelpers = {

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
      style: 'currency', currency: 'MXN', minimumFractionDigits: 0
    }).format(num);
  },

  initials(nombre) {
    if (!nombre) return '?';
    return nombre.trim().split(' ')
      .slice(0, 2)
      .map(w => w[0])
      .join('')
      .toUpperCase();
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

  highlight(text, q) {
    if (!q || !text) return text || '';
    const idx = String(text).toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
      String(text).substring(0, idx) +
      `<span class="cliente-highlight">${String(text).substring(idx, idx + q.length)}</span>` +
      String(text).substring(idx + q.length)
    );
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
  }
};

/* =====================================================
   4. RENDER — TABLA Y TARJETAS
   ===================================================== */

const BP_ClientesRender = {

  applyFilters() {
    const { search, tipo, status, orderBy } = BP_Clientes.filters;
    const q = search.toLowerCase().trim();

    let result = BP_Clientes.allClientes.filter(c => {
      const matchSearch = !q ||
        BP_ClientesHelpers.displayName(c).toLowerCase().includes(q) ||
        (c.razonSocial || '').toLowerCase().includes(q)             ||
        (c.rfc || '').toLowerCase().includes(q)                     ||
        (c.contactoPrincipal?.email || '').toLowerCase().includes(q)||
        (c.contactoPrincipal?.tel || '').includes(q);

      const matchTipo   = tipo   === 'all' || c.tipo   === tipo;
      const matchStatus = status === 'all' || c.status === status;

      return matchSearch && matchTipo && matchStatus;
    });

    // Ordenar
    result.sort((a, b) => {
      if (orderBy === 'nombre') {
        return BP_ClientesHelpers.displayName(a)
          .localeCompare(BP_ClientesHelpers.displayName(b));
      }
      if (orderBy === 'reciente') {
        return new Date(b.creadoEn) - new Date(a.creadoEn);
      }
      if (orderBy === 'eventos') {
        return (b.totalEventos || 0) - (a.totalEventos || 0);
      }
      return 0;
    });

    BP_Clientes.filteredClientes     = result;
    BP_Clientes.pagination.total     = result.length;
    BP_Clientes.pagination.currentPage = 1;
    this.renderStats();
    this.render();
  },

  renderStats() {
    const all = BP_Clientes.allClientes;
    document.getElementById('statTotalClientes').textContent =
      all.length;
    document.getElementById('statClientesActivos').textContent =
      all.filter(c => c.status === 'Activo' || c.status === 'VIP').length;
    document.getElementById('statClientesProspectos').textContent =
      all.filter(c => c.status === 'Prospecto').length;
    document.getElementById('statClientesVip').textContent =
      all.filter(c => c.status === 'VIP').length;
  },

  render() {
    if (BP_Clientes.currentView === 'table') {
      this.renderTable();
    } else {
      this.renderCards();
    }
    this.renderPagination();
  },

  getPageItems() {
    const { currentPage, perPage, total } = BP_Clientes.pagination;
    const start = (currentPage - 1) * perPage;
    const end   = Math.min(start + perPage, total);
    document.getElementById('clientesShowingFrom').textContent = total === 0 ? 0 : start + 1;
    document.getElementById('clientesShowingTo').textContent   = end;
    document.getElementById('clientesTotal').textContent       = total;
    document.getElementById('clientesCountLabel').textContent  =
      `${total} cliente${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`;
    return BP_Clientes.filteredClientes.slice(start, end);
  },

  renderTable() {
    const tbody = document.getElementById('clientesTableBody');
    const items = this.getPageItems();
    const q     = BP_Clientes.filters.search;

    if (items.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8">
          <div class="clientes-empty">
            <i class="mdi mdi-account-search-outline"></i>
            No se encontraron clientes con los filtros aplicados
          </div>
        </td></tr>`;
      return;
    }

    tbody.innerHTML = items.map(c => {
      const nombre = BP_ClientesHelpers.displayName(c);
      return `
        <tr data-cliente-id="${c.id}">
          <td>
            <div class="cliente-avatar ${BP_ClientesHelpers.avatarClass(c.tipo)}">
              ${BP_ClientesHelpers.initials(nombre)}
            </div>
          </td>
          <td>
            <div class="cliente-nombre">
              ${BP_ClientesHelpers.highlight(nombre, q)}
            </div>
            ${c.razonSocial
              ? `<div class="cliente-razon-social">
                   ${BP_ClientesHelpers.highlight(c.razonSocial, q)}
                 </div>`
              : ''}
            ${c.contactoPrincipal?.email
              ? `<div class="cliente-coloquial">
                   <i class="mdi mdi-email-outline me-1"></i>
                   ${BP_ClientesHelpers.highlight(c.contactoPrincipal.email, q)}
                 </div>`
              : ''}
          </td>
          <td>${BP_ClientesHelpers.tipoBadge(c.tipo)}</td>
          <td>
            <span class="rfc-text">
              ${BP_ClientesHelpers.highlight(c.rfc || '—', q)}
            </span>
          </td>
          <td>
            <div class="small fw-medium">
              ${c.contactoPrincipal?.nombre || '—'}
            </div>
            <div class="small text-muted">
              ${BP_ClientesHelpers.highlight(c.contactoPrincipal?.tel || '', q)}
            </div>
          </td>
          <td class="text-center">
            <span class="fw-bold text-primary">${c.totalEventos || 0}</span>
          </td>
          <td class="text-center">
            ${BP_ClientesHelpers.statusBadge(c.status)}
          </td>
          <td class="text-center">
            <div class="d-flex gap-1 justify-content-center">
              <button class="btn btn-icon btn-sm btn-outline-secondary cliente-action-btn"
                      title="Vista rápida"
                      onclick="BP_ClientesActions.quickView('${c.id}')">
                <i class="mdi mdi-eye-outline"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-outline-primary cliente-action-btn"
                      title="Editar"
                      onclick="BP_ClientesActions.edit('${c.id}')">
                <i class="mdi mdi-pencil-outline"></i>
              </button>
              <button class="btn btn-icon btn-sm btn-outline-danger cliente-action-btn"
                      title="Eliminar"
                      onclick="BP_ClientesActions.confirmDelete('${c.id}')">
                <i class="mdi mdi-trash-can-outline"></i>
              </button>
            </div>
          </td>
        </tr>`;
    }).join('');

    // Click en fila abre quick view
    tbody.querySelectorAll('tr[data-cliente-id]').forEach(row => {
      row.addEventListener('click', function (e) {
        if (e.target.closest('button')) return;
        BP_ClientesActions.quickView(this.dataset.clienteId);
      });
    });
  },

  renderCards() {
    const container = document.getElementById('clientesCardsBody');
    const items     = this.getPageItems();
    const q         = BP_Clientes.filters.search;

    if (items.length === 0) {
      container.innerHTML = `
        <div class="col-12">
          <div class="clientes-empty">
            <i class="mdi mdi-account-search-outline"></i>
            No se encontraron clientes
          </div>
        </div>`;
      return;
    }

    container.innerHTML = items.map(c => {
      const nombre = BP_ClientesHelpers.displayName(c);
      return `
        <div class="col-md-6 col-xl-4">
          <div class="cliente-card" onclick="BP_ClientesActions.quickView('${c.id}')">
            <div class="cliente-card-header">
              <div class="cliente-card-avatar ${BP_ClientesHelpers.avatarClass(c.tipo)}">
                ${BP_ClientesHelpers.initials(nombre)}
              </div>
              <div class="flex-grow-1 overflow-hidden">
                <div class="cliente-card-nombre text-truncate">
                  ${BP_ClientesHelpers.highlight(nombre, q)}
                </div>
                <div class="cliente-card-sub">
                  ${BP_ClientesHelpers.tipoBadge(c.tipo)}
                  <span class="ms-1">${BP_ClientesHelpers.statusBadge(c.status)}</span>
                </div>
              </div>
            </div>
            ${c.contactoPrincipal?.email
              ? `<div class="cliente-card-meta">
                   <i class="mdi mdi-email-outline"></i>
                   ${c.contactoPrincipal.email}
                 </div>`
              : ''}
            ${c.contactoPrincipal?.tel
              ? `<div class="cliente-card-meta">
                   <i class="mdi mdi-phone-outline"></i>
                   ${c.contactoPrincipal.tel}
                 </div>`
              : ''}
            ${c.rfc
              ? `<div class="cliente-card-meta">
                   <i class="mdi mdi-card-account-details-outline"></i>
                   <span class="rfc-text">${c.rfc}</span>
                 </div>`
              : ''}
            <div class="cliente-card-footer">
              <div class="cliente-card-eventos">
                <strong>${c.totalEventos || 0}</strong> evento${c.totalEventos !== 1 ? 's' : ''}
              </div>
              <div class="small text-muted">
                ${BP_ClientesHelpers.formatCurrency(c.revenueTotal)}
              </div>
              <div class="d-flex gap-1">
                <button class="btn btn-icon btn-sm btn-outline-primary cliente-action-btn"
                        title="Editar"
                        onclick="event.stopPropagation();BP_ClientesActions.edit('${c.id}')">
                  <i class="mdi mdi-pencil-outline"></i>
                </button>
                <button class="btn btn-icon btn-sm btn-outline-danger cliente-action-btn"
                        title="Eliminar"
                        onclick="event.stopPropagation();BP_ClientesActions.confirmDelete('${c.id}')">
                  <i class="mdi mdi-trash-can-outline"></i>
                </button>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');
  },

  renderPagination() {
    const { currentPage, perPage, total } = BP_Clientes.pagination;
    const totalPages = Math.ceil(total / perPage) || 1;
    const el = document.getElementById('clientesPagination');

    let html = `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0);"
           onclick="BP_ClientesRender.goToPage(${currentPage - 1})">
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
               onclick="BP_ClientesRender.goToPage(${p})">${p}</a>
          </li>`;
      }
    });

    html += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="javascript:void(0);"
           onclick="BP_ClientesRender.goToPage(${currentPage + 1})">
          <i class="mdi mdi-chevron-right"></i>
        </a>
      </li>`;

    el.innerHTML = html;
  },

  pageRange(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
    if (current >= total - 3) return [1, '...', total-4, total-3, total-2, total-1, total];
    return [1, '...', current-1, current, current+1, '...', total];
  },

  goToPage(page) {
    const totalPages = Math.ceil(
      BP_Clientes.pagination.total / BP_Clientes.pagination.perPage
    ) || 1;
    if (page < 1 || page > totalPages) return;
    BP_Clientes.pagination.currentPage = page;
    this.render();
  }
};
/* =====================================================
   5. ACCIONES
   ===================================================== */

const BP_ClientesActions = {

  /**
   * Abre modal de vista rápida
   */
  async quickView(id) {
    document.getElementById('quickViewClienteTitle').textContent = 'Cargando...';
    document.getElementById('quickViewClienteBody').innerHTML = `
      <div class="text-center py-4">
        <div class="spinner-border text-primary"></div>
      </div>`;

    const modal = new bootstrap.Modal(
      document.getElementById('quickViewClienteModal')
    );
    modal.show();

    try {
      const c = await BP_ClientesAPI.getById(id);
      if (!c) throw new Error('Cliente no encontrado');

      const nombre = BP_ClientesHelpers.displayName(c);
      document.getElementById('quickViewClienteTitle').innerHTML = `
        ${nombre}
        <span class="ms-2">${BP_ClientesHelpers.statusBadge(c.status)}</span>`;

      document.getElementById('quickViewClienteBody').innerHTML = `
        <!-- Avatar + nombre -->
        <div class="d-flex align-items-center gap-3 mb-4">
          <div class="cliente-avatar ${BP_ClientesHelpers.avatarClass(c.tipo)}"
               style="width:52px;height:52px;font-size:1.1rem;">
            ${BP_ClientesHelpers.initials(nombre)}
          </div>
          <div>
            <div class="fw-semibold fs-6">${nombre}</div>
            ${c.razonSocial
              ? `<div class="text-muted small">${c.razonSocial}</div>`
              : ''}
            <div class="mt-1">
              ${BP_ClientesHelpers.tipoBadge(c.tipo)}
            </div>
          </div>
          <div class="ms-auto text-end">
            <div class="small text-muted">Revenue total</div>
            <div class="fw-bold text-success fs-6">
              ${BP_ClientesHelpers.formatCurrency(c.revenueTotal)}
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="row g-3 mb-4">
          <div class="col-4">
            <div class="qv-stat-box">
              <div class="qv-stat-num">${c.totalEventos || 0}</div>
              <div class="qv-stat-label">Eventos</div>
            </div>
          </div>
          <div class="col-4">
            <div class="qv-stat-box">
              <div class="qv-stat-num">
                ${BP_ClientesHelpers.formatCurrency(
                  c.totalEventos ? Math.round(c.revenueTotal / c.totalEventos) : 0
                )}
              </div>
              <div class="qv-stat-label">Ticket Prom.</div>
            </div>
          </div>
          <div class="col-4">
            <div class="qv-stat-box">
              <div class="qv-stat-num">
                ${BP_ClientesHelpers.formatDate(c.ultimoEvento)}
              </div>
              <div class="qv-stat-label">Último Evento</div>
            </div>
          </div>
        </div>

        <div class="row g-4">
          <!-- Columna izquierda -->
          <div class="col-md-6">

            <!-- Datos generales -->
            <div class="qv-section-title">Datos Generales</div>
            <div class="mb-3">
              <div class="qv-info-row">
                <span class="qv-info-label">RFC</span>
                <span class="qv-info-value rfc-text">${c.rfc || '—'}</span>
              </div>
              <div class="qv-info-row">
                <span class="qv-info-label">Alta</span>
                <span class="qv-info-value">
                  ${BP_ClientesHelpers.formatDate(c.creadoEn)}
                </span>
              </div>
              ${c.notas ? `
              <div class="qv-info-row">
                <span class="qv-info-label">Notas</span>
                <span class="qv-info-value text-muted small">${c.notas}</span>
              </div>` : ''}
            </div>

            <!-- Dirección fiscal -->
            <div class="qv-section-title mt-3">Dirección Fiscal</div>
            <div class="small text-muted">
              ${c.direccionFiscal ? `
                ${c.direccionFiscal.calle},
                ${c.direccionFiscal.colonia},
                ${c.direccionFiscal.ciudad},
                ${c.direccionFiscal.estado}
                CP ${c.direccionFiscal.cp}
              ` : '—'}
            </div>

            ${c.direccionFisica ? `
            <div class="qv-section-title mt-3">Dirección Física</div>
            <div class="small text-muted">
              ${c.direccionFisica.calle},
              ${c.direccionFisica.colonia},
              ${c.direccionFisica.ciudad},
              ${c.direccionFisica.estado}
              CP ${c.direccionFisica.cp}
            </div>` : ''}

          </div>

          <!-- Columna derecha -->
          <div class="col-md-6">

            <!-- Contacto principal -->
            <div class="qv-section-title">Contacto Principal</div>
            <div class="mb-3">
              ${c.contactoPrincipal ? `
              <div class="qv-info-row">
                <span class="qv-info-label">Nombre</span>
                <span class="qv-info-value">${c.contactoPrincipal.nombre}</span>
              </div>
              <div class="qv-info-row">
                <span class="qv-info-label">Cargo</span>
                <span class="qv-info-value">${c.contactoPrincipal.cargo || '—'}</span>
              </div>
              <div class="qv-info-row">
                <span class="qv-info-label">Email</span>
                <span class="qv-info-value">
                  <a href="mailto:${c.contactoPrincipal.email}" class="text-primary">
                    ${c.contactoPrincipal.email}
                  </a>
                </span>
              </div>
              <div class="qv-info-row">
                <span class="qv-info-label">Teléfono</span>
                <span class="qv-info-value">
                  <a href="tel:${c.contactoPrincipal.tel}" class="text-primary">
                    ${c.contactoPrincipal.tel}
                  </a>
                </span>
              </div>` : '<div class="text-muted small">Sin contacto registrado</div>'}
            </div>

            <!-- Contacto alternativo -->
            ${c.contactoAlternativo ? `
            <div class="qv-section-title mt-3">Contacto Alternativo</div>
            <div class="qv-info-row">
              <span class="qv-info-label">Nombre</span>
              <span class="qv-info-value">${c.contactoAlternativo.nombre}</span>
            </div>
            <div class="qv-info-row">
              <span class="qv-info-label">Cargo</span>
              <span class="qv-info-value">${c.contactoAlternativo.cargo || '—'}</span>
            </div>
            <div class="qv-info-row">
              <span class="qv-info-label">Email</span>
              <span class="qv-info-value">
                <a href="mailto:${c.contactoAlternativo.email}" class="text-primary">
                  ${c.contactoAlternativo.email}
                </a>
              </span>
            </div>
            <div class="qv-info-row">
              <span class="qv-info-label">Teléfono</span>
              <span class="qv-info-value">
                <a href="tel:${c.contactoAlternativo.tel}" class="text-primary">
                  ${c.contactoAlternativo.tel}
                </a>
              </span>
            </div>` : ''}

          </div>
        </div>`;

      // Botones del footer del modal
      document.getElementById('quickViewEditBtn').onclick = () => {
        bootstrap.Modal.getInstance(
          document.getElementById('quickViewClienteModal')
        ).hide();
        this.edit(id);
      };

    document.getElementById('quickViewDetalleBtn').onclick = () => {
      window.location.href =
        `/clientes/detalle?id=${id}`;
    };

    } catch (err) {
      document.getElementById('quickViewClienteBody').innerHTML = `
        <div class="alert alert-danger">
          <i class="mdi mdi-alert-circle-outline me-2"></i>
          ${err.message}
        </div>`;
    }
  },

    edit(id) {
      window.location.href =
        `/clientes/formulario?mode=edit&id=${id}`;
    },

  confirmDelete(id) {
    const c = BP_Clientes.allClientes.find(x => x.id === id);
    const nombre = c ? BP_ClientesHelpers.displayName(c) : id;
    BP_Clientes.deleteTargetId = id;
    document.getElementById('deleteClienteMsg').textContent =
      `Se eliminará a "${nombre}" y toda su información. Esta acción no se puede deshacer.`;
    const modal = new bootstrap.Modal(
      document.getElementById('deleteClienteModal')
    );
    modal.show();
  },

  async executeDelete() {
    const id = BP_Clientes.deleteTargetId;
    if (!id) return;

    const btn = document.getElementById('confirmDeleteClienteBtn');
    btn.disabled  = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Eliminando...';

    try {
      await BP_ClientesAPI.delete(id);
      bootstrap.Modal.getInstance(
        document.getElementById('deleteClienteModal')
      ).hide();
      BP_ClientesHelpers.toast('success', 'Cliente eliminado correctamente');
      BP_Clientes.deleteTargetId = null;
      await BP_ClientesInit.loadClientes();
    } catch (err) {
      BP_ClientesHelpers.toast('error', err.message || 'Error al eliminar');
    } finally {
      btn.disabled  = false;
      btn.innerHTML = '<i class="mdi mdi-trash-can-outline me-1"></i>Sí, eliminar';
    }
  },

  exportCSV() {
    const items = BP_Clientes.filteredClientes;
    if (!items.length) {
      BP_ClientesHelpers.toast('warning', 'No hay clientes para exportar');
      return;
    }
    const headers = [
      'ID','Tipo','Nombre','Razón Social','RFC','Estatus',
      'Email','Teléfono','Ciudad','Total Eventos','Revenue Total','Alta'
    ];
    const rows = items.map(c => [
      c.id, c.tipo,
      BP_ClientesHelpers.displayName(c),
      c.razonSocial || '',
      c.rfc || '',
      c.status,
      c.contactoPrincipal?.email || '',
      c.contactoPrincipal?.tel   || '',
      c.direccionFiscal?.ciudad  || '',
      c.totalEventos || 0,
      c.revenueTotal || 0,
      c.creadoEn || ''
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v =>
        `"${String(v).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `clientes-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    BP_ClientesHelpers.toast('success', 'Exportación completada');
  }
};

/* =====================================================
   6. INICIALIZACIÓN Y EVENTOS
   ===================================================== */

const BP_ClientesInit = {

  async loadClientes() {
    document.getElementById('clientesTableBody').innerHTML = `
      <tr><td colspan="8" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div>
        <span class="text-muted">Cargando clientes...</span>
      </td></tr>`;
    try {
      const data = await BP_ClientesAPI.getAll();
      BP_Clientes.allClientes = data;
      BP_ClientesRender.applyFilters();
    } catch (err) {
      document.getElementById('clientesTableBody').innerHTML = `
        <tr><td colspan="8">
          <div class="alert alert-danger m-3">
            <i class="mdi mdi-alert-circle-outline me-2"></i>
            Error al cargar clientes: ${err.message}
          </div>
        </td></tr>`;
    }
  },

  bindEvents() {
    // Búsqueda
    let searchTimer;
    document.getElementById('clientesSearchInput')
      .addEventListener('input', function () {
        document.getElementById('clearClientesSearch')
          .classList.toggle('d-none', !this.value);
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
          BP_Clientes.filters.search = this.value;
          BP_ClientesRender.applyFilters();
        }, 300);
      });

    // Limpiar búsqueda
    document.getElementById('clearClientesSearch')
      .addEventListener('click', function () {
        document.getElementById('clientesSearchInput').value = '';
        this.classList.add('d-none');
        BP_Clientes.filters.search = '';
        BP_ClientesRender.applyFilters();
      });

    // Filtro tipo
    document.getElementById('tipoClienteFilter')
      .addEventListener('change', function () {
        BP_Clientes.filters.tipo = this.value;
        BP_ClientesRender.applyFilters();
      });

    // Filtro status
    document.getElementById('statusClienteFilter')
      .addEventListener('change', function () {
        BP_Clientes.filters.status = this.value;
        BP_ClientesRender.applyFilters();
      });

    // Ordenar
    document.getElementById('ordenarClienteFilter')
      .addEventListener('change', function () {
        BP_Clientes.filters.orderBy = this.value;
        BP_ClientesRender.applyFilters();
      });

    // Limpiar todos los filtros
    document.getElementById('clearClientesFilters')
      .addEventListener('click', () => {
        document.getElementById('clientesSearchInput').value  = '';
        document.getElementById('clearClientesSearch').classList.add('d-none');
        document.getElementById('tipoClienteFilter').value    = 'all';
        document.getElementById('statusClienteFilter').value  = 'all';
        document.getElementById('ordenarClienteFilter').value = 'nombre';
        BP_Clientes.filters = {
          search: '', tipo: 'all', status: 'all', orderBy: 'nombre'
        };
        BP_ClientesRender.applyFilters();
      });

    // Toggle vista tabla / tarjetas
    document.getElementById('viewTableBtn')
      .addEventListener('click', function () {
        BP_Clientes.currentView = 'table';
        document.getElementById('viewTable').classList.remove('d-none');
        document.getElementById('viewCards').classList.add('d-none');
        this.classList.add('active');
        document.getElementById('viewCardsBtn').classList.remove('active');
        BP_ClientesRender.render();
      });

    document.getElementById('viewCardsBtn')
      .addEventListener('click', function () {
        BP_Clientes.currentView = 'cards';
        document.getElementById('viewCards').classList.remove('d-none');
        document.getElementById('viewTable').classList.add('d-none');
        this.classList.add('active');
        document.getElementById('viewTableBtn').classList.remove('active');
        BP_ClientesRender.render();
      });

    // Exportar
    document.getElementById('exportClientesBtn')
      .addEventListener('click', () => BP_ClientesActions.exportCSV());

    // Confirmar eliminar
    document.getElementById('confirmDeleteClienteBtn')
      .addEventListener('click', () => BP_ClientesActions.executeDelete());
  },

  async run() {
    this.bindEvents();
    await this.loadClientes();
  }
};

/* =====================================================
   8. ARRANQUE
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  BP_ClientesInit.run();
});