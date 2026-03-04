@extends('layouts.main')
@section('title','Eventos')
@section('leve','Inventario')
@section('subleve','Eventos')

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <h4 class="mb-0">Eventos activos / próximos</h4>
    <a href="{{ url()->previous() }}" class="btn btn-outline-secondary">Volver</a>
  </div>

  <div class="card mb-4">
    <div class="card-header"><h5 class="mb-0">Agregar evento</h5></div>
    <div class="card-body">
      <form method="POST" action="{{ route('inventory.eventos.store') }}" class="row g-3">
        @csrf
        <div class="col-md-4">
          <label class="form-label">Nombre</label>
          <input type="text" name="name" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Cliente</label>
          <input type="text" name="client_name" class="form-control">
        </div>
        <div class="col-md-4">
          <label class="form-label">Estado</label>
          <input type="text" name="status" class="form-control" value="PLANIFICADO">
        </div>
        <div class="col-md-4">
          <label class="form-label">Inicio</label>
          <input type="date" name="start_date" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Fin</label>
          <input type="date" name="end_date" class="form-control" required>
        </div>
        <div class="col-md-4">
          <label class="form-label">Lugar</label>
          <input type="text" name="venue_name" class="form-control">
        </div>
        <div class="col-12">
          <label class="form-label">Dirección</label>
          <input type="text" name="venue_address" class="form-control">
        </div>
        <div class="col-12">
          <label class="form-label">Descripción</label>
          <textarea name="description" class="form-control" rows="2"></textarea>
        </div>
        <div class="col-12 text-end">
          <button class="btn btn-primary" type="submit">Guardar evento</button>
        </div>
      </form>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><h5 class="mb-0">Listado de eventos</h5></div>
    <div class="table-responsive">
      <table class="table table-hover mb-0">
        <thead class="table-light">
          <tr>
            <th>Nombre</th>
            <th>Cliente</th>
            <th>Inicio</th>
            <th>Fin</th>
            <th>Lugar</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          @forelse($events as $event)
            <tr>
              <td>{{ $event->name }}</td>
              <td>{{ $event->client_name ?? '—' }}</td>
              <td>{{ $event->start_date ? $event->start_date->format('d/m/Y') : '—' }}</td>
              <td>{{ $event->end_date ? $event->end_date->format('d/m/Y') : '—' }}</td>
              <td>{{ $event->venue_name ?? $event->venue_address ?? '—' }}</td>
              <td>{{ $event->status ?? '—' }}</td>
            </tr>
          @empty
            <tr><td colspan="6" class="text-center py-4 text-muted">Sin eventos activos.</td></tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>
</div>
@endsection
