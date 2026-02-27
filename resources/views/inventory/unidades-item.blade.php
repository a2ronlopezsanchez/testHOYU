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
  $skuValue = $itemParent->sku ?? 'Falta';
@endphp

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-unidades-item.css') }}" />
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
                    <li class="mb-1"><span class="text-muted">SKU:</span><span id="infoSku" class="ms-1 fw-medium font-monospace">{{ $skuValue }}</span></li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-2">Especificaciones</h6>
                  <ul class="list-unstyled mb-0 small" id="infoSpecs">
                    <li><span class="text-muted">Familia:</span> <span class="ms-1 fw-medium">{{ $itemParent->family ?: 'Falta' }}</span></li>
                    <li><span class="text-muted">Sub familia:</span> <span class="ms-1 fw-medium">{{ $itemParent->sub_family ?: 'Falta' }}</span></li>
                    <li><span class="text-muted">Color:</span> <span class="ms-1 fw-medium">{{ $itemParent->color ?: 'Falta' }}</span></li>
                    <li><span class="text-muted">Tags:</span> <span class="ms-1 fw-medium">Falta</span></li>
                  </ul>
                </div>
                <div class="col-12">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-1">Descripción</h6>
                  <p class="small text-muted mb-0" id="infoDescription">Falta</p>
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
          <a class="btn btn-primary btn-sm" id="addUnitBtn" href="{{ route('inventory.formulario', ['id' => $itemParent->id, 'mode' => 'new-from-parent']) }}">
            <i class="mdi mdi-plus me-1"></i>Agregar Unidad
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
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>
                    <div class="fw-medium">{{ $unit->serial_number ?: 'Falta' }}</div>
                    <small class="text-muted">{{ $unit->rfid_tag ?: 'RFID: Falta' }}</small>
                  </td>
                  <td>{{ str_replace('_', ' ', $unit->status ?: 'Falta') }}</td>
                  <td>{{ $unit->condition ?: 'Falta' }}</td>
                  <td>{{ $unit->location->name ?? 'Falta' }}</td>
                  <td>{{ optional($unit->updated_at)->format('d/m/Y') ?: 'Falta' }}</td>
                  <td>Falta</td>
                  <td class="text-center">
                    <a class="btn btn-sm btn-outline-primary" href="{{ route('inventory.detalle.unidad', ['id' => $unit->id]) }}">
                      <i class="mdi mdi-eye"></i>
                    </a>
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
        <div class="card-header"><h5 class="card-title mb-0">Próximos Eventos</h5></div>
        <div class="card-body p-0">
          <ul class="list-group list-group-flush" id="sideUpcomingEvents">
            <li class="list-group-item text-center py-3 text-muted">Falta</li>
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
            <thead class="table-light sticky-top"><tr><th style="width:50px;">ACTIVO</th><th style="width:120px;">SKU</th><th>NOMBRE DE PRODUCTO</th><th style="width:140px;">CATEGORÍA</th><th style="width:90px;">ID</th><th style="width:70px;" class="text-center">VER</th></tr></thead>
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
            <thead class="table-light sticky-top"><tr><th style="width:50px;"></th><th style="width:120px;">SERIAL / RFID</th><th style="width:110px;">CONDICIÓN</th><th>UBICACIÓN ACTUAL</th><th style="width:110px;">ÚLTIMO USO</th></tr></thead>
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
