@extends('layouts.main')
@section('title','Detalle de Item')
@section('leve','Inventario')
@section('subleve','Disponibilidad')

@section('css')
<!-- Page CSS -->
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/cards-statistics.css') }}" />
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-detalle-item.css') }}" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
<!-- DataTables CSS -->
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}">
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}">
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}">
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

  <!-- Alerta de Mantenimiento Vencido -->
  @if($hasOverdueMaintenance)
  <div class="alert alert-danger alert-dismissible fade show" role="alert">
    <i class="mdi mdi-alert-circle me-2"></i>
    <strong>¡Mantenimiento Vencido!</strong> La inspección está atrasada por {{ $overdueDays }} {{ $overdueDays == 1 ? 'día' : 'días' }}.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  @endif

  <!-- Header del Item -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between">
        <div class="d-flex align-items-start">
          <button class="btn btn-icon btn-sm btn-outline-secondary me-3" onclick="window.history.back()">
            <i class="mdi mdi-arrow-left"></i>
          </button>
          <div>
            <h4 class="mb-1" id="itemName">{{ $inventoryItem->name  ?? $inventoryItem->public_name }}</h4>
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
                      <!--
                      <span id="itemWarranty">
                        {{ $currentItem->warranty_provider ?? 'N/A' }}
                        @if($currentItem->warranty_expiration)
                          ({{ $currentItem->warranty_expiration }})
                        @endif
                      </span>
                        -->
                      @if($currentItem->warranty_valid)
                        <span class="badge bg-label-success ms-2" id="warrantyStatus">Vigente</span>
                      @else
                        <span class="badge bg-label-danger ms-2" id="warrantyStatus">Sin garantía</span>
                      @endif
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
                      <h3 class="stat-value" id="totalEvents">{{ $totalEvents }}</h3>
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
                      <h3 class="stat-value" id="totalHours">{{ number_format($totalHours, 1) }} hrs</h3>
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
                      <h3 class="stat-value" id="totalMaintenances">{{ $totalMaintenances }}</h3>
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
                      @forelse($upcomingEvents as $upcoming)
                        <tr>
                          <td>{{ $upcoming->event->name ?? 'Sin nombre' }}</td>
                          <td>{{ $upcoming->event && $upcoming->event->start_date ? $upcoming->event->start_date->format('d/m/Y') : '-' }}</td>
                          <td>{{ $upcoming->event->venue_address ?? 'Sin ubicación' }}</td>
                          <td>
                            @php
                              $statusMap = [
                                'ASIGNADO' => ['text' => 'Asignado', 'class' => 'bg-info'],
                                'EN_USO' => ['text' => 'En Uso', 'class' => 'bg-warning'],
                                'CANCELADO' => ['text' => 'Cancelado', 'class' => 'bg-secondary']
                              ];
                              $status = $statusMap[$upcoming->assignment_status] ?? ['text' => $upcoming->assignment_status, 'class' => 'bg-secondary'];
                            @endphp
                            <span class="badge {{ $status['class'] }}">{{ $status['text'] }}</span>
                          </td>
                        </tr>
                      @empty
                        <tr>
                          <td colspan="4" class="text-center text-muted">No hay eventos próximos programados</td>
                        </tr>
                      @endforelse
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
                  <span id="lastInspection">{{ $lastInspectionDate }}</span>
                </div>
                <div class="d-flex justify-content-between mb-3">
                  <span class="text-muted">Próxima inspección:</span>
                  <span class="fw-medium {{ $nextInspectionOverdue ? 'text-danger' : 'text-primary' }}" id="nextInspection">{{ $nextInspectionDate }}</span>
                </div>

                <div class="mb-2">
                  @php
                    $condition = strtoupper($currentItem->condition ?? 'BUENO');
                    $badgeClass = 'bg-label-success';
                    $progressPercent = 75;
                    $progressClass = 'bg-success';

                    if (in_array($condition, ['REGULAR', 'MEDIO'])) {
                      $badgeClass = 'bg-label-warning';
                      $progressPercent = 50;
                      $progressClass = 'bg-warning';
                    } elseif (in_array($condition, ['MALO', 'DEFICIENTE', 'DAÑADO'])) {
                      $badgeClass = 'bg-label-danger';
                      $progressPercent = 25;
                      $progressClass = 'bg-danger';
                    }
                  @endphp
                  <span class="badge {{ $badgeClass }}">{{ ucfirst(strtolower($currentItem->condition ?? 'Bueno')) }}</span>
                </div>
                <div class="progress" style="height: 8px;">
                  <div class="progress-bar {{ $progressClass }}" role="progressbar" style="width: {{ $progressPercent }}%"></div>
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
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                <i class="mdi mdi-download me-1"></i>Exportar
              </button>
              <ul class="dropdown-menu" id="usageExportButtons">
                <li><a class="dropdown-item" href="#" data-export="excel"><i class="mdi mdi-file-excel-outline me-1"></i>Excel</a></li>
                <li><a class="dropdown-item" href="#" data-export="pdf"><i class="mdi mdi-file-pdf-box me-1"></i>PDF</a></li>
                <li><a class="dropdown-item" href="#" data-export="print"><i class="mdi mdi-printer-outline me-1"></i>Imprimir</a></li>
              </ul>
            </div>
            <button class="btn btn-sm btn-primary" id="registerUsageBtn">
              <i class="mdi mdi-calendar-plus me-1"></i>Registrar Uso del Equipo
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
                @foreach($usageRecords as $record)
                  <tr data-usage-id="{{ $record->id }}" class="usage-record-row">
                    <td>{{ $record->event->name ?? 'Sin evento' }}</td>
                    <td>{{ $record->event && $record->event->start_date ? $record->event->start_date->format('d/m/Y') : '-' }}</td>
                    <td>{{ $record->event->venue_address ?? 'Sin ubicación' }}</td>
                    <td>{{ $record->hours_used ? number_format($record->hours_used, 1) . ' hrs' : '-' }}</td>
                    <td>
                      @php
                        $statusMap = [
                          'ASIGNADO' => ['text' => 'Asignado', 'class' => 'bg-info'],
                          'EN_USO' => ['text' => 'En Uso', 'class' => 'bg-warning'],
                          'DEVUELTO' => ['text' => 'Devuelto', 'class' => 'bg-success'],
                          'CANCELADO' => ['text' => 'Cancelado', 'class' => 'bg-secondary']
                        ];
                        $status = $statusMap[$record->assignment_status] ?? ['text' => $record->assignment_status, 'class' => 'bg-secondary'];
                      @endphp
                      <span class="badge {{ $status['class'] }}">{{ $status['text'] }}</span>
                    </td>
                    <td>{{ $record->notes ?? 'Sin notas' }}</td>
                  </tr>
                @endforeach
              </tbody>
            </table>
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
            <div class="btn-group">
              <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="mdi mdi-download me-1"></i>Exportar
              </button>
              <ul class="dropdown-menu" id="maintenanceExportButtons">
                <li><a class="dropdown-item" href="#" data-export="excel"><i class="mdi mdi-file-excel-outline me-1"></i>Excel</a></li>
                <li><a class="dropdown-item" href="#" data-export="pdf"><i class="mdi mdi-file-pdf-box me-1"></i>PDF</a></li>
                <li><a class="dropdown-item" href="#" data-export="print"><i class="mdi mdi-printer-outline me-1"></i>Imprimir</a></li>
              </ul>
            </div>
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
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                @foreach($maintenanceRecords as $record)
                  <tr data-maintenance-id="{{ $record->id }}">
                    <td>{{ $record->maintenance_type }}</td>
                    <td>{{ $record->scheduled_date->format('d/m/Y') }}</td>
                    <td>{{ $record->technician_name }}</td>
                    <td>${{ number_format($record->total_cost, 2) }}</td>
                    <td>
                      @php
                        $badgeClass = 'bg-label-secondary';
                        if ($record->maintenance_status === 'COMPLETADO') {
                          $badgeClass = 'bg-label-success';
                        } elseif ($record->maintenance_status === 'PROGRAMADO') {
                          $badgeClass = 'bg-label-primary';
                        } elseif ($record->maintenance_status === 'VENCIDO') {
                          $badgeClass = 'bg-label-danger';
                        }
                      @endphp
                      <span class="badge {{ $badgeClass }}" data-status="{{ $record->maintenance_status }}">
                        {{ ucfirst(strtolower($record->maintenance_status)) }}
                      </span>
                    </td>
                    <td>{{ $record->work_description ?? 'Sin notas' }}</td>
                    <td>
                      @if($record->maintenance_status !== 'COMPLETADO')
                        <div class="dropdown">
                          <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="mdi mdi-dots-vertical"></i>
                          </button>
                          <ul class="dropdown-menu">
                            <li>
                              <a class="dropdown-item complete-maintenance-btn" href="#" data-maintenance-id="{{ $record->id }}">
                                <i class="mdi mdi-check me-2"></i>Completar
                              </a>
                            </li>
                          </ul>
                        </div>
                      @else
                        <span class="text-muted">-</span>
                      @endif
                    </td>
                  </tr>
                @endforeach
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

