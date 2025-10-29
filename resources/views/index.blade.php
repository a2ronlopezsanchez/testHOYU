@extends('layouts.main')
@section('title','Disponibilidad y Asignación')
@section('leve','Inventario')
@section('subleve','Disponibilidad')
@section('css')
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />

    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/catalogo-inventario.css') }}" />
    <style>
      .btn-primary{
        position: relative !important;
        overflow: hidden !important;
      } 
      /* Scroll fino en navegadores WebKit (Chrome, Edge, Safari) */
      .container-xxl::-webkit-scrollbar,
      .container-xxl *::-webkit-scrollbar {
          height: 4px; /* grosor horizontal */
      }

      .container-xxl::-webkit-scrollbar-track,
      .container-xxl *::-webkit-scrollbar-track {
          background: transparent; /* fondo del track */
      }

      .container-xxl::-webkit-scrollbar-thumb,
      .container-xxl *::-webkit-scrollbar-thumb {
          border-radius: 4px;
      }

      /* Scroll fino en Firefox */
      .container-xxl, .container-xxl * {
          scrollbar-width: thin; /* delgado */
      }
      /* Asegura que el menú quede por encima de la tabla/headers */
    .dropdown-menu {
      z-index: 2050 !important; /* > modal backdrop (1040/1050), > header sticky */
    }

    </style>
