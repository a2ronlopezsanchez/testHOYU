@extends('layouts.main')
@section('title','Formulario de Cliente')
@section('leve','Clientes')
@section('subleve','Formulario')

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/clientes.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

              <!-- Header -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <button class="btn btn-icon btn-sm btn-outline-secondary"
                              onclick="window.location.href='{{ route('clientes.catalogo') }}'">
                        <i class="mdi mdi-arrow-left"></i>
                      </button>
                      <div>
                        <h4 class="mb-1" id="formTitle">Nuevo Cliente</h4>
                        <small class="text-muted" id="formSubtitle">
                          Completa la información del cliente
                        </small>
                      </div>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-outline-secondary btn-sm" id="cancelFormBtn"
                              onclick="window.location.href='{{ route('clientes.catalogo') }}'">
                        Cancelar
                      </button>
                      <button class="btn btn-primary btn-sm" id="saveClienteBtn">
                        <i class="mdi mdi-content-save me-1"></i>
                        Guardar Cliente
                      </button>
                    </div>
                  </div>

                  <!-- Progress steps -->
                  <div class="form-steps mt-4">
                    <div class="steps-track">
                      <div class="step-item active" data-step="1">
                        <div class="step-dot">1</div>
                        <div class="step-label">General</div>
                      </div>
                      <div class="step-line"></div>
                      <div class="step-item" data-step="2">
                        <div class="step-dot">2</div>
                        <div class="step-label">Fiscal</div>
                      </div>
                      <div class="step-line"></div>
                      <div class="step-item" data-step="3">
                        <div class="step-dot">3</div>
                        <div class="step-label">Contactos</div>
                      </div>
                      <div class="step-line"></div>
                      <div class="step-item" data-step="4">
                        <div class="step-dot">4</div>
                        <div class="step-label">Notas</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-4">

                <!-- ══ COLUMNA PRINCIPAL ══ -->
                <div class="col-lg-8">

                  <!-- PASO 1: Información General -->
                  <div class="card mb-4 form-section" id="section1">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <span class="step-badge">1</span>
                        Información General
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">

                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="clienteTipo">
                              <option value="Persona Moral">Persona Moral</option>
                              <option value="Persona Física">Persona Física</option>
                            </select>
                            <label for="clienteTipo">Tipo de Cliente *</label>
                          </div>
                        </div>

                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="clienteStatus">
                              <option value="Prospecto">Prospecto</option>
                              <option value="Activo">Activo</option>
                              <option value="VIP">VIP</option>
                              <option value="Inactivo">Inactivo</option>
                            </select>
                            <label for="clienteStatus">Estatus *</label>
                          </div>
                        </div>

                        <!-- Campos Persona Moral -->
                        <div class="col-12" id="camposMoral">
                          <div class="row g-3">
                            <div class="col-md-6">
                              <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" id="clienteRazonSocial"
                                       placeholder="Razón Social">
                                <label for="clienteRazonSocial">Razón Social *</label>
                              </div>
                            </div>
                            <div class="col-md-6">
                              <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" id="clienteNombreColoquial"
                                       placeholder="Nombre Coloquial">
                                <label for="clienteNombreColoquial">Nombre Coloquial</label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <!-- Campos Persona Física -->
                        <div class="col-12 d-none" id="camposFisica">
                          <div class="row g-3">
                            <div class="col-md-4">
                              <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" id="clienteNombre"
                                       placeholder="Nombre(s)">
                                <label for="clienteNombre">Nombre(s) *</label>
                              </div>
                            </div>
                            <div class="col-md-4">
                              <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" id="clienteApellidoP"
                                       placeholder="Apellido Paterno">
                                <label for="clienteApellidoP">Apellido Paterno *</label>
                              </div>
                            </div>
                            <div class="col-md-4">
                              <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" id="clienteApellidoM"
                                       placeholder="Apellido Materno">
                                <label for="clienteApellidoM">Apellido Materno</label>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control font-monospace" id="clienteRfc"
                                   placeholder="RFC" maxlength="13"
                                   style="text-transform:uppercase;">
                            <label for="clienteRfc">RFC *</label>
                          </div>
                        </div>

                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control" id="clienteGiro"
                                   placeholder="Giro o industria">
                            <label for="clienteGiro">Giro / Industria</label>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <!-- PASO 2: Información Fiscal -->
                  <div class="card mb-4 form-section" id="section2">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <span class="step-badge">2</span>
                        Información Fiscal y Dirección
                      </h5>
                    </div>
                    <div class="card-body">
                      <h6 class="text-muted text-uppercase small fw-semibold mb-3">
                        Dirección Fiscal
                      </h6>
                      <div class="row g-3">
                        <div class="col-md-8">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control" id="fiscalCalle"
                                   placeholder="Calle y número">
                            <label for="fiscalCalle">Calle y Número</label>
                          </div>
                        </div>
                        <div class="col-md-4">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control" id="fiscalCp"
                                   placeholder="CP" maxlength="5">
                            <label for="fiscalCp">Código Postal</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control" id="fiscalColonia"
                                   placeholder="Colonia">
                            <label for="fiscalColonia">Colonia</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control" id="fiscalCiudad"
                                   placeholder="Ciudad">
                            <label for="fiscalCiudad">Ciudad / Municipio</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="fiscalEstado">
                              <option value="">Selecciona estado...</option>
                              <option>Aguascalientes</option><option>Baja California</option>
                              <option>Baja California Sur</option><option>Campeche</option>
                              <option>Chiapas</option><option>Chihuahua</option>
                              <option>CDMX</option><option>Coahuila</option>
                              <option>Colima</option><option>Durango</option>
                              <option>Estado de México</option><option>Guanajuato</option>
                              <option>Guerrero</option><option>Hidalgo</option>
                              <option>Jalisco</option><option>Michoacán</option>
                              <option>Morelos</option><option>Nayarit</option>
                              <option>Nuevo León</option><option>Oaxaca</option>
                              <option>Puebla</option><option>Querétaro</option>
                              <option>Quintana Roo</option><option>San Luis Potosí</option>
                              <option>Sinaloa</option><option>Sonora</option>
                              <option>Tabasco</option><option>Tamaulipas</option>
                              <option>Tlaxcala</option><option>Veracruz</option>
                              <option>Yucatán</option><option>Zacatecas</option>
                            </select>
                            <label for="fiscalEstado">Estado</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="fiscalRegimenFiscal">
                              <option value="">Selecciona régimen...</option>
                              <option value="601">601 - General de Ley Personas Morales</option>
                              <option value="603">603 - Personas Morales con Fines no Lucrativos</option>
                              <option value="605">605 - Sueldos y Salarios</option>
                              <option value="606">606 - Arrendamiento</option>
                              <option value="612">612 - Personas Físicas con Actividades Empresariales</option>
                              <option value="616">616 - Sin Obligaciones Fiscales</option>
                              <option value="621">621 - Incorporación Fiscal</option>
                              <option value="626">626 - Régimen Simplificado de Confianza</option>
                            </select>
                            <label for="fiscalRegimenFiscal">Régimen Fiscal</label>
                          </div>
                        </div>
                      </div>

                      <!-- Toggle dirección física -->
                      <div class="form-check form-switch mt-4 mb-3">
                        <input class="form-check-input" type="checkbox"
                               id="toggleDireccionFisica">
                        <label class="form-check-label fw-medium"
                               for="toggleDireccionFisica">
                          Agregar dirección física (diferente a la fiscal)
                        </label>
                      </div>

                      <div id="seccionDireccionFisica" class="d-none">
                        <h6 class="text-muted text-uppercase small fw-semibold mb-3">
                          Dirección Física
                        </h6>
                        <div class="row g-3">
                          <div class="col-md-8">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control" id="fisicaCalle"
                                     placeholder="Calle y número">
                              <label for="fisicaCalle">Calle y Número</label>
                            </div>
                          </div>
                          <div class="col-md-4">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control" id="fisicaCp"
                                     placeholder="CP" maxlength="5">
                              <label for="fisicaCp">Código Postal</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control" id="fisicaColonia"
                                     placeholder="Colonia">
                              <label for="fisicaColonia">Colonia</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control" id="fisicaCiudad"
                                     placeholder="Ciudad">
                              <label for="fisicaCiudad">Ciudad / Municipio</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <select class="form-select" id="fisicaEstado">
                                <option value="">Selecciona estado...</option>
                                <option>Aguascalientes</option><option>Baja California</option>
                                <option>Baja California Sur</option><option>Campeche</option>
                                <option>Chiapas</option><option>Chihuahua</option>
                                <option>CDMX</option><option>Coahuila</option>
                                <option>Colima</option><option>Durango</option>
                                <option>Estado de México</option><option>Guanajuato</option>
                                <option>Guerrero</option><option>Hidalgo</option>
                                <option>Jalisco</option><option>Michoacán</option>
                                <option>Morelos</option><option>Nayarit</option>
                                <option>Nuevo León</option><option>Oaxaca</option>
                                <option>Puebla</option><option>Querétaro</option>
                                <option>Quintana Roo</option><option>San Luis Potosí</option>
                                <option>Sinaloa</option><option>Sonora</option>
                                <option>Tabasco</option><option>Tamaulipas</option>
                                <option>Tlaxcala</option><option>Veracruz</option>
                                <option>Yucatán</option><option>Zacatecas</option>
                              </select>
                              <label for="fisicaEstado">Estado</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- PASO 3: Contactos -->
                  <div class="card mb-4 form-section" id="section3">
                    <div class="card-header d-flex align-items-center justify-content-between">
                      <h5 class="card-title mb-0">
                        <span class="step-badge">3</span>
                        Contactos
                      </h5>
                    </div>
                    <div class="card-body">

                      <!-- Contacto Principal -->
                      <h6 class="text-muted text-uppercase small fw-semibold mb-3">
                        <i class="mdi mdi-account-star-outline me-1 text-primary"></i>
                        Contacto Principal
                      </h6>
                      <div class="row g-3 mb-4">
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control"
                                   id="cp1Nombre" placeholder="Nombre completo">
                            <label for="cp1Nombre">Nombre Completo *</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control"
                                   id="cp1Cargo" placeholder="Cargo o puesto">
                            <label for="cp1Cargo">Cargo / Puesto</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="email" class="form-control"
                                   id="cp1Email" placeholder="email@ejemplo.com">
                            <label for="cp1Email">Email *</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="tel" class="form-control"
                                   id="cp1Tel" placeholder="55 1234 5678">
                            <label for="cp1Tel">Teléfono *</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="tel" class="form-control"
                                   id="cp1Whatsapp" placeholder="55 1234 5678">
                            <label for="cp1Whatsapp">WhatsApp</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <input type="text" class="form-control"
                                   id="cp1Cumpleanos" placeholder="DD/MM">
                            <label for="cp1Cumpleanos">Cumpleaños (DD/MM)</label>
                          </div>
                        </div>
                      </div>

                      <hr class="my-3">

                      <!-- Contacto Alternativo -->
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="text-muted text-uppercase small fw-semibold mb-0">
                          <i class="mdi mdi-account-outline me-1"></i>
                          Contacto Alternativo
                        </h6>
                        <div class="form-check form-switch mb-0">
                          <input class="form-check-input" type="checkbox"
                                 id="toggleContactoAlt">
                          <label class="form-check-label small"
                                 for="toggleContactoAlt">Agregar</label>
                        </div>
                      </div>

                      <div id="seccionContactoAlt" class="d-none">
                        <div class="row g-3 mb-4">
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control"
                                     id="cp2Nombre" placeholder="Nombre completo">
                              <label for="cp2Nombre">Nombre Completo</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control"
                                     id="cp2Cargo" placeholder="Cargo o puesto">
                              <label for="cp2Cargo">Cargo / Puesto</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="email" class="form-control"
                                     id="cp2Email" placeholder="email@ejemplo.com">
                              <label for="cp2Email">Email</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="tel" class="form-control"
                                     id="cp2Tel" placeholder="55 1234 5678">
                              <label for="cp2Tel">Teléfono</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="tel" class="form-control"
                                     id="cp2Whatsapp" placeholder="55 1234 5678">
                              <label for="cp2Whatsapp">WhatsApp</label>
                            </div>
                          </div>
                          <div class="col-md-6">
                            <div class="form-floating form-floating-outline">
                              <input type="text" class="form-control"
                                     id="cp2Cumpleanos" placeholder="DD/MM">
                              <label for="cp2Cumpleanos">Cumpleaños (DD/MM)</label>
                            </div>
                          </div>
                        </div>
                      </div>

                      <hr class="my-3">

                      <!-- Contactos adicionales dinámicos -->
                      <div class="d-flex align-items-center justify-content-between mb-3">
                        <h6 class="text-muted text-uppercase small fw-semibold mb-0">
                          <i class="mdi mdi-account-multiple-outline me-1"></i>
                          Contactos Adicionales
                        </h6>
                        <button class="btn btn-sm btn-outline-primary"
                                type="button" id="addContactoBtn">
                          <i class="mdi mdi-plus me-1"></i>Agregar
                        </button>
                      </div>
                      <div id="contactosAdicionalesContainer">
                        <!-- Se agregan dinámicamente -->
                      </div>

                    </div>
                  </div>

                  <!-- PASO 4: Notas y Preferencias -->
                  <div class="card mb-4 form-section" id="section4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">
                        <span class="step-badge">4</span>
                        Notas y Preferencias
                      </h5>
                    </div>
                    <div class="card-body">
                      <div class="row g-3">
                        <div class="col-12">
                          <div class="form-floating form-floating-outline">
                            <textarea class="form-control" id="clienteNotas"
                                      placeholder="Notas generales..."
                                      style="height: 100px;"></textarea>
                            <label for="clienteNotas">Notas Generales</label>
                          </div>
                          <small class="text-muted">
                            Preferencias, condiciones especiales, observaciones importantes.
                          </small>
                        </div>
                        <div class="col-12">
                          <div class="form-floating form-floating-outline">
                            <textarea class="form-control" id="clienteCondicionesPago"
                                      placeholder="Condiciones de pago..."
                                      style="height: 80px;"></textarea>
                            <label for="clienteCondicionesPago">
                              Condiciones de Pago
                            </label>
                          </div>
                          <small class="text-muted">
                            Ej: 50% anticipo, 50% al término. Factura en 3 días.
                          </small>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="clienteFormaPago">
                              <option value="">Selecciona...</option>
                              <option value="Transferencia">Transferencia bancaria</option>
                              <option value="Efectivo">Efectivo</option>
                              <option value="Cheque">Cheque</option>
                              <option value="Tarjeta">Tarjeta de crédito/débito</option>
                              <option value="Mixto">Mixto</option>
                            </select>
                            <label for="clienteFormaPago">Forma de Pago Preferida</label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-floating form-floating-outline">
                            <select class="form-select" id="clienteUsoCfdi">
                              <option value="">Selecciona uso CFDI...</option>
                              <option value="G01">G01 - Adquisición de mercancias</option>
                              <option value="G03">G03 - Gastos en general</option>
                              <option value="P01">P01 - Por definir</option>
                              <option value="S01">S01 - Sin efectos fiscales</option>
                            </select>
                            <label for="clienteUsoCfdi">Uso de CFDI</label>
                          </div>
                        </div>
                        <div class="col-12">
                          <label class="form-label fw-medium small">
                            Canales de Comunicación Preferidos
                          </label>
                          <div class="d-flex gap-3 flex-wrap">
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox"
                                     id="canalEmail" value="Email">
                              <label class="form-check-label" for="canalEmail">
                                <i class="mdi mdi-email-outline me-1"></i>Email
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox"
                                     id="canalWhatsapp" value="WhatsApp">
                              <label class="form-check-label" for="canalWhatsapp">
                                <i class="mdi mdi-whatsapp me-1"></i>WhatsApp
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox"
                                     id="canalTelefono" value="Teléfono">
                              <label class="form-check-label" for="canalTelefono">
                                <i class="mdi mdi-phone-outline me-1"></i>Teléfono
                              </label>
                            </div>
                            <div class="form-check">
                              <input class="form-check-input" type="checkbox"
                                     id="canalPresencial" value="Presencial">
                              <label class="form-check-label" for="canalPresencial">
                                <i class="mdi mdi-account-outline me-1"></i>Presencial
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
                <!-- ══ / COLUMNA PRINCIPAL ══ -->

                <!-- ══ PANEL LATERAL ══ -->
                <div class="col-lg-4">

                  <!-- Resumen -->
                  <div class="card mb-4 sticky-top" style="top: 80px;">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Resumen del Cliente</h5>
                    </div>
                    <div class="card-body">

                      <!-- Avatar preview -->
                      <div class="text-center mb-4">
                        <div class="cliente-avatar mx-auto mb-2"
                             id="previewAvatar"
                             style="width:64px;height:64px;font-size:1.4rem;
                                    background:rgba(105,108,255,0.15);color:#696cff;">
                          ?
                        </div>
                        <div class="fw-semibold" id="previewNombre">—</div>
                        <div class="text-muted small" id="previewTipo">—</div>
                        <div class="mt-1" id="previewStatus"></div>
                      </div>

                      <hr class="my-3">

                      <!-- Info resumen -->
                      <div class="resume-row">
                        <span class="resume-label">RFC</span>
                        <span class="resume-value font-monospace" id="previewRfc">—</span>
                      </div>
                      <div class="resume-row">
                        <span class="resume-label">Email</span>
                        <span class="resume-value" id="previewEmail">—</span>
                      </div>
                      <div class="resume-row">
                        <span class="resume-label">Teléfono</span>
                        <span class="resume-value" id="previewTel">—</span>
                      </div>
                      <div class="resume-row">
                        <span class="resume-label">Ciudad</span>
                        <span class="resume-value" id="previewCiudad">—</span>
                      </div>
                      <div class="resume-row">
                        <span class="resume-label">Forma Pago</span>
                        <span class="resume-value" id="previewFormaPago">—</span>
                      </div>

                      <hr class="my-3">

                      <!-- Validación campos -->
                      <div class="mb-3">
                        <small class="text-muted fw-semibold d-block mb-2">
                          Campos requeridos
                        </small>
                        <div id="validationChecklist">
                          <!-- Se renderiza dinámicamente -->
                        </div>
                      </div>

                      <div class="d-grid gap-2 mt-3">
                        <button class="btn btn-primary" id="saveSideBtn">
                          <i class="mdi mdi-content-save me-1"></i>
                          Guardar Cliente
                        </button>
                        <button class="btn btn-outline-secondary"
                                onclick="window.location.href='{{ route('clientes.catalogo') }}'">
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
                <!-- ══ / PANEL LATERAL ══ -->

              </div>

            </div>
@endsection

@section('script')
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/formulario-cliente.js') }}"></script>
@endsection
