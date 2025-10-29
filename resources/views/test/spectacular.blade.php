@extends('layouts.test')
@section('title','Espectaculares')
@section('leve','Espectaculares')
@section('css')
        <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/rtl/theme-default.css" class="template-customizer-theme-css') }}" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/bs-stepper/bs-stepper.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/select2/select2.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/@form-validation/form-validation.css') }}" />

    <!-- Page CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-analytics.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/bootstrap-datepicker/bootstrap-datepicker.css') }}" />
    
    <style>

        /* Progress bar personalizada */
        .step-progress {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .progress-bar-custom {
            flex: 1;
            height: 4px;
            background-color: rgba(255, 255, 255, 0.3);
            border-radius: 2px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background-color: white;
            border-radius: 2px;
            transition: width 0.3s ease;
        }

        .step-counter {
            font-size: 0.875rem;
            color: rgba(255, 255, 255, 0.8);
        }

        /* Formulario */
        /*
        .form-floating-outline {
            position: relative;
        }

        .form-floating-outline .form-control,
        .form-floating-outline .form-select {
            border: 1px solid rgba(161, 172, 184, 0.24);
            border-radius: 0.375rem;
            background-color: transparent;
            padding: 0.75rem 0.875rem;
        }

        .form-floating-outline .form-control:focus,
        .form-floating-outline .form-select:focus {
            border-color: var(--bs-primary);
            box-shadow: 0 0 0 0.2rem rgba(105, 108, 255, 0.25);
        }

        .form-floating-outline label {
            background-color: #fff;
            padding: 0 0.25rem;
            color: #a1acb8;
            font-size: 0.875rem;
            font-weight: 500;
        }
        */
        /* Botones de medidas */
        .size-option {
            padding: 0.5rem 1rem;
            border: 1px solid rgba(161, 172, 184, 0.24);
            border-radius: 0.375rem;
            background: white;
            color: #566a7f;
            font-size: 0.875rem;
            transition: all 0.2s;
            cursor: pointer;
        }

        .size-option:hover {
            border-color: var(--bs-primary);
            background-color: rgba(105, 108, 255, 0.04);
        }

        .size-option.active {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
            color: white;
        }

        /* Caras del espectacular */
        .cara-item {
            background-color: #f8f9fa;
            border: 1px solid rgba(161, 172, 184, 0.15);
            border-radius: 0.5rem;
            padding: 1rem;
        }

        /* Controles numéricos */
        .number-control {
            display: flex;
            border: 1px solid rgba(161, 172, 184, 0.24);
            border-radius: 0.375rem;
            overflow: hidden;
        }

        .number-control button {
            width: 40px;
            height: 40px;
            border: none;
            background: #f8f9fa;
            color: #566a7f;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
        }

        .number-control button:hover {
            background-color: var(--bs-primary);
            color: white;
        }

        .number-control input {
            flex: 1;
            border: none;
            text-align: center;
            background: white;
            padding: 0.5rem;
        }

        /* Upload zone */
        .upload-zone {
            border: 2px dashed rgba(161, 172, 184, 0.3);
            border-radius: 0.5rem;
            padding: 2rem;
            text-align: center;
            transition: all 0.3s;
            cursor: pointer;
        }

        .upload-zone:hover {
            border-color: var(--bs-primary);
            background-color: rgba(105, 108, 255, 0.04);
        }

        /* Map placeholder */
        .map-placeholder {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 0.5rem;
            height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px solid rgba(161, 172, 184, 0.15);
        }

        /* Preview card */
        .preview-card {
            background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
            border: 1px solid rgba(161, 172, 184, 0.15);
            border-radius: 0.5rem;
            padding: 1.5rem;
        }

        /* Estado indicators */
        .estado-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            display: inline-block;
            margin-right: 0.5rem;
        }

        .estado-disponible { background-color: var(--bs-success); }
        .estado-ocupado { background-color: var(--bs-danger); }
        .estado-mantenimiento { background-color: var(--bs-warning); }

        /* Success state */
        .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, var(--bs-success) 0%, #5cb85c 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            color: white;
            font-size: 2rem;
        }

        /* Navigation buttons */
        .nav-buttons {
            border-top: 1px solid rgba(161, 172, 184, 0.15);
            padding: 1.5rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .btn {
            border-radius: 0.375rem;
            font-weight: 500;
            padding: 0.5rem 1.5rem;
        }

        .btn-primary {
            background-color: var(--bs-primary);
            border-color: var(--bs-primary);
        }

        .btn-primary:hover {
            background-color: #5a5ede;
            border-color: #5a5ede;
        }

        /* Hidden steps */
        .step-content {
            display: none;
        }

        .step-content.active {
            display: block;
        }

        /* Button in main page */
        .main-content {
            padding: 2rem;
        }

        .create-btn {
            background: linear-gradient(135deg, var(--bs-primary) 0%, #5a5ede 100%);
            border: none;
            border-radius: 0.5rem;
            color: white;
            padding: 0.75rem 2rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s;
            box-shadow: 0 0.25rem 1rem rgba(105, 108, 255, 0.3);
        }

        .create-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 0.5rem 1.5rem rgba(105, 108, 255, 0.4);
            color: white;
        }
    </style>
    <style>
        .swal2-container{
            z-index: 9999 !important;
        }
        .dtr-bs-modal{
            z-index: 9000 !important;
        }
        #editModal{
            z-index: 9900 !important;
        }
        .editOneModal{
            z-index: 9900 !important;
        }
        .flatpickr-calendar{
            z-index: 9999 !important;
        }
        .editOne{
            color: #757bff;
            cursor: pointer;
        }
        #status-filters {
            width: 100% !important;
            overflow-x: auto;
            white-space: nowrap;
            display: flex;
            gap: 5px; /* Espaciado opcional entre botones */
            scrollbar-width: thin; /* Para Firefox */
            scrollbar-color: #666cff #f1f1f1; /* Color del thumb y track */
        }

        /* Estilos para navegadores basados en WebKit (Chrome, Edge, Safari) */
        #status-filters::-webkit-scrollbar {
            height: 6px; /* Altura del scroll horizontal */
        }

        #status-filters::-webkit-scrollbar-track {
            background: #f1f1f1; /* Color del fondo del scroll */
            border-radius: 5px;
        }

        #status-filters::-webkit-scrollbar-thumb {
            background: #666cff; /* Color de la barra deslizante */
            border-radius: 5px;
        }

        #status-filters::-webkit-scrollbar-thumb:hover {
            background: #666cff; /* Color al pasar el mouse */
        }

        .status-filter {
            flex-shrink: 0; /* Evita que los botones se reduzcan de tamaño */
        }
    </style>