<!-- Modal Completar Mantenimiento -->
<div class="modal fade" id="completeMaintenanceModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Completar Mantenimiento</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="text-center py-3">
          <i class="mdi mdi-check-circle-outline mdi-48px text-success mb-3"></i>
          <h5 class="mb-2">¿Completar este mantenimiento?</h5>
          <p class="text-muted mb-0">Esta acción marcará el mantenimiento como completado y registrará la fecha de finalización.</p>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-success" id="confirmCompleteMaintenanceBtn">Completar</button>
      </div>
    </div>
  </div>
</div>

<!-- Modal Registrar Uso del Equipo -->
<div class="modal fade" id="registerUsageModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Registrar Uso del Equipo</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="usageForm">
          <h6 class="mb-3 text-muted">Información del Evento</h6>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="eventName">Nombre del Evento</label>
              <input type="text" class="form-control" id="eventName" required>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="eventDate">Fecha del Evento</label>
              <input type="date" class="form-control" id="eventDate" required>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label" for="eventVenue">Ubicación <span class="text-muted">(Opcional)</span></label>
            <input type="text" class="form-control" id="eventVenue" placeholder="Ej: Arena Ciudad, Hotel Palace">
          </div>

          <hr class="my-4">
          <h6 class="mb-3 text-muted">Información de Asignación</h6>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label" for="usageHours">Horas de Uso</label>
              <div class="input-group">
                <input type="number" class="form-control" id="usageHours" step="0.5" min="0" placeholder="0.0">
                <span class="input-group-text">hrs</span>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label" for="assignmentStatus">Estado <span class="text-muted">(Opcional)</span></label>
              <select class="form-select" id="assignmentStatus">
                <option value="">Por defecto: Devuelto (Finalizado)</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="EN_USO">En Uso</option>
                <option value="DEVUELTO">Devuelto</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label" for="usageNotes">Notas</label>
            <textarea class="form-control" id="usageNotes" rows="3" placeholder="Observaciones, incidencias, etc."></textarea>
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
@endsection

@section('script')
<script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
<script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>

<!-- DataTables JS -->
<script src="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
<!-- JSZip for Excel export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
<!-- pdfMake for PDF export -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
<!-- DataTables Buttons -->
<script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.bootstrap5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
<script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>

<!-- Pasar datos de Blade a JavaScript -->
<script>
window.bladeItemData = {
    itemParent: @json($itemParent),
    availability: @json($availability),
    @if(isset($inventoryItem))
    inventoryItem: @json($inventoryItem),
    @else
    inventoryItem: null,
    @endif
    maintenanceRecords: @json($maintenanceRecords ?? [])
};
</script>

<!-- Page JS -->
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/vista-detalle-item.js') }}?v={{ time() }}"></script>
@endsection
