@extends('layouts.main')
@section('title','Catálogo')
@section('leve','Inventario')
@section('subleve','Catalogo')
@section('css')
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/catalogo-inventario.css') }}" />

    <style>
        .switch {
            position: relative;
            display: inline-block;
            width: 50px;
            height: 26px;
        }

        .switch-input {
            opacity: 0;
            width: 0;
            height: 0;
        }
    </style>
@endsection
@section('content')
    <!-- Content -->
    <div class="container-xxl flex-grow-1 container-p-y">
            
            <!-- Header Principal -->
            <div class="inventory-card-header mb-4">
                <div class="header-info">
                    <h4 class="fw-bold py-3 mb-2">
                    <span class="text-muted fw-light">Inventario /</span> Catálogo
                    </h4>
                </div>
            </div>
        <div class="card">
        <div class="card-body">
            <table id="productos-table" class="table table-bordered">
            <thead>
                <tr>
                <th>Activo</th>
                <th>SKU</th>
                <th>Nombre de Producto</th>
                <th>Categoría</th>
                <th>ID</th>
                <th>Ver</th>
                </tr>
            </thead>
            <tbody>
                @forelse($items as $p)
                <tr>
                <td>
                    <label class="switch">
                        <input 
                        type="checkbox" 
                        class="switch-input toggle-active" 
                        id="prod-{{ $p->id }}"
                        @checked($p->is_active)
                        disabled
                        />
                        <span class="switch-toggle-slider">
                        <span class="switch-on"></span>
                        <span class="switch-off"></span>
                        </span>
                    </label>
                </td>
                <td>{{ $p->sku }}</td>
                <td>{{ $p->name }}</td>
                <td>{{ $p->parent?->category?->name }}</td>
                <td>{{ $p->item_id }}</td>
                <td>
                    <button type="button" class="btn btn-icon btn-label-primary waves-effect" disabled>
                        <span class="icon-base ri ri-check-double-line icon-22px">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M1.182 12C2.122 6.88 6.608 3 12 3s9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9M12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0-2a3 3 0 1 1 0-6a3 3 0 0 1 0 6"/></svg>
                        </span>
                    </button>
                </td>
                </tr>
                @empty
                <tr>
                    <td colspan="6" class="text-center text-muted py-4">No hay productos para mostrar.</td>
                </tr>
                @endforelse
            </tbody>
            </table>
            <div class="mt-3 d-flex justify-content-end">
                {{ $items->links() }}
            </div>
        </div>
        </div>
    </div>
@endsection
@section('script')
@endsection
