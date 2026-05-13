@extends('layouts.main')
@section('title', 'Gestión de Eventos')
@section('leve', 'Eventos')
@section('subleve', 'Gestión de Eventos')

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">
  <div class="card">
    <div class="card-body p-0" style="min-height: 80vh;">
      <iframe
        src="{{ asset('materialize/html/horizontal-menu-template/eventos-inventario.html') }}"
        title="Gestión de eventos inventario"
        style="width: 100%; min-height: 80vh; border: 0;"
        loading="lazy"></iframe>
    </div>
  </div>
</div>
@endsection
