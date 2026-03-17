@extends('layouts.main')
@section('title','Catálogo de Clientes')
@section('leve','Clientes')
@section('subleve','Catalogo')

@section('css')
<link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/clientes.css') }}" />
@endsection

@section('content')
<div class="container-xxl flex-grow-1 container-p-y">

              <!-- Header -->
              <div class="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
                <div>
                  <h4 class="mb-1">Directorio de Clientes</h4>
                  <small class="text-muted">Gestión completa de clientes y prospectos</small>
                </div>
                <div class="d-flex gap-2 flex-wrap">
                  <button class="btn btn-outline-secondary btn-sm" id="exportClientesBtn">
                    <i class="mdi mdi-download me-1"></i>
                    <span class="d-none d-sm-inline">Exportar</span>
                  </button>
                  <a href="{{ route('clientes.formulario') }}?mode=new" class="btn btn-primary btn-sm">
                    <i class="mdi mdi-plus me-1"></i>
                    <span class="d-none d-sm-inline">Nuevo Cliente</span>
                  </a>
                </div>
              </div>

              <!-- Stats cards -->
              <div class="row g-4 mb-4">
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 mb-0 text-primary" id="statTotalClientes">--</div>
                      <small class="text-muted">Total Clientes</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 mb-0 text-success" id="statClientesActivos">--</div>
                      <small class="text-muted">Activos</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 mb-0 text-warning" id="statClientesProspectos">--</div>
                      <small class="text-muted">Prospectos</small>
                    </div>
                  </div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="card h-100">
                    <div class="card-body text-center py-3">
                      <div class="fw-bold fs-3 mb-0 text-info" id="statClientesVip">--</div>
                      <small class="text-muted">VIP</small>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Filtros -->
              <div class="card mb-4">
                <div class="card-body">
                  <div class="row g-3 align-items-center">
                    <div class="col-md-5">
                      <div class="input-group">
                        <span class="input-group-text"><i class="mdi mdi-magnify"></i></span>
                        <input type="text" class="form-control"
                               placeholder="Buscar por nombre, RFC, email o teléfono..."
                               id="clientesSearchInput">
                        <button class="btn btn-outline-secondary d-none" type="button" id="clearClientesSearch">
                          <i class="mdi mdi-close"></i>
                        </button>
                      </div>
                    </div>
                    <div class="col-md-7">
                      <div class="d-flex gap-2 justify-content-md-end flex-wrap">
                        <select class="form-select w-auto" id="tipoClienteFilter">
                          <option value="all">Todos los tipos</option>
                          <option value="Persona Física">Persona Física</option>
                          <option value="Persona Moral">Persona Moral</option>
                        </select>
                        <select class="form-select w-auto" id="statusClienteFilter">
                          <option value="all">Todos los estatus</option>
                          <option value="Activo">Activos</option>
                          <option value="Prospecto">Prospectos</option>
                          <option value="VIP">VIP</option>
                          <option value="Inactivo">Inactivos</option>
                        </select>
                        <select class="form-select w-auto" id="ordenarClienteFilter">
                          <option value="nombre">Ordenar: Nombre</option>
                          <option value="reciente">Más recientes</option>
                          <option value="eventos">Más eventos</option>
                        </select>
                        <button class="btn btn-outline-secondary" id="clearClientesFilters" title="Limpiar filtros">
                          <i class="mdi mdi-refresh"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Tabla -->
              <div class="card">
                <div class="card-header d-flex align-items-center justify-content-between">
                  <div>
                    <h5 class="card-title mb-0">Clientes</h5>
                    <small class="text-muted" id="clientesCountLabel">Cargando...</small>
                  </div>
                  <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-secondary active" id="viewTableBtn" title="Vista tabla">
                      <i class="mdi mdi-view-list"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" id="viewCardsBtn" title="Vista tarjetas">
                      <i class="mdi mdi-view-grid"></i>
                    </button>
                  </div>
                </div>

                <!-- Vista tabla -->
                <div id="viewTable">
                  <div class="table-responsive">
                    <table class="table table-hover mb-0" id="clientesTable">
                      <thead class="table-light">
                        <tr>
                          <th style="width:50px;"></th>
                          <th>CLIENTE</th>
                          <th style="width:130px;">TIPO</th>
                          <th style="width:120px;">RFC</th>
                          <th style="width:160px;">CONTACTO</th>
                          <th style="width:80px;" class="text-center">EVENTOS</th>
                          <th style="width:100px;" class="text-center">ESTATUS</th>
                          <th style="width:100px;" class="text-center">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody id="clientesTableBody">
                        <tr>
                          <td colspan="8" class="text-center py-4">
                            <div class="spinner-border spinner-border-sm text-primary me-2"></div>
                            <span class="text-muted">Cargando clientes...</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <!-- Vista tarjetas -->
                <div id="viewCards" class="d-none">
                  <div class="card-body">
                    <div class="row g-3" id="clientesCardsBody">
                    </div>
                  </div>
                </div>

                <!-- Paginación -->
                <div class="card-footer">
                  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <small class="text-muted">
                      Mostrando <span id="clientesShowingFrom">1</span>–<span id="clientesShowingTo">10</span>
                      de <span id="clientesTotal">0</span> clientes
                    </small>
                    <nav>
                      <ul class="pagination pagination-sm mb-0" id="clientesPagination"></ul>
                    </nav>
                  </div>
                </div>
              </div>

            </div>
</div>

<!-- ══ MODAL: VISTA RÁPIDA CLIENTE ══ -->
    <div class="modal fade" id="quickViewClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="quickViewClienteTitle">Detalle Cliente</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body" id="quickViewClienteBody">
            <div class="text-center py-4">
              <div class="spinner-border text-primary"></div>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-between">
            <button type="button" class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">Cerrar</button>
            <div class="d-flex gap-2">
              <button type="button" class="btn btn-outline-primary" id="quickViewEditBtn">
                <i class="mdi mdi-pencil-outline me-1"></i>Editar
              </button>
              <button type="button" class="btn btn-primary" id="quickViewDetalleBtn">
                <i class="mdi mdi-eye-outline me-1"></i>Ver Perfil Completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══ MODAL: CONFIRMAR ELIMINAR ══ -->
    <div class="modal fade" id="deleteClienteModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header border-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center px-4 pb-4">
            <i class="mdi mdi-alert-circle-outline mdi-48px text-danger d-block mb-3"></i>
            <h5 class="mb-2">¿Eliminar cliente?</h5>
            <p class="text-muted mb-0" id="deleteClienteMsg">
              Esta acción no se puede deshacer.
            </p>
          </div>
          <div class="modal-footer border-0 justify-content-center gap-2">
            <button type="button" class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteClienteBtn">
              <i class="mdi mdi-trash-can-outline me-1"></i>Sí, eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

@endsection

@section('script')
<script src="{{ asset('/materialize/assets/js/modules/bp-modules/catalogo-clientes.js') }}"></script>
@endsection