@endsection
@section('content')
    <!-- Content -->

    <div class="container-xxl flex-grow-1 container-p-y">
        
        <!-- Header Principal -->
        <div class="inventory-card-header mb-4">
        <div class="header-info">
            <h4 class="fw-bold py-3 mb-2">
            <span class="text-muted fw-light">Inventario /</span> Disponibilidad y Asignaciones
            </h4>
        </div>
        <div class="header-controls">
            
            <button class="btn btn-primary" id="addItemPBtn">
            <i class="mdi mdi-plus me-1"></i>
            Nuevo Item
            </button>
            
        </div>
        </div>

        <!-- Selector de fecha -->
        <div class="card mb-4">
        <div class="card-body">
            <div class="d-flex align-items-center justify-content-between flex-wrap">
            <div class="d-flex align-items-center">
                <h6 class="mb-0 me-3">Disponibilidad para el:</h6>
                <div class="dropdown me-2">
                <button 
                    class="btn btn-outline-primary dropdown-toggle" 
                    type="button" 
                    id="datePickerBtn" 
                    data-bs-toggle="dropdown" 
                    data-bs-auto-close="outside">
                    <i class="mdi mdi-calendar me-2"></i>
                    <span id="selectedDateText">Lunes, 28 de julio de 2025</span>
                </button>
                <div class="dropdown-menu" aria-labelledby="datePickerBtn" style="min-width: 280px;">
                    <div class="p-3">
                    <input type="text" class="form-control" id="dateInput" placeholder="Seleccionar fecha..." readonly>
                    </div>
                </div>
                </div>
                
                <div class="btn-group">
                <button class="btn btn-outline-secondary" id="prevDayBtn" title="Día anterior">
                    <i class="mdi mdi-chevron-left"></i>
                </button>
                <button class="btn btn-outline-secondary" id="todayBtn" title="Hoy">
                    Hoy
                </button>
                <button class="btn btn-outline-secondary" id="nextDayBtn" title="Día siguiente">
                    <i class="mdi mdi-chevron-right"></i>
                </button>
                </div>
            </div>
            
            <div class="availability-legend">
            <div class="legend-item">
                <span class="legend-badge bg-success"></span>
                <small class="legend-text">Libre</small>
            </div>
            <div class="legend-item">
                <span class="legend-badge bg-primary"></span>
                <small class="legend-text">Asignado</small>
            </div>
            <div class="legend-item">
                <span class="legend-badge bg-warning"></span>
                <small class="legend-text">Inactivo Temporal</small>
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
                        placeholder="Buscar por nombre, marca, modelo..."
                        id="searchInput">
                    <button class="btn btn-outline-secondary d-none" type="button" id="clearSearchBtn">
                        <i class="mdi mdi-close"></i>
                    </button>
                    <button class="btn btn-circle btn-clear-all" type="button" id="clearAllBtn" title="Limpiar todos los filtros">
                    <i class="mdi mdi-refresh"></i>
                    </button>
                    </div>
                </div>
            </div>
            
            <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-md-end">
                <button class="btn btn-outline-secondary" id="clearFilters">
                    Limpiar Filtros
                </button>
                <button class="btn btn-outline-secondary" id="reportsBtn">
                    <i class="mdi mdi-chart-bar me-1"></i>
                    Reportes
                </button>
                </div>
            </div>
            </div>
            
            <!-- Categorías -->
            <div class="mt-3">
              <div class="d-flex flex-wrap gap-2" id="categoryFilters">
                  <button class="btn btn-sm btn-label-primary active" data-category="all">
                  Todos
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="AUDIO">
                  Audio
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="ILUMINACION">
                  Iluminación
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="VIDEO">
                  Video
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="MICROFONIA">
                  Microfonía
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="ENERGIA">
                  Energía
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="ESTRUCTURA">
                  Estructura
                  </button>
                  <button class="btn btn-sm btn-outline-primary" data-category="MOBILIARIO">
                  Mobiliario
                  </button>
              </div>
            </div>
        </div>
        </div>
        <!-- Lista de items en el catálogo -->
        <div class="card">
            <div class="inventory-card-header">
            <div class="header-info">
                <h5 class="mb-1">Catálogo</h5>
                <small class="text-muted" id="itemCount">Cargando...</small>
            </div>
            <div class="header-controls">
                <div class="view-toggle-group">
                <small class="text-muted">Vista:</small>
                <div class="btn-group btn-group-sm" role="group">
                    <button type="button" class="btn btn-outline-secondary active" id="tableViewBtn">
                    <i class="mdi mdi-table"></i>
                    </button>
                    <button type="button" class="btn btn-outline-secondary" id="cardViewBtn">
                    <i class="mdi mdi-view-grid"></i>
                    </button>
                </div>
                </div>
            </div>
        </div>
        
        <div class="inventory-table-container" id="tableView">
        <table class="table table-hover" id="inventoryTable">
            <thead class="table-light">
            <tr>
                <th width="50px"></th>
                <th width="300px">Item</th>
                <th width="120px">Categoría</th>
                <th width="80px" class="text-center">Total</th>
                <th width="90px" class="text-center">Disponibles</th>
                <th width="90px" class="text-center">Asignados</th>
                <th width="90px" class="text-center">Mantenimiento</th>
                <th width="100px" class="text-center">Acciones</th>
            </tr>
            </thead>
            <tbody id="inventoryTableBody">
            <!-- Las filas se generarán dinámicamente -->
            </tbody>
        </table>
        </div>

        <!-- Vista de grid -->
        <div class="inventory-grid-container d-none" id="gridView">
        <div class="row" id="inventoryGridBody">
            <!-- Las tarjetas se generarán dinámicamente -->
        </div>
        </div>
        
        <!-- Paginación -->
        <div class="card-footer">
            <div class="d-flex justify-content-between align-items-center">
            <div>
                <small class="text-muted">
                Mostrando <span id="showingFrom">1</span> a <span id="showingTo">10</span> 
                de <span id="totalItems">0</span> ítems
                </small>
            </div>
            
            <nav aria-label="Paginación tabla inventario">
                <ul class="pagination pagination-sm mb-0" id="paginationControls">
                <li class="page-item disabled">
                    <a class="page-link" href="#" id="prevPage">
                    <i class="mdi mdi-chevron-left"></i>
                    </a>
                </li>
                <li class="page-item active">
                    <a class="page-link" href="#">1</a>
                </li>
                <li class="page-item">
                    <a class="page-link" href="#" id="nextPage">
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
        <!-- Modal para vista detallada de unidades -->
    <div class="modal fade" id="unitDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="unitDetailsModalTitle">Detalles del Item</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <!-- Información general del item -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Información General</h6>
                    <div id="itemGeneralInfo">
                      <!-- Se llenará dinámicamente -->
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card bg-light">
                  <div class="card-body">
                    <h6 class="card-title">Disponibilidad - <span id="modalSelectedDate"></span></h6>
                    <div id="itemAvailabilityInfo">
                      <!-- Se llenará dinámicamente -->
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Tabla de unidades individuales -->
            <div class="table-responsive">
              <table class="table table-striped">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>ID Item</th>
                    <th>Número de Serie</th>
                    <th>Estado</th>
                    <th>Evento/Ubicación</th>
                    <th>Duración</th>
                    <th>Condición</th>
                  </tr>
                </thead>
                <tbody id="modalUnitsTableBody">
                  <!-- Se llenará dinámicamente -->
                </tbody>
              </table>
            </div>
            
            <!-- Vista de calendario de disponibilidad -->
            <div class="mt-4">
              <h6>Vista de Calendario - Disponibilidad</h6>
              <div class="alert alert-info">
                <i class="mdi mdi-information me-2"></i>
                Esta vista muestra el porcentaje de unidades disponibles por día
              </div>
              <div id="calendarView">
                <!-- Se generará dinámicamente -->
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
            <button type="button" class="btn btn-primary" id="editItemBtn">Editar Item</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal para agregar nuevo ItemP -->
    <div class="modal fade" id="addItemPModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Nuevo ItemP</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addItemPForm">
              <div class="row g-3">
                <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="ItemPName" 
                              placeholder="MICROFONO | SHURE | SM58 | ID MS01" required>
                        <label for="ItemPName">Nombre del Producto *</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="ItemPPublicName" 
                              placeholder="MICROFONO | SHURE | SM58 | ID MS01" required>
                        <label for="ItemPPublicName">Nombre Público *</label>
                    </div>
                </div>
                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPCategory"
                          name="ItemPCategory"
                          class="form-control h-auto"
                          placeholder="Elige sólo una..."
                          value="AUDIO" />
                        <label for="ItemPCategory">Categoría *</label>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPBrand"
                          name="ItemPBrand"
                          class="form-control h-auto"
                          placeholder="Elige sólo una..."
                          value="" />
                        <label for="ItemPBrand">Marca *</label>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPModel"
                          name="ItemPModel"
                          class="form-control h-auto"
                          placeholder="Agregar modelos"
                          value="" />
                        <label for="ItemPModel">Modelo</label>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPFamily"
                          name="ItemPFamily"
                          class="form-control h-auto"
                          placeholder="Agregar familias"
                          value="" />
                        <label for="ItemPFamily">Familia</label>
                      </div>
                    </div>

                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPSubFamily"
                          name="ItemPSubFamily"
                          class="form-control h-auto"
                          placeholder="Agregar sub familias"
                          value="" />
                        <label for="ItemPSubFamily">Sub Familia</label>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="ItemPColor"
                          name="ItemPColor"
                          class="form-control h-auto"
                          placeholder="Seleccionar colores"
                          value="" />
                        <label for="ItemPColor">Color</label>
                      </div>
                    </div>
                
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveItemPBtn">Guardar Item</button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="addItemModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Agregar Nuevo Item</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form id="addItemForm">
              <div class="row g-3">
                <div class="col-md-12">
                  <label for="itemParent" class="form-label">Producto Padre *</label>
                  <select id="itemParent" class="form-select" required>
                    <option value="">Selecciona...</option>
                  </select>
                  <div class="form-text">Usaremos la categoría y marca del Padre para crear el ID.</div>
                </div>
                <div class="col-md-6">
                  <label for="itemSku" class="form-label">SKU</label>
                  <input type="text" class="form-control" id="itemSku" value="BP123456" placeholder="BP123456" disabled required>
                  <div class="form-text">*Asignado automáticamente por sistema.</div>
                </div>
                <div class="col-md-6">
                  <label for="itemId" class="form-label">ID</label>
                  <input type="text" class="form-control" id="itemId" value="AS01" placeholder="AS01" disabled required>
                  <div class="form-text">*Asignado automáticamente por sistema.</div>
                </div>
                <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="itemName" 
                              placeholder="MICROFONO | SHURE | SM58 | ID MS01" required>
                        <label for="itemName">Nombre del Producto *</label>
                    </div>
                </div>
                 <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="itemPublicName" 
                              placeholder="MICROFONO | SHURE | SM58 | ID MS01">
                        <label for="itemPublicName">Nombre Público</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="itemSerial" placeholder="SN123456789">
                        <label for="itemSerial">Número de Serie</label>
                    </div>
                </div>
                    


                    <div class="col-md-6">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="itemStatus"
                          name="itemStatus"
                          class="form-control h-auto"
                          placeholder="Seleccionar estado"
                          value="" />
                        <label for="itemStatus">Estado *</label>
                      </div>
                    </div>

                    <div class="col-md-4">
                      <div class="form-floating form-floating-outline">
                        <input
                          id="itemLocation"
                          name="itemLocation"
                          class="form-control h-auto"
                          placeholder="Seleccionar ubicación"
                          value="" />
                        <label for="itemLocation">Ubicación *</label>
                      </div>
                    </div>

                <div class="col-md-4">
                  <div class="form-floating form-floating-outline"> 
                    <input type="text" class="form-control" id="itemRack" placeholder="A1-B3">
                    <label for="itemRack">Rack</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating form-floating-outline"> 
                    <input type="text" class="form-control" id="itemPanel" placeholder="P1-5">
                    <label for="itemPanel">Panel</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-floating form-floating-outline"> 
                    <input type="text" class="form-control" id="itemRfid" placeholder="RF001234">
                    <label for="itemRfid">RFID</label>
                  </div>
                </div>
                    <div>
                    <label for="itemImage" class="form-label">Imagen del Producto</label>
                    <input type="file" class="form-control" id="itemImage" accept="image/*">
                    <div class="form-text">Formatos permitidos: JPG, PNG, GIF (máx. 2MB)</div>
                    <!-- Preview de la imagen -->
                    <div class="mt-2" id="imagePreview" style="display: none;">
                        <img id="previewImg" src="" alt="Preview" style="max-width: 200px; max-height: 150px; border-radius: 8px; border: 1px solid #dee2e6;">
                    </div>
                </div>
              
                <div class="col-md-6">
                  <label for="itemWarranty" class="form-label">Garantía Vigente</label>
                  <select class="form-select" id="itemWarranty">
                    <option value="SI">Sí</option>
                    <option value="NO">No</option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label for="itemUnitSet" class="form-label">Unit/Set</label>
                  <select class="form-select" id="itemUnitSet">
                    <option value="UNIT">Individual</option>
                    <option value="SET">Conjunto</option>
                  </select>
                </div>

                <div class="col-md-4">
                  <label for="itemOriginalPrice" class="form-label">Precio Original</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="itemOriginalPrice" step="0.01">
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="itemIdealPrice" class="form-label">Precio Renta Ideal</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="itemIdealPrice" step="0.01">
                  </div>
                </div>
                <div class="col-md-4">
                  <label for="itemMinPrice" class="form-label">Precio Renta Mínimo</label>
                  <div class="input-group">
                    <span class="input-group-text">$</span>
                    <input type="number" class="form-control" id="itemMinPrice" step="0.01">
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="saveItemBtn">Guardar Item</button>
          </div>
        </div>
      </div>
    </div>
@endsection
@section('script')
    <script src="{{ asset('/materialize/assets/js/modules/bp-modules/catalogo-inventario.js') }}"></script>
@endsection