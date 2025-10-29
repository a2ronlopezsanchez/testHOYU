{{-- Vista simplificada con DataTables --}}
@extends('layouts.main')
@section('title','Disponibilidad y Asignación')
@section('level','Inventario')
@section('sublevel','Disponibilidad')

@section('css')
    {{-- DataTables CSS --}}
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.7/css/dataTables.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/responsive/2.5.0/css/responsive.bootstrap5.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.bootstrap5.min.css">
    
    {{-- Flatpickr CSS --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    
    {{-- SweetAlert2 CSS --}}
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">
    
    {{-- CSS personalizado para DataTables --}}
    <style>
        .inventory-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 1.5rem;
            border-radius: 10px;
            margin-bottom: 1.5rem;
        }
        
        .item-thumbnail {
            width: 40px;
            height: 40px;
            background: #f8f9fa;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.2rem;
        }
        
        .expanded-detail-container {
            background: #f8f9fa;
            padding: 1rem;
            border-radius: 8px;
            border-left: 4px solid #007bff;
        }
        
        .dataTables_wrapper .dataTables_length,
        .dataTables_wrapper .dataTables_filter,
        .dataTables_wrapper .dataTables_info,
        .dataTables_wrapper .dataTables_paginate {
            margin-bottom: 1rem;
        }
        
        .category-filters {
            display: flex;
            flex-wrap: wrap;
            gap: 0.5rem;
            margin-bottom: 1rem;
        }
        
        .availability-legend {
            display: flex;
            gap: 1rem;
            align-items: center;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .legend-badge {
            width: 12px;
            height: 12px;
            border-radius: 50%;
        }
        
        .search-highlight {
            background-color: yellow;
            font-weight: bold;
        }
        
        .table-loading {
            position: relative;
            pointer-events: none;
            opacity: 0.6;
        }
        
        .table-loading::after {
            content: "Cargando...";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 1rem 2rem;
            border-radius: 8px;
            border: 1px solid #ddd;
            z-index: 1000;
        }
    </style>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
    {{-- Header Principal --}}
    <div class="inventory-header">
        <div class="d-flex justify-content-between align-items-center">
            <div>
                <h4 class="mb-2 text-white">
                    <i class="mdi mdi-package-variant me-2"></i>
                    Inventario - Disponibilidad y Asignaciones
                </h4>
                <p class="mb-0 opacity-75">Gestión completa del catálogo de equipos</p>
            </div>
            <div class="text-end">
                <button class="btn btn-light me-2" id="exportBtn">
                    <i class="mdi mdi-file-export me-1"></i>
                    Exportar
                </button>
                <button class="btn btn-warning" id="addItemBtn">
                    <i class="mdi mdi-plus me-1"></i>
                    Nuevo Item
                </button>
            </div>
        </div>
    </div>

    {{-- Selector de fecha --}}
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

    {{-- Filtros --}}
    <div class="card mb-4">
        <div class="card-body">
            <div class="row g-3 align-items-center">
                <div class="col-md-8">
                    <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Buscar por nombre, marca, modelo..."
                            id="searchInput">
                        <button class="btn btn-outline-secondary" type="button" id="clearAllBtn" title="Limpiar filtros">
                            <i class="mdi mdi-refresh"></i>
                        </button>
                    </div>
                </div>
                
                <div class="col-md-4 text-end">
                    <small class="text-muted me-2">Total de ítems:</small>
                    <span class="badge bg-primary" id="itemCount">Cargando...</span>
                </div>
            </div>
            
            {{-- Categorías --}}
            <div class="mt-3">
                <div class="category-filters" id="categoryFilters">
                    <button class="btn btn-sm btn-label-primary active" data-category="all">
                        Todos
                    </button>
                    {{-- Las categorías se cargan dinámicamente desde la API --}}
                </div>
            </div>
        </div>
    </div>

    {{-- Tabla principal con DataTables --}}
    <div class="card">
        <div class="card-header">
            <h5 class="mb-0">
                <i class="mdi mdi-table me-2"></i>
                Catálogo de Inventario
            </h5>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover" id="inventoryTable" style="width:100%">
                    <thead class="table-light">
                        <tr>
                            <th width="30px"></th>
                            <th>Item</th>
                            <th>Categoría</th>
                            <th width="80px">Total</th>
                            <th width="90px">Disponibles</th>
                            <th width="90px">Asignados</th>
                            <th width="90px">Mantenimiento</th>
                            <th width="100px">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{-- DataTables llena automáticamente --}}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>

{{-- Modal para vista detallada --}}
<div class="modal fade" id="unitDetailsModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="unitDetailsModalTitle">Detalles del Item</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-title">Información General</h6>
                                <div id="itemGeneralInfo">
                                    {{-- Se llena dinámicamente --}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card bg-light">
                            <div class="card-body">
                                <h6 class="card-title">Disponibilidad - <span id="modalSelectedDate"></span></h6>
                                <div id="itemAvailabilityInfo">
                                    {{-- Se llena dinámicamente --}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
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
                            {{-- Se llena dinámicamente --}}
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary" id="editItemBtn">Editar Item</button>
            </div>
        </div>
    </div>
</div>

{{-- Modal para agregar nuevo item (simplificado) --}}
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
                        <div class="col-md-6">
                            <label for="itemName" class="form-label">Nombre del Producto *</label>
                            <input type="text" class="form-control" id="itemName" required>
                        </div>
                        <div class="col-md-6">
                            <label for="itemPublicName" class="form-label">Nombre Público</label>
                            <input type="text" class="form-control" id="itemPublicName">
                        </div>
                        <div class="col-md-4">
                            <label for="itemCategory" class="form-label">Categoría *</label>
                            <select class="form-select" id="itemCategory" required>
                                <option value="">Seleccionar...</option>
                                {{-- Se llena dinámicamente --}}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="itemBrand" class="form-label">Marca *</label>
                            <select class="form-select" id="itemBrand" required>
                                <option value="">Seleccionar...</option>
                                {{-- Se llena dinámicamente --}}
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="itemModel" class="form-label">Modelo</label>
                            <input type="text" class="form-control" id="itemModel">
                        </div>
                        <div class="col-md-6">
                            <label for="itemLocation" class="form-label">Ubicación *</label>
                            <select class="form-select" id="itemLocation" required>
                                <option value="">Seleccionar...</option>
                                {{-- Se llena dinámicamente --}}
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="itemStatus" class="form-label">Estado *</label>
                            <select class="form-select" id="itemStatus" required>
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="DESCOMPUESTO">Descompuesto</option>
                                <option value="EN_REPARACION">En Reparación</option>
                            </select>
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
    {{-- CSRF Token --}}
    <meta name="csrf-token" content="{{ csrf_token() }}">
    
    {{-- jQuery (requerido para DataTables) --}}
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    
    {{-- DataTables JS --}}
    <script src="https://cdn.datatables.net/1.13.7/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/1.13.7/js/dataTables.bootstrap5.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.5.0/js/dataTables.responsive.min.js"></script>
    <script src="https://cdn.datatables.net/responsive/2.5.0/js/responsive.bootstrap5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js"></script>
    
    {{-- Flatpickr JS --}}
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
    
    {{-- SweetAlert2 JS --}}
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    
    {{-- Nuestro script personalizado --}}
    <script src="{{ asset('/materialize/assets/js/modules/bp-modules/catalogo-inventario-dt.js') }}"></script>
@endsection