@endsection
@section('content')
    <div class="container-xxl flex-grow-1 container-p-y">
        <div class="mb-4">
            <h3 class="card-title">Espectaculares</h3>
            <p class="text-muted">Gestión del catálogo de espectaculares</p>
            <div class="btn-group mb-3" role="group">
                <button id="tabCatalogo" type="button" class="btn btn-primary me-2">
                Catálogo
                </button>
                <button id="tabApartados" type="button" class="btn btn-outline-secondary">
                Apartados
                </button>
            </div>
        </div>
        <div id="sectionCatalogo">
            <!-- Espectaculares List Table -->
            <div class="card">
                <div class="card-header card-header-esp border-bottom">
                    <h5 class="card-title">Filtros de Búsqueda</h5>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-4">
                            <select class="form-select" id="ubicacion_filter">
                                <option value="">Todas las ubicaciones</option>
                                <option value="carretera57">Carretera 57</option>
                                <option value="zona-industrial">Zona Industrial</option>
                                <option value="centro">Centro</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" id="tamano_filter">
                                <option value="">Todos los tamaños</option>
                                <option value="12 x 7.20 Mts">12 x 7.20 Mts</option>
                                <option value="10 x 6.00 Mts">10 x 6.00 Mts</option>
                                <option value="8 x 4.00 Mts">8 x 4.00 Mts</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <select class="form-select" id="estado_filter">
                                <option value="">Todos los estados</option>
                                <option value="Disponible">Disponible</option>
                                <option value="Ocupado">Ocupado</option>
                            </select>
                        </div>
                    </div>
                    <button class="create-btn" data-bs-toggle="modal" data-bs-target="#crearEspectacularModal">
                        <i class="mdi mdi-plus"></i>
                        Crear Nuevo Espectacular
                    </button>
                </div>
                
                <div class="card-datatable table-responsive">
                    <table class="datatables-espectaculares table" id="espectacularesTable">
                        <thead class="table-light">
                            <tr>
                                <th></th>
                                <th>ID</th>
                                <th>Espectacular</th>
                                <th>Ubicación</th>
                                <th>Tamaño</th>
                                <th>Estado</th>
                                <th>Caras Disponibles</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Los datos se cargarán via JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Offcanvas para agregar/editar espectacular -->
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddEspectacular" aria-labelledby="offcanvasAddEspectacularLabel">
                    <div class="offcanvas-header">
                        <h5 id="offcanvasAddEspectacularLabel" class="offcanvas-title">Agregar Espectacular</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body mx-0 flex-grow-0 h-100">
                        <form class="add-new-espectacular pt-0" id="addNewEspectacularForm">
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="text" class="form-control" id="add-espectacular-nombre" placeholder="Nombre del espectacular" name="espectacularNombre" aria-label="Nombre del espectacular">
                                <label for="add-espectacular-nombre">Nombre</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="text" id="add-espectacular-ubicacion" class="form-control" placeholder="Ubicación completa" aria-label="Ubicación" name="espectacularUbicacion">
                                <label for="add-espectacular-ubicacion">Ubicación</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="text" id="add-espectacular-coordenadas" class="form-control" placeholder="22°08'43.1&quot;N 100°56'53.4&quot;W" aria-label="Coordenadas" name="espectacularCoordenadas">
                                <label for="add-espectacular-coordenadas">Coordenadas</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="text" id="add-espectacular-carretera" class="form-control" placeholder="Carretera 57" aria-label="Carretera" name="espectacularCarretera">
                                <label for="add-espectacular-carretera">Carretera</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <select id="espectacular-medidas" class="form-select" name="espectacularMedidas">
                                    <option value="">Seleccionar</option>
                                    <option value="12 x 7.20 Mts">12 x 7.20 Mts</option>
                                    <option value="10 x 6.00 Mts">10 x 6.00 Mts</option>
                                    <option value="8 x 4.00 Mts">8 x 4.00 Mts</option>
                                    <option value="14 x 8.00 Mts">14 x 8.00 Mts</option>
                                </select>
                                <label for="espectacular-medidas">Medidas</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <select id="espectacular-caras" class="form-select" name="espectacularCaras">
                                    <option value="1">1 Cara</option>
                                    <option value="2" selected>2 Caras</option>
                                    <option value="3">3 Caras</option>
                                </select>
                                <label for="espectacular-caras">Número de Caras</label>
                            </div>
                            <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">Guardar</button>
                            <button type="reset" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas">Cancelar</button>
                        </form>
                    </div>
                </div>
                

                <div class="modal fade" id="crearEspectacularModal" tabindex="-1" aria-labelledby="crearEspectacularModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-xl">
                        <div class="modal-content">
                            <!-- Header con progress -->
                            <div class="modal-header">
                                <div class="d-flex justify-content-between align-items-center w-100">
                                    <h5 class="modal-title" id="crearEspectacularModalLabel">Crear Nuevo Espectacular</h5>
                                    <div class="step-progress">
                                        <div class="progress-bar-custom">
                                            <div class="progress-fill" id="progressFill" style="width: 33.33%"></div>
                                        </div>
                                        <span class="step-counter">Paso <span id="currentStep">1</span> de 3</span>
                                    </div>
                                </div>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>

                            <!-- Contenido del modal -->
                            <div class="modal-body" style="padding: 2rem;">
                                <!-- Paso 1: Información Básica -->
                                <div class="step-content active" id="step1">
                                    <h4 class="mb-4">Información Básica</h4>
                                    
                                    <div class="row g-4 mb-4">
                                        <!-- ID Automático -->

                                        <div class="col-sm-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" id="id" class="form-control" value="ESP-001" readonly/>
                                                <label for="id">ID generado automáticamente</label>
                                            </div>
                                        </div>

                                        <!-- Nombre -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" class="form-control" id="nombreEspectacular" placeholder=" ">
                                                <label for="nombreEspectacular">Nombre del Espectacular *</label>
                                            </div>
                                        </div>

                                        <!-- Ubicación -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" class="form-control" id="ubicacionEspectacular" placeholder=" ">
                                                <label for="ubicacionEspectacular">Ubicación Completa *</label>
                                            </div>
                                        </div>

                                        <!-- Carretera -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" class="form-control" id="carreteraEspectacular" placeholder=" ">
                                                <label for="carreteraEspectacular">Carretera o Avenida *</label>
                                            </div>
                                        </div>

                                        <!-- Coordenadas -->
                                        <div class="col-md-6">
                                            <div class="form-floating-outline">
                                                <label for="coordenadasEspectacular">Coordenadas GPS *</label>
                                                <div class="input-group">
                                                    <input type="text" class="form-control" id="coordenadasEspectacular" placeholder=" ">
                                                    <button class="btn btn-outline-secondary" type="button">
                                                        <i class="mdi mdi-map-marker"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Medidas -->
                                        <div class="col-md-6">
                                            <label class="form-label">Medidas *</label>
                                            <div class="d-flex gap-2">
                                                <button type="button" class="size-option active" data-medida="12x7.20">12 x 7.20 Mts</button>
                                                <button type="button" class="size-option" data-medida="10x6.00">10 x 6.00 Mts</button>
                                                <button type="button" class="size-option" data-medida="8x4.00">8 x 4.00 Mts</button>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Caras del Espectacular -->
                                    <div class="border-top pt-4">
                                        <h5 class="mb-3">Caras del Espectacular</h5>
                                        
                                        <div id="carasContainer">
                                            <!-- Cara 1 -->
                                            <div class="cara-item mb-3" data-cara="1">
                                                <div class="row g-3 align-items-end">
                                                    <div class="col-md-4">
                                                        <div class="form-floating form-floating-outline">
                                                            <input type="text" class="form-control" value="Cara Natural" placeholder=" ">
                                                            <label>Tipo de Cara</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <div class="form-floating form-floating-outline">
                                                            <select class="form-select">
                                                                <option value="Norte" selected>Norte</option>
                                                                <option value="Sur">Sur</option>
                                                                <option value="Este">Este</option>
                                                                <option value="Oeste">Oeste</option>
                                                                <option value="Noreste">Noreste</option>
                                                                <option value="Noroeste">Noroeste</option>
                                                                <option value="Sureste">Sureste</option>
                                                                <option value="Suroeste">Suroeste</option>
                                                            </select>
                                                            <label>Vista / Orientación</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <div class="form-floating form-floating-outline">
                                                            <select class="form-select">
                                                                <option value="Disponible" selected>Disponible</option>
                                                                <option value="Ocupado">Ocupado</option>
                                                                <option value="En Mantenimiento">En Mantenimiento</option>
                                                            </select>
                                                            <label>Estado Inicial</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-2">
                                                        <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="eliminarCara(1)" style="display: none;">
                                                            <i class="mdi mdi-delete"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <!-- Cara 2 -->
                                            <div class="cara-item mb-3" data-cara="2">
                                                <div class="row g-3 align-items-end">
                                                    <div class="col-md-4">
                                                        <div class="form-floating form-floating-outline">
                                                            <input type="text" class="form-control" value="Contra Cara" placeholder=" ">
                                                            <label>Tipo de Cara</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <div class="form-floating form-floating-outline">
                                                            <select class="form-select">
                                                                <option value="Norte">Norte</option>
                                                                <option value="Sur" selected>Sur</option>
                                                                <option value="Este">Este</option>
                                                                <option value="Oeste">Oeste</option>
                                                                <option value="Noreste">Noreste</option>
                                                                <option value="Noroeste">Noroeste</option>
                                                                <option value="Sureste">Sureste</option>
                                                                <option value="Suroeste">Suroeste</option>
                                                            </select>
                                                            <label>Vista / Orientación</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-3">
                                                        <div class="form-floating form-floating-outline">
                                                            <select class="form-select">
                                                                <option value="Disponible" selected>Disponible</option>
                                                                <option value="Ocupado">Ocupado</option>
                                                                <option value="En Mantenimiento">En Mantenimiento</option>
                                                            </select>
                                                            <label>Estado Inicial</label>
                                                        </div>
                                                    </div>
                                                    <div class="col-md-2">
                                                        <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="eliminarCara(2)">
                                                            <i class="mdi mdi-delete"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <button type="button" class="btn btn-outline-primary" onclick="agregarCara()">
                                            <i class="mdi mdi-plus me-2"></i>Agregar Cara
                                        </button>
                                    </div>
                                </div>

                                <!-- Paso 2: Características Técnicas -->
                                <div class="step-content" id="step2">
                                    <h4 class="mb-4">Características Técnicas</h4>
                                    
                                    <div class="row g-4 mb-4">
                                        <!-- Tipo de Estructura -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <select class="form-select" id="tipoEstructura">
                                                    <option value="Unipolar" selected>Unipolar</option>
                                                    <option value="Bipolar">Bipolar</option>
                                                    <option value="Muro">Muro</option>
                                                    <option value="Azotea">Azotea</option>
                                                    <option value="Pantalla LED">Pantalla LED</option>
                                                </select>
                                                <label for="tipoEstructura">Tipo de Estructura</label>
                                            </div>
                                        </div>
                                        <!-- Material de Caras -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <input type="text" class="form-control" id="materialCaras" value="Lona impresa" placeholder=" ">
                                                <label for="materialCaras">Material de Caras</label>
                                            </div>
                                        </div>
                                        <!-- Ángulo Visual -->
                                        <div class="col-md-6">
                                            <label class="form-label">Ángulo Visual (grados)</label>
                                            <div class="number-control">
                                                <button type="button" onclick="cambiarAngulo(-5)">
                                                    <i class="mdi mdi-minus"></i>
                                                </button>
                                                <input type="number" id="anguloVisual" value="90" readonly>
                                                <button type="button" onclick="cambiarAngulo(5)">
                                                    <i class="mdi mdi-plus"></i>
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <!-- Altura Total -->
                                        <div class="col-md-6">
                                            <label class="form-label">Altura Total (metros)</label>
                                            <div class="number-control">
                                                <button type="button" onclick="cambiarAltura(-0.5)">
                                                    <i class="mdi mdi-minus"></i>
                                                </button>
                                                <input type="number" id="alturaTotal" value="15" step="0.5" readonly>
                                                <button type="button" onclick="cambiarAltura(0.5)">
                                                    <i class="mdi mdi-plus"></i>
                                                </button>
                                            </div>
                                        </div>

                                        

                                        <!-- Iluminación -->
                                        <div class="col-md-6">
                                            <div class="form-floating form-floating-outline">
                                                <select class="form-select" id="iluminacion">
                                                    <option value="LED" selected>LED</option>
                                                    <option value="Reflectores">Reflectores</option>
                                                    <option value="Sin iluminación">Sin iluminación</option>
                                                </select>
                                                <label for="iluminacion">Iluminación</label>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Observaciones -->
                                    <div>
                                        <div class="form-floating form-floating-outline">
                                            <textarea class="form-control" id="observaciones" style="height: 120px" placeholder=" "></textarea>
                                            <label for="observaciones">Observaciones Adicionales</label>
                                        </div>
                                    </div>
                                </div>

                                <!-- Paso 3: Imágenes y Ubicación -->
                                <div class="step-content" id="step3">
                                    <h4 class="mb-4">Imágenes y Ubicación</h4>
                                    
                                    <!-- Upload de imágenes -->
                                    <div class="mb-4">
                                        <label class="form-label">Imágenes del Espectacular</label>
                                        <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
                                            <i class="mdi mdi-image-outline display-4 text-muted mb-3"></i>
                                            <h6 class="text-muted mb-2">Arrastra y suelta las imágenes aquí o</h6>
                                            <button type="button" class="btn btn-outline-secondary">
                                                Seleccionar Archivos
                                            </button>
                                            <p class="text-muted small mt-2 mb-0">Se aceptan imágenes JPG, PNG o WEBP (máx. 5MB)</p>
                                        </div>
                                        <input type="file" id="fileInput" multiple accept="image/*" style="display: none;">
                                    </div>

                                    <!-- Mapa -->
                                    <div class="mb-4">
                                        <label class="form-label">Ubicación en el Mapa</label>
                                        <div class="map-placeholder">
                                            <div class="text-center">
                                                <i class="mdi mdi-map-marker-outline display-4 text-muted mb-3"></i>
                                                <h6 class="text-muted mb-1">Aquí se mostraría un mapa con la ubicación</h6>
                                                <p class="text-muted small mb-0">basada en las coordenadas ingresadas</p>
                                            </div>
                                        </div>
                                        <small class="text-muted">Coordenadas actuales: <span id="coordenadasActuales">No definidas</span></small>
                                    </div>

                                    <!-- Vista Previa -->
                                    <div class="border-top pt-4">
                                        <h5 class="mb-3">Vista Previa</h5>
                                        <div class="preview-card">
                                            <div class="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 class="mb-1" id="previewNombre">Nombre del Espectacular</h6>
                                                    <p class="text-muted small mb-0" id="previewUbicacion">Ubicación completa</p>
                                                </div>
                                                <div class="text-end">
                                                    <span class="badge bg-primary">ID: ESP001</span>
                                                    <p class="text-muted small mb-0 mt-1" id="previewMedidas">12 x 7.20 Mts</p>
                                                </div>
                                            </div>
                                            
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <h6 class="text-muted small mb-2">CARAS:</h6>
                                                    <div id="previewCaras">
                                                        <div class="d-flex align-items-center mb-1">
                                                            <span class="estado-dot estado-disponible"></span>
                                                            <small>Cara Natural (Norte)</small>
                                                        </div>
                                                        <div class="d-flex align-items-center">
                                                            <span class="estado-dot estado-disponible"></span>
                                                            <small>Contra Cara (Sur)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="col-md-6">
                                                    <h6 class="text-muted small mb-2">CARACTERÍSTICAS:</h6>
                                                    <div>
                                                        <small class="d-block">Estructura: <span id="previewEstructura">Unipolar</span></small>
                                                        <small class="d-block">Iluminación: <span id="previewIluminacion">LED</span></small>
                                                        <small class="d-block">Altura: <span id="previewAltura">15</span>m</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Estado de éxito -->
                                <div class="step-content text-center" id="stepSuccess" style="display: none;">
                                    <div class="success-icon">
                                        <i class="mdi mdi-check"></i>
                                    </div>
                                    <h4 class="mb-3">¡Espectacular creado con éxito!</h4>
                                    <p class="text-muted mb-4">El espectacular ha sido registrado correctamente en el sistema.</p>
                                    <div class="d-flex justify-content-center gap-3">
                                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                                            Ver Listado
                                        </button>
                                        <button type="button" class="btn btn-primary" onclick="crearOtro()">
                                            Crear Otro
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <!-- Footer con botones de navegación -->
                            <div class="nav-buttons" id="modalFooter">
                                <button type="button" class="btn btn-outline-secondary" id="btnAnterior" onclick="anteriorPaso()" disabled>
                                    <i class="mdi mdi-arrow-left me-1"></i>Anterior
                                </button>
                                <button type="button" class="btn btn-primary" id="btnSiguiente" onclick="siguientePaso()">
                                    Siguiente<i class="mdi mdi-arrow-right ms-1"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
        <div id="sectionApartados" style="display:none;">
            <div class="card">
                <div class="card-header card-header-apartado border-bottom">
                    <h5 class="card-title">Filtros de Búsqueda</h5>
                    <div class="d-flex justify-content-between align-items-center row py-3 gap-3 gap-md-0">
                        <div class="col-md-3">
                            <select class="form-select" id="cliente_filter">
                                <option value="">Todos los clientes</option>
                                <option value="Comercial Mexicana">Comercial Mexicana</option>
                                <option value="Banco Azteca">Banco Azteca</option>
                                <option value="Telcel">Telcel</option>
                                <option value="Liverpool">Liverpool</option>
                                <option value="Coca-Cola">Coca-Cola</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="estado_filter_ap">
                                <option value="">Todos los estados</option>
                                <option value="Activo">Activo</option>
                                <option value="Por Vencer">Por Vencer</option>
                                <option value="Vencido">Vencido</option>
                                <option value="Renovado">Renovado</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <select class="form-select" id="espectacular_filter">
                                <option value="">Todos los espectaculares</option>
                                <option value="ESP001">ESP001 - Autos Mendoza</option>
                                <option value="ESP002">ESP002 - Blego La Pila</option>
                                <option value="ESP003">ESP003 - Zona Industrial</option>
                                <option value="ESP004">ESP004 - Centro Comercial</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <input type="month" class="form-control" id="mes_filter" placeholder="Filtrar por mes">
                        </div>
                    </div>
                </div>
                <div class="card-datatable table-responsive">
                    <table class="datatables-apartados table" id="apartadosTable">
                        <thead class="table-light">
                            <tr>
                                <th></th>
                                <th>ID Apartado</th>
                                <th>Cliente</th>
                                <th>Espectacular</th>
                                <th>Cara</th>
                                <th>Período</th>
                                <th>Estado</th>
                                <th>Valor</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Los datos se cargarán via JavaScript -->
                        </tbody>
                    </table>
                </div>

                <!-- Offcanvas para agregar/editar apartado -->
                <div class="offcanvas offcanvas-end" tabindex="-1" id="offcanvasAddApartado" aria-labelledby="offcanvasAddApartadoLabel">
                    <div class="offcanvas-header">
                        <h5 id="offcanvasAddApartadoLabel" class="offcanvas-title">Nuevo Apartado</h5>
                        <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div class="offcanvas-body mx-0 flex-grow-0 h-100">
                        <form class="add-new-apartado pt-0" id="addNewApartadoForm">
                            <div class="form-floating form-floating-outline mb-4">
                                <select class="form-select" id="add-apartado-espectacular" name="apartadoEspectacular">
                                    <option value="">Seleccionar</option>
                                    <option value="ESP001">ESP001 - Autos Mendoza</option>
                                    <option value="ESP002">ESP002 - Blego La Pila</option>
                                    <option value="ESP003">ESP003 - Zona Industrial</option>
                                    <option value="ESP004">ESP004 - Centro Comercial</option>
                                </select>
                                <label for="add-apartado-espectacular">Espectacular</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <select class="form-select" id="add-apartado-cara" name="apartadoCara">
                                    <option value="">Seleccionar cara</option>
                                    <!-- Se llena dinámicamente según el espectacular seleccionado -->
                                </select>
                                <label for="add-apartado-cara">Cara</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <select class="form-select" id="add-apartado-cliente" name="apartadoCliente">
                                    <option value="">Seleccionar</option>
                                    <option value="Comercial Mexicana">Comercial Mexicana</option>
                                    <option value="Banco Azteca">Banco Azteca</option>
                                    <option value="Telcel">Telcel</option>
                                    <option value="Liverpool">Liverpool</option>
                                    <option value="Coca-Cola">Coca-Cola</option>
                                </select>
                                <label for="add-apartado-cliente">Cliente</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="date" class="form-control" id="add-apartado-inicio" name="apartadoInicio">
                                <label for="add-apartado-inicio">Fecha Inicio</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="date" class="form-control" id="add-apartado-fin" name="apartadoFin">
                                <label for="add-apartado-fin">Fecha Fin</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <input type="number" class="form-control" id="add-apartado-valor" name="apartadoValor" step="0.01" placeholder="0.00">
                                <label for="add-apartado-valor">Valor Mensual ($)</label>
                            </div>
                            <div class="form-floating form-floating-outline mb-4">
                                <textarea class="form-control" id="add-apartado-notas" name="apartadoNotas" style="height: 100px" placeholder="Notas adicionales..."></textarea>
                                <label for="add-apartado-notas">Notas</label>
                            </div>
                            <button type="submit" class="btn btn-primary me-sm-3 me-1 data-submit">Guardar</button>
                            <button type="reset" class="btn btn-outline-secondary" data-bs-dismiss="offcanvas">Cancelar</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal para Ver Detalles del Apartado -->
        <div class="modal fade" id="detalleApartadoModal" tabindex="-1" aria-labelledby="detalleApartadoModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="detalleApartadoModalLabel">Detalles del Apartado</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">ID Apartado</h6>
                                        <p class="text-muted mb-0" id="detalle-id">APT001</p>
                                    </div>
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Estado</h6>
                                        <span class="badge bg-label-success" id="detalle-estado">Activo</span>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Cliente</h6>
                                        <p class="text-muted mb-0" id="detalle-cliente">Comercial Mexicana</p>
                                    </div>
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Valor Mensual</h6>
                                        <p class="text-muted mb-0" id="detalle-valor">$5,500</p>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Espectacular</h6>
                                        <p class="text-muted mb-0" id="detalle-espectacular">ESP003 - Zona Industrial</p>
                                    </div>
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Cara</h6>
                                        <p class="text-muted mb-0" id="detalle-cara">Cara Natural (Este)</p>
                                    </div>
                                </div>
                                <div class="row mb-3">
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Fecha Inicio</h6>
                                        <p class="text-muted mb-0" id="detalle-fecha-inicio">15/05/2025</p>
                                    </div>
                                    <div class="col-sm-6">
                                        <h6 class="mb-1">Fecha Fin</h6>
                                        <p class="text-muted mb-0" id="detalle-fecha-fin">15/08/2025</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card bg-light">
                                    <div class="card-body text-center">
                                        <div class="client-logo bg-primary mx-auto mb-3" id="detalle-logo">CM</div>
                                        <h6 class="mb-1" id="detalle-cliente-nombre">Comercial Mexicana</h6>
                                        <p class="text-muted small mb-2">Cliente Premium</p>
                                        <div class="d-flex justify-content-center">
                                            <span class="badge bg-label-success">Activo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <h6 class="mb-3">Timeline del Apartado</h6>
                        <div class="timeline" id="apartado-timeline">
                            <div class="timeline-item">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">Apartado Creado</h6>
                                    <small class="text-muted">01/05/2025</small>
                                </div>
                                <p class="text-muted mb-0">Apartado registrado en el sistema</p>
                            </div>
                            <div class="timeline-item">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">Contrato Firmado</h6>
                                    <small class="text-muted">10/05/2025</small>
                                </div>
                                <p class="text-muted mb-0">Documentación legal completada</p>
                            </div>
                            <div class="timeline-item">
                                <div class="d-flex justify-content-between">
                                    <h6 class="mb-1">Apartado Activo</h6>
                                    <small class="text-muted">15/05/2025</small>
                                </div>
                                <p class="text-muted mb-0">Período de vigencia iniciado</p>
                            </div>
                        </div>
                        
                        <div class="mt-4" id="detalle-notas-section">
                            <h6 class="mb-2">Notas</h6>
                            <p class="text-muted" id="detalle-notas">Cliente preferencial con descuento del 10%. Renovación automática habilitada.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                        <button type="button" class="btn btn-primary" onclick="editarApartado()">Editar Apartado</button>
                    </div>
                </div>
            </div>
        </div>



        <!-- Modal para Apartar Espectacular -->
        <div class="modal fade" id="apartadoModal" tabindex="-1" aria-labelledby="apartadoModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="apartadoModalLabel">Apartar Espectacular</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-4">
                            <div class="col-md-4">
                                <img id="modal-imagen" src="https://via.placeholder.com/300x200" alt="Espectacular" class="img-fluid rounded">
                            </div>
                            <div class="col-md-8">
                                <h6 id="modal-nombre" class="mb-2">Nombre del Espectacular</h6>
                                <p class="mb-1"><strong>ID:</strong> <span id="modal-id">ESP001</span></p>
                                <p class="mb-1"><strong>Ubicación:</strong> <span id="modal-ubicacion">Ubicación</span></p>
                                <p class="mb-1"><strong>Tamaño:</strong> <span id="modal-medidas">12 x 7.20 Mts</span></p>
                                <p class="mb-1"><strong>Coordenadas:</strong> <span id="modal-coordenadas">Coordenadas</span></p>
                            </div>
                        </div>
                        
                        <hr>
                        
                        <h6 class="mb-3">Información del Apartado</h6>
                        <form id="apartadoForm">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <div class="form-floating form-floating-outline">
                                        <select class="form-select" id="cara-select" name="caraId">
                                            <!-- Se llena dinámicamente -->
                                        </select>
                                        <label for="cara-select">Seleccionar Cara</label>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-floating form-floating-outline">
                                        <select class="form-select" id="cliente-select" name="clienteId">
                                            <option value="">Seleccionar cliente</option>
                                            <option value="1">Comercial Mexicana</option>
                                            <option value="2">Banco Azteca</option>
                                            <option value="3">Telcel</option>
                                            <option value="4">Liverpool</option>
                                            <option value="5">Coca-Cola</option>
                                        </select>
                                        <label for="cliente-select">Cliente</label>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-floating form-floating-outline">
                                        <input type="date" class="form-control" id="fecha-inicio" name="fechaInicio">
                                        <label for="fecha-inicio">Fecha Inicio</label>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <div class="form-floating form-floating-outline">
                                        <input type="date" class="form-control" id="fecha-fin" name="fechaFin">
                                        <label for="fecha-fin">Fecha Fin</label>
                                    </div>
                                </div>
                                <div class="col-12 mb-3">
                                    <div class="form-floating form-floating-outline">
                                        <textarea class="form-control" id="notas" name="notas" style="height: 100px" placeholder="Notas adicionales..."></textarea>
                                        <label for="notas">Notas Adicionales</label>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" id="confirmar-apartado">Confirmar Apartado</button>
                    </div>
                </div>
            </div>
        </div>

    </div>

