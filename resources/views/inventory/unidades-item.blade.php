@extends('layouts.main')
@section('title','Asignar a Eventos')
@section('leve','Inventario')
@section('subleve','Asignar a Eventos')

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/vista-unidades-item.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
  <div class="card mb-4">
    <div class="card-body d-flex justify-content-between align-items-start flex-wrap gap-3">
      <div>
        <h4 class="mb-1">{{ $itemParent->public_name ?: $itemParent->name }}</h4>
        <div class="text-muted">
          {{ $itemParent->brand->name ?? 'Sin marca' }}
          @if($itemParent->model)
            • {{ $itemParent->model }}
          @endif
          • {{ $itemParent->category->name ?? 'Sin categoría' }}
        </div>
        <small class="text-muted">{{ $inventoryItems->count() }} unidades activas asociadas</small>
      </div>

      <a href="{{ route('inventory.disponibilidad') }}" class="btn btn-outline-secondary">
        <i class="mdi mdi-arrow-left me-1"></i>Volver al catálogo
      </a>
    </div>
  </div>

  <div class="card">
    <div class="card-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Unidades del ítem padre</h5>
      <span class="badge bg-label-primary">Ruta de asignación en construcción</span>
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
          </tr>
        </thead>
        <tbody>
          @forelse($inventoryItems as $index => $unit)
            <tr>
              <td>{{ $index + 1 }}</td>
              <td>{{ $unit->item_id ?: '—' }}</td>
              <td>{{ $unit->serial_number ?: '—' }}</td>
              <td>{{ str_replace('_', ' ', $unit->status) }}</td>
              <td>{{ $unit->condition ?: '—' }}</td>
              <td>{{ $unit->location->name ?? '—' }}</td>
            </tr>
          @empty
            <tr>
              <td colspan="6" class="text-center text-muted py-4">Este ítem padre no tiene unidades activas registradas.</td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
