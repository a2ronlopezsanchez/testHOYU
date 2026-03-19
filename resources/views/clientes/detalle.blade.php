@extends('layouts.main')
@section('title','Detalle de Cliente')
@section('leve','Clientes')
@section('subleve','Detalle')

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/clientes.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

              <!-- Header -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="d-flex align-items-start justify-content-between flex-wrap gap-3">
                    <div class="d-flex align-items-center gap-3">
                      <button class="btn btn-icon btn-sm btn-outline-secondary"
                              onclick="window.location.href='{{ route('clientes.catalogo') }}'">
                        <i class="mdi mdi-arrow-left"></i>
                      </button>
                      <div class="d-flex align-items-center gap-3">
                        <div class="cliente-avatar cliente-avatar-moral"
                             id="headerAvatar"
                             style="width:52px;height:52px;font-size:1.1rem;">
                          ?
                        </div>
                        <div>
                          <h4 class="mb-1" id="headerNombre">Cargando...</h4>
                          <div class="d-flex align-items-center gap-2 flex-wrap">
                            <span class="text-muted small" id="headerRazonSocial"></span>
                            <span id="headerTipoBadge"></span>
                            <span id="headerStatusBadge"></span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="d-flex gap-2 flex-wrap">
                      <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
                        <i class="mdi mdi-printer me-1"></i>
                        <span class="d-none d-sm-inline">Imprimir</span>
                      </button>
                      <a href="#" class="btn btn-sm btn-outline-primary" id="headerEditBtn">
                        <i class="mdi mdi-pencil-outline me-1"></i>
                        <span class="d-none d-sm-inline">Editar</span>
                      </a>
                      <a href="#"
                         class="btn btn-sm btn-primary" id="headerNuevaCotBtn">
                        <i class="mdi mdi-file-plus-outline me-1"></i>
                        <span class="d-none d-sm-inline">Nueva Cotización</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Stats rápidas -->
              <div class="row g-4 mb-4">
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 text-primary mb-0" id="statEventos">--</div>
                      <small class="text-muted">Eventos Totales</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 text-success mb-0" id="statRevenue">--</div>
                      <small class="text-muted">Revenue Total</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 text-warning mb-0" id="statPendiente">--</div>
                      <small class="text-muted">Saldo Pendiente</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 text-info mb-0" id="statTicket">--</div>
                      <small class="text-muted">Ticket Promedio</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row g-4">
                <!-- ══ COLUMNA PRINCIPAL ══ -->
                <div class="col-lg-8">

                  <!-- Tabs -->
                  <div class="card">
                    <div class="card-header p-0">
                      <ul class="nav nav-tabs card-header-tabs" id="clienteTabs">
                        <li class="nav-item">
                          <a class="nav-link active px-4 py-3" data-bs-toggle="tab"
                             href="#tabCotizaciones">
                            <i class="mdi mdi-file-document-outline me-1"></i>
                            Cotizaciones
                            <span class="badge bg-label-primary ms-1" id="badgeCotizaciones">0</span>
                          </a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link px-4 py-3" data-bs-toggle="tab"
                             href="#tabEventos">
                            <i class="mdi mdi-calendar-star me-1"></i>
                            Eventos
                            <span class="badge bg-label-success ms-1" id="badgeEventos">0</span>
                          </a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link px-4 py-3" data-bs-toggle="tab"
                             href="#tabCobranza">
                            <i class="mdi mdi-cash-clock me-1"></i>
                            Cobranza
                            <span class="badge bg-label-warning ms-1" id="badgeCobranza">0</span>
                          </a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link px-4 py-3" data-bs-toggle="tab"
                             href="#tabRevenue">
                            <i class="mdi mdi-chart-line me-1"></i>
                            Revenue
                          </a>
                        </li>
                        <li class="nav-item">
                          <a class="nav-link px-4 py-3" data-bs-toggle="tab"
                             href="#tabFacturacion">
                            <i class="mdi mdi-receipt-text-outline me-1"></i>
                            Facturación
                          </a>
                        </li>
                      </ul>
                    </div>

                    <div class="tab-content p-4">

                      <!-- Tab: Cotizaciones -->
                      <div class="tab-pane fade show active" id="tabCotizaciones">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <h6 class="mb-0">Historial de Cotizaciones</h6>
                          <a href="#" class="btn btn-sm btn-primary" id="nuevaCotBtn">
                            <i class="mdi mdi-plus me-1"></i>Nueva
                          </a>
                        </div>
                        <div id="cotizacionesList">
                          <div class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Tab: Eventos -->
                      <div class="tab-pane fade" id="tabEventos">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <h6 class="mb-0">Historial de Eventos</h6>
                          <a href="#" class="btn btn-sm btn-success" id="nuevoEvtBtn">
                            <i class="mdi mdi-plus me-1"></i>Nuevo Evento
                          </a>
                        </div>
                        <div id="eventosList">
                          <div class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Tab: Cobranza -->
                      <div class="tab-pane fade" id="tabCobranza">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <h6 class="mb-0">Estado de Cobranza</h6>
                        </div>
                        <div id="cobranzaList">
                          <div class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Tab: Revenue -->
                      <div class="tab-pane fade" id="tabRevenue">
                        <h6 class="mb-3">Análisis de Revenue</h6>
                        <div id="revenueContent">
                          <div class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                          </div>
                        </div>
                      </div>

                      <!-- Tab: Facturación -->
                      <div class="tab-pane fade" id="tabFacturacion">
                        <h6 class="mb-3">Historial de Facturación</h6>
                        <div id="facturacionList">
                          <div class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary"></div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
                <!-- ══ / COLUMNA PRINCIPAL ══ -->

                <!-- ══ PANEL LATERAL ══ -->
                <div class="col-lg-4">
                    <!-- Info general -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Información General</h5>
                    </div>
                    <div class="card-body" id="sideInfoGeneral">
                      <div class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Contactos -->
                  <div class="card mb-4">
                    <div class="card-header d-flex align-items-center justify-content-between">
                      <h5 class="card-title mb-0">Contactos</h5>
                      <a href="#" class="btn btn-sm btn-outline-primary" id="editContactosBtn">
                        <i class="mdi mdi-pencil-outline"></i>
                      </a>
                    </div>
                    <div class="card-body p-0" id="sideContactos">
                      <div class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Dirección -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Direcciones</h5>
                    </div>
                    <div class="card-body" id="sideDirecciones">
                      <div class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Preferencias -->
                  <div class="card mb-4">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Preferencias</h5>
                    </div>
                    <div class="card-body" id="sidePreferencias">
                      <div class="text-center py-3">
                        <div class="spinner-border spinner-border-sm text-primary"></div>
                      </div>
                    </div>
                  </div>

                  <!-- Acciones rápidas -->
                  <div class="card">
                    <div class="card-header">
                      <h5 class="card-title mb-0">Acciones Rápidas</h5>
                    </div>
                    <div class="card-body d-grid gap-2">
                      <a href="#" class="btn btn-primary" id="accionNuevaCot">
                        <i class="mdi mdi-file-plus-outline me-2"></i>
                        Nueva Cotización
                      </a>
                      <a href="#" class="btn btn-success" id="accionNuevoEvt">
                        <i class="mdi mdi-calendar-plus me-2"></i>
                        Nuevo Evento
                      </a>
                      <a href="#" class="btn btn-outline-secondary" id="accionEditarCliente">
                        <i class="mdi mdi-pencil-outline me-2"></i>
                        Editar Cliente
                      </a>
                      <button class="btn btn-outline-secondary" id="accionExportarCliente">
                        <i class="mdi mdi-download me-2"></i>
                        Exportar Perfil
                      </button>
                    </div>
                  </div>

                </div>
                <!-- ══ / PANEL LATERAL ══ -->

              </div>

            </div>
@endsection

@section('script')
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/vista-detalle-cliente.js') }}"></script>
@endsection
