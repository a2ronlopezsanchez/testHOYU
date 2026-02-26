@extends('layouts.main')
@section('title','Detalle de Unidades')
@section('leve','Inventario')
@section('subleve','Asignar a Eventos')

@php
  $itemName = $itemParent->public_name ?: $itemParent->name;
  $totalUnits = $inventoryItems->count();
  $availableUnits = $inventoryItems->where('status', 'ACTIVO')->count();
  $assignedUnits = $inventoryItems->filter(function ($unit) {
      return in_array($unit->status, ['ASIGNADO', 'EN_USO']);
  })->count();
  $maintenanceUnits = $inventoryItems->filter(function ($unit) {
      return in_array($unit->status, ['EN_REPARACION', 'MANTENIMIENTO']);
  })->count();
@endphp

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-unidades-item.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

  <div class="card mb-4">
    <div class="card-body">
      <div class="d-flex align-items-start justify-content-between flex-wrap gap-3">
        <div class="d-flex align-items-start gap-3">
          <a class="btn btn-icon btn-sm btn-outline-secondary flex-shrink-0" href="{{ route('inventory.disponibilidad') }}">
            <i class="mdi mdi-arrow-left"></i>
          </a>
          <div>
            <h4 class="mb-1">{{ $itemName }}</h4>
            <div class="d-flex align-items-center flex-wrap gap-2">
              <span class="text-muted small">{{ $itemParent->brand->name ?? 'Sin marca' }}</span>
              <span class="text-muted">•</span>
              <span class="badge bg-label-primary">{{ $itemParent->category->name ?? 'Sin categoría' }}</span>
              <span class="text-muted">•</span>
              <small class="text-muted">{{ $totalUnits }} unidades</small>
            </div>
          </div>
        </div>

        <div class="d-flex gap-2 flex-wrap">
          <button class="btn btn-sm btn-outline-secondary" onclick="window.print()">
            <i class="mdi mdi-printer me-1"></i>
            <span class="d-none d-sm-inline">Imprimir</span>
          </button>
          <a class="btn btn-sm btn-outline-secondary" href="{{ route('inventory.disponibilidad') }}">
            <i class="mdi mdi-download me-1"></i>
            <span class="d-none d-sm-inline">Volver al catálogo</span>
          </a>
          <a class="btn btn-sm btn-primary" href="{{ route('inventory.formulario', ['id' => $itemParent->id]) }}">
            <i class="mdi mdi-pencil me-1"></i>
            <span class="d-none d-sm-inline">Editar Item</span>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <div class="col-lg-8 col-xl-9">

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-4">
            <div class="col-auto d-none d-md-block">
              <div class="units-item-image">
                <img src="{{ asset('/materialize/assets/img/products/card-weekly-sales-watch.png') }}"
                     alt="Item" class="rounded border" style="width:120px;height:90px;object-fit:cover;">
              </div>
            </div>
            <div class="col">
              <div class="row g-3">
                <div class="col-md-6">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-2">Información General</h6>
                  <ul class="list-unstyled mb-0 small">
                    <li class="mb-1"><span class="text-muted">Categoría:</span> <span class="ms-1 fw-medium">{{ $itemParent->category->name ?? '—' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Marca:</span> <span class="ms-1 fw-medium">{{ $itemParent->brand->name ?? '—' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Modelo:</span> <span class="ms-1 fw-medium">{{ $itemParent->model ?: '—' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Familia:</span> <span class="ms-1 fw-medium">{{ $itemParent->family ?: '—' }}</span></li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-2">Especificaciones</h6>
                  <ul class="list-unstyled mb-0 small">
                    <li class="mb-1"><span class="text-muted">Subfamilia:</span> <span class="ms-1 fw-medium">{{ $itemParent->sub_family ?: '—' }}</span></li>
                    <li class="mb-1"><span class="text-muted">Color:</span> <span class="ms-1 fw-medium">{{ $itemParent->color ?: '—' }}</span></li>
                    <li class="mb-1"><span class="text-muted">ID Padre:</span> <span class="ms-1 fw-medium font-monospace">{{ $itemParent->id }}</span></li>
                  </ul>
                </div>
                <div class="col-12">
                  <h6 class="text-muted text-uppercase small fw-semibold mb-1">Descripción</h6>
                  <p class="small text-muted mb-0">Vista para consultar unidades del ítem padre y preparar su asignación a eventos.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card-footer bg-light">
          <div class="row g-3 text-center">
            <div class="col-6 col-md-3"><div class="units-stat-box"><div class="fw-bold fs-4 mb-0">{{ $totalUnits }}</div><small class="text-muted">Total</small><div class="units-stat-bar bg-secondary mt-1"></div></div></div>
            <div class="col-6 col-md-3"><div class="units-stat-box"><div class="fw-bold fs-4 mb-0 text-success">{{ $availableUnits }}</div><small class="text-muted">Disponibles</small><div class="units-stat-bar bg-success mt-1"></div></div></div>
            <div class="col-6 col-md-3"><div class="units-stat-box"><div class="fw-bold fs-4 mb-0 text-primary">{{ $assignedUnits }}</div><small class="text-muted">Asignadas</small><div class="units-stat-bar bg-primary mt-1"></div></div></div>
            <div class="col-6 col-md-3"><div class="units-stat-box"><div class="fw-bold fs-4 mb-0 text-warning">{{ $maintenanceUnits }}</div><small class="text-muted">Mantenimiento</small><div class="units-stat-bar bg-warning mt-1"></div></div></div>
          </div>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3 align-items-center">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                <input type="text" class="form-control" placeholder="Buscar unidad (visual)" disabled>
              </div>
            </div>
            <div class="col-md-6">
              <div class="d-flex justify-content-md-end gap-2">
                <button class="btn btn-outline-secondary btn-sm" disabled><i class="mdi mdi-filter-variant me-1"></i>Filtros</button>
                <button class="btn btn-outline-secondary btn-sm" disabled><i class="mdi mdi-export me-1"></i>Exportar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0">Unidades asociadas</h5>
          <span class="badge bg-label-primary">Asignación a eventos: siguiente paso</span>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>ID Item</th>
                <th>Serial</th>
                <th>Estatus</th>
                <th>Condición</th>
                <th>Ubicación</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              @forelse($inventoryItems as $index => $unit)
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td><span class="badge bg-label-dark">{{ $unit->item_id ?: '—' }}</span></td>
                  <td>{{ $unit->serial_number ?: '—' }}</td>
                  <td>{{ str_replace('_', ' ', $unit->status) }}</td>
                  <td>{{ $unit->condition ?: '—' }}</td>
                  <td>{{ $unit->location->name ?? '—' }}</td>
                  <td>
                    <a href="{{ route('inventory.detalle.unidad', ['id' => $unit->id]) }}" class="btn btn-sm btn-outline-primary">
                      Ver detalle
                    </a>
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="7" class="text-center text-muted py-4">Este ítem padre no tiene unidades activas registradas.</td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <div class="col-lg-4 col-xl-3">
      <div class="card mb-4">
        <div class="card-header"><h5 class="card-title mb-0">Acciones rápidas</h5></div>
        <div class="card-body d-grid gap-2">
          <a class="btn btn-primary" href="{{ route('inventory.formulario', ['id' => $itemParent->id, 'mode' => 'new-from-parent']) }}">
            <i class="mdi mdi-plus me-2"></i>Agregar Unidad
          </a>
          <button class="btn btn-success" disabled>
            <i class="mdi mdi-calendar-plus me-2"></i>Asignar a Evento
          </button>
          <button class="btn btn-outline-secondary" onclick="window.print()">
            <i class="mdi mdi-printer me-2"></i>Imprimir
          </button>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header"><h5 class="card-title mb-0">Mantenimiento</h5></div>
        <div class="card-body">
          <div class="d-flex justify-content-between mb-2"><small class="text-muted">Total unidades:</small><span class="fw-medium">{{ $totalUnits }}</span></div>
          <div class="d-flex justify-content-between mb-2"><small class="text-muted">En mantenimiento:</small><span class="fw-medium text-warning">{{ $maintenanceUnits }}</span></div>
          <div class="d-flex justify-content-between mb-3"><small class="text-muted">Asignadas:</small><span class="fw-medium">{{ $assignedUnits }}</span></div>
          <hr class="my-2">
          <a href="{{ route('inventory.detalle', ['id' => $itemParent->id]) }}" class="btn btn-sm btn-outline-secondary w-100">
            <i class="mdi mdi-history me-1"></i>Ver historial del ítem
          </a>
        </div>
      </div>

      <div class="card mb-4">
        <div class="card-header"><h5 class="card-title mb-0">Próximos Eventos</h5></div>
        <div class="card-body">
          <p class="text-muted small mb-0">La integración de eventos para asignación quedará en esta sección.</p>
        </div>
      </div>

      <div class="card">
        <div class="card-header"><h5 class="card-title mb-0">Alertas</h5></div>
        <div class="card-body">
          @if($maintenanceUnits > 0)
            <div class="alert alert-warning mb-0 py-2 px-3">Hay {{ $maintenanceUnits }} unidad(es) en mantenimiento.</div>
          @else
            <div class="text-muted small mb-0">Sin alertas activas.</div>
          @endif
        </div>
      </div>
    </div>
  </div>
</div>
@endsection
