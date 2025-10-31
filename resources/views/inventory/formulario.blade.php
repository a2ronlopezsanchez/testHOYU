@extends('layouts.main')
@section('title','Formulario de Item')
@section('leve','Inventario')
@section('subleve','Disponibilidad')

@section('css')
<!-- Page CSS -->
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/formulario-item-completo.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/dropzone/dropzone.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

  <!-- Header Principal -->
  <div class="row mb-4">
    <div class="col-12">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h4 class="fw-bold mb-1">
                <span class="text-muted fw-light">Inventario /</span>
                <span id="formTitle">
                  @if($mode === 'edit')
                    Editar Item
                  @else
                    Registrar Nuevo Item
                  @endif
                </span>
              </h4>
              <p class="mb-0 text-muted">
                @if($mode === 'edit')
                  Modifique los campos necesarios y guarde los cambios
                @else
                  Complete todos los campos requeridos para registrar el item en el sistema
                @endif
              </p>
            </div>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-secondary" onclick="window.history.back()">
                <i class="mdi mdi-arrow-left me-1"></i>
                Volver al Catálogo
              </button>
              <button type="button" class="btn btn-primary" id="saveFormBtn">
                <i class="mdi mdi-content-save me-1"></i>
                <span id="saveButtonText">
                  @if($mode === 'edit')
                    Actualizar Item
                  @else
                    Guardar Item
                  @endif
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Indicador de progreso -->
  <div class="row mb-4">
    <div class="col-12">
      <div class="card">
        <div class="card-body py-2">
          <div class="progress-wrapper">
            <div class="progress" style="height: 6px;">
              <div class="progress-bar bg-primary" role="progressbar" style="width: 0%" id="formProgress"></div>
            </div>
            <small class="text-muted mt-1 d-block">
              <span id="progressText">0% completado</span> -
              <span id="fieldsCompleted">0</span> de <span id="totalFields">0</span> campos completados
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Formulario principal -->
  <form id="itemCompleteForm">
    <div class="row">
      <!-- Navegación por tabs -->
      <div class="col-12 mb-2">
        <ul class="nav nav-pills flex-column flex-sm-row" id="formTabs" role="tablist">
          <li class="nav-item flex-fill">
            <a class="nav-link active" id="basic-tab" data-bs-toggle="tab" href="#basic" role="tab">
              <i class="mdi mdi-information me-1"></i>
              <span class="d-none d-sm-inline">Información Básica</span>
              <span class="d-sm-none">Básica</span>
            </a>
          </li>
          <li class="nav-item flex-fill">
            <a class="nav-link" id="technical-tab" data-bs-toggle="tab" href="#technical" role="tab">
              <i class="mdi mdi-cog me-1"></i>
              <span class="d-none d-sm-inline">Especificaciones</span>
              <span class="d-sm-none">Técnica</span>
            </a>
          </li>
          <li class="nav-item flex-fill">
            <a class="nav-link" id="financial-tab" data-bs-toggle="tab" href="#financial" role="tab">
              <i class="mdi mdi-currency-usd me-1"></i>
              <span class="d-none d-sm-inline">Precios y Valores</span>
              <span class="d-sm-none">Precios</span>
            </a>
          </li>
          <li class="nav-item flex-fill">
            <a class="nav-link" id="location-tab" data-bs-toggle="tab" href="#location" role="tab">
              <i class="mdi mdi-map-marker me-1"></i>
              <span class="d-none d-sm-inline">Ubicación y Estado</span>
              <span class="d-sm-none">Ubicación</span>
            </a>
          </li>
          <li class="nav-item flex-fill">
            <a class="nav-link" id="multimedia-tab" data-bs-toggle="tab" href="#multimedia" role="tab">
              <i class="mdi mdi-image me-1"></i>
              <span class="d-none d-sm-inline">Multimedia</span>
              <span class="d-sm-none">Fotos</span>
            </a>
          </li>
          <li class="nav-item flex-fill">
            <a class="nav-link" id="rfid-tab" data-bs-toggle="tab" href="#rfid" role="tab">
              <i class="mdi mdi-tag-rfid me-1"></i>
              <span class="d-none d-sm-inline">RFID</span>
            </a>
          </li>
        </ul>
      </div>

      <!-- Contenido de tabs -->
      <div class="col-12">
        <div class="tab-content">
          <!-- Tab 1: Información Básica -->
          <div class="tab-pane fade show active" id="basic" role="tabpanel">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Datos Principales del Item</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemSku" placeholder="BP000000" readonly>
                          <label for="itemSku">SKU *</label>
                          <div class="form-text">Generado automáticamente por el sistema</div>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemId" placeholder="XX00" readonly>
                          <label for="itemId">ID del Item *</label>
                          <div class="form-text">Generado según categoría y marca</div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemName" placeholder="Ingrese el nombre completo"
                                 value="{{ old('itemName', $itemParent->name ?? '') }}" required>
                          <label for="itemName">Nombre del Producto *</label>
                          <div class="form-text">Formato: TIPO | MARCA | MODELO | CARACTERÍSTICAS</div>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemPublicName" placeholder="Nombre para mostrar al cliente"
                                 value="{{ old('itemPublicName', $itemParent->public_name ?? '') }}">
                          <label for="itemPublicName">Nombre Público</label>
                          <div class="form-text">Cómo se mostrará en cotizaciones y documentos</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input id="itemCategory" name="itemCategory" class="form-control h-auto" placeholder="Seleccionar categoría">
                          <label for="itemCategory">Categoría *</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input id="itemFamily" name="itemFamily" class="form-control h-auto" placeholder="Familia del producto">
                          <label for="itemFamily">Familia</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input id="itemSubFamily" name="itemSubFamily" class="form-control h-auto" placeholder="Sub-familia">
                          <label for="itemSubFamily">Sub-Familia</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input id="itemBrand" name="itemBrand" class="form-control h-auto" placeholder="Marca del producto">
                          <label for="itemBrand">Marca *</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input id="itemModel" name="itemModel" class="form-control h-auto" placeholder="Modelo">
                          <label for="itemModel">Modelo *</label>
                        </div>
                      </div>
                      <div class="col-12">
                        <div class="form-floating form-floating-outline">
                          <textarea class="form-control h-px-100" id="itemDescription" placeholder="Descripción detallada"></textarea>
                          <label for="itemDescription">Descripción</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <!-- Vista previa -->
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Vista Previa</h5>
                  </div>
                  <div class="card-body">
                    <div class="item-preview">
                      <div class="preview-image mb-3">
                        <img src="{{ asset('/materialize/assets/img/products/card-weekly-sales-watch.png') }}"
                             alt="Preview"
                             class="img-fluid rounded"
                             id="previewMainImage">
                      </div>
                      <h6 id="previewName" class="mb-1">Nombre del Producto</h6>
                      <p class="text-muted small mb-2" id="previewPublicName">Nombre Público</p>
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-label-primary" id="previewCategory">Categoría</span>
                        <span class="fw-medium" id="previewBrand">Marca</span>
                      </div>
                      <hr>
                      <div class="row text-center">
                        <div class="col-4">
                          <div class="fw-medium" id="previewUnits">0</div>
                          <small class="text-muted">Unidades</small>
                        </div>
                        <div class="col-4">
                          <div class="fw-medium text-success" id="previewAvailable">0</div>
                          <small class="text-muted">Disponibles</small>
                        </div>
                        <div class="col-4">
                          <div class="fw-medium" id="previewPrice">$0</div>
                          <small class="text-muted">Renta</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Guardado automático -->
                <div class="card mt-3">
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <h6 class="mb-1">Guardado Automático</h6>
                        <small class="text-muted" id="autoSaveStatus">No guardado</small>
                      </div>
                      <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="autoSaveToggle" checked>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 2: Especificaciones Técnicas -->
          <div class="tab-pane fade" id="technical" role="tabpanel">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="card-title mb-0">Especificaciones Técnicas</h5>
                    <button type="button" class="btn btn-sm btn-primary" id="addSpecBtn">
                      <i class="mdi mdi-plus me-1"></i>Agregar Especificación
                    </button>
                  </div>
                  <div class="card-body">
                    <div id="specificationsContainer">
                      <!-- Se generarán dinámicamente -->
                      <div class="alert alert-info">
                        <i class="mdi mdi-information me-2"></i>
                        Agregue las especificaciones técnicas del producto. Por ejemplo: Potencia, Dimensiones, Peso, etc.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Identificadores -->
                <div class="card mt-4">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Identificadores y Códigos</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemSerialNumber" placeholder="Número de serie">
                          <label for="itemSerialNumber">Número de Serie</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <div class="input-group">
                            <input type="text" class="form-control" id="itemRfidTag" placeholder="Etiqueta RFID">
                            <button class="btn btn-outline-primary" type="button" id="scanRfidBtn">
                              <i class="mdi mdi-qrcode-scan"></i>
                            </button>
                          </div>
                          <label for="itemRfidTag">Etiqueta RFID</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input id="itemColor" name="itemColor" class="form-control h-auto" placeholder="Color del producto">
                          <label for="itemColor">Color</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <select class="form-select" id="itemUnitSet">
                            <option value="UNIT">Individual (UNIT)</option>
                            <option value="SET">Conjunto (SET)</option>
                          </select>
                          <label for="itemUnitSet">Tipo de Unidad</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input type="number" class="form-control" id="itemTotalUnits" min="1" value="1">
                          <label for="itemTotalUnits">Total de Unidades</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <!-- Plantillas de especificaciones -->
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Plantillas Rápidas</h5>
                  </div>
                  <div class="card-body">
                    <div class="d-grid gap-2" id="specTemplates">
                      <!-- Se generarán según la categoría seleccionada -->
                      <p class="text-muted mb-0">Seleccione una categoría para ver las plantillas disponibles</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 3: Precios y Valores -->
          <div class="tab-pane fade" id="financial" role="tabpanel">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Información Financiera</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="date" class="form-control" id="itemPurchaseDate">
                          <label for="itemPurchaseDate">Fecha de Compra</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <select class="form-select" id="itemWarranty">
                            <option value="SI">Sí</option>
                            <option value="NO" selected>No</option>
                          </select>
                          <label for="itemWarranty">Garantía Vigente</label>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input type="number" class="form-control" id="itemOriginalPrice" step="0.01" min="0">
                          <label for="itemOriginalPrice">Precio Original ($)</label>
                          <div class="form-text">Precio de compra del equipo</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input type="number" class="form-control" id="itemIdealRentPrice" step="0.01" min="0">
                          <label for="itemIdealRentPrice">Precio Renta Ideal ($)</label>
                          <div class="form-text">Precio objetivo de renta</div>
                        </div>
                      </div>
                      <div class="col-md-4">
                        <div class="form-floating form-floating-outline">
                          <input type="number" class="form-control" id="itemMinRentPrice" step="0.01" min="0">
                          <label for="itemMinRentPrice">Precio Renta Mínimo ($)</label>
                          <div class="form-text">Precio mínimo aceptable</div>
                        </div>
                      </div>
                    </div>

                    <!-- Calculadora de rentabilidad -->
                    <div class="mt-4 p-3 bg-light rounded">
                      <h6 class="mb-3">Análisis de Rentabilidad</h6>
                      <div class="row g-3">
                        <div class="col-md-4">
                          <small class="text-muted d-block">ROI Estimado</small>
                          <h5 class="mb-0" id="roiEstimate">0%</h5>
                        </div>
                        <div class="col-md-4">
                          <small class="text-muted d-block">Recuperación en</small>
                          <h5 class="mb-0" id="recoveryTime">0 rentas</h5>
                        </div>
                        <div class="col-md-4">
                          <small class="text-muted d-block">Margen de Ganancia</small>
                          <h5 class="mb-0" id="profitMargin">0%</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <!-- Historial de precios -->
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Historial de Precios</h5>
                  </div>
                  <div class="card-body">
                    <div class="timeline timeline-vertical">
                      <div class="timeline-item">
                        <span class="timeline-indicator timeline-indicator-primary">
                          <i class="mdi mdi-currency-usd"></i>
                        </span>
                        <div class="timeline-event">
                          <div class="timeline-header">
                            <small class="text-muted">Precio Actual</small>
                          </div>
                          <div class="timeline-body">
                            <p class="mb-0 fw-medium" id="currentPriceDisplay">$0.00</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 4: Ubicación y Estado -->
          <div class="tab-pane fade" id="location" role="tabpanel">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Ubicación Física</h5>
                  </div>
                  <div class="card-body">
                    <div class="row g-3">
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input id="itemLocation" name="itemLocation" class="form-control h-auto" placeholder="Ubicación principal">
                          <label for="itemLocation">Ubicación *</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input id="itemStatus" name="itemStatus" class="form-control h-auto" placeholder="Estado del item">
                          <label for="itemStatus">Estado *</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemRack" placeholder="Ej: A1-5">
                          <label for="itemRack">Posición en Rack</label>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="form-floating form-floating-outline">
                          <input type="text" class="form-control" id="itemPanel" placeholder="Ej: P1-3">
                          <label for="itemPanel">Panel</label>
                        </div>
                      </div>
                      <div class="col-12">
                        <label class="form-label">Mapa de Ubicación</label>
                        <div class="warehouse-map bg-light rounded p-3 text-center" style="min-height: 200px;">
                          <i class="mdi mdi-warehouse mdi-48px text-muted"></i>
                          <p class="text-muted mt-2">Vista del mapa del almacén</p>
                          <button type="button" class="btn btn-sm btn-primary">Seleccionar Ubicación</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <!-- Estado y condición -->
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Condición del Equipo</h5>
                  </div>
                  <div class="card-body">
                    <div class="mb-3">
                      <label class="form-label">Condición Física</label>
                      <div class="btn-group d-flex" role="group">
                        <input type="radio" class="btn-check" name="itemCondition" id="condExcelente" value="EXCELENTE">
                        <label class="btn btn-outline-success" for="condExcelente">Excelente</label>

                        <input type="radio" class="btn-check" name="itemCondition" id="condBueno" value="BUENO" checked>
                        <label class="btn btn-outline-primary" for="condBueno">Bueno</label>

                        <input type="radio" class="btn-check" name="itemCondition" id="condRegular" value="REGULAR">
                        <label class="btn btn-outline-warning" for="condRegular">Regular</label>

                        <input type="radio" class="btn-check" name="itemCondition" id="condMalo" value="MALO">
                        <label class="btn btn-outline-danger" for="condMalo">Malo</label>
                      </div>
                    </div>

                    <div>
                      <label class="form-label" for="itemNotes">Notas sobre el Estado</label>
                      <textarea class="form-control" id="itemNotes" rows="4" placeholder="Observaciones sobre el estado actual del equipo..."></textarea>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 5: Multimedia -->
          <div class="tab-pane fade" id="multimedia" role="tabpanel">
            <div class="card">
              <div class="card-header">
                <h5 class="card-title mb-0">Imágenes del Producto</h5>
              </div>
              <div class="card-body">
                <div class="dropzone needsclick" id="dropzone-multi">
                  <div class="dz-message needsclick">
                    <i class="mdi mdi-cloud-upload mdi-48px text-muted mb-2"></i>
                    <h5>Arrastra las imágenes aquí o haz clic para seleccionar</h5>
                    <p class="text-muted mb-0">Formatos permitidos: JPG, PNG, GIF (máx. 5MB por archivo)</p>
                  </div>
                </div>

                <div class="mt-3">
                  <label class="form-label">Galería de Imágenes</label>
                  <div class="row g-3" id="imageGallery">
                    <!-- Las imágenes se mostrarán aquí -->
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Tab 6: RFID -->
          <div class="tab-pane fade" id="rfid" role="tabpanel">
            <div class="row g-4">
              <div class="col-lg-8">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Configuración RFID</h5>
                  </div>
                  <div class="card-body">
                    <div class="alert alert-info d-flex align-items-center mb-4">
                      <i class="mdi mdi-information-outline me-2"></i>
                      <div>
                        <h6 class="alert-heading mb-1">Sistema RFID</h6>
                        <p class="mb-0">Configure los metadatos que se almacenarán en la etiqueta RFID del producto.</p>
                      </div>
                    </div>

                    <div class="mb-4">
                      <h6 class="mb-3">Datos a incluir en la etiqueta:</h6>
                      <div class="row g-3">
                        <div class="col-md-6">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidName" checked>
                            <label class="form-check-label" for="rfidName">
                              Nombre del ítem
                            </label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidCategory" checked>
                            <label class="form-check-label" for="rfidCategory">
                              Categoría
                            </label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidBrand" checked>
                            <label class="form-check-label" for="rfidBrand">
                              Marca y Modelo
                            </label>
                          </div>
                        </div>
                        <div class="col-md-6">
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidSerial">
                            <label class="form-check-label" for="rfidSerial">
                              Número de serie
                            </label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidPurchase">
                            <label class="form-check-label" for="rfidPurchase">
                              Fecha de compra
                            </label>
                          </div>
                          <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rfidCondition" checked>
                            <label class="form-check-label" for="rfidCondition">
                              Condición actual
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button type="button" class="btn btn-primary" id="programRfidBtn">
                      <i class="mdi mdi-tag-rfid me-2"></i>
                      Programar Etiqueta RFID
                    </button>
                  </div>
                </div>
              </div>

              <div class="col-lg-4">
                <div class="card">
                  <div class="card-header">
                    <h5 class="card-title mb-0">Estado RFID</h5>
                  </div>
                  <div class="card-body text-center">
                    <div class="mb-3">
                      <i class="mdi mdi-tag-rfid mdi-48px text-primary"></i>
                    </div>
                    <h6 id="rfidStatusText">Sin Etiqueta Asignada</h6>
                    <p class="text-muted small mb-3">Escanee o ingrese manualmente el código RFID</p>
                    <div class="d-grid gap-2">
                      <button type="button" class="btn btn-outline-primary" id="scanNewRfidBtn">
                        <i class="mdi mdi-qrcode-scan me-2"></i>
                        Escanear Nueva Etiqueta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </form>

</div>
@endsection

@section('script')
<!-- Vendors JS -->
<script src="{{ asset('/materialize/assets/vendor/libs/dropzone/dropzone.js') }}"></script>

<!-- Pasar datos de Blade a JavaScript -->
<script>
window.bladeFormData = {
    mode: '{{ $mode }}',
    itemParent: @json($itemParent),
    // Si es edición y hay items, tomar el primero como referencia
    inventoryItem: @json($itemParent && $itemParent->items->first() ? $itemParent->items->first() : null)
};
console.log('Blade Form Data:', window.bladeFormData);
</script>

<!-- Page JS -->
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/formulario-item-completo.js') }}?v={{ time() }}"></script>
@endsection
