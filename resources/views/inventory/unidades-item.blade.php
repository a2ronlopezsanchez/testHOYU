@extends('layouts.main')
@section('title','Detalle de Unidades')
@section('leve','Inventario')
@section('subleve','Asignar a Eventos')

@php
  $itemName = $itemParent->public_name ?: $itemParent->name;
  $totalUnits = $inventoryItems->count();
  $availableUnits = $inventoryItems->where('status', 'ACTIVO')->count();
  $assignedUnits = $inventoryItems->filter(fn($u) => in_array($u->status, ['ASIGNADO', 'EN_USO']))->count();
  $maintenanceUnits = $inventoryItems->filter(fn($u) => in_array($u->status, ['EN_REPARACION', 'MANTENIMIENTO']))->count();

  $normalizeKey = function ($value) {
      return strtoupper(str_replace([' ', '-'], '_', trim((string) $value)));
  };

  $statusBadgeClass = function ($status) use ($normalizeKey) {
      $key = $normalizeKey($status);

      if (in_array($key, ['DISPONIBLE', 'ACTIVO'], true)) return 'bg-label-success';
      if (in_array($key, ['INACTIVO', 'DESCOMPUESTO', 'EXTRAVIADO', 'BAJA'], true)) return 'bg-label-danger';
      if (in_array($key, ['EN_EVENTO'], true)) return 'bg-label-primary';
      if (in_array($key, ['EN_REPARACION', 'MANTENIMIENTO'], true)) return 'bg-label-warning';

      return 'bg-label-secondary';
  };

  $conditionBadgeClass = function ($condition) use ($normalizeKey) {
      $key = $normalizeKey($condition);

      if ($key === 'EXCELENTE') return 'bg-label-success';
      if ($key === 'BUENO') return 'bg-label-primary';
      if ($key === 'REGULAR') return 'bg-label-warning';
      if ($key === 'MALO') return 'bg-label-danger';

      return 'bg-label-secondary';
  };

  $prettyLabel = function ($value) {
      return ucwords(strtolower(str_replace('_', ' ', trim((string) $value))));
  };

  $formatShortDate = function ($dateValue) {
      if (empty($dateValue)) return '';

      if ($dateValue instanceof \Carbon\CarbonInterface) {
          $date = $dateValue;
      } else {
          try {
              $date = \Carbon\Carbon::parse($dateValue);
          } catch (\Throwable $e) {
              return '';
          }
      }

      $months = [
          1 => 'ene', 2 => 'feb', 3 => 'mar', 4 => 'abr', 5 => 'may', 6 => 'jun',
          7 => 'jul', 8 => 'ago', 9 => 'sep', 10 => 'oct', 11 => 'nov', 12 => 'dic',
      ];

      return $date->day . ' ' . ($months[(int) $date->month] ?? '') . ' ' . $date->year;
  };
@endphp

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-unidades-item.css') }}" />
<style>
  .event-select-row { cursor: pointer; }
