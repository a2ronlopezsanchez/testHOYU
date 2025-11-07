@extends('layouts.main')
@section('title','Detalle de Item')
@section('leve','Inventario')
@section('subleve','Disponibilidad')

@section('css')
<!-- Page CSS -->
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-detalle-item.css') }}" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

  <!-- Header del Item -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between">
        <div class="d-flex align-items-start">
          <button class="btn btn-icon btn-sm btn-outline-secondary me-3" onclick="window.history.back()">
            <i class="mdi mdi-arrow-left"></i>
          </button>
          <div>
            <h4 class="mb-1" id="itemName">{{ $itemParent->name  ?? $itemParent->public_name }}</h4>
            <div class="d-flex align-items-center gap-3">
              <span class="text-muted">ID:
                <span id="itemId">
                  @if(isset($inventoryItem))
                    {{ $inventoryItem->item_id }}
                  @elseif($itemParent->items->first())
                    {{ $itemParent->items->first()->item_id }}
                  @else
                    N/A
                  @endif
                </span>
              </span>
              <span class="badge bg-label-success" id="itemStatusBadge">
                @if(isset($inventoryItem))
                  {{ $inventoryItem->status }}
                @elseif($itemParent->items->first())
                  {{ $itemParent->items->first()->status }}
                @else
                  N/A
                @endif
              </span>
              <span class="badge bg-label-primary" id="itemConditionBadge">
                @if(isset($inventoryItem))
                  {{ $inventoryItem->condition ?? 'Bueno' }}
                @elseif($itemParent->items->first())
                  {{ $itemParent->items->first()->condition ?? 'Bueno' }}
                @else
                  Bueno
                @endif
              </span>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
            <i class="mdi mdi-printer me-1"></i>
            <span class="d-none d-sm-inline">Imprimir</span>
          </button>
          <button class="btn btn-sm btn-outline-secondary" id="shareBtn">
            <i class="mdi mdi-share-variant me-1"></i>
            <span class="d-none d-sm-inline">Compartir</span>
          </button>
          <button class="btn btn-sm btn-primary" id="editBtn">
            <i class="mdi mdi-pencil me-1"></i>
            <span class="d-none d-sm-inline">Editar</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs de navegación -->
  <ul class="nav nav-pills mb-4" id="detailTabs" role="tablist">
    <li class="nav-item">
      <a class="nav-link active" id="overview-tab" data-bs-toggle="tab" href="#overview" role="tab">
        <i class="mdi mdi-view-dashboard me-1"></i>
        Resumen
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link" id="usage-tab" data-bs-toggle="tab" href="#usage" role="tab">
        <i class="mdi mdi-history me-1"></i>
        Historial de Uso
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link" id="maintenance-tab" data-bs-toggle="tab" href="#maintenance" role="tab">
        <i class="mdi mdi-wrench me-1"></i>
        Mantenimiento
      </a>
    </li>
    <li class="nav-item">
      <a class="nav-link" id="documents-tab" data-bs-toggle="tab" href="#documents" role="tab">
        <i class="mdi mdi-file-document me-1"></i>
        Documentos
      </a>
    </li>
  </ul>

  <!-- Contenido de las tabs -->
  <div class="tab-content">
    <!-- Tab Resumen -->
    <div class="tab-pane fade show active" id="overview" role="tabpanel">
      <div class="row">
        <!-- Columna principal -->
        <div class="col-lg-8">
          <!-- Información general -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Información General</h5>
            </div>
            <div class="card-body">
              @php
                $currentItem = $inventoryItem ?? $itemParent->items->first();
              @endphp
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Categoría</span>
                    <div class="info-value" id="itemCategory">
                      {{ $itemParent->category->name ?? 'Sin categoría' }}
                      @if($itemParent->sub_family)
                        / {{ $itemParent->sub_family }}
                      @elseif($itemParent->family)
                        / {{ $itemParent->family }}
                      @endif
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Marca / Modelo</span>
                    <div class="info-value" id="itemBrandModel">
                      {{ $itemParent->brand->name ?? 'Sin marca' }} / {{ $itemParent->model ?? 'Sin modelo' }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Fecha de Compra</span>
                    <div class="info-value" id="itemPurchaseDate">
                      {{ $currentItem->purchase_date ?? 'N/A' }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Precio de Compra</span>
                    <div class="info-value" id="itemPurchasePrice">
                      ${{ number_format($currentItem->original_price ?? 0, 2) }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Número de Serie</span>
                    <div class="info-value" id="itemSerialNumber">
                      {{ $currentItem->serial_number ?? 'N/A' }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Etiqueta RFID</span>
                    <div class="info-value" id="itemRfidTag">
                      {{ $currentItem->rfid_tag ?? 'N/A' }}
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Garantía</span>
                    <div class="info-value">
                      <span id="itemWarranty">
                        {{ $currentItem->warranty_provider ?? 'N/A' }}
                        @if($currentItem->warranty_expiration)
                          ({{ $currentItem->warranty_expiration }})
                        @endif
                      </span>
                      <span class="badge bg-label-danger ms-2" id="warrantyStatus">Expirada</span>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Condición Actual</span>
                    <div class="info-value" id="itemCondition">
                      {{ $currentItem->condition ?? 'Bueno' }}
                    </div>
                  </div>
                </div>
                @if($currentItem->color)
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Color</span>
                    <div class="info-value" id="itemColor">
                      {{ $currentItem->color }}
                    </div>
                  </div>
                </div>
                @endif
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Tipo de Unidad</span>
                    <div class="info-value" id="itemUnitSet">
                      {{ $currentItem->unit_set === 'SET' ? 'Conjunto' : 'Unidad Individual' }}
                      @if($currentItem->unit_set === 'SET' && $currentItem->total_units > 1)
                        <span class="badge bg-label-info ms-2">{{ $currentItem->total_units }} piezas</span>
                      @endif
                    </div>
                  </div>
                </div>
                @if($currentItem->rack_position)
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Posición en Rack</span>
                    <div class="info-value" id="itemRackPosition">
                      {{ $currentItem->rack_position }}
                    </div>
                  </div>
                </div>
                @endif
                @if($currentItem->panel_position)
                <div class="col-md-6">
                  <div class="info-item">
                    <span class="info-label">Posición en Panel</span>
                    <div class="info-value" id="itemPanelPosition">
                      {{ $currentItem->panel_position }}
                    </div>
                  </div>
                </div>
                @endif
              </div>

              <div class="mt-4">
                <h6 class="mb-2">Descripción</h6>
                <p class="text-muted" id="itemDescription">
                  {{ $itemParent->description ?? $currentItem->description ?? 'Sin descripción disponible' }}
                </p>
              </div>

              <div class="mt-4">
                <h6 class="mb-2">Especificaciones Técnicas</h6>
                <ul class="list-unstyled mb-0" id="itemSpecifications">
                  @if($currentItem->specifications && $currentItem->specifications->count() > 0)
                    @foreach($currentItem->specifications as $spec)
                      <li class="mb-1">
                        <i class="mdi mdi-check text-primary me-2"></i>
                        <strong>{{ $spec->name }}:</strong> {{ $spec->value }}
                      </li>
                    @endforeach
                  @elseif($itemParent->specifications)
                    @php
                      $specs = is_string($itemParent->specifications) ? json_decode($itemParent->specifications, true) : $itemParent->specifications;
                    @endphp
                    @if(is_array($specs) && count($specs) > 0)
                      @foreach($specs as $spec)
                        <li class="mb-1"><i class="mdi mdi-check text-primary me-2"></i>{{ $spec }}</li>
                      @endforeach
                    @else
                      <li class="mb-1 text-muted">Sin especificaciones disponibles</li>
                    @endif
                  @else
                    <li class="mb-1 text-muted">Sin especificaciones disponibles</li>
                  @endif
                </ul>
              </div>

              @if($currentItem && $currentItem->notes)
              <div class="alert alert-warning d-flex align-items-start mt-4" id="itemNotes">
                <i class="mdi mdi-alert me-2"></i>
                <div class="flex-grow-1">
                  <h6 class="alert-heading mb-1">Notas Importantes</h6>
                  <p class="mb-0" id="itemNotesText">{{ $currentItem->notes }}</p>
                </div>
                <button class="btn btn-sm btn-icon btn-warning ms-2" id="editNotesBtn" title="Editar notas">
                  <i class="mdi mdi-pencil"></i>
                </button>
              </div>
              @endif
            </div>
          </div>

          <!-- Estadísticas de uso -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Estadísticas de Uso</h5>
            </div>
            <div class="card-body">
              <div class="row g-3 mb-4">
                <div class="col-md-4">
                  <div class="stat-card">
                    <div class="stat-icon bg-primary bg-opacity-10 text-primary">
                      <i class="mdi mdi-calendar"></i>
                    </div>
                    <div class="stat-content">
                      <h3 class="stat-value" id="totalEvents">28</h3>
                      <p class="stat-label">Total de Eventos</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card">
                    <div class="stat-icon bg-success bg-opacity-10 text-success">
                      <i class="mdi mdi-clock-outline"></i>
                    </div>
                    <div class="stat-content">
                      <h3 class="stat-value" id="totalHours">187 hrs</h3>
                      <p class="stat-label">Horas de Uso</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="stat-card">
                    <div class="stat-icon bg-info bg-opacity-10 text-info">
                      <i class="mdi mdi-wrench"></i>
                    </div>
                    <div class="stat-content">
                      <h3 class="stat-value" id="totalMaintenances">3</h3>
                      <p class="stat-label">Mantenimientos</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h6 class="mb-3">Próximos Eventos Programados</h6>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Evento</th>
                        <th>Fecha</th>
                        <th>Ubicación</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody id="upcomingEventsTable">
                      <tr>
                        <td>Conferencia Empresarial</td>
                        <td>20/04/2025</td>
                        <td>Hotel Business</td>
                        <td><span class="badge bg-label-success">Confirmado</span></td>
                      </tr>
                      <tr>
                        <td>Boda Rodríguez-López</td>
                        <td>08/05/2025</td>
                        <td>Hacienda Vista Verde</td>
                        <td><span class="badge bg-label-success">Confirmado</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Columna lateral -->
        <div class="col-lg-4">
          <!-- Estado actual -->
          <div class="card mb-4">
            <div class="card-header">
              <h5 class="card-title mb-0">Estado Actual</h5>
            </div>
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="avatar avatar-md bg-primary bg-opacity-10 me-3">
                  <i class="mdi mdi-map-marker text-primary mdi-24px"></i>
                </div>
                <div>
                  <small class="text-muted d-block">Ubicación Actual</small>
                  <div class="fw-medium" id="currentLocation">
                    {{ $currentItem->location->name ?? 'Sin ubicación' }}
                  </div>
                </div>
              </div>

              <hr>

              <div class="mb-4">
                <h6 class="mb-3">Mantenimiento</h6>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Última inspección:</span>
                  <span id="lastInspection">05/03/2025</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Próxima inspección:</span>
                  <span class="fw-medium text-primary" id="nextInspection">05/06/2025</span>
                </div>

                <div class="mb-2">
                  <span class="badge bg-label-success">En buen estado</span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar bg-success" role="progressbar" style="width: 75%"></div>
                </div>
              </div>

              <hr>

              <div class="mb-4">
                <h6 class="mb-3">Precios y Valores</h6>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Precio de compra:</span>
                  <span id="originalValue" class="fw-medium">${{ number_format($currentItem->original_price ?? 0, 2) }}</span>
                </div>
                @if($currentItem->ideal_rental_price)
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Renta ideal:</span>
                  <span id="idealRentalPrice" class="fw-medium text-success">${{ number_format($currentItem->ideal_rental_price, 2) }}</span>
                </div>
                @endif
                @if($currentItem->minimum_rental_price)
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Renta mínima:</span>
                  <span id="minimumRentalPrice" class="fw-medium text-warning">${{ number_format($currentItem->minimum_rental_price, 2) }}</span>
                </div>
                @endif

                @if($currentItem->original_price && $currentItem->ideal_rental_price)
                @php
                  $depreciation = 40; // Valor de ejemplo, podrías calcularlo
                  $remainingLife = 100 - $depreciation;
                @endphp
                <div class="progress mb-1" style="height: 8px;">
                  <div class="progress-bar bg-success" role="progressbar" style="width: {{ $remainingLife }}%"></div>
                </div>
                <div class="d-flex justify-content-between text-muted small">
                  <span>Depreciación: {{ $depreciation }}%</span>
                  <span>Vida útil: {{ $remainingLife }}%</span>
                </div>
                @endif
              </div>

              <div class="d-grid gap-2">
                <button class="btn btn-primary" id="scheduleMaintenanceBtn">
                  <i class="mdi mdi-calendar me-2"></i>Programar Mantenimiento
                </button>
                <button class="btn btn-outline-danger" id="decommissionBtn">
                  <i class="mdi mdi-archive me-2"></i>Dar de Baja
                </button>
              </div>
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="card">
            <div class="card-header">
              <h5 class="card-title mb-0">Acciones Rápidas</h5>
            </div>
            <div class="card-body">
              <div class="d-grid gap-2">
                <button class="btn btn-sm btn-outline-primary">
                  <i class="mdi mdi-qrcode me-2"></i>Ver Código QR
                </button>
                <button class="btn btn-sm btn-outline-primary">
                  <i class="mdi mdi-file-pdf me-2"></i>Generar Ficha Técnica
                </button>
                <button class="btn btn-sm btn-outline-primary">
                  <i class="mdi mdi-history me-2"></i>Historial Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Historial de Uso -->
    <div class="tab-pane fade" id="usage" role="tabpanel">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Historial de Uso</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary">
              <i class="mdi mdi-download me-1"></i>Exportar
            </button>
            <button class="btn btn-sm btn-primary" id="registerUsageBtn">
              <i class="mdi mdi-calendar-plus me-1"></i>Registrar Uso
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover" id="usageHistoryTable">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Fecha</th>
                  <th>Ubicación</th>
                  <th>Horas de Uso</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Concierto Rock City</td>
                  <td>10/03/2025</td>
                  <td>Arena Ciudad</td>
                  <td>8 hrs</td>
                  <td><span class="badge bg-label-success">Finalizado</span></td>
                  <td>Funcionamiento correcto</td>
                </tr>
                <tr>
                  <td>Boda García-Mendez</td>
                  <td>28/02/2025</td>
                  <td>Hotel Palace</td>
                  <td>6 hrs</td>
                  <td><span class="badge bg-label-success">Finalizado</span></td>
                  <td>Se detectó zumbido a volumen alto</td>
                </tr>
                <tr>
                  <td>Conferencia Anual Tecnología</td>
                  <td>15/02/2025</td>
                  <td>Centro Convenciones</td>
                  <td>4 hrs</td>
                  <td><span class="badge bg-label-success">Finalizado</span></td>
                  <td>Sin incidencias</td>
                </tr>
                <tr>
                  <td>Festival de Verano</td>
                  <td>22/01/2025</td>
                  <td>Parque Central</td>
                  <td>10 hrs</td>
                  <td><span class="badge bg-label-success">Finalizado</span></td>
                  <td>Funcionamiento normal</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginación -->
          <div class="d-flex justify-content-between align-items-center mt-4">
            <div class="text-muted">Mostrando 4 de 28 registros</div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item"><a class="page-link" href="#">Anterior</a></li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">Siguiente</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Mantenimiento -->
    <div class="tab-pane fade" id="maintenance" role="tabpanel">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Historial de Mantenimiento</h5>
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-outline-secondary">
              <i class="mdi mdi-download me-1"></i>Exportar
            </button>
            <button class="btn btn-sm btn-primary" id="registerMaintenanceBtn">
              <i class="mdi mdi-wrench me-1"></i>Registrar Mantenimiento
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover" id="maintenanceHistoryTable">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Técnico</th>
                  <th>Costo</th>
                  <th>Estado</th>
                  <th>Notas</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Revisión</td>
                  <td>05/03/2025</td>
                  <td>Miguel Ángel</td>
                  <td>$0</td>
                  <td><span class="badge bg-label-success">Completado</span></td>
                  <td>Se verificó el zumbido reportado. Se recomienda revisar los circuitos internos en la próxima revisión.</td>
                </tr>
                <tr>
                  <td>Limpieza</td>
                  <td>10/01/2025</td>
                  <td>Carlos Mendoza</td>
                  <td>$25</td>
                  <td><span class="badge bg-label-success">Completado</span></td>
                  <td>Limpieza de componentes y carcasa.</td>
                </tr>
                <tr>
                  <td>Reparación</td>
                  <td>15/11/2024</td>
                  <td>Roberto Sánchez</td>
                  <td>$75</td>
                  <td><span class="badge bg-label-success">Completado</span></td>
                  <td>Sustitución de fusible y revisión de conexiones internas.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab Documentos -->
    <div class="tab-pane fade" id="documents" role="tabpanel">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Documentos</h5>
          <button class="btn btn-sm btn-primary" id="uploadDocumentBtn">
            <i class="mdi mdi-upload me-1"></i>Subir Documento
          </button>
        </div>
        <div class="card-body">
          <div class="document-placeholder text-center py-5">
            <i class="mdi mdi-file-document-outline mdi-48px text-muted mb-3"></i>
            <p class="text-muted mb-3">No hay documentos adjuntos a este ítem.<br>
            Puedes subir manuales, facturas, garantías u otra documentación relevante.</p>
            <button class="btn btn-outline-primary">
              <i class="mdi mdi-paperclip me-2"></i>Adjuntar Documento
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- Modal Registrar Uso -->
<div class="modal fade" id="registerUsageModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Registrar Uso del Equipo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="usageForm">
          <div class="mb-3">
            <label class="form-label" for="eventName">Nombre del Evento</label>
            <input type="text" class="form-control" id="eventName" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="eventDate">Fecha</label>
            <input type="date" class="form-control" id="eventDate" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="eventLocation">Ubicación</label>
            <input type="text" class="form-control" id="eventLocation" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="usageHours">Horas de Uso</label>
            <input type="number" class="form-control" id="usageHours" min="1" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="usageNotes">Notas</label>
            <textarea class="form-control" id="usageNotes" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="saveUsageBtn">Guardar</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal Registrar Mantenimiento -->
<div class="modal fade" id="registerMaintenanceModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Registrar Mantenimiento</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="maintenanceForm">
          <div class="mb-3">
            <label class="form-label" for="maintenanceType">Tipo de Mantenimiento</label>
            <select class="form-select" id="maintenanceType" required>
              <option value="">Seleccionar tipo</option>
              <option value="Revisión">Revisión</option>
              <option value="Limpieza">Limpieza</option>
              <option value="Reparación">Reparación</option>
              <option value="Preventivo">Preventivo</option>
              <option value="Correctivo">Correctivo</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label" for="maintenanceDate">Fecha</label>
            <input type="date" class="form-control" id="maintenanceDate" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="technician">Técnico</label>
            <input type="text" class="form-control" id="technician" required>
          </div>
          <div class="mb-3">
            <label class="form-label" for="maintenanceCost">Costo</label>
            <div class="input-group">
              <span class="input-group-text">$</span>
              <input type="number" class="form-control" id="maintenanceCost" step="0.01" min="0">
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="maintenanceNotes">Notas</label>
            <textarea class="form-control" id="maintenanceNotes" rows="3"></textarea>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="saveMaintenanceBtn">Guardar</button>
      </div>
    </div>
  </div>
</div>
@endsection

@section('script')
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>

<!-- Pasar datos de Blade a JavaScript -->
<script>
window.bladeItemData = {
    itemParent: @json($itemParent),
    availability: @json($availability),
    @if(isset($inventoryItem))
    inventoryItem: @json($inventoryItem)
    @else
    inventoryItem: null
    @endif
};
</script>

<!-- Page JS -->
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/vista-detalle-item.js') }}?v={{ time() }}"></script>
@endsection