@endsection
@section('script')

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="{{ asset('/materialize/assets/vendor/libs/jquery/jquery.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/popper/popper.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/js/bootstrap.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/node-waves/node-waves.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/hammer/hammer.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/i18n/i18n.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/js/menu.js') }}"></script>

    <!-- Other CSS -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>

    <!-- Vendors JS -->
    <script src="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.js') }}"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Main JS -->
    <script src="{{ asset('/materialize/assets/js/main.js') }}"></script>

    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/app-ecommerce-dashboard.js') }}"></script>
        <!-- Vendors JS -->
    <script src="{{ asset('/materialize/assets/vendor/libs/moment/moment.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/select2/select2.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/popular.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/auto-focus.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/cleavejs/cleave.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/cleavejs/cleave-phone.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/bs-stepper/bs-stepper.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/bootstrap-select/bootstrap-select.js') }}"></script>

    <script src="{{ asset('/materialize/assets/js/app-user-list.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/bootstrap-datepicker/bootstrap-datepicker.js') }}"></script>
    <!-- Page JS -->
   
    <script src="{{ asset('/materialize/assets/js/forms-pickers.js') }}"></script>

    <script src="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.js') }}"></script>
   
    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/app-ecommerce-product-list.js') }}"></script>
    <script src="{{ asset('/materialize/assets/js/form-wizard-numbered.js') }}"></script>
    <script src=".{{ asset('/materialize/assets/js/form-wizard-validation.js') }}"></script>

 <!-- Scripts -->
    <script>
  $(function(){
    // suponemos que ya inicializaste:
    // const tableEs = $('#espectacularesTable').DataTable({...});
    // const tableAp = $('#apartadosTable').DataTable({...});

    $('#tabCatalogo').on('click', function(){
      // estilo de tab activo/inactivo
      $(this).removeClass('btn-outline-secondary').addClass('btn-primary');
      $('#tabApartados').removeClass('btn-primary').addClass('btn-outline-secondary');
      // mostrar/ocultar secciones
      $('#sectionCatalogo').show();
      $('#sectionApartados').hide();
      // reajustar columnas (opcional)
      tableEs.columns.adjust();
    });

    $('#tabApartados').on('click', function(){
      $(this).removeClass('btn-outline-secondary').addClass('btn-primary');
      $('#tabCatalogo').removeClass('btn-primary').addClass('btn-outline-secondary');
      $('#sectionCatalogo').hide();
      $('#sectionApartados').show();
      tableAp.columns.adjust();
    });
  });