</style>
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

  <!-- ── HEADER DEL ÍTEM ── -->
  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div class="d-flex align-items-start gap-3">
          <a class="btn btn-icon btn-sm btn-outline-secondary flex-shrink-0" href="{{ route('inventory.disponibilidad') }}">
            <i class="mdi mdi-arrow-left"></i>
          </a>
          <div>
            <h4 class="mb-1" id="pageItemName">{{ $itemName ?: 'Falta' }}</h4>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <span class="text-muted small" id="pageItemBrand">{{ $itemParent->brand->name ?? 'Falta' }}</span>
              <span class="text-muted">•</span>
              <span class="badge bg-label-primary" id="pageItemCategory">{{ $itemParent->category->name ?? 'Falta' }}</span>
              <span class="text-muted">•</span>
              <small class="text-muted"><span id="pageItemTotal">{{ $totalUnits }}</span> unidades</small>
            </div>
          </div>
        </div>
        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
            <i class="mdi mdi-printer me-1"></i>
            <span class="d-none d-sm-inline">Imprimir</span>
          </button>
          <button class="btn btn-sm btn-outline-secondary" id="exportUnitsBtn">
            <i class="mdi mdi-download me-1"></i>
            <span class="d-none d-sm-inline">Exportar</span>
          </button>
          <a class="btn btn-sm btn-primary" id="editItemBtn" href="{{ route('inventory.formulario', ['id' => $itemParent->id]) }}">
            <i class="mdi mdi-pencil me-1"></i>
            <span class="d-none d-sm-inline">Editar Item</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <!-- ══════════════ COLUMNA PRINCIPAL ══════════════ -->
    <div class="col-lg-8 col-xl-9">

      <!-- Info general + specs -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-4">
            <div class="col-auto d-none d-md-block">
              <div class="units-item-image">
                <img src="{{ asset('/materialize/assets/img/products/card-weekly-sales-watch.png') }}"
                     alt="Item" id="itemMainImage"
                     class="rounded border" style="width:120px;height:90px;object-fit:cover;">
              </div>
            </div>
            <div class="col">
              <div class="row g-3">
                <div class="col-md-6">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-2">Información General</h6>
                  <ul class="list-unstyled mb-0 small">
                    <li class="mb-1"><span class="text-muted">Categoría:</span><span id="infoCategory" class="ms-1 fw-medium">{{ $itemParent->category->name ?? 'Falta' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Marca:</span><span id="infoBrand" class="ms-1 fw-medium">{{ $itemParent->brand->name ?? 'Falta' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Modelo:</span><span id="infoModel" class="ms-1 fw-medium">{{ $itemParent->model ?: 'Falta' }}</span></li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-2">Especificaciones</h6>
                  <ul class="list-unstyled mb-0 small" id="infoSpecs">
                    <li><span class="text-muted">Familia:</span> <span class="ms-1 fw-medium">{{ $itemParent->family ?: 'Falta' }}</span></li>
                    <li><span class="text-muted">Sub familia:</span> <span class="ms-1 fw-medium">{{ $itemParent->sub_family ?: 'Falta' }}</span></li>
                    <li><span class="text-muted">Color:</span> <span class="ms-1 fw-medium">{{ $itemParent->color ?? '' }}</span></li>
                    <li><span class="text-muted">Tags:</span> <span class="ms-1 fw-medium">{{ is_array($itemParent->tags) ? implode(', ', array_filter($itemParent->tags)) : ($itemParent->tags ?? '') }}</span></li>
                  </ul>
                </div>
                <div class="col-12">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-1">Descripción</h6>
                  <p class="small text-muted mb-0" id="infoDescription">{{ $itemParent->description ?? '' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats rápidas -->
        <div class="card-footer bg-light">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3">
              <div class="units-stat-box">
                <div class="fw-bold fs-4 mb-0" id="statTotal">{{ $totalUnits }}</div>
                <small class="text-muted">Total</small>
                <div class="units-stat-bar bg-secondary mt-1"></div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="units-stat-box">
                <div class="fw-bold fs-4 mb-0 text-success" id="statAvailable">{{ $availableUnits }}</div>
                <small class="text-muted">Disponibles</small>
                <div class="units-stat-bar bg-success mt-1"></div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="units-stat-box">
                <div class="fw-bold fs-4 mb-0 text-primary" id="statAssigned">{{ $assignedUnits }}</div>
                <small class="text-muted">Asignadas</small>
                <div class="units-stat-bar bg-primary mt-1"></div>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="units-stat-box">
                <div class="fw-bold fs-4 mb-0 text-warning" id="statMaintenance">{{ $maintenanceUnits }}</div>
                <small class="text-muted">Mantenimiento</small>
                <div class="units-stat-bar bg-warning mt-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                <input type="text" class="form-control" placeholder="Buscar por ID, Serial, RFID o ubicación..." id="unitsSearchInput">
                <button class="btn btn-outline-secondary d-none" type="button" id="clearUnitsSearch">
                  <i class="mdi mdi-close"></i>
                </button>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                <select class="form-select w-auto" id="statusFilterSelect">
                  <option value="all">Todos los estados</option>
                  <option value="Disponible">Disponibles</option>
                  <option value="Asignado">Asignados</option>
                  <option value="En Mantenimiento">En Mantenimiento</option>
                </select>
                <select class="form-select w-auto" id="conditionFilterSelect">
                  <option value="all">Todas las condiciones</option>
                  <option value="Excelente">Excelente</option>
                  <option value="Bueno">Bueno</option>
                  <option value="Regular">Regular</option>
                  <option value="En Reparación">En Reparación</option>
                </select>
                <button class="btn btn-outline-secondary" id="clearAllUnitsFilters" title="Limpiar filtros">
                  <i class="mdi mdi-refresh"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabla de unidades -->
      <div class="card">
        <div class="card-header d-flex align-items-center justify-content-between">
          <div>
            <h5 class="card-title mb-0">Unidades Individuales</h5>
            <small class="text-muted" id="unitsCountLabel">{{ $totalUnits }} registradas</small>
          </div>
          <a class="btn btn-primary btn-sm" id="addUnitBtn" href="{{ route('inventory.formulario', ['id' => $itemParent->id, 'mode' => 'new-from-parent']) }}" data-default-href="{{ route('inventory.formulario', ['id' => $itemParent->id, 'mode' => 'new-from-parent']) }}">
            @if(($isUnassignedItem ?? false))<i class="mdi mdi-link-variant-plus me-1"></i>Seleccionar Ítem @else <i class="mdi mdi-plus me-1"></i>Agregar Unidad @endif
          </a>
        </div>

        <div class="table-responsive">
          <table class="table table-hover mb-0" id="unitsTable">
            <thead class="table-light">
              <tr>
                <th width="60px">#</th>
                <th width="140px">Serial / RFID</th>
                <th width="110px">Estado</th>
                <th width="110px">Condición</th>
                <th>Ubicación</th>
                <th width="110px">Último Uso</th>
                <th width="120px">Próx. Evento</th>
                <th width="90px" class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody id="unitsTableBody">
              @forelse($inventoryItems as $index => $unit)
                @php
                  $assignments = $unit->assignments ?? collect();

                  $lastReturned = $assignments
                    ->where('assignment_status', 'DEVUELTO')
                    ->sortByDesc(fn($a) => $a->returned_at ?? $a->assigned_until ?? $a->assigned_from)
                    ->first();

                  $lastUseDate = $formatShortDate(optional($lastReturned)->returned_at ?? optional($lastReturned)->assigned_until ?? optional($lastReturned)->assigned_from);

                  $nextAssigned = $assignments
                    ->filter(function ($a) {
                      return strtoupper((string) $a->assignment_status) === 'ASIGNADO'
                        && optional($a->assigned_from)->toDateString() >= now()->toDateString();
                    })
                    ->sortBy(fn($a) => $a->assigned_from)
                    ->first();

                  $nextEventName = optional(optional($nextAssigned)->event)->name ?? 'No asignado';
                  $nextEventDate = $formatShortDate(optional(optional($nextAssigned)->event)->start_date ?? optional($nextAssigned)->assigned_from);
                  $statusLabel = $prettyLabel($unit->status);
                  $conditionLabel = $prettyLabel($unit->condition);
                  $searchBlob = strtolower(trim(implode(' ', [
                    (string) ($unit->item_id ?? ''),
                    (string) ($unit->serial_number ?? ''),
                    (string) ($unit->rfid_tag ?? ''),
                    (string) ($unit->location->name ?? ''),
                    (string) $statusLabel,
                    (string) $conditionLabel,
                    (string) $nextEventName,
                  ])));
                @endphp
                <tr
                  data-unit-id="{{ $unit->id }}"
                  data-status="{{ $statusLabel }}"
                  data-condition="{{ $conditionLabel }}"
                  data-search="{{ $searchBlob }}"
                  data-item-id="{{ $unit->item_id ?? '' }}"
                  data-serial="{{ $unit->serial_number ?? '' }}"
                  data-rfid="{{ $unit->rfid_tag ?? '' }}"
                  data-location="{{ $unit->location->name ?? '' }}"
                  data-last-use="{{ $lastUseDate }}">

                  <td>{{ $index + 1 }}</td>
                  <td>
                    <div class="fw-medium">{{ $unit->item_id ?? '' }}</div>
                    <small class="text-muted d-block">{{ $unit->serial_number ?? '' }}</small>
                    <small class="text-muted d-block">{{ $unit->rfid_tag ?? '' }}</small>
                  </td>
                  <td>
                    <span class="badge {{ $statusBadgeClass($unit->status) }}">{{ $statusLabel }}</span>
                  </td>
                  <td>
                    <span class="badge {{ $conditionBadgeClass($unit->condition) }}">{{ $conditionLabel }}</span>
                  </td>
                  <td>{{ $unit->location->name ?? 'Falta' }}</td>
                  <td>{{ $lastUseDate }}</td>
                  <td>
                    <div>{{ $nextEventName }}</div>
                    <small class="text-muted d-block">{{ $nextEventDate }}</small>
                  </td>
                  <td class="text-center">
                    <div class="d-flex gap-1 justify-content-center">
                      <a class="btn btn-icon btn-sm btn-outline-primary" title="Ver" href="{{ route('inventory.detalle.unidad', ['id' => $unit->id]) }}">
                        <i class="mdi mdi-eye"></i>
                      </a>
                      <a class="btn btn-icon btn-sm btn-outline-secondary" title="Ver historial" href="{{ route('inventory.detalle.unidad', ['id' => $unit->id]) }}#uso">
                        <i class="mdi mdi-history"></i>
                      </a>
                      <form method="POST" action="{{ route('inventory.unidad.dar-de-baja', ['id' => $unit->id]) }}" onsubmit="return confirm('¿Dar de baja esta unidad?');">
                        @csrf
                        <button type="submit" class="btn btn-icon btn-sm btn-outline-danger" title="Eliminar unidad">
                          <i class="mdi mdi-trash-can-outline"></i>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="8" class="text-center py-4 text-muted">Falta: no hay unidades registradas.</td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <!-- Paginación -->
        <div class="card-footer">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small class="text-muted">
              Mostrando <span id="showingFrom">{{ $totalUnits ? 1 : 0 }}</span>–<span id="showingTo">{{ $totalUnits }}</span>
              de <span id="totalUnits">{{ $totalUnits }}</span> unidades
            </small>
            <nav>
              <ul class="pagination pagination-sm mb-0" id="unitsPagination">
                <li class="page-item disabled" id="prevUnitPage"><a class="page-link" href="javascript:void(0);"><i class="mdi mdi-chevron-left"></i></a></li>
                <li class="page-item active"><a class="page-link" href="javascript:void(0);">1</a></li>
                <li class="page-item disabled" id="nextUnitPage"><a class="page-link" href="javascript:void(0);"><i class="mdi mdi-chevron-right"></i></a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

    </div>
    <!-- ══════════════ / COLUMNA PRINCIPAL ══════════════ -->

    <!-- ══════════════ PANEL LATERAL ══════════════ -->
    <div class="col-lg-4 col-xl-3">

      <div class="card mb-4">
        <div class="card-header"><h5 class="card-title mb-0">Acciones Rápidas</h5></div>
        <div class="card-body d-grid gap-2">
          <a class="btn btn-primary" id="sideAddUnitBtn" href="{{ route('inventory.formulario', ['id' => $itemParent->id, 'mode' => 'new-from-parent']) }}">
            <i class="mdi mdi-plus me-2"></i>Agregar Unidad
          </a>
          <button class="btn btn-success" id="assignToEventBtn">
            <i class="mdi mdi-calendar-plus me-2"></i>Asignar a Evento
          </button>
          <button class="btn btn-outline-secondary" id="printRfidBtn">
            <i class="mdi mdi-tag-outline me-2"></i>Imprimir Etiquetas RFID
          </button>
          <button class="btn btn-outline-secondary" id="generateReportBtn">
            <i class="mdi mdi-chart-bar me-2"></i>Generar Reporte
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header"><h5 class="card-title mb-0">Mantenimiento</h5></div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2"><small class="text-muted">Total mantenimientos:</small><span class="fw-medium" id="sideMaintenanceTotal">Falta</span></div>
          <div class="d-flex justify-content-between mb-2"><small class="text-muted">En mantenimiento:</small><span class="fw-medium text-warning" id="sideMaintenanceCurrent">{{ $maintenanceUnits }}</span></div>
          <div class="d-flex justify-content-between mb-3"><small class="text-muted">Último registro:</small><span class="fw-medium" id="sideMaintenanceLast">Falta</span></div>
          <hr class="my-2">
          <a href="{{ route('inventory.detalle', ['id' => $itemParent->id]) }}" class="btn btn-sm btn-outline-secondary w-100">
            <i class="mdi mdi-history me-1"></i>Ver historial
          </a>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="card-title mb-0">Próximos Eventos</h5>
          <a href="{{ route('inventory.eventos.index') }}" class="btn btn-sm btn-outline-primary">Ver todos</a>
        </div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush" id="sideUpcomingEvents">
            @forelse(($upcomingEvents ?? collect()) as $ev)
              <li class="list-group-item">
                <div class="fw-medium">{{ $ev->name }}</div>
                <small class="text-muted d-block">{{ $ev->start_date ? $ev->start_date->format('d M Y') : '' }}</small>
                <small class="text-muted d-block">{{ $ev->client_name ?? 'Sin cliente' }}</small>
              </li>
            @empty
              <li class="list-group-item text-center py-3 text-muted">No hay próximos eventos.</li>
            @endforelse
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h5 class="card-title mb-0">Alertas</h5></div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush" id="sideAlerts">
            @if($maintenanceUnits > 0)
              <li class="list-group-item text-center py-3 text-warning">Hay {{ $maintenanceUnits }} unidad(es) en mantenimiento.</li>
            @else
              <li class="list-group-item text-center py-3 text-muted">
                <i class="mdi mdi-check-circle-outline mdi-24px d-block mb-1 text-success"></i>
                Sin alertas activas
              </li>
            @endif
          </ul>
        </div>
      </div>

    </div>
    <!-- ══════════════ / PANEL LATERAL ══════════════ -->
  </div>
</div>

<!-- ══ MODAL: AGREGAR / EDITAR UNIDAD ══ -->
<div class="modal fade" id="unitModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="unitModalTitle">Agregar Unidad</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body">
        <form id="unitForm">
          <input type="hidden" id="unitFormId">
          <div class="row g-3">
            <div class="col-md-6"><div class="form-floating form-floating-outline"><input type="text" class="form-control" id="unitSerial" placeholder="TPP-001"><label for="unitSerial">Número de Serie</label></div></div>
            <div class="col-md-6"><div class="form-floating form-floating-outline"><input type="text" class="form-control" id="unitRfid" placeholder="RF-L-0001"><label for="unitRfid">Etiqueta RFID</label></div></div>
            <div class="col-md-6"><div class="form-floating form-floating-outline"><select class="form-select" id="unitStatus"><option value="Disponible">Disponible</option><option value="Asignado">Asignado</option><option value="En Mantenimiento">En Mantenimiento</option></select><label for="unitStatus">Estado</label></div></div>
            <div class="col-md-6"><div class="form-floating form-floating-outline"><select class="form-select" id="unitCondition"><option value="Excelente">Excelente</option><option value="Bueno" selected>Bueno</option><option value="Regular">Regular</option><option value="En Reparación">En Reparación</option></select><label for="unitCondition">Condición</label></div></div>
            <div class="col-md-6"><div class="form-floating form-floating-outline"><input type="text" class="form-control" id="unitLocation" placeholder="Almacén A-1"><label for="unitLocation">Ubicación</label></div></div>
            <div class="col-md-6"><div class="form-floating form-floating-outline"><input type="date" class="form-control" id="unitPurchaseDate"><label for="unitPurchaseDate">Fecha de Compra</label></div></div>
            <div class="col-12"><div class="form-floating form-floating-outline"><textarea class="form-control" id="unitNotes" placeholder="Notas..." style="height:80px;"></textarea><label for="unitNotes">Notas</label></div></div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="saveUnitBtn"><i class="mdi mdi-content-save me-1"></i>Guardar Unidad</button>
      </div>
    </div>
  </div>
</div>

<!-- ══ MODAL: HISTORIAL DE UNIDAD ══ -->
<div class="modal fade" id="unitHistoryModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="unitHistoryTitle">Historial de Unidad</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body" id="unitHistoryBody"><div class="text-center py-4"><div class="spinner-border text-primary"></div></div></div>
      <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button></div>
    </div>
  </div>
</div>

<!-- ══ MODAL: SELECCIONAR ÍTEM DE CATÁLOGO ══ -->
<div class="modal fade" id="selectItemModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h5 class="modal-title">Seleccionar Ítem del Catálogo</h5>
          <small class="text-muted">Busca y selecciona el ítem al que deseas agregar una unidad</small>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0">
        <div class="p-3 border-bottom bg-light">
          <div class="input-group"><span class="input-group-text"><i class="mdi mdi-magnify"></i></span><input type="text" class="form-control" id="catalogSearchInput" placeholder="Buscar por nombre, SKU o ID..."><button class="btn btn-outline-secondary d-none" type="button" id="clearCatalogSearch"><i class="mdi mdi-close"></i></button></div>
          <div class="d-flex gap-2 mt-2 flex-wrap"><select class="form-select form-select-sm w-auto" id="catalogCategoryFilter"><option value="all">Todas las categorías</option></select><small class="text-muted align-self-center ms-auto" id="catalogResultCount">Falta</small></div>
        </div>
        <div class="table-responsive" style="max-height: 380px; overflow-y: auto;">
          <table class="table table-hover mb-0" id="catalogTable">
            <thead class="table-light sticky-top"><tr><th style="width:50px;">ACTIVO</th><th style="width:120px;">MARCA</th><th>NOMBRE DE PRODUCTO</th><th style="width:140px;">CATEGORÍA</th><th style="width:90px;">ID</th><th style="width:100px;" class="text-center">SELECCIONAR</th></tr></thead>
            <tbody id="catalogTableBody"><tr><td colspan="6" class="text-center py-4 text-muted">Falta</td></tr></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button></div>
    </div>
  </div>
</div>

<!-- ══ MODAL: CATÁLOGO DE EVENTOS ══ -->
<div class="modal fade" id="eventCatalogModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h5 class="modal-title">Seleccionar Evento</h5>
          <small class="text-muted">Selecciona el evento al que deseas asignar unidades</small>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0">
        <div class="p-3 border-bottom bg-light">
          <div class="input-group"><span class="input-group-text"><i class="mdi mdi-magnify"></i></span><input type="text" class="form-control" id="eventSearchInput" placeholder="Buscar evento por nombre, cliente o lugar..."><button class="btn btn-outline-secondary d-none" type="button" id="clearEventSearch"><i class="mdi mdi-close"></i></button></div>
          <div class="d-flex gap-2 mt-2 flex-wrap align-items-center"><select class="form-select form-select-sm w-auto" id="eventMonthFilter"><option value="all">Todos los meses</option></select><small class="text-muted ms-auto" id="eventResultCount">Falta</small></div>
        </div>
        <div class="table-responsive" style="max-height:380px; overflow-y:auto;">
          <table class="table table-hover mb-0" id="eventCatalogTable">
            <thead class="table-light sticky-top"><tr><th style="width:110px;">FECHA</th><th>NOMBRE DEL EVENTO</th><th style="width:150px;">CLIENTE</th><th style="width:120px;">LUGAR</th><th style="width:80px;" class="text-center">SELECCIONAR</th></tr></thead>
            <tbody id="eventCatalogTableBody"><tr><td colspan="5" class="text-center py-4 text-muted">Falta</td></tr></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button></div>
    </div>
  </div>
</div>

<!-- ══ MODAL: ASIGNAR UNIDADES AL EVENTO ══ -->
<div class="modal fade" id="assignUnitsModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <div>
          <h5 class="modal-title" id="assignUnitsTitle">Seleccionar Unidades</h5>
          <div class="text-muted small mt-1" id="assignUnitsSubtitle">Falta</div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
      </div>
      <div class="modal-body p-0">
        <div class="p-3 border-bottom bg-light" id="assignEventInfoBar">Falta</div>
        <div class="p-3 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div class="form-check mb-0"><input class="form-check-input" type="checkbox" id="selectAllUnitsCheck"><label class="form-check-label fw-medium" for="selectAllUnitsCheck">Seleccionar todas</label></div>
          <small class="text-muted" id="assignSelectedCount">0 unidades seleccionadas</small>
        </div>
        <div class="table-responsive" style="max-height:320px; overflow-y:auto;">
          <table class="table table-hover mb-0" id="assignUnitsTable">
            <thead class="table-light sticky-top"><tr><th style="width:50px;"></th><th style="width:160px;">ITEM ID / SERIAL / RFID</th><th style="width:110px;">CONDICIÓN</th><th>UBICACIÓN ACTUAL</th><th style="width:110px;">ÚLTIMO USO</th></tr></thead>
            <tbody id="assignUnitsTableBody"><tr><td colspan="5" class="text-center py-4 text-muted">Falta</td></tr></tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer d-flex justify-content-between align-items-center">
        <button type="button" class="btn btn-outline-secondary" id="assignUnitsBackBtn"><i class="mdi mdi-arrow-left me-1"></i>Volver a eventos</button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-success" id="confirmAssignBtn"><i class="mdi mdi-calendar-check me-1"></i>Confirmar Asignación</button>
        </div>
      </div>
    </div>
  </div>
</div>


@endsection

@section('script')
<script>
document.addEventListener('DOMContentLoaded', function () {
  const isUnassignedItem = @json($isUnassignedItem ?? false);
  const currentItemParentId = @json($itemParent->id);
  const searchInput = document.getElementById('unitsSearchInput');
  const clearSearchBtn = document.getElementById('clearUnitsSearch');
  const statusSelect = document.getElementById('statusFilterSelect');
  const conditionSelect = document.getElementById('conditionFilterSelect');
  const clearAllBtn = document.getElementById('clearAllUnitsFilters');
  const rows = Array.from(document.querySelectorAll('#unitsTableBody tr[data-status]'));

  const addUnitBtn = document.getElementById('addUnitBtn');
  const selectItemModalEl = document.getElementById('selectItemModal');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const clearCatalogSearch = document.getElementById('clearCatalogSearch');
  const catalogCategoryFilter = document.getElementById('catalogCategoryFilter');
  const catalogResultCount = document.getElementById('catalogResultCount');
  const catalogTableBody = document.getElementById('catalogTableBody');

  const assignToEventBtn = document.getElementById('assignToEventBtn');
  const eventModalEl = document.getElementById('eventCatalogModal');
  const eventSearchInput = document.getElementById('eventSearchInput');
  const clearEventSearch = document.getElementById('clearEventSearch');
  const eventMonthFilter = document.getElementById('eventMonthFilter');
  const eventResultCount = document.getElementById('eventResultCount');
  const eventTableBody = document.getElementById('eventCatalogTableBody');


  const uniqueSorted = (arr) => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es'));

  const statuses = uniqueSorted(rows.map(r => r.dataset.status || ''));
  const conditions = uniqueSorted(rows.map(r => r.dataset.condition || ''));

  if (statusSelect) statusSelect.innerHTML = '<option value="all">Todos los estados</option>' + statuses.map(v => `<option value="${v}">${v}</option>`).join('');
  if (conditionSelect) conditionSelect.innerHTML = '<option value="all">Todas las condiciones</option>' + conditions.map(v => `<option value="${v}">${v}</option>`).join('');

  const monthNames = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  const parseDateSafe = (raw) => {
    if (!raw) return null;
    let d = new Date(raw);
    if (!Number.isNaN(d.getTime())) return d;
    d = new Date(String(raw).split(' ')[0] + 'T00:00:00');
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const formatShortDate = (d) => {
    const date = parseDateSafe(d);
    if (!date) return '';
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  let eventRowsCache = [];
  let catalogRowsCache = [];

  function eventDueBadge(startDate) {
    const d = parseDateSafe(startDate);
    if (!d) return '';
    const today = new Date();
    today.setHours(0,0,0,0);
    d.setHours(0,0,0,0);

    const diffDays = Math.floor((d - today) / 86400000);
    if (diffDays === 0) return '<span class="badge bg-label-success">Hoy</span>';
    if (diffDays > 0) return `<span class="badge bg-label-warning">En ${diffDays} día${diffDays === 1 ? '' : 's'}</span>`;
    return '';
  }


  function renderCatalogRows() {
    if (!catalogTableBody) return;

    const term = (catalogSearchInput?.value || '').trim().toLowerCase();
    const category = catalogCategoryFilter?.value || 'all';

    const rowsFiltered = catalogRowsCache.filter((item) => {
      const inSearch = !term || `${item.public_name} ${item.name} ${item.brand} ${item.category}`.toLowerCase().includes(term);
      const inCategory = category === 'all' || (item.category || '').toLowerCase() === category;
      return inSearch && inCategory;
    });

    catalogTableBody.innerHTML = rowsFiltered.length
      ? rowsFiltered.map((item) => `
          <tr>
            <td><span class="badge bg-label-${item.units_count > 0 ? 'success' : 'secondary'}">${item.units_count > 0 ? 'SI' : 'NO'}</span></td>
            <td>${item.brand || '—'}</td>
            <td><div class="fw-medium">${item.public_name || item.name || 'Sin nombre'}</div><small class="text-muted">${item.model || '—'}</small></td>
            <td>${item.category || '—'}</td>
            <td>${item.id}</td>
            <td class="text-center"><button class="btn btn-sm btn-primary" data-select-parent-id="${item.id}">Seleccionar</button></td>
          </tr>
        `).join('')
      : '<tr><td colspan="6" class="text-center py-4 text-muted">No se encontraron ítems.</td></tr>';

    if (catalogResultCount) {
      catalogResultCount.textContent = `${rowsFiltered.length} ítem${rowsFiltered.length === 1 ? '' : 's'}`;
    }

    if (clearCatalogSearch) {
      clearCatalogSearch.classList.toggle('d-none', !term);
    }
  }

  async function openSelectItemModal() {
    if (!selectItemModalEl || typeof bootstrap === 'undefined') return;
    bootstrap.Modal.getOrCreateInstance(selectItemModalEl).show();

    if (!catalogTableBody) return;
    catalogTableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div><span class="text-muted">Cargando catálogo...</span></td></tr>';

    try {
      const res = await fetch('{{ route('inventory.parents.index') }}', { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo cargar el catálogo.');

      catalogRowsCache = (data.data || []).filter((item) => Number(item.id) !== Number(currentItemParentId));

      const categories = Array.from(new Set(catalogRowsCache.map(i => (i.category || '').trim().toLowerCase()).filter(Boolean))).sort((a,b) => a.localeCompare(b,'es'));
      if (catalogCategoryFilter) {
        catalogCategoryFilter.innerHTML = '<option value="all">Todas las categorías</option>' + categories.map((c) => `<option value="${c}">${c}</option>`).join('');
      }

      renderCatalogRows();
    } catch (error) {
      catalogTableBody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-danger">${error.message || 'No se pudo cargar el catálogo.'}</td></tr>`;
    }
  }

  async function confirmAssociateToParent(targetParentId) {
    if (!targetParentId) return;

    const proceed = await (typeof Swal !== 'undefined'
      ? Swal.fire({
          title: '¿Asociar unidades?',
          text: 'Se asociarán las unidades de este item SIN ASIGNAR al ítem seleccionado.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Sí, asociar',
          cancelButtonText: 'Cancelar',
        })
      : Promise.resolve({ isConfirmed: confirm('¿Asociar unidades al ítem seleccionado?') }));

    if (!proceed.isConfirmed) return;

    try {
      const res = await fetch(`{{ url('inventory/item') }}/${currentItemParentId}/associate-to-parent`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ target_parent_id: Number(targetParentId) }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo asociar.');

      if (typeof Swal !== 'undefined') {
        await Swal.fire('Listo', data.message || 'Unidades asociadas correctamente.', 'success');
      }
      window.location.reload();
    } catch (error) {
      if (typeof Swal !== 'undefined') {
        Swal.fire('Error', error.message || 'No se pudo asociar.', 'error');
      }
    }
  }

  function renderEventRows() {
    if (!eventTableBody) return;

    const term = (eventSearchInput?.value || '').trim().toLowerCase();
    const month = eventMonthFilter?.value || 'all';

    const rowsFiltered = eventRowsCache.filter((ev) => {
      const inSearch = !term || `${ev.name} ${ev.client_name} ${ev.venue_name} ${ev.venue_address}`.toLowerCase().includes(term);
      const inMonth = month === 'all' || String(ev.start_month) === String(month);
      return inSearch && inMonth;
    });

    eventTableBody.innerHTML = rowsFiltered.length
      ? rowsFiltered.map((ev) => {
          const d = parseDateSafe(ev.start_date);
          const day = d ? d.getDate() : '—';
          const mon = d ? monthNames[d.getMonth()].toUpperCase() : '';
          const dateBoxClass = eventDueBadge(ev.start_date).includes('Hoy') ? 'bg-label-success' : 'bg-label-primary';
          return `
            <tr class="event-select-row" role="button" tabindex="0" data-event-id="${ev.id}">
              <td>
                <div class="rounded ${dateBoxClass} text-center px-2 py-1" style="min-width:52px;">
                  <div class="fw-bold">${day}</div>
                  <small class="text-uppercase">${mon}</small>
                </div>
              </td>
              <td>
                <div class="fw-medium">${ev.name || 'Sin nombre'}</div>
                <div class="d-flex align-items-center gap-2 small text-muted mt-1">
                  ${eventDueBadge(ev.start_date)}
                  <span>${formatShortDate(ev.start_date)}</span>
                </div>
              </td>
              <td>${ev.client_name || '—'}</td>
              <td>${ev.venue_address || ev.venue_name || '—'}</td>
              <td class="text-center">
                <button class="btn btn-icon btn-sm btn-outline-primary" title="Seleccionar" data-event-id="${ev.id}">
                  <i class="mdi mdi-calendar-check"></i>
                </button>
              </td>
            </tr>
          `;
        }).join('')
      : '<tr><td colspan="5" class="text-center py-4 text-muted">No se encontraron eventos.</td></tr>';

    if (eventResultCount) {
      eventResultCount.textContent = `${rowsFiltered.length} evento${rowsFiltered.length === 1 ? '' : 's'}`;
    }

    if (clearEventSearch) {
      clearEventSearch.classList.toggle('d-none', !term);
    }
  }

  async function openEventModal() {
    if (!eventModalEl || typeof bootstrap === 'undefined') return;
    const modal = new bootstrap.Modal(eventModalEl);
    modal.show();

    if (!eventTableBody) return;
    eventTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-primary me-2"></div><span class="text-muted">Cargando eventos...</span></td></tr>';

    try {
      const res = await fetch('{{ route('inventory.events.assignable') }}', { headers: { 'Accept': 'application/json' } });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || 'Error al cargar eventos');

      eventRowsCache = (data.data || []).map((ev) => {
        const d = parseDateSafe(ev.start_date);
        return {
          ...ev,
          start_month: d && !Number.isNaN(d.getTime()) ? d.getMonth() + 1 : null,
        };
      });

      const months = Array.from(new Set(eventRowsCache.map(e => e.start_month).filter(Boolean))).sort((a,b)=>a-b);
      if (eventMonthFilter) {
        eventMonthFilter.innerHTML = '<option value="all">Todos los meses</option>' + months.map((m) => `<option value="${m}">${monthNames[m-1]}</option>`).join('');
      }
      renderEventRows();
    } catch (e) {
      eventTableBody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-danger">${e.message || 'No se pudieron cargar los eventos.'}</td></tr>`;
      if (eventResultCount) eventResultCount.textContent = '0 eventos';
    }
  }


  let selectedEvent = null;

  function collectUnitsForAssignment() {
    return Array.from(document.querySelectorAll('#unitsTableBody tr[data-unit-id]')).map((row) => ({
      id: row.dataset.unitId,
      itemId: row.dataset.itemId || '',
      serial: row.dataset.serial || '',
      rfid: row.dataset.rfid || '',
      condition: row.dataset.condition || '',
      location: row.dataset.location || '',
      lastUse: row.dataset.lastUse || '',
    }));
  }

  function updateAssignSelectedCount() {
    const checks = Array.from(document.querySelectorAll('.assign-unit-check'));
    const checked = checks.filter(c => c.checked).length;
    const label = document.getElementById('assignSelectedCount');
    if (label) label.textContent = `${checked} unidad${checked === 1 ? '' : 'es'} seleccionada${checked === 1 ? '' : 's'}`;
    const confirmBtn = document.getElementById('confirmAssignBtn');
    if (confirmBtn) confirmBtn.disabled = checked === 0;
    const selectAll = document.getElementById('selectAllUnitsCheck');
    if (selectAll) {
      selectAll.checked = checks.length > 0 && checked === checks.length;
      selectAll.indeterminate = checked > 0 && checked < checks.length;
    }
  }

  function openAssignUnitsModal(eventData) {
    selectedEvent = eventData;
    const assignModalEl = document.getElementById('assignUnitsModal');
    if (!assignModalEl || typeof bootstrap === 'undefined') return;

    const title = document.getElementById('assignUnitsTitle');
    const subtitle = document.getElementById('assignUnitsSubtitle');
    const infoBar = document.getElementById('assignEventInfoBar');
    const tbody = document.getElementById('assignUnitsTableBody');

    if (title) title.innerHTML = `Seleccionar Unidades <span class="badge bg-label-success ms-2">EVT-${eventData.id}</span>`;
    if (subtitle) subtitle.textContent = eventData.name || '';
    if (infoBar) {
      infoBar.innerHTML = `<div class="d-flex align-items-center justify-content-between flex-wrap gap-2"><div><div class="fw-medium">${eventData.name || ''}</div><small class="text-muted">${formatShortDate(eventData.start_date)} • ${eventData.client_name || '—'}</small></div><small class="text-muted">${eventData.venue_address || eventData.venue_name || '—'}</small></div>`;
    }

    const units = collectUnitsForAssignment();
    if (tbody) {
      tbody.innerHTML = units.map((u) => `
        <tr>
          <td><input class="form-check-input assign-unit-check" type="checkbox" value="${u.id}"></td>
          <td><div class="fw-medium">${u.itemId || '—'}</div><small class="text-muted d-block">${u.serial || '—'}</small><small class="text-muted d-block">${u.rfid || ''}</small></td>
          <td><span class="badge bg-label-secondary">${u.condition || '—'}</span></td>
          <td>${u.location || '—'}</td>
          <td>${u.lastUse || '—'}</td>
        </tr>
      `).join('') || '<tr><td colspan="5" class="text-center py-4 text-muted">No hay unidades para asignar.</td></tr>';
    }

    document.querySelectorAll('.assign-unit-check').forEach((c) => c.addEventListener('change', updateAssignSelectedCount));
    const selectAll = document.getElementById('selectAllUnitsCheck');
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
      selectAll.onchange = function () {
        document.querySelectorAll('.assign-unit-check').forEach((c) => { c.checked = this.checked; });
        updateAssignSelectedCount();
      };
    }

    updateAssignSelectedCount();

    const eventModalElLocal = document.getElementById('eventCatalogModal');
    if (eventModalElLocal) bootstrap.Modal.getOrCreateInstance(eventModalElLocal).hide();
    bootstrap.Modal.getOrCreateInstance(assignModalEl).show();
  }


  async function submitEventAssignment() {
    const checks = Array.from(document.querySelectorAll('.assign-unit-check:checked'));
    const unitIds = checks.map((c) => Number(c.value)).filter(Boolean);
    if (!selectedEvent || !unitIds.length) return;

    try {
      const res = await fetch('{{ route('inventory.events.assign') }}', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          event_id: selectedEvent.id,
          unit_ids: unitIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No se pudo guardar la asignación.');
      }

      const created = data?.data?.created_count || 0;
      const skipped = data?.data?.skipped_count || 0;
      const allOk = skipped === 0;

      if (typeof Swal !== 'undefined') {
        Swal.fire({
          icon: allOk ? 'success' : 'info',
          title: allOk ? 'Asignación completada' : 'Asignación parcial',
          html: allOk
            ? `Se agregaron ${created} unidad(es) correctamente.`
            : `Se agregaron ${created} unidad(es).<br>${skipped} ya estaban asignadas a este evento.`,
          confirmButtonText: 'Aceptar',
        });
      }

      const assignModalEl = document.getElementById('assignUnitsModal');
      if (assignModalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(assignModalEl).hide();
      }

    } catch (e) {
      if (typeof Swal !== 'undefined') {
        Swal.fire('Error', e.message || 'No se pudo guardar la asignación.', 'error');
      }
    }
  }

  function applyFilters() {
    const term = (searchInput?.value || '').trim().toLowerCase();
    const status = statusSelect?.value || 'all';
    const condition = conditionSelect?.value || 'all';

    let visible = 0;
    rows.forEach((row) => {
      const bySearch = !term || (row.dataset.search || '').includes(term);
      const byStatus = status === 'all' || row.dataset.status === status;
      const byCondition = condition === 'all' || row.dataset.condition === condition;
      const show = (bySearch && byStatus && byCondition);
      row.style.display = show ? '' : 'none';
      if (show) visible++;
    });

    const unitsCountLabel = document.getElementById('unitsCountLabel');
    if (unitsCountLabel) {
      unitsCountLabel.textContent = `${visible} unidad${visible === 1 ? '' : 'es'} encontrada${visible === 1 ? '' : 's'}`;
    }

    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    const totalUnits = document.getElementById('totalUnits');
    if (showingFrom && showingTo && totalUnits) {
      showingFrom.textContent = visible ? '1' : '0';
      showingTo.textContent = String(visible);
      totalUnits.textContent = String(visible);
    }

    if (clearSearchBtn) clearSearchBtn.classList.toggle('d-none', !term);
  }

  if (searchInput) searchInput.addEventListener('input', applyFilters);
  if (statusSelect) statusSelect.addEventListener('change', applyFilters);
  if (conditionSelect) conditionSelect.addEventListener('change', applyFilters);
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      applyFilters();
    });
  }
  if (clearAllBtn) {
    clearAllBtn.addEventListener('click', function () {
      if (searchInput) searchInput.value = '';
      if (statusSelect) statusSelect.value = 'all';
      if (conditionSelect) conditionSelect.value = 'all';
      applyFilters();
    });
  }


  if (addUnitBtn) {
    addUnitBtn.addEventListener('click', function (e) {
      if (!isUnassignedItem) return;
      e.preventDefault();
      openSelectItemModal();
    });
  }

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', renderCatalogRows);
  }

  if (catalogCategoryFilter) {
    catalogCategoryFilter.addEventListener('change', renderCatalogRows);
  }

  if (clearCatalogSearch) {
    clearCatalogSearch.addEventListener('click', function () {
      if (catalogSearchInput) catalogSearchInput.value = '';
      renderCatalogRows();
    });
  }

  if (catalogTableBody) {
    catalogTableBody.addEventListener('click', function (e) {
      const btn = e.target.closest('button[data-select-parent-id]');
      if (!btn) return;
      confirmAssociateToParent(btn.getAttribute('data-select-parent-id'));
    });
  }

  if (assignToEventBtn) {
    assignToEventBtn.addEventListener('click', openEventModal);
  }

  if (eventSearchInput) {
    eventSearchInput.addEventListener('input', renderEventRows);
  }

  if (eventMonthFilter) {
    eventMonthFilter.addEventListener('change', renderEventRows);
  }

  if (clearEventSearch) {
    clearEventSearch.addEventListener('click', function () {
      if (eventSearchInput) eventSearchInput.value = '';
      renderEventRows();
    });
  }


  const openEventFromTarget = (target) => {
    const row = target.closest('[data-event-id]');
    if (!row) return;
    const eventId = row.getAttribute('data-event-id');
    const ev = eventRowsCache.find((x) => String(x.id) === String(eventId));
    if (!ev) return;
    openAssignUnitsModal(ev);
  };

  if (eventTableBody) {
    eventTableBody.addEventListener('click', function (e) {
      openEventFromTarget(e.target);
    });

    eventTableBody.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const row = e.target.closest('tr[data-event-id]');
      if (!row) return;
      e.preventDefault();
      openEventFromTarget(row);
    });
  }

  const confirmAssignBtn = document.getElementById('confirmAssignBtn');
  if (confirmAssignBtn) {
    confirmAssignBtn.addEventListener('click', submitEventAssignment);
  }

  const assignUnitsBackBtn = document.getElementById('assignUnitsBackBtn');
  if (assignUnitsBackBtn) {
    assignUnitsBackBtn.addEventListener('click', function () {
      const assignModalEl = document.getElementById('assignUnitsModal');
      if (assignModalEl && typeof bootstrap !== 'undefined') {
        bootstrap.Modal.getOrCreateInstance(assignModalEl).hide();
      }
      openEventModal();
    });
  }

  applyFilters();
});
</script>
@endsection


