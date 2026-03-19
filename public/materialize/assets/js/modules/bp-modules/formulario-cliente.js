/* =====================================================
   FORMULARIO CLIENTE — Black Production
   formulario-cliente.js
   ===================================================== */

'use strict';

/* =====================================================
   1. CONFIGURACIÓN GLOBAL
   ===================================================== */

const BP_FormCliente = {
  USE_MOCK:     false,
  API_BASE:     '/clientes',
  mode:         'new',   // 'new' | 'edit'
  clienteId:    null,
  contactosExtra: [],    // contactos adicionales dinámicos
  contactoExtraCount: 0
};

/* =====================================================
   2. CAPA DE API
   ===================================================== */

const BP_FormClienteAPI = {

  getHeaders() {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
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

  async getById(id) {
    const res = await fetch(`${BP_FormCliente.API_BASE}/${id}`, {
      headers: { 'Accept': 'application/json' }
    });
    return this.handleResponse(res, 'Cliente no encontrado');
  },

  async create(data) {
    const res = await fetch(BP_FormCliente.API_BASE, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res, 'Error al crear cliente');
  },

  async update(id, data) {
    const res = await fetch(`${BP_FormCliente.API_BASE}/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    return this.handleResponse(res, 'Error al actualizar cliente');
  }
};

/* =====================================================
   3. HELPERS DEL FORMULARIO
   ===================================================== */

const BP_FormHelpers = {

  getUrlParam(param) {
    return new URLSearchParams(window.location.search).get(param);
  },

  initials(nombre) {
    if (!nombre || nombre === '—') return '?';
    return nombre.trim().split(' ')
      .slice(0, 2).map(w => w[0]).join('').toUpperCase();
  },

  statusBadgeHtml(status) {
    const map = {
      'Activo':    '<span class="badge-cliente-activo">Activo</span>',
      'Prospecto': '<span class="badge-cliente-prospecto">Prospecto</span>',
      'VIP':       '<span class="badge-cliente-vip">⭐ VIP</span>',
      'Inactivo':  '<span class="badge-cliente-inactivo">Inactivo</span>'
    };
    return map[status] || '';
  },

  toast(icon, title) {
    if (typeof Swal === 'undefined') { alert(title); return; }
    Swal.fire({
      toast: true, position: 'top-end',
      icon, title,
      showConfirmButton: false,
      timer: 3500, timerProgressBar: true
    });
  },

  val(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : '';
  },

  setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value || '';
  },

  setSelect(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const opt = [...el.options].find(o => o.value === value);
    if (opt) el.value = value;
  },

  setCheck(id, checked) {
    const el = document.getElementById(id);
    if (el) el.checked = !!checked;
  }
};

/* =====================================================
   4. PREVIEW EN TIEMPO REAL (panel lateral)
   ===================================================== */

const BP_FormPreview = {

  update() {
    const tipo   = BP_FormHelpers.val('clienteTipo');
    const status = BP_FormHelpers.val('clienteStatus');
    const rfc    = BP_FormHelpers.val('clienteRfc');
    const email  = BP_FormHelpers.val('cp1Email');
    const tel    = BP_FormHelpers.val('cp1Tel');
    const ciudad = BP_FormHelpers.val('fiscalCiudad');
    const pago   = BP_FormHelpers.val('clienteFormaPago');

    // Nombre según tipo
    let nombre = '—';
    if (tipo === 'Persona Moral') {
      nombre = BP_FormHelpers.val('clienteNombreColoquial') ||
               BP_FormHelpers.val('clienteRazonSocial') || '—';
    } else {
      const n  = BP_FormHelpers.val('clienteNombre');
      const ap = BP_FormHelpers.val('clienteApellidoP');
      const am = BP_FormHelpers.val('clienteApellidoM');
      nombre = [n, ap, am].filter(Boolean).join(' ') || '—';
    }

    // Avatar
    const avatarEl = document.getElementById('previewAvatar');
    avatarEl.textContent = BP_FormHelpers.initials(nombre);
    avatarEl.className   = `cliente-avatar mx-auto mb-2 ${
      tipo === 'Persona Moral' ? 'cliente-avatar-moral' : 'cliente-avatar-fisica'
    }`;
    avatarEl.style.cssText =
      'width:64px;height:64px;font-size:1.4rem;';

    document.getElementById('previewNombre').textContent  = nombre;
    document.getElementById('previewTipo').textContent    = tipo;
    document.getElementById('previewStatus').innerHTML    =
      BP_FormHelpers.statusBadgeHtml(status);
    document.getElementById('previewRfc').textContent     = rfc || '—';
    document.getElementById('previewEmail').textContent   = email || '—';
    document.getElementById('previewTel').textContent     = tel || '—';
    document.getElementById('previewCiudad').textContent  = ciudad || '—';
    document.getElementById('previewFormaPago').textContent = pago || '—';

    this.updateChecklist(nombre, rfc, email, tel);
    this.updateSteps(nombre, rfc, email, tel);
  },

  updateChecklist(nombre, rfc, email, tel) {
    const tipo = BP_FormHelpers.val('clienteTipo');
    let nombreValido = false;

    if (tipo === 'Persona Moral') {
      nombreValido = !!BP_FormHelpers.val('clienteRazonSocial');
    } else {
      nombreValido = !!(
        BP_FormHelpers.val('clienteNombre') &&
        BP_FormHelpers.val('clienteApellidoP')
      );
    }

    const checks = [
      { id: 'chk-nombre',  label: 'Nombre / Razón Social', valid: nombreValido },
      { id: 'chk-rfc',     label: 'RFC',                   valid: rfc.length >= 12 },
      { id: 'chk-email',   label: 'Email de contacto',     valid: /\S+@\S+\.\S+/.test(email) },
      { id: 'chk-tel',     label: 'Teléfono de contacto',  valid: tel.length >= 8 },
    ];

    document.getElementById('validationChecklist').innerHTML =
      checks.map(c => `
        <div class="check-item ${c.valid ? 'valid' : ''}">
          <i class="mdi ${c.valid
            ? 'mdi-check-circle-outline'
            : 'mdi-circle-outline'}"></i>
          ${c.label}
        </div>`
      ).join('');
  },

  updateSteps(nombre, rfc, email, tel) {
    const tipo = BP_FormHelpers.val('clienteTipo');
    let step1ok = false;

    if (tipo === 'Persona Moral') {
      step1ok = !!BP_FormHelpers.val('clienteRazonSocial') && rfc.length >= 12;
    } else {
      step1ok = !!(
        BP_FormHelpers.val('clienteNombre') &&
        BP_FormHelpers.val('clienteApellidoP') &&
        rfc.length >= 12
      );
    }

    const step2ok = !!BP_FormHelpers.val('fiscalCiudad');
    const step3ok = /\S+@\S+\.\S+/.test(email) && tel.length >= 8;
    const step4ok = true; // opcional

    const items = document.querySelectorAll('.step-item');
    const lines = document.querySelectorAll('.step-line');
    const steps = [step1ok, step2ok, step3ok, step4ok];

    items.forEach((item, i) => {
      item.classList.remove('active', 'completed');
      if (steps[i]) {
        item.classList.add('completed');
      }
    });

    lines.forEach((line, i) => {
      line.classList.toggle('completed', steps[i]);
    });

    // Marcar el primer incompleto como activo
    const firstIncomplete = steps.findIndex(s => !s);
    if (firstIncomplete !== -1 && items[firstIncomplete]) {
      items[firstIncomplete].classList.add('active');
    }
  }
};
/* =====================================================
   5. CONTACTOS ADICIONALES DINÁMICOS
   ===================================================== */

const BP_FormContactos = {

  add() {
    const count = ++BP_FormCliente.contactoExtraCount;
    const id    = `extra-${count}`;

    BP_FormCliente.contactosExtra.push(id);

    const container = document.getElementById('contactosAdicionalesContainer');
    const div       = document.createElement('div');
    div.className   = 'contacto-extra-card';
    div.id          = `card-${id}`;
    div.innerHTML   = `
      <button class="btn btn-sm btn-outline-danger remove-contacto-btn"
              type="button"
              onclick="BP_FormContactos.remove('${id}')">
        <i class="mdi mdi-close"></i>
      </button>
      <div class="row g-3">
        <div class="col-12">
          <small class="text-muted fw-semibold">
            Contacto Adicional #${count}
          </small>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control"
                   id="${id}-nombre" placeholder="Nombre">
            <label>Nombre Completo</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control"
                   id="${id}-cargo" placeholder="Cargo">
            <label>Cargo / Puesto</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="email" class="form-control"
                   id="${id}-email" placeholder="email@ejemplo.com">
            <label>Email</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="tel" class="form-control"
                   id="${id}-tel" placeholder="55 1234 5678">
            <label>Teléfono</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="tel" class="form-control"
                   id="${id}-whatsapp" placeholder="55 1234 5678">
            <label>WhatsApp</label>
          </div>
        </div>
        <div class="col-md-6">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control"
                   id="${id}-cumpleanos" placeholder="DD/MM">
            <label>Cumpleaños (DD/MM)</label>
          </div>
        </div>
      </div>`;

    container.appendChild(div);

    // Scroll suave al nuevo contacto
    setTimeout(() => {
      div.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  },

  remove(id) {
    const card = document.getElementById(`card-${id}`);
    if (card) {
      card.style.opacity    = '0';
      card.style.transform  = 'translateY(-10px)';
      card.style.transition = 'all 0.2s ease';
      setTimeout(() => card.remove(), 200);
    }
    BP_FormCliente.contactosExtra =
      BP_FormCliente.contactosExtra.filter(x => x !== id);
  },

  getAll() {
    return BP_FormCliente.contactosExtra.map(id => ({
      nombre:     document.getElementById(`${id}-nombre`)?.value.trim()     || '',
      cargo:      document.getElementById(`${id}-cargo`)?.value.trim()      || '',
      email:      document.getElementById(`${id}-email`)?.value.trim()      || '',
      tel:        document.getElementById(`${id}-tel`)?.value.trim()        || '',
      whatsapp:   document.getElementById(`${id}-whatsapp`)?.value.trim()   || '',
      cumpleanos: document.getElementById(`${id}-cumpleanos`)?.value.trim() || ''
    })).filter(c => c.nombre || c.email || c.tel);
  },

  loadFromData(contactos) {
    if (!contactos || contactos.length === 0) return;
    contactos.forEach(c => {
      this.add();
      const id = BP_FormCliente.contactosExtra[
        BP_FormCliente.contactosExtra.length - 1
      ];
      BP_FormHelpers.setVal(`${id}-nombre`,     c.nombre);
      BP_FormHelpers.setVal(`${id}-cargo`,      c.cargo);
      BP_FormHelpers.setVal(`${id}-email`,      c.email);
      BP_FormHelpers.setVal(`${id}-tel`,        c.tel);
      BP_FormHelpers.setVal(`${id}-whatsapp`,   c.whatsapp);
      BP_FormHelpers.setVal(`${id}-cumpleanos`, c.cumpleanos);
    });
  }
};

/* =====================================================
   6. RECOLECCIÓN Y VALIDACIÓN DE DATOS
   ===================================================== */

const BP_FormData = {

  /**
   * Valida campos requeridos y retorna array de errores
   */
  validate() {
    const errors  = [];
    const tipo    = BP_FormHelpers.val('clienteTipo');
    const rfc     = BP_FormHelpers.val('clienteRfc');
    const email   = BP_FormHelpers.val('cp1Email');
    const tel     = BP_FormHelpers.val('cp1Tel');
    const nombre  = BP_FormHelpers.val('cp1Nombre');

    // Nombre / Razón Social
    if (tipo === 'Persona Moral') {
      if (!BP_FormHelpers.val('clienteRazonSocial')) {
        errors.push({ field: 'clienteRazonSocial', msg: 'La razón social es obligatoria' });
      }
    } else {
      if (!BP_FormHelpers.val('clienteNombre')) {
        errors.push({ field: 'clienteNombre', msg: 'El nombre es obligatorio' });
      }
      if (!BP_FormHelpers.val('clienteApellidoP')) {
        errors.push({ field: 'clienteApellidoP', msg: 'El apellido paterno es obligatorio' });
      }
    }

    // RFC
    if (!rfc) {
      errors.push({ field: 'clienteRfc', msg: 'El RFC es obligatorio' });
    } else if (rfc.length < 12 || rfc.length > 13) {
      errors.push({ field: 'clienteRfc', msg: 'El RFC debe tener 12 o 13 caracteres' });
    }

    // Contacto principal
    if (!nombre) {
      errors.push({ field: 'cp1Nombre', msg: 'El nombre del contacto principal es obligatorio' });
    }
    if (!email) {
      errors.push({ field: 'cp1Email', msg: 'El email del contacto principal es obligatorio' });
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.push({ field: 'cp1Email', msg: 'El email no tiene un formato válido' });
    }
    if (!tel) {
      errors.push({ field: 'cp1Tel', msg: 'El teléfono del contacto principal es obligatorio' });
    }

    return errors;
  },

  /**
   * Muestra errores de validación en los campos
   */
  showErrors(errors) {
    // Limpiar errores previos
    document.querySelectorAll('.is-invalid').forEach(el => {
      el.classList.remove('is-invalid');
    });
    document.querySelectorAll('.invalid-feedback').forEach(el => {
      el.remove();
    });

    errors.forEach(err => {
      const el = document.getElementById(err.field);
      if (!el) return;
      el.classList.add('is-invalid');
      const feedback = document.createElement('div');
      feedback.className   = 'invalid-feedback';
      feedback.textContent = err.msg;
      el.parentNode.appendChild(feedback);
    });

    // Scroll al primer error
    if (errors.length > 0) {
      const firstEl = document.getElementById(errors[0].field);
      if (firstEl) {
        firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstEl.focus();
      }
    }
  },

  /**
   * Recolecta todos los datos del formulario
   */
  collect() {
    const tipo = BP_FormHelpers.val('clienteTipo');

    // Nombre display
    let nombreColoquial = '';
    let razonSocial     = null;

    if (tipo === 'Persona Moral') {
      razonSocial     = BP_FormHelpers.val('clienteRazonSocial');
      nombreColoquial = BP_FormHelpers.val('clienteNombreColoquial');
    } else {
      const n  = BP_FormHelpers.val('clienteNombre');
      const ap = BP_FormHelpers.val('clienteApellidoP');
      const am = BP_FormHelpers.val('clienteApellidoM');
      nombreColoquial = [n, ap, am].filter(Boolean).join(' ');
    }

    const nombre = BP_FormHelpers.val('clienteNombre');
    const apellidoPaterno = BP_FormHelpers.val('clienteApellidoP');
    const apellidoMaterno = BP_FormHelpers.val('clienteApellidoM');

    // Dirección física
    const hasFisica = document.getElementById('toggleDireccionFisica')?.checked;
    const direccionFisica = hasFisica ? {
      calle:   BP_FormHelpers.val('fisicaCalle'),
      colonia: BP_FormHelpers.val('fisicaColonia'),
      ciudad:  BP_FormHelpers.val('fisicaCiudad'),
      estado:  BP_FormHelpers.val('fisicaEstado'),
      cp:      BP_FormHelpers.val('fisicaCp')
    } : null;

    // Contacto alternativo
    const hasAlt = document.getElementById('toggleContactoAlt')?.checked;
    const contactoAlternativo = hasAlt ? {
      nombre:     BP_FormHelpers.val('cp2Nombre'),
      cargo:      BP_FormHelpers.val('cp2Cargo'),
      email:      BP_FormHelpers.val('cp2Email'),
      tel:        BP_FormHelpers.val('cp2Tel'),
      whatsapp:   BP_FormHelpers.val('cp2Whatsapp'),
      cumpleanos: BP_FormHelpers.val('cp2Cumpleanos')
    } : null;

    // Canales de comunicación
    const canales = ['canalEmail','canalWhatsapp','canalTelefono','canalPresencial']
      .filter(id => document.getElementById(id)?.checked)
      .map(id => document.getElementById(id).value);

    return {
      tipo,
      nombreColoquial,
      razonSocial,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      rfc:    BP_FormHelpers.val('clienteRfc').toUpperCase(),
      giro:   BP_FormHelpers.val('clienteGiro'),
      status: BP_FormHelpers.val('clienteStatus'),
      direccionFiscal: {
        calle:          BP_FormHelpers.val('fiscalCalle'),
        colonia:        BP_FormHelpers.val('fiscalColonia'),
        ciudad:         BP_FormHelpers.val('fiscalCiudad'),
        estado:         BP_FormHelpers.val('fiscalEstado'),
        cp:             BP_FormHelpers.val('fiscalCp'),
        regimenFiscal:  BP_FormHelpers.val('fiscalRegimenFiscal')
      },
      direccionFisica,
      contactoPrincipal: {
        nombre:     BP_FormHelpers.val('cp1Nombre'),
        cargo:      BP_FormHelpers.val('cp1Cargo'),
        email:      BP_FormHelpers.val('cp1Email'),
        tel:        BP_FormHelpers.val('cp1Tel'),
        whatsapp:   BP_FormHelpers.val('cp1Whatsapp'),
        cumpleanos: BP_FormHelpers.val('cp1Cumpleanos')
      },
      contactoAlternativo,
      contactosAdicionales: BP_FormContactos.getAll(),
      notas:              BP_FormHelpers.val('clienteNotas'),
      condicionesPago:    BP_FormHelpers.val('clienteCondicionesPago'),
      formaPago:          BP_FormHelpers.val('clienteFormaPago'),
      usoCfdi:            BP_FormHelpers.val('clienteUsoCfdi'),
      canalesComunicacion: canales,
      totalEventos:       0,
      revenueTotal:       0
    };
  }
};
/* =====================================================
   7. POPULATE — CARGA DATOS EN EDICIÓN
   ===================================================== */

const BP_FormPopulate = {

  load(c) {
    // Tipo y status
    BP_FormHelpers.setSelect('clienteTipo',   c.tipo);
    BP_FormHelpers.setSelect('clienteStatus', c.status);

    // Mostrar campos según tipo
    BP_FormUI.toggleTipo(c.tipo);

    // Datos según tipo
    if (c.tipo === 'Persona Moral') {
      BP_FormHelpers.setVal('clienteRazonSocial',    c.razonSocial);
      BP_FormHelpers.setVal('clienteNombreColoquial', c.nombreColoquial);
    } else {
      const partes = (c.nombreColoquial || '').split(' ');
      BP_FormHelpers.setVal('clienteNombre',    partes[0] || '');
      BP_FormHelpers.setVal('clienteApellidoP', partes[1] || '');
      BP_FormHelpers.setVal('clienteApellidoM', partes[2] || '');
    }

    // RFC y giro
    BP_FormHelpers.setVal('clienteRfc',  c.rfc);
    BP_FormHelpers.setVal('clienteGiro', c.giro);

    // Dirección fiscal
    if (c.direccionFiscal) {
      BP_FormHelpers.setVal('fiscalCalle',   c.direccionFiscal.calle);
      BP_FormHelpers.setVal('fiscalColonia', c.direccionFiscal.colonia);
      BP_FormHelpers.setVal('fiscalCiudad',  c.direccionFiscal.ciudad);
      BP_FormHelpers.setVal('fiscalCp',      c.direccionFiscal.cp);
      BP_FormHelpers.setSelect('fiscalEstado',
        c.direccionFiscal.estado);
      BP_FormHelpers.setSelect('fiscalRegimenFiscal',
        c.direccionFiscal.regimenFiscal);
    }

    // Dirección física
    if (c.direccionFisica) {
      BP_FormHelpers.setCheck('toggleDireccionFisica', true);
      document.getElementById('seccionDireccionFisica')
        .classList.remove('d-none');
      BP_FormHelpers.setVal('fisicaCalle',   c.direccionFisica.calle);
      BP_FormHelpers.setVal('fisicaColonia', c.direccionFisica.colonia);
      BP_FormHelpers.setVal('fisicaCiudad',  c.direccionFisica.ciudad);
      BP_FormHelpers.setVal('fisicaCp',      c.direccionFisica.cp);
      BP_FormHelpers.setSelect('fisicaEstado', c.direccionFisica.estado);
    }

    // Contacto principal
    if (c.contactoPrincipal) {
      BP_FormHelpers.setVal('cp1Nombre',     c.contactoPrincipal.nombre);
      BP_FormHelpers.setVal('cp1Cargo',      c.contactoPrincipal.cargo);
      BP_FormHelpers.setVal('cp1Email',      c.contactoPrincipal.email);
      BP_FormHelpers.setVal('cp1Tel',        c.contactoPrincipal.tel);
      BP_FormHelpers.setVal('cp1Whatsapp',   c.contactoPrincipal.whatsapp);
      BP_FormHelpers.setVal('cp1Cumpleanos', c.contactoPrincipal.cumpleanos);
    }

    // Contacto alternativo
    if (c.contactoAlternativo) {
      BP_FormHelpers.setCheck('toggleContactoAlt', true);
      document.getElementById('seccionContactoAlt')
        .classList.remove('d-none');
      BP_FormHelpers.setVal('cp2Nombre',     c.contactoAlternativo.nombre);
      BP_FormHelpers.setVal('cp2Cargo',      c.contactoAlternativo.cargo);
      BP_FormHelpers.setVal('cp2Email',      c.contactoAlternativo.email);
      BP_FormHelpers.setVal('cp2Tel',        c.contactoAlternativo.tel);
      BP_FormHelpers.setVal('cp2Whatsapp',   c.contactoAlternativo.whatsapp);
      BP_FormHelpers.setVal('cp2Cumpleanos', c.contactoAlternativo.cumpleanos);
    }

    // Contactos adicionales
    if (c.contactosAdicionales?.length) {
      BP_FormContactos.loadFromData(c.contactosAdicionales);
    }

    // Notas y preferencias
    BP_FormHelpers.setVal('clienteNotas',           c.notas);
    BP_FormHelpers.setVal('clienteCondicionesPago', c.condicionesPago);
    BP_FormHelpers.setSelect('clienteFormaPago',    c.formaPago);
    BP_FormHelpers.setSelect('clienteUsoCfdi',      c.usoCfdi);

    // Canales de comunicación
    if (c.canalesComunicacion?.length) {
      ['canalEmail','canalWhatsapp','canalTelefono','canalPresencial']
        .forEach(id => {
          const el = document.getElementById(id);
          if (el) el.checked = c.canalesComunicacion.includes(el.value);
        });
    }

    // Actualizar preview
    BP_FormPreview.update();
  }
};

/* =====================================================
   8. UI — INTERACCIONES VISUALES
   ===================================================== */

const BP_FormUI = {

  toggleTipo(tipo) {
    const esMoral  = tipo === 'Persona Moral';
    document.getElementById('camposMoral')
      .classList.toggle('d-none', !esMoral);
    document.getElementById('camposFisica')
      .classList.toggle('d-none', esMoral);
  },

  highlightSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.add('highlighted');
    setTimeout(() => section.classList.remove('highlighted'), 1500);
  },

  bindAll() {

    // Toggle tipo cliente
    document.getElementById('clienteTipo')
      .addEventListener('change', function () {
        BP_FormUI.toggleTipo(this.value);
        BP_FormPreview.update();
      });

    // Toggle dirección física
    document.getElementById('toggleDireccionFisica')
      .addEventListener('change', function () {
        document.getElementById('seccionDireccionFisica')
          .classList.toggle('d-none', !this.checked);
        if (this.checked) {
          BP_FormUI.highlightSection('section2');
        }
      });

    // Toggle contacto alternativo
    document.getElementById('toggleContactoAlt')
      .addEventListener('change', function () {
        document.getElementById('seccionContactoAlt')
          .classList.toggle('d-none', !this.checked);
        if (this.checked) {
          BP_FormUI.highlightSection('section3');
        }
      });

    // Agregar contacto extra
    document.getElementById('addContactoBtn')
      .addEventListener('click', () => BP_FormContactos.add());

    // RFC mayúsculas automático
    document.getElementById('clienteRfc')
      .addEventListener('input', function () {
        const pos = this.selectionStart;
        this.value = this.value.toUpperCase();
        this.setSelectionRange(pos, pos);
        BP_FormPreview.update();
      });

    // Preview en tiempo real — campos clave
    const previewFields = [
      'clienteTipo','clienteStatus','clienteRazonSocial',
      'clienteNombreColoquial','clienteNombre','clienteApellidoP',
      'clienteApellidoM','clienteRfc','cp1Email','cp1Tel',
      'fiscalCiudad','clienteFormaPago'
    ];
    previewFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('input',  () => BP_FormPreview.update());
        el.addEventListener('change', () => BP_FormPreview.update());
      }
    });

    // Scroll spy — resalta step activo al hacer scroll
    const sections = ['section1','section2','section3','section4'];
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = sections.indexOf(entry.target.id);
          if (idx === -1) return;
          document.querySelectorAll('.step-item').forEach((s, i) => {
            s.classList.toggle('active',
              i === idx && !s.classList.contains('completed'));
          });
        }
      });
    }, { threshold: 0.3 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // Click en step navega a sección
    document.querySelectorAll('.step-item').forEach((item, i) => {
      item.style.cursor = 'pointer';
      item.addEventListener('click', () => {
        const section = document.getElementById(`section${i + 1}`);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }
};

/* =====================================================
   9. GUARDAR
   ===================================================== */

const BP_FormSave = {

  async save() {
    const errors = BP_FormData.validate();
    if (errors.length > 0) {
      BP_FormData.showErrors(errors);
      BP_FormHelpers.toast('warning',
        `Corrige ${errors.length} campo${errors.length > 1 ? 's' : ''} requerido${errors.length > 1 ? 's' : ''}`
      );
      return;
    }

    const data    = BP_FormData.collect();
    const saveBtn = document.getElementById('saveClienteBtn');
    const sideBtn = document.getElementById('saveSideBtn');

    [saveBtn, sideBtn].forEach(btn => {
      if (!btn) return;
      btn.disabled  = true;
      btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Guardando...';
    });

    try {
      let result;
      if (BP_FormCliente.mode === 'edit') {
        result = await BP_FormClienteAPI.update(BP_FormCliente.clienteId, data);
        BP_FormHelpers.toast('success', 'Cliente actualizado correctamente');
      } else {
        result = await BP_FormClienteAPI.create(data);
        BP_FormHelpers.toast('success', 'Cliente creado correctamente');
      }

      // Redirigir al detalle del cliente
      setTimeout(() => {
        window.location.href =
          `/clientes/detalle?id=${result.id}`;
      }, 1200);

    } catch (err) {
      BP_FormHelpers.toast('error', err.message || 'Error al guardar');
      [saveBtn, sideBtn].forEach(btn => {
        if (!btn) return;
        btn.disabled  = false;
        btn.innerHTML = '<i class="mdi mdi-content-save me-1"></i>Guardar Cliente';
      });
    }
  }
};

/* =====================================================
   10. INICIALIZACIÓN
   ===================================================== */

const BP_FormClienteInit = {

  async run() {
    // Leer modo y ID de la URL
    BP_FormCliente.mode      = BP_FormHelpers.getUrlParam('mode') || 'new';
    BP_FormCliente.clienteId = BP_FormHelpers.getUrlParam('id');

    // Actualizar título
    if (BP_FormCliente.mode === 'edit') {
      document.getElementById('formTitle').textContent    = 'Editar Cliente';
      document.getElementById('formSubtitle').textContent =
        'Modifica la información del cliente';
      document.title = 'Editar Cliente | Black Production';
    }

    // Inicializar tipo por defecto
    BP_FormUI.toggleTipo('Persona Moral');

    // Bind de eventos UI
    BP_FormUI.bindAll();

    // Botones guardar
    document.getElementById('saveClienteBtn')
      .addEventListener('click', () => BP_FormSave.save());
    document.getElementById('saveSideBtn')
      .addEventListener('click', () => BP_FormSave.save());

    // Preview inicial
    BP_FormPreview.update();

    // Si es edición, cargar datos
    if (BP_FormCliente.mode === 'edit' && BP_FormCliente.clienteId) {
      await this.loadForEdit();
    }
  },

  async loadForEdit() {
    // Deshabilitar botones mientras carga
    ['saveClienteBtn','saveSideBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.disabled  = true;
        el.innerHTML =
          '<span class="spinner-border spinner-border-sm me-1"></span>Cargando...';
      }
    });

    try {
      const cliente = await BP_FormClienteAPI.getById(BP_FormCliente.clienteId);
      if (!cliente) throw new Error('Cliente no encontrado');

      BP_FormPopulate.load(cliente);

      // Actualizar subtítulo con nombre del cliente
      const nombre = cliente.nombreColoquial ||
                     cliente.razonSocial     ||
                     cliente.contactoPrincipal?.nombre || '';
      document.getElementById('formSubtitle').textContent =
        `Editando: ${nombre}`;

    } catch (err) {
      BP_FormHelpers.toast('error', err.message || 'Error al cargar cliente');
    } finally {
      ['saveClienteBtn','saveSideBtn'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.disabled  = false;
          el.innerHTML =
            '<i class="mdi mdi-content-save me-1"></i>Guardar Cliente';
        }
      });
    }
  }
};

/* =====================================================
   11. ARRANQUE
   ===================================================== */

document.addEventListener('DOMContentLoaded', () => {
  BP_FormClienteInit.run();
});