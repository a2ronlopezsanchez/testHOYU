@extends('layouts.test')
@section('title','Dashboard')
@section('leve','Dashboard')
@section('css')
@endsection
@section('content')
  <div class="container-xxl flex-grow-1 container-p-y">
    <div class="row gy-4 mb-4">
      <!-- Sales Overview-->
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between flex-wrap gap-3">
            <div class="d-flex gap-3">
              <div class="card-info">
                <h6>Total Espectaculares</h6>
                <h4 class="mb-0"><strong>24</strong></h4>
                <h5 class="mb-0  text-success">+2 nuevos</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between flex-wrap gap-3">
            <div class="d-flex gap-3">
              <div class="card-info">
                <h6>Espectaculares Disponibles</h6>
                <h4 class="mb-0"><strong>8</strong></h4>
                <h5 class="mb-0 text-danger">-3 este mes</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between flex-wrap gap-3">
            <div class="d-flex gap-3">
              <div class="card-info">
                <h6>Vallas Móviles</h6>
                <h4 class="mb-0"><strong>12</strong></h4>
                <h5 class="mb-0">0 cambios</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="card h-100">
          <div class="card-body d-flex justify-content-between flex-wrap gap-3">
            <div class="d-flex gap-3">
              <div class="card-info">
                <h6>Clientes Activos</h6>
                <h4 class="mb-0"><strong>18</strong></h4>
                <h5 class="mb-0  text-success">+2 este mes</h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--/ Sales Overview-->
    </div>
    <!-- Basic Bootstrap Table -->
    <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><strong>Espectaculares Recientes </strong></h5>
          <a href="#" class="text-danger small">Ver todos</a>
        </div>
        <div class="table-responsive text-nowrap">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ubicación</th>
              <th>Tamaño</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody class="table-border-bottom-0">
            <tr>
              <td>
                <span class="fw-medium">ESP-001	</span>
              </td>
              <td>Blvd. San Luis</td>
              <td>
                12 x 7.20 Mts	
              </td>
              <td><span class="badge rounded-pill bg-label-success  me-1">Disponible</span></td>
            </tr>
            <tr>
              <td>
                <span class="fw-medium">ESP-002</span>
              </td>
              <td>Carretera 57</td>
              <td>
                12 x 7.20 Mts	
              </td>
              <td><span class="badge rounded-pill bg-label-success  me-1">Disponible</span></td>
            </tr>
            <tr>
              <td>
                <span class="fw-medium">ESP-003</span>
              </td>
              <td>Km. 186+065</td>
              <td>
                12 x 7.20 Mts	
              </td>
              <td><span class="badge rounded-pill bg-label-danger  me-1">Ocupado</span></td>
            </tr>
            <tr>
              <td>
                <span class="fw-medium">ESP-004</span>
              </td>
              <td>Zona Industrial</td>
              <td>
                10 x 6.00 Mts		
              </td>
              <td><span class="badge rounded-pill bg-label-danger  me-1">Ocupado</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!--/ Basic Bootstrap Table -->

    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><strong>Vallas Móviles en Ruta</strong></h5>
        <a href="#" class="text-danger small">Ver todos</a>
      </div>
      <div class="card-body d-flex justify-content-between flex-wrap gap-3">
        <div class="row g-3">
          <div class="d-flex gap-3 mb-3">
            <div class="avatar">
              <div class="avatar-initial bg-label-danger rounded">
                <span class="mdi mdi-24px fw-bold">VM</span>
              </div>
            </div>
            <div class="card-info">
              <h4 class="mb-0">Valla SLP-001</h4>
              <small>Zona Centro - 4 horas activa</small>
            </div>
          </div>
          <div class="d-flex gap-3 mb-3">
            <div class="avatar">
              <div class="avatar-initial bg-label-danger rounded">
                <span class="mdi mdi-24px fw-bold">VM</span>
              </div>
            </div>
            <div class="card-info">
              <h4 class="mb-0">Valla SLP-002</h4>
              <small>Zona Norte - 2 horas activa</small>
            </div>
          </div>
          <div class="d-flex gap-3 mb-3">
            <div class="avatar">
              <div class="avatar-initial bg-label-danger rounded">
                <span class="mdi mdi-24px fw-bold">VM</span>
              </div>
            </div>
            <div class="card-info">
              <h4 class="mb-0">Valla SLP-003</h4>
              <small>Zona Sur - 5 horas activa</small>
            </div>
          </div>
          <div class="d-flex gap-3 mb-3">
            <div class="avatar">
              <div class="avatar-initial bg-label-danger rounded">
                <span class="mdi mdi-24px fw-bold">VM</span>
              </div>
            </div>
            <div class="card-info">
              <h4 class="mb-0">Valla SLP-004</h4>
              <small>Carretera 57 - 3 horas activa</small>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
@endsection
@section('script')
@endsection