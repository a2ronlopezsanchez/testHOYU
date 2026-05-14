@extends('layouts.main')
@section('title', 'Gestión de Eventos')
@section('leve', 'Eventos')
@section('subleve', 'Gestión de Eventos')

@section('css')
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.0.96/css/materialdesignicons.min.css">
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/apex-charts/apex-charts.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/animate-css/animate.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/sweetalert2/sweetalert2.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/bootstrap-select/bootstrap-select.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/eventos-inventario.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
              
              <!-- Header Principal -->
              <div class="inventory-card-header mb-4">
                <div class="header-info">
                  <h4 class="fw-bold py-3 mb-2">
                    <span class="text-muted fw-light">Eventos /</span> Gestión de Eventos
                  </h4>
                </div>
                <div class="header-controls">
                  <button class="btn btn-outline-secondary" id="exportEventsBtn">
                    <i class="mdi mdi-file-export me-1"></i>
                    Exportar
                  </button>
                  <button class="btn btn-primary" id="addEventBtn">
                    <i class="mdi mdi-plus me-1"></i>
                    Crear Evento
                  </button>
                </div>
              </div>

              <!-- Estadísticas rápidas -->
              <div class="row mb-4">
                <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="content-left">
                          <h4 class="mb-1" id="totalEventsCount">0</h4>
                          <small>Total Eventos</small>
                        </div>
                        <span class="badge badge-center rounded-pill bg-label-primary">
                          <i class="mdi mdi-calendar-multiple mdi-24px"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="content-left">
                          <h4 class="mb-1" id="confirmedEventsCount">0</h4>
                          <small>Confirmados</small>
                        </div>
                        <span class="badge badge-center rounded-pill bg-label-success">
                          <i class="mdi mdi-calendar-check mdi-24px"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="content-left">
                          <h4 class="mb-1" id="inProgressEventsCount">0</h4>
                          <small>En Progreso</small>
                        </div>
                        <span class="badge badge-center rounded-pill bg-label-warning">
                          <i class="mdi mdi-progress-clock mdi-24px"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-xl-3 col-sm-6 mb-xl-0 mb-4">
                  <div class="card">
                    <div class="card-body">
                      <div class="d-flex align-items-center justify-content-between">
                        <div class="content-left">
                          <h4 class="mb-1" id="thisMonthEventsCount">0</h4>
                          <small>Este Mes</small>
                        </div>
                        <span class="badge badge-center rounded-pill bg-label-info">
                          <i class="mdi mdi-calendar-month mdi-24px"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Filtros y búsqueda -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="row g-3 align-items-center">
                    <div class="col-md-6">
                      <div class="d-flex gap-2 align-items-center">
                        <div class="input-group flex-grow-1">
                          <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                          <input
                            type="text"
                            class="form-control"
                            placeholder="uscar por folio, cotización, nombre, cliente, ubicación..."
                            id="searchEventsInput">
                          <button class="btn btn-outline-secondary d-none" type="button" id="clearSearchEventsBtn">
                            <i class="mdi mdi-close"></i>
                          </button>
                          <button class="btn btn-circle btn-clear-all" type="button" id="clearAllEventsBtn" title="Limpiar todos los filtros">
                            <i class="mdi mdi-refresh"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div class="col-md-6">
                      <div class="d-flex gap-2 justify-content-md-end">
                        <div class="dropdown">
                          <button class="btn btn-outline-secondary dropdown-toggle" type="button" id="filterEventsBtn" data-bs-toggle="dropdown">
                            <i class="mdi mdi-filter-variant me-1"></i>
                            Filtros
                          </button>
                          <div class="dropdown-menu dropdown-menu-end" style="min-width: 250px;">
                            <h6 class="dropdown-header">Filtrar por Estado</h6>
                            <div class="px-3">
                              <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" value="COTIZADO" id="filterCotizado" checked>
                                <label class="form-check-label" for="filterCotizado">Cotizado</label>
                              </div>
                              <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" value="CONFIRMADO" id="filterConfirmado" checked>
                                <label class="form-check-label" for="filterConfirmado">Confirmado</label>
                              </div>
                              <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" value="EN_PROGRESO" id="filterEnProgreso" checked>
                                <label class="form-check-label" for="filterEnProgreso">En Progreso</label>
                              </div>
                              <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" value="COMPLETADO" id="filterCompletado" checked>
                                <label class="form-check-label" for="filterCompletado">Completado</label>
                              </div>
                              <div class="form-check mb-2">
                                <input class="form-check-input" type="checkbox" value="CANCELADO" id="filterCancelado">
                                <label class="form-check-label" for="filterCancelado">Cancelado</label>
                              </div>
                            </div>
                            <div class="dropdown-divider"></div>
                            <h6 class="dropdown-header">Filtrar por Tipo</h6>
                            <div class="px-3">
                              <select class="form-select form-select-sm" id="filterEventType">
                                <option value="">Todos los tipos</option>
                                <option value="EMPRESARIAL">Empresarial</option>
                                <option value="SOCIAL">Social</option>
                                <option value="DEPORTIVO">Deportivo</option>
                                <option value="ESCOLAR">Escolar</option>
                                <option value="PARTICULAR">Particular</option>
                                <option value="CONCIERTO">Concierto</option>
                                <option value="AUTOMOVILISTICO">Automovilístico</option>
                                <option value="OTRO">Otro</option>
                              </select>
                            </div>
                            <div class="dropdown-divider"></div>
                            <h6 class="dropdown-header">Filtrar por Fecha</h6>
                            <div class="px-3">
                              <input type="text" class="form-control form-control-sm mb-2" id="filterDateRange" placeholder="Seleccionar rango..." readonly>
                            </div>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item text-center" href="#" id="applyFiltersBtn">
                              <i class="mdi mdi-check me-1"></i>Aplicar Filtros
                            </a>
                          </div>
                        </div>
                        
                        <button class="btn btn-outline-secondary" id="calendarViewBtn">
                          <i class="mdi mdi-calendar me-1"></i>
                          Vista Calendario
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Filtros rápidos por estado -->
                  <div class="mt-3">
                    <div class="d-flex flex-wrap gap-2" id="statusQuickFilters">
                      <button class="btn btn-sm btn-label-primary active" data-status="all">
                        Todos
                      </button>
                      <button class="btn btn-sm btn-outline-secondary" data-status="COTIZADO">
                        Cotizado
                      </button>
                      <button class="btn btn-sm btn-outline-success" data-status="CONFIRMADO">
                        Confirmado
                      </button>
                      <button class="btn btn-sm btn-outline-warning" data-status="EN_PROGRESO">
                        En Progreso
                      </button>
                      <button class="btn btn-sm btn-outline-info" data-status="COMPLETADO">
                        Completado
                      </button>
                      <button class="btn btn-sm btn-outline-danger" data-status="CANCELADO">
                        Cancelado
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Lista de eventos -->
              <div class="card">
                <div class="inventory-card-header">
                  <div class="header-info">
                    <h5 class="mb-1">Eventos Registrados</h5>
                    <small class="text-muted" id="eventsCount">Cargando...</small>
                  </div>
                  <div class="header-controls">
                    <div class="btn-group btn-group-sm" role="group">
                      <button type="button" class="btn btn-outline-secondary active" id="tableViewEventsBtn">
                        <i class="mdi mdi-table"></i> Tabla
                      </button>
                      <button type="button" class="btn btn-outline-secondary" id="cardViewEventsBtn">
                        <i class="mdi mdi-view-grid"></i> Tarjetas
                      </button>
                    </div>
                  </div>
                </div>
                
                <!-- Vista de tabla -->
                <div class="inventory-table-container" id="eventsTableView">
                  <table class="table table-hover" id="eventsTable">
                    <thead class="table-light">
                      <tr>
                        <th width="250px">Nombre del Evento</th>
                        <th width="180px">Cliente</th>
                        <th width="150px">Tipo</th>
                        <th width="150px">Fecha(s)</th>
                        <th width="180px">Ubicación</th>
                        <th width="120px">Estado</th>
                        <th width="100px" class="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="eventsTableBody">
                      <!-- Las filas se generarán dinámicamente -->
                    </tbody>
                  </table>
                </div>

                <!-- Vista de tarjetas -->
                <div class="d-none" id="eventsCardsView">
                  <div class="row p-4" id="eventsCardsBody">
                    <!-- Las tarjetas se generarán dinámicamente -->
                  </div>
                </div>
                
                <!-- Paginación -->
                <div class="card-footer">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <small class="text-muted">
                        Mostrando <span id="eventsShowingFrom">1</span> a <span id="eventsShowingTo">10</span> 
                        de <span id="eventsTotalItems">0</span> eventos
                      </small>
                    </div>
                    
                    <nav aria-label="Paginación eventos">
                      <ul class="pagination pagination-sm mb-0" id="eventsPaginationControls">
                        <li class="page-item disabled">
                          <a class="page-link" href="#" id="eventsPrevPage">
                            <i class="mdi mdi-chevron-left"></i>
                          </a>
                        </li>
                        <li class="page-item">
                          <a class="page-link" href="#" id="eventsNextPage">
                            <i class="mdi mdi-chevron-right"></i>
                          </a>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>

            </div>
            <!-- / Content -->

            <!-- Footer -->
            <footer class="content-footer footer bg-footer-theme">
              <div class="container-xxl">
                <div
                  class="footer-container d-flex align-items-center justify-content-between py-3 flex-md-row flex-column">
                  <div class="mb-2 mb-md-0">
                    ©
                    <script>
                      document.write(new Date().getFullYear());
                    </script>
                    , hecho con <span class="text-danger"><i class="tf-icons mdi mdi-heart"></i></span> por
                    <a href="https://pixinvent.com" target="_blank" class="footer-link fw-medium">Happening</a>
                  </div>
                </div>
              </div>
            </footer>
            <!-- / Footer -->

            <div class="content-backdrop fade"></div>
          </div>
          <!-- / Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>

      <!-- Drag Target Area To SlideIn Menu On Small Screens -->
      <div class="drag-target"></div>
    </div>
    <!-- / Layout wrapper -->

    <!-- Modal para crear/editar evento -->
    <div class="modal fade" id="eventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="eventModalTitle">Crear Nuevo Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Navigation Tabs -->
            <ul class="nav nav-tabs nav-fill mb-4" id="eventTabs" role="tablist">
              <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tab-general" data-bs-toggle="tab" data-bs-target="#general-tab" type="button" role="tab">
                  <i class="mdi mdi-information-outline me-1"></i>
                  Información General
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-contactos" data-bs-toggle="tab" data-bs-target="#contactos-tab" type="button" role="tab">
                  <i class="mdi mdi-account-multiple-outline me-1"></i>
                  Contactos
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-horarios" data-bs-toggle="tab" data-bs-target="#horarios-tab" type="button" role="tab">
                  <i class="mdi mdi-clock-outline me-1"></i>
                  Horarios y Logística
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-notas" data-bs-toggle="tab" data-bs-target="#notas-tab" type="button" role="tab">
                  <i class="mdi mdi-note-text-outline me-1"></i>
                  Notas Técnicas
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link disabled" id="tab-inventario" data-bs-toggle="tab" data-bs-target="#inventario-tab" type="button" role="tab">
                  <i class="mdi mdi-package-variant-closed me-1"></i>
                  Inventario
                  <span class="badge badge-sm bg-label-secondary ms-1">Fase 2</span>
                </button>
              </li>
              <li class="nav-item" role="presentation">
                <button class="nav-link disabled" id="tab-personal" data-bs-toggle="tab" data-bs-target="#personal-tab" type="button" role="tab">
                  <i class="mdi mdi-account-hard-hat me-1"></i>
                  Personal/Crew
                  <span class="badge badge-sm bg-label-secondary ms-1">Fase 3</span>
                </button>
              </li>
            </ul>

            <!-- Tab Content -->
            <div class="tab-content" id="eventTabsContent">
              
              <!-- Tab 1: Información General -->
              <div class="tab-pane fade show active" id="general-tab" role="tabpanel">
                <form id="eventGeneralForm">
                  <div class="row g-3">
                    
                    <!-- NUEVOS CAMPOS: Folio y Cotización (solo lectura en edición) -->
                    <div class="col-md-6" id="folioContainer" style="display: none;">
                      <label for="eventFolio" class="form-label">Folio (ID)</label>
                      <input type="text" class="form-control" id="eventFolio" readonly>
                      <div class="form-text">Folio único de 6 dígitos - irrepetible</div>
                    </div>

                    <div class="col-md-6" id="cotizacionContainer" style="display: none;">
                      <label for="eventCotizacion" class="form-label">No. de Cotización</label>
                      <input type="text" class="form-control" id="eventCotizacion" readonly>
                      <div class="form-text">Formato: COT-YYYYMMDD-XXX</div>
                    </div>

                    <!-- Nombre del Evento -->
                    <div class="col-12">
                      <label for="eventName" class="form-label">Nombre del Evento *</label>
                      <input type="text" class="form-control" id="eventName" placeholder="Ej: Conferencia Anual 2025" required>
                    </div>

                    <!-- Cliente -->
                    <div class="col-md-6">
                      <label for="eventClient" class="form-label">Cliente *</label>
                      <select class="form-select" id="eventClient" required>
                        <option value="">Seleccionar cliente...</option>
                        <!-- Los clientes se cargarán dinámicamente -->
                      </select>
                      <div class="form-text">
                        <a href="#" id="addNewClientLink">
                          <i class="mdi mdi-plus-circle me-1"></i>Agregar nuevo cliente
                        </a>
                      </div>
                    </div>

                    <!-- Tipo de Evento -->
                    <div class="col-md-6">
                      <label for="eventType" class="form-label">Tipo de Evento *</label>
                      <select class="form-select" id="eventType" required>
                        <option value="">Seleccionar tipo...</option>
                        <option value="EMPRESARIAL">Empresarial</option>
                        <option value="SOCIAL">Social</option>
                        <option value="DEPORTIVO">Deportivo</option>
                        <option value="ESCOLAR">Escolar</option>
                        <option value="PARTICULAR">Particular</option>
                        <option value="CONCIERTO">Concierto</option>
                        <option value="AUTOMOVILISTICO">Automovilístico</option>
                        <option value="OTRO">Otro</option>
                      </select>
                    </div>

                    <!-- Ubicación -->
                    <div class="col-12">
                      <label for="eventLocation" class="form-label">Ubicación/Venue *</label>
                      <input type="text" class="form-control" id="eventLocation" placeholder="Ej: Centro de Convenciones, Calle Principal #123" required>
                    </div>

                    <!-- Configuración de Fechas -->
                    <div class="col-12">
                      <label class="form-label">Configuración de Fechas *</label>
                      <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="dateConfig" id="singleDate" value="single" checked>
                        <label class="form-check-label" for="singleDate">
                          Evento de un solo día
                        </label>
                      </div>
                      <div class="form-check mb-2">
                        <input class="form-check-input" type="radio" name="dateConfig" id="multipleConsecutiveDates" value="consecutive">
                        <label class="form-check-label" for="multipleConsecutiveDates">
                          Evento de varios días consecutivos
                        </label>
                      </div>
                      <div class="form-check">
                        <input class="form-check-input" type="radio" name="dateConfig" id="recurringEvent" value="recurring">
                        <label class="form-check-label" for="recurringEvent">
                          Evento recurrente (será configurado después de crear el evento base)
                        </label>
                      </div>
                    </div>

                    <!-- Fecha única -->
                    <div class="col-md-6" id="singleDateContainer">
                      <label for="eventDate" class="form-label">Fecha del Evento *</label>
                      <input type="text" class="form-control" id="eventDate" placeholder="Seleccionar fecha..." readonly>
                    </div>

                    <!-- Rango de fechas -->
                    <div class="col-md-6 d-none" id="dateRangeContainer">
                      <label for="eventDateRange" class="form-label">Rango de Fechas *</label>
                      <input type="text" class="form-control" id="eventDateRange" placeholder="Seleccionar rango..." readonly>
                    </div>

                    <!-- Estado -->
                    <div class="col-md-6">
                      <label for="eventStatus" class="form-label">Estado *</label>
                      <select class="form-select" id="eventStatus" required>
                        <option value="COTIZADO">Cotizado</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="POSTPONED">Pospuesto</option>
                        <option value="REAGENDADO">Re-agendado</option>
                        <option value="CANCELADO">Cancelado</option>
                        <option value="PICKING">Picking</option>
                        <option value="LOADING">Loading</option>
                        <option value="TRASLADO_VENUE">Traslado :: Venue</option>
                        <option value="EN_MONTAJE">En Montaje</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="COMPLETADO">Completado</option>
                        <option value="DESMONTAJE">Desmontaje</option>
                        <option value="TRASLADO_ALMACEN">Traslado :: Almacén</option>
                        <option value="UNLOADING">Unloading</option>
                        <option value="FINALIZADO">Finalizado</option>
                      </select>
                    </div>

                    <!-- Notas Generales -->
                    <div class="col-12">
                      <label for="eventGeneralNotes" class="form-label">Notas Generales</label>
                      <textarea class="form-control" id="eventGeneralNotes" rows="3" placeholder="Información adicional sobre el evento..."></textarea>
                    </div>

                  </div>
                </form>
              </div>

              <!-- Tab 2: Contactos -->
              <div class="tab-pane fade" id="contactos-tab" role="tabpanel">
                <div class="mb-3">
                  <button type="button" class="btn btn-sm btn-primary" id="addContactBtn">
                    <i class="mdi mdi-plus me-1"></i>
                    Agregar Contacto
                  </button>
                </div>
                
                <div id="contactsContainer">
                  <!-- Los contactos se agregarán dinámicamente aquí -->
                  <div class="alert alert-info">
                    <i class="mdi mdi-information-outline me-2"></i>
                    No hay contactos agregados. Haz clic en "Agregar Contacto" para comenzar.
                  </div>
                </div>
              </div>

              <!-- Tab 3: Horarios y Logística -->
              <div class="tab-pane fade" id="horarios-tab" role="tabpanel">
                <form id="eventScheduleForm">
                  <div class="row g-3">
                    
                    <div class="col-md-6">
                      <label for="eventStartTime" class="form-label">Hora de Inicio del Evento</label>
                      <input type="time" class="form-control" id="eventStartTime">
                    </div>

                    <div class="col-md-6">
                      <label for="eventEndTime" class="form-label">Hora de Fin del Evento</label>
                      <input type="time" class="form-control" id="eventEndTime">
                    </div>

                    <div class="col-md-6">
                      <label for="setupStartTime" class="form-label">Hora de Inicio de Montaje</label>
                      <input type="time" class="form-control" id="setupStartTime">
                    </div>

                    <div class="col-md-6">
                      <label for="setupEndTime" class="form-label">Hora de Fin de Montaje</label>
                      <input type="time" class="form-control" id="setupEndTime">
                    </div>

                    <div class="col-12">
                      <label for="accessNotes" class="form-label">Notas de Acceso</label>
                      <textarea class="form-control" id="accessNotes" rows="3" 
                        placeholder="Información sobre accesos, horarios de entrada, permisos especiales, etc."></textarea>
                    </div>

                    <div class="col-12">
                      <label for="setupNotes" class="form-label">Notas de Montaje</label>
                      <textarea class="form-control" id="setupNotes" rows="3" 
                        placeholder="Instrucciones especiales para el montaje, restricciones, áreas designadas, etc."></textarea>
                    </div>

                  </div>
                </form>
              </div>

              <!-- Tab 4: Notas Técnicas -->
              <div class="tab-pane fade" id="notas-tab" role="tabpanel">
                <form id="eventTechnicalForm">
                  <div class="row g-3">
                    
                    <div class="col-12">
                      <label for="technicalSpecs" class="form-label">Especificaciones Técnicas</label>
                      <textarea class="form-control" id="technicalSpecs" rows="4" 
                        placeholder="Requerimientos técnicos especiales, equipamiento, configuraciones, etc."></textarea>
                    </div>

                    <div class="col-12">
                      <label for="eventFiles" class="form-label">Archivos Adjuntos</label>
                      <input type="file" class="form-control" id="eventFiles" multiple 
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.mp4,.mp3">
                      <div class="form-text">
                        Puedes subir videos, presentaciones, fotos, música, documentos, etc. (Máx. 10MB por archivo)
                      </div>
                    </div>

                    <div class="col-12" id="filesPreviewContainer">
                      <!-- Preview de archivos se mostrará aquí -->
                    </div>

                    <div class="col-12">
                      <label for="additionalNotes" class="form-label">Notas Adicionales</label>
                      <textarea class="form-control" id="additionalNotes" rows="3" 
                        placeholder="Cualquier otra información relevante..."></textarea>
                    </div>

                  </div>
                </form>
              </div>

              <!-- Tab 5: Inventario -->
              <div class="tab-pane fade" id="inventario-tab" role="tabpanel">
                <!-- Resumen de Inventario Asignado -->
                <div class="row mb-4">
                  <div class="col-md-4">
                    <div class="card bg-label-primary">
                      <div class="card-body text-center">
                        <h3 class="mb-1" id="totalItemsAllocated">0</h3>
                        <small>Items Reservados</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card bg-label-success">
                      <div class="card-body text-center">
                        <h3 class="mb-1" id="totalItemsAssigned">0</h3>
                        <small>SKUs Asignados</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-4">
                    <div class="card bg-label-warning">
                      <div class="card-body text-center">
                        <h3 class="mb-1" id="totalItemsPending">0</h3>
                        <small>Pendientes de Asignar</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">Inventario del Evento</h6>
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-primary" id="allocateInventoryBtn">
                      <i class="mdi mdi-package-variant-plus me-1"></i>
                      Reservar Items
                    </button>
                    <button type="button" class="btn btn-sm btn-success" id="assignSpecificSKUsBtn">
                      <i class="mdi mdi-barcode me-1"></i>
                      Asignar SKUs Específicos
                    </button>
                  </div>
                </div>

                <!-- Tabla de Items Reservados -->
                <div class="table-responsive">
                  <table class="table table-sm" id="eventInventoryTable">
                    <thead class="table-light">
                      <tr>
                        <th>Item</th>
                        <th width="100px" class="text-center">Cantidad Reservada</th>
                        <th width="100px" class="text-center">SKUs Asignados</th>
                        <th width="120px" class="text-center">Estado</th>
                        <th width="80px" class="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="eventInventoryTableBody">
                      <tr>
                        <td colspan="5" class="text-center py-4">
                          <div class="empty-state">
                            <i class="mdi mdi-package-variant-closed-remove mdi-48px text-muted"></i>
                            <p class="text-muted mt-2">No hay inventario asignado a este evento.</p>
                            <button type="button" class="btn btn-sm btn-primary" onclick="document.getElementById('allocateInventoryBtn').click()">
                              Comenzar a Reservar Items
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Alertas de conflictos -->
                <div id="inventoryConflictsContainer" class="mt-3">
                  <!-- Se mostrarán conflictos aquí -->
                </div>
              </div>

              <!-- Tab 6: Personal/Crew -->
              <div class="tab-pane fade" id="personal-tab" role="tabpanel">
                <!-- Resumen de Personal -->
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="card bg-label-info">
                      <div class="card-body text-center">
                        <h3 class="mb-1" id="totalInternalCrew">0</h3>
                        <small>Personal Interno</small>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card bg-label-secondary">
                      <div class="card-body text-center">
                        <h3 class="mb-1" id="totalExternalCrew">0</h3>
                        <small>Subcontratados</small>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Botones de acción -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">Equipo Asignado</h6>
                  <div class="btn-group">
                    <button type="button" class="btn btn-sm btn-primary" id="addInternalCrewBtn">
                      <i class="mdi mdi-account-plus me-1"></i>
                      Agregar Personal Interno
                    </button>
                    <button type="button" class="btn btn-sm btn-secondary" id="addExternalCrewBtn">
                      <i class="mdi mdi-account-multiple-plus me-1"></i>
                      Agregar Subcontratado
                    </button>
                  </div>
                </div>

                <!-- Lista de Personal Interno -->
                <div class="mb-4">
                  <h6 class="text-muted mb-3">
                    <i class="mdi mdi-account-hard-hat me-2"></i>
                    Personal Interno
                  </h6>
                  <div id="internalCrewContainer">
                    <div class="alert alert-info">
                      <i class="mdi mdi-information-outline me-2"></i>
                      No hay personal interno asignado. Haz clic en "Agregar Personal Interno" para comenzar.
                    </div>
                  </div>
                </div>

                <!-- Lista de Subcontratados -->
                <div>
                  <h6 class="text-muted mb-3">
                    <i class="mdi mdi-account-group me-2"></i>
                    Subcontratados
                  </h6>
                  <div id="externalCrewContainer">
                    <div class="alert alert-info">
                      <i class="mdi mdi-information-outline me-2"></i>
                      No hay subcontratados asignados. Haz clic en "Agregar Subcontratado" para comenzar.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-outline-primary" id="duplicateEventBtn" style="display: none;">
              <i class="mdi mdi-content-copy me-1"></i>
              Duplicar Evento
            </button>
            <button type="button" class="btn btn-primary" id="saveEventBtn">
              <i class="mdi mdi-content-save me-1"></i>
              Guardar Evento
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para vista detallada del evento -->
    <div class="modal fade" id="eventDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="eventDetailsModalTitle">Detalles del Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div id="eventDetailsContent">
              <!-- El contenido se llenará dinámicamente -->
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" id="editEventFromDetailsBtn">
              <i class="mdi mdi-pencil me-1"></i>
              Editar Evento
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Modal para duplicar evento -->
    <div class="modal fade" id="duplicateEventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Duplicar Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Estás a punto de duplicar el evento: <strong id="duplicateEventName"></strong></p>
            <p class="text-muted">Se copiará toda la información excepto las fechas, que deberás configurar en el nuevo evento.</p>
            
            <div class="alert alert-info">
              <i class="mdi mdi-information-outline me-2"></i>
              Después de duplicar, podrás modificar cualquier información del nuevo evento.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirmDuplicateEventBtn">
              <i class="mdi mdi-content-copy me-1"></i>
              Confirmar Duplicación
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para vincular eventos recurrentes -->
    <div class="modal fade" id="recurringEventModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Configurar Evento Recurrente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p>Evento base: <strong id="recurringBaseEventName"></strong></p>
            
            <form id="recurringEventForm">
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label">Frecuencia de Recurrencia *</label>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="recurrenceType" id="weeklyRecurrence" value="weekly" checked>
                    <label class="form-check-label" for="weeklyRecurrence">
                      Semanal
                    </label>
                  </div>
                  <div class="form-check mb-2">
                    <input class="form-check-input" type="radio" name="recurrenceType" id="biweeklyRecurrence" value="biweekly">
                    <label class="form-check-label" for="biweeklyRecurrence">
                      Quincenal
                    </label>
                  </div>
                  <div class="form-check">
                    <input class="form-check-input" type="radio" name="recurrenceType" id="monthlyRecurrence" value="monthly">
                    <label class="form-check-label" for="monthlyRecurrence">
                      Mensual
                    </label>
                  </div>
                </div>

                <div class="col-md-6">
                  <label for="recurrenceStartDate" class="form-label">Fecha de Inicio *</label>
                  <input type="text" class="form-control" id="recurrenceStartDate" placeholder="Seleccionar fecha..." readonly required>
                </div>

                <div class="col-md-6">
                  <label for="recurrenceOccurrences" class="form-label">Número de Ocurrencias *</label>
                  <input type="number" class="form-control" id="recurrenceOccurrences" min="2" max="52" value="4" required>
                  <div class="form-text">Máximo 52 ocurrencias</div>
                </div>

                <div class="col-12">
                  <div class="alert alert-info">
                    <i class="mdi mdi-information-outline me-2"></i>
                    Se crearán <strong><span id="occurrencesPreview">4</span></strong> eventos vinculados basados en el evento original.
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="createRecurringEventsBtn">
              <i class="mdi mdi-calendar-multiple me-1"></i>
              Crear Eventos Recurrentes
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar cliente rápido -->
    <div class="modal fade" id="quickAddClientModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Cliente Rápido</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="quickAddClientForm">
              <div class="mb-3">
                <label for="clientType" class="form-label">Tipo de Cliente *</label>
                <select class="form-select" id="clientType" required>
                  <option value="">Seleccionar...</option>
                  <option value="EMPRESA">Empresa</option>
                  <option value="PERSONA">Persona</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="clientName" class="form-label">Nombre *</label>
                <input type="text" class="form-control" id="clientName" placeholder="Nombre del cliente o empresa" required>
              </div>

              <div class="mb-3">
                <label for="clientEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="clientEmail" placeholder="correo@ejemplo.com">
              </div>

              <div class="mb-3">
                <label for="clientPhone" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="clientPhone" placeholder="+52 123 456 7890">
              </div>

              <div class="alert alert-warning">
                <i class="mdi mdi-alert-outline me-2"></i>
                Este es un formulario rápido. Para agregar más información del cliente, usa el módulo de Clientes.
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveQuickClientBtn">
              <i class="mdi mdi-content-save me-1"></i>
              Guardar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para edición rápida de estado -->
    <div class="modal fade" id="quickEditStatusModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-sm">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cambiar Estado del Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="mb-3">Evento: <strong id="quickEditEventName"></strong></p>
            
            <div class="mb-3">
              <label for="quickEditStatus" class="form-label">Nuevo Estado *</label>
              <select class="form-select" id="quickEditStatus" required>
                <option value="COTIZADO">Cotizado</option>
                <option value="CONFIRMADO">Confirmado</option>
                <option value="POSTPONED">Pospuesto</option>
                <option value="REAGENDADO">Re-agendado</option>
                <option value="CANCELADO">Cancelado</option>
                <option value="PICKING">Picking</option>
                <option value="LOADING">Loading</option>
                <option value="TRASLADO_VENUE">Traslado :: Venue</option>
                <option value="EN_MONTAJE">En Montaje</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="COMPLETADO">Completado</option>
                <option value="DESMONTAJE">Desmontaje</option>
                <option value="TRASLADO_ALMACEN">Traslado :: Almacén</option>
                <option value="UNLOADING">Unloading</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>

            <div class="alert alert-info alert-sm">
              <i class="mdi mdi-information-outline me-2"></i>
              El estado se actualizará inmediatamente.
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveQuickEditStatusBtn">
              <i class="mdi mdi-content-save me-1"></i>
              Actualizar Estado
            </button>
          </div>
        </div>
      </div>
    </div>

        <!-- Modal para Reservar Inventario (Allocate) -->
    <div class="modal fade" id="allocateInventoryModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Reservar Items para el Evento</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3">Selecciona los items del inventario y la cantidad que necesitas para este evento.</p>
            
            <!-- Búsqueda de items -->
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                <input type="text" class="form-control" id="searchInventoryItems" placeholder="Buscar items por nombre, marca, modelo...">
              </div>
            </div>

            <!-- Filtro por categoría -->
            <div class="mb-3">
              <label class="form-label">Filtrar por Categoría</label>
              <div class="d-flex flex-wrap gap-2" id="inventoryCategoryFilters">
                <button class="btn btn-sm btn-outline-primary active" data-inv-category="all">Todos</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="AUDIO">Audio</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="ILUMINACION">Iluminación</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="VIDEO">Video</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="MICROFONIA">Microfonía</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="ENERGIA">Energía</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="ESTRUCTURA">Estructura</button>
                <button class="btn btn-sm btn-outline-primary" data-inv-category="MOBILIARIO">Mobiliario</button>
              </div>
            </div>

            <!-- Tabla de items disponibles -->
            <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
              <table class="table table-sm table-hover">
                <thead class="table-light sticky-top">
                  <tr>
                    <th>Item</th>
                    <th width="100px" class="text-center">Disponibles</th>
                    <th width="150px" class="text-center">Cantidad a Reservar</th>
                    <th width="80px" class="text-center">Acción</th>
                  </tr>
                </thead>
                <tbody id="availableInventoryTableBody">
                  <!-- Se llenará dinámicamente -->
                </tbody>
              </table>
            </div>

            <!-- Items seleccionados -->
            <div class="mt-4">
              <h6 class="mb-3">Items Seleccionados para Reservar</h6>
              <div id="selectedItemsContainer">
                <div class="alert alert-info">
                  <i class="mdi mdi-information-outline me-2"></i>
                  No has seleccionado ningún item todavía.
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirmAllocateInventoryBtn">
              <i class="mdi mdi-check me-1"></i>
              Confirmar Reservación
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Asignar SKUs Específicos -->
    <div class="modal fade" id="assignSKUsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Asignar SKUs Específicos</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <p class="text-muted mb-3">Selecciona los SKUs específicos de cada item reservado para este evento.</p>
            
            <!-- Selector de item reservado -->
            <div class="mb-4">
              <label class="form-label">Selecciona un item reservado:</label>
              <select class="form-select" id="selectAllocatedItem">
                <option value="">-- Seleccionar item --</option>
              </select>
            </div>

            <!-- Información del item seleccionado -->
            <div id="skuAssignmentContainer" style="display: none;">
              <div class="alert alert-primary">
                <div class="row">
                  <div class="col-md-6">
                    <strong>Item:</strong> <span id="skuItemName"></span>
                  </div>
                  <div class="col-md-3">
                    <strong>Reservados:</strong> <span id="skuQuantityAllocated"></span>
                  </div>
                  <div class="col-md-3">
                    <strong>Asignados:</strong> <span id="skuQuantityAssigned" class="text-success"></span>
                  </div>
                </div>
              </div>

              <!-- Tabla de SKUs disponibles -->
              <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                <table class="table table-sm table-hover">
                  <thead class="table-light sticky-top">
                    <tr>
                      <th width="50px">
                        <input type="checkbox" class="form-check-input" id="selectAllSKUs">
                      </th>
                      <th>SKU</th>
                      <th>ID Unidad</th>
                      <th>Número de Serie</th>
                      <th>Condición</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody id="availableSKUsTableBody">
                    <!-- Se llenará dinámicamente -->
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="confirmAssignSKUsBtn">
              <i class="mdi mdi-check me-1"></i>
              Confirmar Asignación
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Agregar Personal Interno -->
    <div class="modal fade" id="addInternalCrewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Personal Interno</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addInternalCrewForm">
              <div class="mb-3">
                <label for="internalCrewUser" class="form-label">Seleccionar Usuario *</label>
                <select class="form-select" id="internalCrewUser" required>
                  <option value="">-- Seleccionar usuario --</option>
                  <!-- Se llenará dinámicamente con usuarios del sistema -->
                </select>
              </div>

              <div class="mb-3">
                <label for="internalCrewRole" class="form-label">Rol en el Evento *</label>
                <select class="form-select" id="internalCrewRole" required>
                  <option value="">-- Seleccionar rol --</option>
                  <option value="PROJECT_MANAGER">Project Manager</option>
                  <option value="TECNICO_AUDIO">Técnico de Audio</option>
                  <option value="TECNICO_ILUMINACION">Técnico de Iluminación</option>
                  <option value="TECNICO_VIDEO">Técnico de Video</option>
                  <option value="INGENIERO_SONIDO">Ingeniero de Sonido</option>
                  <option value="OPERADOR_LUCES">Operador de Luces</option>
                  <option value="CAMAROGRAFO">Camarógrafo</option>
                  <option value="MONTAJISTA">Montajista</option>
                  <option value="LOGISTICA">Logística</option>
                  <option value="COORDINADOR">Coordinador</option>
                  <option value="ASISTENTE">Asistente</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="internalCrewNotes" class="form-label">Notas</label>
                <textarea class="form-control" id="internalCrewNotes" rows="2" placeholder="Responsabilidades específicas, horarios especiales, etc."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveInternalCrewBtn">
              <i class="mdi mdi-content-save me-1"></i>
              Agregar al Equipo
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para Agregar Subcontratado -->
    <div class="modal fade" id="addExternalCrewModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Subcontratado</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addExternalCrewForm">
              <div class="mb-3">
                <label for="externalCrewName" class="form-label">Nombre Completo *</label>
                <input type="text" class="form-control" id="externalCrewName" placeholder="Ej: Juan Pérez García" required>
              </div>

              <div class="mb-3">
                <label for="externalCrewCompany" class="form-label">Empresa/Proveedor</label>
                <input type="text" class="form-control" id="externalCrewCompany" placeholder="Ej: Audio Pro Services">
              </div>

              <div class="mb-3">
                <label for="externalCrewRole" class="form-label">Rol/Especialidad *</label>
                <select class="form-select" id="externalCrewRole" required>
                  <option value="">-- Seleccionar rol --</option>
                  <option value="TECNICO_AUDIO">Técnico de Audio</option>
                  <option value="TECNICO_ILUMINACION">Técnico de Iluminación</option>
                  <option value="TECNICO_VIDEO">Técnico de Video</option>
                  <option value="INGENIERO_SONIDO">Ingeniero de Sonido</option>
                  <option value="OPERADOR_LUCES">Operador de Luces</option>
                  <option value="CAMAROGRAFO">Camarógrafo</option>
                  <option value="MONTAJISTA">Montajista</option>
                  <option value="CONDUCTOR">Conductor</option>
                  <option value="SEGURIDAD">Seguridad</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>

              <div class="mb-3">
                <label for="externalCrewPhone" class="form-label">Teléfono</label>
                <input type="tel" class="form-control" id="externalCrewPhone" placeholder="+52 123 456 7890">
              </div>

              <div class="mb-3">
                <label for="externalCrewEmail" class="form-label">Email</label>
                <input type="email" class="form-control" id="externalCrewEmail" placeholder="correo@ejemplo.com">
              </div>

              <div class="mb-3">
                <label for="externalCrewCost" class="form-label">Costo</label>
                <div class="input-group">
                  <span class="input-group-text">$</span>
                  <input type="number" class="form-control" id="externalCrewCost" step="0.01" placeholder="0.00">
                </div>
              </div>

              <div class="mb-3">
                <label for="externalCrewNotes" class="form-label">Notas</label>
                <textarea class="form-control" id="externalCrewNotes" rows="2" placeholder="Horarios, responsabilidades específicas, etc."></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveExternalCrewBtn">
              <i class="mdi mdi-content-save me-1"></i>
              Agregar Subcontratado
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Template para item de inventario seleccionado -->
    <template id="selectedInventoryItemTemplate">
      <div class="card mb-2 selected-inventory-item">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <strong class="item-name"></strong>
              <br>
              <small class="text-muted">Cantidad: <span class="item-quantity"></span></small>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-selected-item-btn">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Template para miembro de crew interno -->
    <template id="internalCrewMemberTemplate">
      <div class="card mb-2 crew-member-card">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div class="d-flex align-items-center">
              <div class="avatar avatar-sm me-3">
                <img src="{{ asset('/materialize/assets/') }}/img/avatars/1.png" alt class="rounded-circle">
              </div>
              <div>
                <h6 class="mb-0 crew-name"></h6>
                <small class="text-muted crew-role"></small>
                <div class="crew-notes text-muted small mt-1"></div>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-crew-btn">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Template para subcontratado -->
    <template id="externalCrewMemberTemplate">
      <div class="card mb-2 crew-member-card">
        <div class="card-body p-3">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="mb-0 crew-name"></h6>
              <small class="text-muted">
                <span class="crew-role"></span>
                <span class="crew-company"></span>
              </small>
              <div class="row mt-2">
                <div class="col-md-6">
                  <small class="text-muted crew-contact"></small>
                </div>
                <div class="col-md-6">
                  <small class="text-success crew-cost"></small>
                </div>
              </div>
              <div class="crew-notes text-muted small mt-1"></div>
            </div>
            <button type="button" class="btn btn-sm btn-outline-danger remove-crew-btn">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
        </div>
      </div>
    </template>

    <!-- Template para tarjeta de contacto -->
    <template id="contactCardTemplate">
      <div class="card mb-3 contact-card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <h6 class="mb-0">Contacto <span class="contact-number"></span></h6>
            <button type="button" class="btn btn-sm btn-outline-danger remove-contact-btn">
              <i class="mdi mdi-delete"></i>
            </button>
          </div>
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Tipo de Contacto *</label>
              <select class="form-select contact-type" required>
                <option value="">Seleccionar...</option>
                <option value="PRINCIPAL">Principal</option>
                <option value="FACTURACION">Facturación</option>
                <option value="VENUE">Venue</option>
                <option value="EN_SITIO">En Sitio</option>
                <option value="TECNICO">Técnico</option>
                <option value="OTRO">Otro</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label">Nombre Completo *</label>
              <input type="text" class="form-control contact-name" placeholder="Ej: Juan Pérez" required>
            </div>

            <div class="col-md-6">
              <label class="form-label">Email</label>
              <input type="email" class="form-control contact-email" placeholder="correo@ejemplo.com">
            </div>

            <div class="col-md-6">
              <label class="form-label">Teléfono</label>
              <input type="tel" class="form-control contact-phone" placeholder="+52 123 456 7890">
            </div>

            <div class="col-12">
              <label class="form-label">Notas del Contacto</label>
              <textarea class="form-control contact-notes" rows="2" placeholder="Información adicional sobre este contacto..."></textarea>
            </div>
          </div>
        </div>
      </div>
    </template>
@endsection

@section('script')
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/sweetalert2/sweetalert2.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/moment/moment.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.js') }}"></script>
<script src="{{ asset('/materialize/assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/eventos-inventario.js') }}"></script>
@endsection