</script>

    <script>
        const apartados = [
            {
                id: 'APT001',
                espectacularId: 'ESP003',
                espectacularNombre: 'Zona Industrial',
                caraId: 'C1',
                caraTipo: 'Cara Natural',
                caraVista: 'Este',
                cliente: 'Comercial Mexicana',
                clienteLogo: 'CM',
                fechaInicio: '2025-05-15',
                fechaFin: '2025-08-15',
                valor: 5500,
                estado: 'Activo',
                notas: 'Cliente preferencial con descuento del 10%. Renovación automática habilitada.',
                timeline: [
                    { fecha: '2025-05-01', evento: 'Apartado Creado', descripcion: 'Apartado registrado en el sistema' },
                    { fecha: '2025-05-10', evento: 'Contrato Firmado', descripcion: 'Documentación legal completada' },
                    { fecha: '2025-05-15', evento: 'Apartado Activo', descripcion: 'Período de vigencia iniciado' }
                ]
            },
            {
                id: 'APT002',
                espectacularId: 'ESP004',
                espectacularNombre: 'Centro Comercial',
                caraId: 'C1',
                caraTipo: 'Cara Natural',
                caraVista: 'Sur',
                cliente: 'Banco Azteca',
                clienteLogo: 'BA',
                fechaInicio: '2025-04-01',
                fechaFin: '2025-07-01',
                valor: 7200,
                estado: 'Activo',
                notas: 'Contrato anual con opción a descuento por pago anticipado.',
                timeline: [
                    { fecha: '2025-03-20', evento: 'Apartado Creado', descripcion: 'Solicitud inicial recibida' },
                    { fecha: '2025-03-28', evento: 'Contrato Firmado', descripcion: 'Términos acordados y firmados' },
                    { fecha: '2025-04-01', evento: 'Apartado Activo', descripcion: 'Campaña publicitaria iniciada' }
                ]
            },
            {
                id: 'APT003',
                espectacularId: 'ESP004',
                espectacularNombre: 'Centro Comercial',
                caraId: 'C2',
                caraTipo: 'Contra Cara',
                caraVista: 'Norte',
                cliente: 'Telcel',
                clienteLogo: 'TC',
                fechaInicio: '2025-03-20',
                fechaFin: '2025-06-20',
                valor: 6800,
                estado: 'Por Vencer',
                notas: 'Campaña de lanzamiento de nuevo producto. Posible renovación.',
                timeline: [
                    { fecha: '2025-03-10', evento: 'Apartado Creado', descripcion: 'Propuesta enviada y aceptada' },
                    { fecha: '2025-03-18', evento: 'Contrato Firmado', descripcion: 'Documentos legales procesados' },
                    { fecha: '2025-03-20', evento: 'Apartado Activo', descripcion: 'Material publicitario instalado' }
                ]
            },
            {
                id: 'APT004',
                espectacularId: 'ESP001',
                espectacularNombre: 'Autos Mendoza',
                caraId: 'C1',
                caraTipo: 'Cara Natural',
                caraVista: 'Poniente',
                cliente: 'Liverpool',
                clienteLogo: 'LP',
                fechaInicio: '2025-02-01',
                fechaFin: '2025-05-01',
                valor: 4500,
                estado: 'Vencido',
                notas: 'Campaña de temporada navideña. Cliente satisfecho con resultados.',
                timeline: [
                    { fecha: '2025-01-15', evento: 'Apartado Creado', descripcion: 'Negociación inicial completada' },
                    { fecha: '2025-01-28', evento: 'Contrato Firmado', descripcion: 'Condiciones especiales acordadas' },
                    { fecha: '2025-02-01', evento: 'Apartado Activo', descripcion: 'Campaña publicitaria lanzada' },
                    { fecha: '2025-05-01', evento: 'Apartado Vencido', descripcion: 'Finalización del período contractual' }
                ]
            },
            {
                id: 'APT005',
                espectacularId: 'ESP002',
                espectacularNombre: 'Blego - La Pila',
                caraId: 'C1',
                caraTipo: 'Cara Natural',
                caraVista: 'Norte',
                cliente: 'Coca-Cola',
                clienteLogo: 'CC',
                fechaInicio: '2025-06-01',
                fechaFin: '2025-12-01',
                valor: 8500,
                estado: 'Renovado',
                notas: 'Campaña de verano extendida. Cliente VIP con tarifa preferencial.',
                timeline: [
                    { fecha: '2025-05-10', evento: 'Apartado Creado', descripcion: 'Renovación de contrato anterior' },
                    { fecha: '2025-05-25', evento: 'Contrato Firmado', descripcion: 'Mejores condiciones negociadas' },
                    { fecha: '2025-06-01', evento: 'Apartado Activo', descripcion: 'Nueva campaña publicitaria' },
                    { fecha: '2025-05-28', evento: 'Renovado', descripcion: 'Extensión del contrato aprobada' }
                ]
            },
            {
                id: 'APT006',
                espectacularId: 'ESP001',
                espectacularNombre: 'Autos Mendoza',
                caraId: 'C2',
                caraTipo: 'Contra cara',
                caraVista: 'Oriente',
                cliente: 'Comercial Mexicana',
                clienteLogo: 'CM',
                fechaInicio: '2025-07-01',
                fechaFin: '2025-10-01',
                valor: 4800,
                estado: 'Activo',
                notas: 'Segunda ubicación para el mismo cliente. Descuento por volumen aplicado.',
                timeline: [
                    { fecha: '2025-06-15', evento: 'Apartado Creado', descripcion: 'Expansión de campaña existente' },
                    { fecha: '2025-06-28', evento: 'Contrato Firmado', descripcion: 'Condiciones preferentes aplicadas' },
                    { fecha: '2025-07-01', evento: 'Apartado Activo', descripcion: 'Segunda ubicación activada' }
                ]
            }
        ];
        // Datos de ejemplo
        const espectaculares = [
            {
                id: 'ESP001',
                nombre: 'Autos Mendoza',
                ubicacion: 'Blv. San Luis deportiva universitaria',
                coordenadas: '22°08\'43.1"N 100°56\'53.4"W',
                carretera: 'Carretera 57',
                medidas: '12 x 7.20 Mts',
                imagen: 'https://via.placeholder.com/400x320/696cff/ffffff?text=ESP001',
                caras: [
                    { id: 'C1', tipo: 'Cara Natural', vista: 'Poniente', estado: 'Disponible' },
                    { id: 'C2', tipo: 'Contra cara', vista: 'Oriente', estado: 'Disponible' }
                ]
            },
            {
                id: 'ESP002',
                nombre: 'Blego - La Pila',
                ubicacion: 'Km. 186+065 lado izq. carr.57 México',
                coordenadas: '22°02\'46.4"N 100°51\'30.1"W',
                carretera: 'Carretera 57',
                medidas: '12 x 7.20 Mts',
                imagen: 'https://via.placeholder.com/400x320/71dd37/ffffff?text=ESP002',
                caras: [
                    { id: 'C1', tipo: 'Cara Natural', vista: 'Norte', estado: 'Disponible' },
                    { id: 'C2', tipo: 'Contra Cara', vista: 'Sur', estado: 'Disponible' }
                ]
            },
            {
                id: 'ESP003',
                nombre: 'Zona Industrial',
                ubicacion: 'Av. Industrias 3220, Zona Industrial',
                coordenadas: '22°09\'15.3"N 100°58\'12.8"W',
                carretera: 'Av. Industrias',
                medidas: '10 x 6.00 Mts',
                imagen: 'https://via.placeholder.com/400x320/ff3e1d/ffffff?text=ESP003',
                caras: [
                    { id: 'C1', tipo: 'Cara Natural', vista: 'Este', estado: 'Ocupado' },
                    { id: 'C2', tipo: 'Contra Cara', vista: 'Oeste', estado: 'Disponible' }
                ]
            },
            {
                id: 'ESP004',
                nombre: 'Centro Comercial',
                ubicacion: 'Blvd. Antonio Rocha Cordero 700',
                coordenadas: '22°10\'33.6"N 100°59\'45.9"W',
                carretera: 'Blvd. Antonio Rocha Cordero',
                medidas: '12 x 7.20 Mts',
                imagen: 'https://via.placeholder.com/400x320/ffab00/ffffff?text=ESP004',
                caras: [
                    { id: 'C1', tipo: 'Cara Natural', vista: 'Sur', estado: 'Ocupado' },
                    { id: 'C2', tipo: 'Contra Cara', vista: 'Norte', estado: 'Ocupado' }
                ]
            }
        ];

        let dt_espectaculares;
        let currentEspectacular = null;
        let dt_apartados;
        let currentApartado = null;
        $(document).ready(function() {
            // Inicializar DataTable
            dt_espectaculares = $('#espectacularesTable').DataTable({
                data: espectaculares,
                columns: [
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: function() {
                            return '';
                        }
                    },
                    {
                        data: 'id',
                        render: function(data) {
                            return '<span class="fw-medium">' + data + '</span>';
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            return `
                                <div class="d-flex justify-content-start align-items-center">
                                    <div class="d-flex flex-column">
                                        <span class="user-name text-truncate">${data.nombre}</span>
                                        <small class="user-email text-truncate">${data.id}</small>
                                    </div>
                                </div>
                            `;
                        }
                    },
                    {
                        data: 'ubicacion',
                        render: function(data, type, row) {
                            return `
                                <div class="d-flex align-items-center">
                                    <i class="mdi mdi-map-marker-outline me-2 text-muted"></i>
                                    <span class="text-truncate" style="max-width: 200px;" title="${data}">${data}</span>
                                </div>
                            `;
                        }
                    },
                    {
                        data: 'medidas',
                        render: function(data) {
                            return '<span class="">' + data + '</span>';
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            const disponibles = data.caras.filter(c => c.estado === 'Disponible').length;
                            const total = data.caras.length;
                            const porcentaje = (disponibles / total) * 100;
                            
                            let badgeClass = 'bg-label-success badge rounded-pill';
                            let statusText = 'Disponible';
                            
                            if (disponibles === 0) {
                                badgeClass = 'bg-label-danger badge rounded-pill';
                                statusText = 'Ocupado';
                            } else if (disponibles < total) {
                                badgeClass = 'bg-label-warning badge rounded-pill';
                                statusText = 'Parcial';
                            }
                            
                            return `<span class="badge ${badgeClass}">${statusText}</span>`;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            const disponibles = data.caras.filter(c => c.estado === 'Disponible').length;
                            const total = data.caras.length;
                            return `<span class="fw-medium">${disponibles} de ${total}</span>`;
                        }
                    },
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: function(data) {
                            return `
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="openApartadoModal('${data.id}')" title="Apartar">
                                        <i class="mdi mdi-calendar-plus"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="editEspectacular('${data.id}')" title="Editar">
                                        <i class="mdi mdi-pencil-outline"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="viewEspectacular('${data.id}')" title="Ver">
                                        <i class="mdi mdi-eye-outline"></i>
                                    </button>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-icon btn-outline-secondary dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                            <i class="mdi mdi-dots-vertical"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item" href="javascript:void(0);" onclick="duplicateEspectacular('${data.id}')">
                                                <i class="mdi mdi-content-copy me-2"></i>Duplicar
                                            </a>
                                            <a class="dropdown-item" href="javascript:void(0);" onclick="downloadInfo('${data.id}')">
                                                <i class="mdi mdi-download me-2"></i>Descargar
                                            </a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteEspectacular('${data.id}')">
                                                <i class="mdi mdi-delete-outline me-2"></i>Eliminar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }
                ],
                responsive: false,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                displayLength: 10,
                lengthMenu: [7, 10, 25, 50, 75, 100],
                order: [[1, 'asc']],
                columnDefs: [
                    {
                        targets: [0, 7],
                        orderable: false
                    }
                ],
                buttons: [
                    {
                        text: '<i class="mdi mdi-plus me-1"></i><span class="d-none d-sm-inline-block">Agregar Espectacular</span>',
                        className: 'btn btn-primary',
                        action: function() {
                            $('#offcanvasAddEspectacular').offcanvas('show');
                        }
                    }
                ]
            });

            // Mover el botón de agregar al header
            //$('.card-header-esp').append('<button class="btn btn-sm btn-primary ms-auto" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAddEspectacular"><i class="mdi mdi-plus me-1"></i>Agregar Espectacular</button>');

            // Filtros personalizados
            $('#ubicacion_filter, #tamano_filter, #estado_filter').on('change', function() {
                dt_espectaculares.draw();
            });

            // Filtro personalizado para DataTables
            $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
                const ubicacionFilter = $('#ubicacion_filter').val();
                const tamanoFilter = $('#tamano_filter').val();
                const estadoFilter = $('#estado_filter').val();
                
                const row = espectaculares[dataIndex];
                
                // Filtro de ubicación
                if (ubicacionFilter) {
                    switch(ubicacionFilter) {
                        case 'carretera57':
                            if (!row.carretera.includes('Carretera 57')) return false;
                            break;
                        case 'zona-industrial':
                            if (!row.ubicacion.toLowerCase().includes('industrial')) return false;
                            break;
                        case 'centro':
                            if (!row.ubicacion.toLowerCase().includes('centro')) return false;
                            break;
                    }
                }
                
                // Filtro de tamaño
                if (tamanoFilter && row.medidas !== tamanoFilter) {
                    return false;
                }
                
                // Filtro de estado
                if (estadoFilter) {
                    const disponibles = row.caras.filter(c => c.estado === 'Disponible').length;
                    if (estadoFilter === 'Disponible' && disponibles === 0) return false;
                    if (estadoFilter === 'Ocupado' && disponibles > 0) return false;
                }

                return true;
            });

            // Inicializar Select2
            $('.select2').select2();

            // Event listeners para formularios
            $('#addNewEspectacularForm').on('submit', function(e) {
                e.preventDefault();
                // Aquí iría la lógica para agregar un nuevo espectacular
                console.log('Agregar nuevo espectacular');
                $('#offcanvasAddEspectacular').offcanvas('hide');
                showToast('Espectacular agregado exitosamente', 'success');
            });

            $('#confirmar-apartado').on('click', function() {
                // Aquí iría la lógica para confirmar el apartado
                console.log('Confirmar apartado');
                $('#apartadoModal').modal('hide');
                showToast('Apartado confirmado exitosamente', 'success');
            });
            // Inicializar DataTable
            dt_apartados = $('#apartadosTable').DataTable({
                data: apartados,
                columns: [
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: function() {
                            return '';
                        }
                    },
                    {
                        data: 'id',
                        render: function(data) {
                            return '<span class="fw-medium">' + data + '</span>';
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            const bgColors = ['bg-primary', 'bg-success', 'bg-info', 'bg-warning', 'bg-danger'];
                            const colorIndex = data.cliente.length % bgColors.length;
                            
                            return `
                                <div class="d-flex justify-content-start align-items-center">
                                    <div class="avatar-wrapper">
                                        <div class="avatar me-3">
                                            <div class="avatar-initial  rounded-circle ${bgColors[colorIndex]}">${data.clienteLogo}</div>
                                        </div>
                                    </div>
                                    <div class="d-flex flex-column">
                                        <span class="user-name text-truncate">${data.cliente}</span>
                                        <small class="user-email text-truncate">Cliente Activo</small>
                                    </div>
                                </div>
                            `;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            return `
                                <div class="d-flex flex-column">
                                    <span class="fw-medium">${data.espectacularId}</span>
                                    <small class="text-muted">${data.espectacularNombre}</small>
                                </div>
                            `;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            return `
                                <span class="">${data.caraTipo}</span><br>
                                <small class="text-muted">(${data.caraVista})</small>
                            `;
                        }
                    },
                    {
                        data: null,
                        render: function(data) {
                            const fechaInicio = new Date(data.fechaInicio).toLocaleDateString('es-ES');
                            const fechaFin = new Date(data.fechaFin).toLocaleDateString('es-ES');
                            const diasRestantes = Math.ceil((new Date(data.fechaFin) - new Date()) / (1000 * 60 * 60 * 24));
                            
                            let progressClass = 'bg-success';
                            if (diasRestantes < 30) progressClass = 'bg-warning';
                            if (diasRestantes < 0) progressClass = 'bg-danger';
                            
                            const porcentajeTranscurrido = Math.max(0, Math.min(100, 
                                ((new Date() - new Date(data.fechaInicio)) / (new Date(data.fechaFin) - new Date(data.fechaInicio))) * 100
                            ));
                            
                            return `
                                <div class="d-flex flex-column">
                                    <small class="text-muted mb-1">${fechaInicio} - ${fechaFin}</small>
                                    <div class="progress progress-sm mb-1">
                                        <div class="progress-bar ${progressClass}" style="width: ${porcentajeTranscurrido}%"></div>
                                    </div>
                                    <small class="text-muted">${diasRestantes > 0 ? diasRestantes + ' días restantes' : 'Vencido'}</small>
                                </div>
                            `;
                        }
                    },
                    {
                        data: 'estado',
                        render: function(data) {
                            const estadoClasses = {
                                'Activo': 'bg-label-success',
                                'Por Vencer': 'bg-label-warning',
                                'Vencido': 'bg-label-danger',
                                'Renovado': 'bg-label-info'
                            };
                            return `<span class="badge rounded-pill badge ${estadoClasses[data] || 'bg-label-secondary'}">${data}</span>`;
                        }
                    },
                    {
                        data: 'valor',
                        render: function(data) {
                            return `<span class="fw-medium">${data.toLocaleString()}</span>`;
                        }
                    },
                    {
                        data: null,
                        orderable: false,
                        searchable: false,
                        render: function(data) {
                            return `
                                <div class="d-flex align-items-center">
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="verDetalleApartado('${data.id}')" title="Ver Detalles">
                                        <i class="mdi mdi-eye-outline"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="editarApartado('${data.id}')" title="Editar">
                                        <i class="mdi mdi-pencil-outline"></i>
                                    </button>
                                    <button class="btn btn-sm btn-icon btn-outline-secondary me-1" onclick="renovarApartado('${data.id}')" title="Renovar">
                                        <i class="mdi mdi-refresh"></i>
                                    </button>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-icon btn-outline-secondary dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                                            <i class="mdi mdi-dots-vertical"></i>
                                        </button>
                                        <div class="dropdown-menu dropdown-menu-end">
                                            <a class="dropdown-item" href="javascript:void(0);" onclick="generarContrato('${data.id}')">
                                                <i class="mdi mdi-file-document me-2"></i>Generar Contrato
                                            </a>
                                            <a class="dropdown-item" href="javascript:void(0);" onclick="enviarRecordatorio('${data.id}')">
                                                <i class="mdi mdi-email-send me-2"></i>Enviar Recordatorio
                                            </a>
                                            <a class="dropdown-item" href="javascript:void(0);" onclick="duplicarApartado('${data.id}')">
                                                <i class="mdi mdi-content-copy me-2"></i>Duplicar
                                            </a>
                                            <div class="dropdown-divider"></div>
                                            <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="eliminarApartado('${data.id}')">
                                                <i class="mdi mdi-delete-outline me-2"></i>Eliminar
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    }
                ],
                responsive: false,
                language: {
                    url: 'https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
                },
                dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6 d-flex justify-content-center justify-content-md-end"f>>t<"row"<"col-sm-12 col-md-6"i><"col-sm-12 col-md-6"p>>',
                displayLength: 10,
                lengthMenu: [7, 10, 25, 50, 75, 100],
                order: [[1, 'asc']],
                columnDefs: [
                    {
                        targets: [0, 8],
                        orderable: false
                    }
                ]
            });

            // Mover el botón de agregar al header
            $('.card-header-apartado').append('<button class="btn btn-sm btn-primary ms-auto" data-bs-toggle="offcanvas" data-bs-target="#offcanvasAddApartado"><i class="mdi mdi-plus me-1"></i>Nuevo Apartado</button>');

            // Filtros personalizados
            $('#cliente_filter, #estado_filter_ap, #espectacular_filter, #mes_filter').on('change', function() {
                dt_apartados.draw();
            });

            // Filtro personalizado para DataTables
            $.fn.dataTable.ext.search.push(function(settings, data, dataIndex) {
                const clienteFilter = $('#cliente_filter').val();
                const estadoFilter_ap = $('#estado_filter_ap').val();
                const espectacularFilter = $('#espectacular_filter').val();
                const mesFilter = $('#mes_filter').val();
                
                const row = apartados[dataIndex];
                
                // Filtro de cliente
                if (clienteFilter && row.cliente !== clienteFilter) {
                    return false;
                }
                
                // Filtro de estado
                if (estadoFilter_ap && row.estado !== estadoFilter_ap) {
                    return false;
                }
                
                // Filtro de espectacular
                if (espectacularFilter && row.espectacularId !== espectacularFilter) {
                    return false;
                }
                
                // Filtro de mes
                if (mesFilter) {
                    const fechaInicio = new Date(row.fechaInicio);
                    const fechaFin = new Date(row.fechaFin);
                    const mesSeleccionado = new Date(mesFilter + '-01');
                    
                    if (!(fechaInicio <= mesSeleccionado && fechaFin >= mesSeleccionado)) {
                        return false;
                    }
                }
                
                return true;
            });

            // Actualizar caras disponibles cuando se selecciona un espectacular
            $('#add-apartado-espectacular').on('change', function() {
                const espectacularId = $(this).val();
                const caraSelect = $('#add-apartado-cara');
                caraSelect.empty().append('<option value="">Seleccionar cara</option>');
                
                if (espectacularId) {
                    const espectacular = espectaculares.find(e => e.id === espectacularId);
                    if (espectacular) {
                        espectacular.caras.forEach(cara => {
                            const option = $(`<option value="${cara.id}">${cara.tipo} (${cara.vista}) - ${cara.estado}</option>`);
                            if (cara.estado === 'Ocupado') {
                                option.prop('disabled', true);
                            }
                            caraSelect.append(option);
                        });
                    }
                }
            });

            // Event listeners para formularios
            $('#addNewApartadoForm').on('submit', function(e) {
                e.preventDefault();
                // Aquí iría la lógica para agregar un nuevo apartado
                console.log('Agregar nuevo apartado');
                $('#offcanvasAddApartado').offcanvas('hide');
                showToast('Apartado creado exitosamente', 'success');
            });
        });

        // Funciones de acción
        function openApartadoModal(espectacularId) {
            currentEspectacular = espectaculares.find(e => e.id === espectacularId);
            if (!currentEspectacular) return;
            
            // Llenar datos del modal
            $('#modal-nombre').text(currentEspectacular.nombre);
            $('#modal-id').text(currentEspectacular.id);
            $('#modal-ubicacion').text(currentEspectacular.ubicacion);
            $('#modal-medidas').text(currentEspectacular.medidas);
            $('#modal-coordenadas').text(currentEspectacular.coordenadas);
            $('#modal-imagen').attr('src', currentEspectacular.imagen);
            
            // Llenar opciones de caras
            const caraSelect = $('#cara-select');
            caraSelect.empty();
            currentEspectacular.caras.forEach(cara => {
                const option = $(`<option value="${cara.id}">${cara.tipo} (${cara.vista}) - ${cara.estado}</option>`);
                if (cara.estado === 'Ocupado') {
                    option.prop('disabled', true);
                }
                caraSelect.append(option);
            });
            
            $('#apartadoModal').modal('show');
        }

        function editEspectacular(id) {
            const espectacular = espectaculares.find(e => e.id === id);
            if (espectacular) {
                // Llenar formulario con datos existentes
                $('#add-espectacular-nombre').val(espectacular.nombre);
                $('#add-espectacular-ubicacion').val(espectacular.ubicacion);
                $('#add-espectacular-coordenadas').val(espectacular.coordenadas);
                $('#add-espectacular-carretera').val(espectacular.carretera);
                $('#espectacular-medidas').val(espectacular.medidas);
                $('#espectacular-caras').val(espectacular.caras.length);
                
                $('#offcanvasAddEspectacularLabel').text('Editar Espectacular');
                $('#offcanvasAddEspectacular').offcanvas('show');
            }
        }

        function viewEspectacular(id) {
            const espectacular = espectaculares.find(e => e.id === id);
            if (espectacular) {
                const disponibles = espectacular.caras.filter(c => c.estado === 'Disponible').length;
                const ocupadas = espectacular.caras.length - disponibles;
                
                const info = `
                    ID: ${espectacular.id}
                    Nombre: ${espectacular.nombre}
                    Ubicación: ${espectacular.ubicacion}
                    Tamaño: ${espectacular.medidas}
                    Coordenadas: ${espectacular.coordenadas}
                    Caras disponibles: ${disponibles}
                    Caras ocupadas: ${ocupadas}
                `;
                alert(info);
            }
        }

        function duplicateEspectacular(id) {
            const espectacular = espectaculares.find(e => e.id === id);
            if (espectacular) {
                showToast(`Espectacular ${id} duplicado`, 'info');
            }
        }

        function downloadInfo(id) {
            const espectacular = espectaculares.find(e => e.id === id);
            if (espectacular) {
                showToast(`Descargando información de ${id}`, 'info');
            }
        }

        function deleteEspectacular(id) {
            if (confirm('¿Está seguro que desea eliminar este espectacular?')) {
                const index = espectaculares.findIndex(e => e.id === id);
                if (index > -1) {
                    espectaculares.splice(index, 1);
                    dt_espectaculares.clear().rows.add(espectaculares).draw();
                    showToast('Espectacular eliminado exitosamente', 'success');
                }
            }
        }

        // Función para mostrar notificaciones toast
        function showToast(message, type = 'success') {
            const colors = {
                success: '#71dd37',
                error: '#ff3e1d',
                warning: '#ffab00',
                info: '#696cff'
            };

            // Crear toast dinámicamente
            const toast = $(`
                <div class="toast-container position-fixed top-0 end-0 p-3">
                    <div class="toast" role="alert" style="background-color: ${colors[type]}; color: white;">
                        <div class="toast-body">
                            <i class="mdi mdi-check-circle me-2"></i>${message}
                        </div>
                    </div>
                </div>
            `);

            $('body').append(toast);
            const bsToast = new bootstrap.Toast(toast.find('.toast')[0]);
            bsToast.show();

            // Remover después de 3 segundos
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Reset form cuando se cierra el offcanvas
        $('#offcanvasAddEspectacular').on('hidden.bs.offcanvas', function() {
            $('#addNewEspectacularForm')[0].reset();
            $('#offcanvasAddEspectacularLabel').text('Agregar Espectacular');
        });

        // Reset modal cuando se cierra
        $('#apartadoModal').on('hidden.bs.modal', function() {
            $('#apartadoForm')[0].reset();
            currentEspectacular = null;
        });
        // Funciones de acción
        function verDetalleApartado(apartadoId) {
            const apartado = apartados.find(a => a.id === apartadoId);
            if (!apartado) return;
            
            currentApartado = apartado;
            
            // Llenar datos del modal
            $('#detalle-id').text(apartado.id);
            $('#detalle-cliente').text(apartado.cliente);
            $('#detalle-cliente-nombre').text(apartado.cliente);
            $('#detalle-valor').text(' '+ apartado.valor.toLocaleString());
            $('#detalle-espectacular').text(apartado.espectacularId + ' - ' + apartado.espectacularNombre);
            $('#detalle-cara').text(apartado.caraTipo + ' (' + apartado.caraVista + ')');
            $('#detalle-fecha-inicio').text(new Date(apartado.fechaInicio).toLocaleDateString('es-ES'));
            $('#detalle-fecha-fin').text(new Date(apartado.fechaFin).toLocaleDateString('es-ES'));
            $('#detalle-notas').text(apartado.notas);
            $('#detalle-logo').text(apartado.clienteLogo);
            
            // Estado con clase apropiada
            const estadoClasses = {
                'Activo': 'bg-label-success',
                'Por Vencer': 'bg-label-warning',
                'Vencido': 'bg-label-danger',
                'Renovado': 'bg-label-info'
            };
            $('#detalle-estado').attr('class', `badge ${estadoClasses[apartado.estado]}`).text(apartado.estado);
            
            // Timeline
            const timelineHtml = apartado.timeline.map(item => `
                <div class="timeline-item">
                    <div class="d-flex justify-content-between">
                        <h6 class="mb-1">${item.evento}</h6>
                        <small class="text-muted">${new Date(item.fecha).toLocaleDateString('es-ES')}</small>
                    </div>
                    <p class="text-muted mb-0">${item.descripcion}</p>
                </div>
            `).join('');
            $('#apartado-timeline').html(timelineHtml);
            
            $('#detalleApartadoModal').modal('show');
        }

        function editarApartado(apartadoId = null) {
            if (!apartadoId && currentApartado) {
                apartadoId = currentApartado.id;
            }
            
            const apartado = apartados.find(a => a.id === apartadoId);
            if (apartado) {
                // Cerrar modal de detalles si está abierto
                $('#detalleApartadoModal').modal('hide');
                
                // Llenar formulario con datos existentes
                $('#add-apartado-espectacular').val(apartado.espectacularId).trigger('change');
                setTimeout(() => {
                    $('#add-apartado-cara').val(apartado.caraId);
                }, 100);
                $('#add-apartado-cliente').val(apartado.cliente);
                $('#add-apartado-inicio').val(apartado.fechaInicio);
                $('#add-apartado-fin').val(apartado.fechaFin);
                $('#add-apartado-valor').val(apartado.valor);
                $('#add-apartado-notas').val(apartado.notas);
                
                $('#offcanvasAddApartadoLabel').text('Editar Apartado');
                $('#offcanvasAddApartado').offcanvas('show');
            }
        }

        function renovarApartado(apartadoId) {
            const apartado = apartados.find(a => a.id === apartadoId);
            if (apartado) {
                const confirmed = confirm(`¿Desea renovar el apartado ${apartadoId} para ${apartado.cliente}?`);
                if (confirmed) {
                    // Aquí iría la lógica de renovación
                    showToast(`Apartado ${apartadoId} renovado exitosamente`, 'success');
                }
            }
        }

        function generarContrato(apartadoId) {
            const apartado = apartados.find(a => a.id === apartadoId);
            if (apartado) {
                showToast(`Generando contrato para ${apartado.cliente}...`, 'info');
            }
        }

        function enviarRecordatorio(apartadoId) {
            const apartado = apartados.find(a => a.id === apartadoId);
            if (apartado) {
                showToast(`Recordatorio enviado a ${apartado.cliente}`, 'success');
            }
        }

        function duplicarApartado(apartadoId) {
            const apartado = apartados.find(a => a.id === apartadoId);
            if (apartado) {
                showToast(`Apartado ${apartadoId} duplicado`, 'info');
            }
        }

        function eliminarApartado(apartadoId) {
            if (confirm('¿Está seguro que desea eliminar este apartado?')) {
                const index = apartados.findIndex(a => a.id === apartadoId);
                if (index > -1) {
                    apartados.splice(index, 1);
                    dt_apartados.clear().rows.add(apartados).draw();
                    showToast('Apartado eliminado exitosamente', 'success');
                }
            }
        }

        // Función para mostrar notificaciones toast
        function showToast(message, type = 'success') {
            const colors = {
                success: '#71dd37',
                error: '#ff3e1d',
                warning: '#ffab00',
                info: '#696cff'
            };

            const toast = $(`
                <div class="toast-container position-fixed top-0 end-0 p-3">
                    <div class="toast" role="alert" style="background-color: ${colors[type]}; color: white;">
                        <div class="toast-body">
                            <i class="mdi mdi-check-circle me-2"></i>${message}
                        </div>
                    </div>
                </div>
            `);

            $('body').append(toast);
            const bsToast = new bootstrap.Toast(toast.find('.toast')[0]);
            bsToast.show();

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Reset form cuando se cierra el offcanvas
        $('#offcanvasAddApartado').on('hidden.bs.offcanvas', function() {
            $('#addNewApartadoForm')[0].reset();
            $('#offcanvasAddApartadoLabel').text('Nuevo Apartado');
            $('#add-apartado-cara').empty().append('<option value="">Seleccionar cara</option>');
        });

        // Reset modal cuando se cierra
        $('#detalleApartadoModal').on('hidden.bs.modal', function() {
            currentApartado = null;
        });
    </script>
   <script>
        // Variables globales
        let currentStep = 1;
        let totalSteps = 3;
        let caraCounter = 2;
        
        // Datos del formulario
        let formData = {
            nombre: '',
            ubicacion: '',
            coordenadas: '',
            carretera: '',
            medidas: '12x7.20',
            caras: [
                { tipo: 'Cara Natural', vista: 'Norte', estado: 'Disponible' },
                { tipo: 'Contra Cara', vista: 'Sur', estado: 'Disponible' }
            ],
            tipoEstructura: 'Unipolar',
            anguloVisual: 90,
            alturaTotal: 15,
            materialCaras: 'Lona impresa',
            iluminacion: 'LED',
            observaciones: ''
        };

        // Inicializar cuando el DOM esté listo
        document.addEventListener('DOMContentLoaded', function() {
            // Event listeners para actualizar preview en tiempo real
            setupRealTimeUpdates();
            
            // Event listeners para botones de medidas
            setupSizeButtons();
            
            // Event listener para coordenadas
            document.getElementById('coordenadasEspectacular').addEventListener('input', function() {
                document.getElementById('coordenadasActuales').textContent = this.value || 'No definidas';
            });
        });

        // Configurar actualizaciones en tiempo real
        function setupRealTimeUpdates() {
            // Nombre
            document.getElementById('nombreEspectacular').addEventListener('input', function() {
                formData.nombre = this.value;
                document.getElementById('previewNombre').textContent = this.value || 'Nombre del Espectacular';
            });

            // Ubicación
            document.getElementById('ubicacionEspectacular').addEventListener('input', function() {
                formData.ubicacion = this.value;
                document.getElementById('previewUbicacion').textContent = this.value || 'Ubicación completa';
            });

            // Tipo de estructura
            document.getElementById('tipoEstructura').addEventListener('change', function() {
                formData.tipoEstructura = this.value;
                document.getElementById('previewEstructura').textContent = this.value;
            });

            // Iluminación
            document.getElementById('iluminacion').addEventListener('change', function() {
                formData.iluminacion = this.value;
                document.getElementById('previewIluminacion').textContent = this.value;
            });
        }

        // Configurar botones de medidas
        function setupSizeButtons() {
            document.querySelectorAll('.size-option').forEach(button => {
                button.addEventListener('click', function() {
                    // Remover active de todos
                    document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('active'));
                    
                    // Agregar active al clickeado
                    this.classList.add('active');
                    
                    // Actualizar datos
                    formData.medidas = this.dataset.medida;
                    document.getElementById('previewMedidas').textContent = this.textContent;
                });
            });
        }

        // Navegación entre pasos
        function siguientePaso() {
            if (currentStep < totalSteps) {
                // Validar paso actual antes de continuar
                if (validarPaso(currentStep)) {
                    currentStep++;
                    mostrarPaso(currentStep);
                    actualizarProgreso();
                    actualizarBotones();
                } else {
                    showToast('Por favor completa todos los campos requeridos', 'warning');
                }
            } else if (currentStep === totalSteps) {
                // Último paso - guardar
                guardarEspectacular();
            }
        }

        function anteriorPaso() {
            if (currentStep > 1) {
                currentStep--;
                mostrarPaso(currentStep);
                actualizarProgreso();
                actualizarBotones();
            }
        }

        function mostrarPaso(paso) {
            // Ocultar todos los pasos
            document.querySelectorAll('.step-content').forEach(step => {
                step.classList.remove('active');
                step.style.display = 'none';
            });
            
            // Ocultar estado de éxito si está visible
            document.getElementById('stepSuccess').style.display = 'none';
            
            // Mostrar paso actual
            const pasoActual = document.getElementById(`step${paso}`);
            if (pasoActual) {
                pasoActual.classList.add('active');
                pasoActual.style.display = 'block';
            }
            
            // Actualizar número de paso
            document.getElementById('currentStep').textContent = paso;
        }

        function actualizarProgreso() {
            const progress = (currentStep / totalSteps) * 100;
            document.getElementById('progressFill').style.width = `${progress}%`;
        }

        function actualizarBotones() {
            const btnAnterior = document.getElementById('btnAnterior');
            const btnSiguiente = document.getElementById('btnSiguiente');
            
            // Botón anterior
            btnAnterior.disabled = currentStep === 1;
            
            // Botón siguiente
            if (currentStep === totalSteps) {
                btnSiguiente.innerHTML = '<i class="mdi mdi-content-save me-1"></i>Guardar Espectacular';
            } else {
                btnSiguiente.innerHTML = 'Siguiente<i class="mdi mdi-arrow-right ms-1"></i>';
            }
        }

        // Validación de pasos
        function validarPaso(paso) {
            switch (paso) {
                case 1:
                    return document.getElementById('nombreEspectacular').value.trim() !== '' &&
                           document.getElementById('ubicacionEspectacular').value.trim() !== '' &&
                           document.getElementById('carreteraEspectacular').value.trim() !== '' &&
                           document.getElementById('coordenadasEspectacular').value.trim() !== '';
                case 2:
                    return true; // Paso 2 no tiene campos obligatorios
                case 3:
                    return true; // Paso 3 no tiene campos obligatorios
                default:
                    return true;
            }
        }

        // Gestión de caras
        function agregarCara() {
            caraCounter++;
            const container = document.getElementById('carasContainer');
            
            const caraHtml = `
                <div class="cara-item mb-3" data-cara="${caraCounter}">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-4">
                            <div class="form-floating form-floating-outline">
                                <input type="text" class="form-control" value="Cara Adicional" placeholder=" ">
                                <label>Tipo de Cara</label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <select class="form-select">
                                    <option value="Norte" selected>Norte</option>
                                    <option value="Sur">Sur</option>
                                    <option value="Este">Este</option>
                                    <option value="Oeste">Oeste</option>
                                    <option value="Noreste">Noreste</option>
                                    <option value="Noroeste">Noroeste</option>
                                    <option value="Sureste">Sureste</option>
                                    <option value="Suroeste">Suroeste</option>
                                </select>
                                <label>Vista / Orientación</label>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="form-floating form-floating-outline">
                                <select class="form-select">
                                    <option value="Disponible" selected>Disponible</option>
                                    <option value="Ocupado">Ocupado</option>
                                    <option value="En Mantenimiento">En Mantenimiento</option>
                                </select>
                                <label>Estado Inicial</label>
                            </div>
                        </div>
                        <div class="col-md-2">
                            <button type="button" class="btn btn-outline-danger btn-sm w-100" onclick="eliminarCara(${caraCounter})">
                                <i class="mdi mdi-delete"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            container.insertAdjacentHTML('beforeend', caraHtml);
            actualizarPreviewCaras();
        }

        function eliminarCara(caraId) {
            const carasExistentes = document.querySelectorAll('.cara-item').length;
            
            if (carasExistentes <= 1) {
                showToast('Debe mantener al menos una cara', 'warning');
                return;
            }
            
            const caraElement = document.querySelector(`[data-cara="${caraId}"]`);
            if (caraElement) {
                caraElement.remove();
                actualizarPreviewCaras();
                
                // Mostrar/ocultar botones de eliminar
                const remainingCaras = document.querySelectorAll('.cara-item');
                remainingCaras.forEach((cara, index) => {
                    const deleteBtn = cara.querySelector('.btn-outline-danger');
                    if (remainingCaras.length === 1) {
                        deleteBtn.style.display = 'none';
                    } else {
                        deleteBtn.style.display = 'block';
                    }
                });
            }
        }

        function actualizarPreviewCaras() {
            const carasElements = document.querySelectorAll('.cara-item');
            const previewContainer = document.getElementById('previewCaras');
            
            let carasHtml = '';
            carasElements.forEach(cara => {
                const tipo = cara.querySelector('input[type="text"]').value;
                const vista = cara.querySelector('select').value;
                const estado = cara.querySelectorAll('select')[1].value;
                
                const estadoClass = estado === 'Disponible' ? 'estado-disponible' : 
                                  estado === 'Ocupado' ? 'estado-ocupado' : 'estado-mantenimiento';
                
                carasHtml += `
                    <div class="d-flex align-items-center mb-1">
                        <span class="estado-dot ${estadoClass}"></span>
                        <small>${tipo} (${vista})</small>
                    </div>
                `;
            });
            
            previewContainer.innerHTML = carasHtml;
        }

        // Controles numéricos
        function cambiarAngulo(incremento) {
            const input = document.getElementById('anguloVisual');
            let valor = parseInt(input.value) + incremento;
            valor = Math.max(0, Math.min(360, valor)); // Limitar entre 0 y 360
            input.value = valor;
            formData.anguloVisual = valor;
        }

        function cambiarAltura(incremento) {
            const input = document.getElementById('alturaTotal');
            let valor = parseFloat(input.value) + incremento;
            valor = Math.max(1, Math.min(50, valor)); // Limitar entre 1 y 50
            input.value = valor;
            formData.alturaTotal = valor;
            document.getElementById('previewAltura').textContent = valor;
        }

        // Guardar espectacular
        function guardarEspectacular() {
            // Recopilar todos los datos del formulario
            recopilarDatos();
            
            // Simular guardado
            document.getElementById('modalFooter').style.display = 'none';
            document.querySelectorAll('.step-content').forEach(step => {
                step.style.display = 'none';
            });
            document.getElementById('stepSuccess').style.display = 'block';
            
            // Opcional: Aquí enviarías los datos al servidor
            console.log('Datos del espectacular:', formData);
        }

        function recopilarDatos() {
            // Recopilar datos básicos
            formData.nombre = document.getElementById('nombreEspectacular').value;
            formData.ubicacion = document.getElementById('ubicacionEspectacular').value;
            formData.coordenadas = document.getElementById('coordenadasEspectacular').value;
            formData.carretera = document.getElementById('carreteraEspectacular').value;
            
            // Recopilar características técnicas
            formData.tipoEstructura = document.getElementById('tipoEstructura').value;
            formData.anguloVisual = parseInt(document.getElementById('anguloVisual').value);
            formData.alturaTotal = parseFloat(document.getElementById('alturaTotal').value);
            formData.materialCaras = document.getElementById('materialCaras').value;
            formData.iluminacion = document.getElementById('iluminacion').value;
            formData.observaciones = document.getElementById('observaciones').value;
            
            // Recopilar caras
            formData.caras = [];
            document.querySelectorAll('.cara-item').forEach(cara => {
                const tipo = cara.querySelector('input[type="text"]').value;
                const vista = cara.querySelector('select').value;
                const estado = cara.querySelectorAll('select')[1].value;
                
                formData.caras.push({ tipo, vista, estado });
            });
        }

        // Crear otro espectacular
        function crearOtro() {
            // Resetear formulario
            resetearFormulario();
            
            // Volver al paso 1
            currentStep = 1;
            
            // Ocultar estado de éxito y mostrar paso 1
            document.getElementById('stepSuccess').style.display = 'none';
            mostrarPaso(1);
            actualizarProgreso();
            actualizarBotones();
            
            // Mostrar footer
            document.getElementById('modalFooter').style.display = 'flex';
        }

        function resetearFormulario() {
            // Limpiar campos básicos
            document.getElementById('nombreEspectacular').value = '';
            document.getElementById('ubicacionEspectacular').value = '';
            document.getElementById('coordenadasEspectacular').value = '';
            document.getElementById('carreteraEspectacular').value = '';
            
            // Resetear medidas
            document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('active'));
            document.querySelector('.size-option').classList.add('active');
            
            // Resetear características técnicas
            document.getElementById('tipoEstructura').value = 'Unipolar';
            document.getElementById('anguloVisual').value = 90;
            document.getElementById('alturaTotal').value = 15;
            document.getElementById('materialCaras').value = 'Lona impresa';
            document.getElementById('iluminacion').value = 'LED';
            document.getElementById('observaciones').value = '';
            
            // Resetear caras (mantener solo 2)
            const carasContainer = document.getElementById('carasContainer');
            const carasActuales = carasContainer.querySelectorAll('.cara-item');
            carasActuales.forEach((cara, index) => {
                if (index > 1) {
                    cara.remove();
                }
            });
            
            // Resetear valores de las primeras 2 caras
            const cara1 = carasContainer.querySelector('[data-cara="1"]');
            const cara2 = carasContainer.querySelector('[data-cara="2"]');
            
            if (cara1) {
                cara1.querySelector('input').value = 'Cara Natural';
                cara1.querySelector('select').value = 'Norte';
                cara1.querySelectorAll('select')[1].value = 'Disponible';
            }
            
            if (cara2) {
                cara2.querySelector('input').value = 'Contra Cara';
                cara2.querySelector('select').value = 'Sur';
                cara2.querySelectorAll('select')[1].value = 'Disponible';
            }
            
            // Resetear preview
            document.getElementById('previewNombre').textContent = 'Nombre del Espectacular';
            document.getElementById('previewUbicacion').textContent = 'Ubicación completa';
            document.getElementById('previewMedidas').textContent = '12 x 7.20 Mts';
            document.getElementById('previewEstructura').textContent = 'Unipolar';
            document.getElementById('previewIluminacion').textContent = 'LED';
            document.getElementById('previewAltura').textContent = '15';
            document.getElementById('coordenadasActuales').textContent = 'No definidas';
            
            actualizarPreviewCaras();
            
            caraCounter = 2;
            
            // Asegurar que todos los pasos estén ocultos menos el primero
            document.querySelectorAll('.step-content').forEach(step => {
                step.classList.remove('active');
                step.style.display = 'none';
            });
            
            // Mostrar solo el paso 1
            const step1 = document.getElementById('step1');
            step1.classList.add('active');
            step1.style.display = 'block';
        }

        // Reset al cerrar modal
        document.getElementById('crearEspectacularModal').addEventListener('hidden.bs.modal', function() {
            resetearFormulario();
            currentStep = 1;
            mostrarPaso(1);
            actualizarProgreso();
            actualizarBotones();
            document.getElementById('modalFooter').style.display = 'flex';
            document.getElementById('stepSuccess').style.display = 'none';
        });

        // Función para mostrar notificaciones
        function showToast(message, type = 'success') {
            const colors = {
                success: '#71dd37',
                error: '#ff3e1d',
                warning: '#ffab00',
                info: '#696cff'
            };

            // Crear toast dinámicamente
            const toast = document.createElement('div');
            toast.className = 'toast-container position-fixed top-0 end-0 p-3';
            toast.style.zIndex = '9999';
            toast.innerHTML = `
                <div class="toast show" role="alert" style="background-color: ${colors[type]}; color: white;">
                    <div class="toast-body d-flex align-items-center">
                        <i class="mdi mdi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'alert' : 'information'} me-2"></i>
                        ${message}
                    </div>
                </div>
            `;

            document.body.appendChild(toast);

            // Remover después de 3 segundos
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // File upload handling
        document.getElementById('fileInput').addEventListener('change', function(e) {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                showToast(`${files.length} archivo(s) seleccionado(s)`, 'success');
            }
        });

        // Drag and drop para imágenes
        const uploadZone = document.querySelector('.upload-zone');
        
        uploadZone.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = 'var(--bs-primary)';
            this.style.backgroundColor = 'rgba(105, 108, 255, 0.04)';
        });

        uploadZone.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(161, 172, 184, 0.3)';
            this.style.backgroundColor = 'transparent';
        });

        uploadZone.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = 'rgba(161, 172, 184, 0.3)';
            this.style.backgroundColor = 'transparent';
            
            const files = Array.from(e.dataTransfer.files);
            const imageFiles = files.filter(file => file.type.startsWith('image/'));
            
            if (imageFiles.length > 0) {
                showToast(`${imageFiles.length} imagen(es) cargada(s)`, 'success');
            }
        });
    </script>
@endsection