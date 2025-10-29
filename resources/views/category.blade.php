@extends('layouts.main')
@section('title','Categorias')
@section('leve','Category')
@section('subleve','Category')
@section('css')
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-checkboxes-jquery/datatables.checkboxes.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.css') }}" />
    <!-- Row Group CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-rowgroup-bs5/rowgroup.bootstrap5.css') }}" />
        <!-- Form Validation -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/@form-validation/form-validation.css') }}" />
   
    
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/catalogo-inventario.css') }}" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    <style>
        .btn-outline-secondary {
            border-color: #b6bcc6 !important;
        }
        .switch {
            position: relative;
            display: inline-block;
            width: 50px; /* ancho del switch */
            height: 26px; /* alto del switch */
        }

        .switch-input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        /* Que nada recorte los menús cerca de la tabla */
        #categoriesTable_wrapper,
        #categoriesTable_wrapper .row,
        .card,
        .card-body,
        .table-responsive {
        overflow: visible !important;
        }

        /* Eleva el menú sobre la tabla/hover */
        .dropdown-menu {
        z-index: 2000; /* > 1000 que usa Bootstrap por defecto */
        }


    </style>
@endsection
@section('content')
    <!-- Content -->
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="container-xxl flex-grow-1 container-p-y">
        <!-- Header Principal -->
        <div class="inventory-card-header mb-4">
            <div class="header-info">
                <h4 class="fw-bold py-3 mb-2">
                    Categorías
                </h4>
            </div>
            <button id="btnAdd" class="btn btn-primary">
                <i class="mdi mdi-plus me-1"></i> Añadir
            </button>
        </div>
        {{-- Importante: para que el dropdown no quede detrás, no recortes overflow --}}
        <div class="card">
            <div class="card-body">
                <div class="table-responsive" style="overflow: visible;">
                    <table id="categoriesTable" class="table table-bordered w-100 align-middle">
                    <thead>
                        <tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Estado</th>
                        <th>Orden</th>
                        <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    </table>
                </div>
            </div>
        </div>
    </div>

    {{-- Modal Crear/Editar --}}
    <div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <form id="categoryForm" class="modal-content">
        <div class="modal-header">
            <h5 class="modal-title" id="modalTitle">Nueva categoría</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
        </div>
        <div class="modal-body">
            <input type="hidden" id="catId">
            <div class="row">

                <div class="col-md-6 mb-3">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="name" 
                                placeholder="Nombre" required>
                        <label>Nombre *</label>
                    </div>
                </div>
            

                <div class="col-md-6 mb-3">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="code" 
                                placeholder="Código" required>
                        <label>Código</label>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div class="form-floating form-floating-outline">
                    <textarea class="form-control" id="description" rows="2"></textarea>
                    <label>Descripción</label>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="icon" placeholder="tag">
                        <label>Icono</label>
                    </div>
                </div>
                <div class="col-md-6 mb-3">
                    <div class="form-floating form-floating-outline">
                        <input type="text" class="form-control" id="color" placeholder="#6c5ce7">
                        <label>Color</label>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6 mb-3">
                    <div class="form-floating form-floating-outline">
                        <input type="number" class="form-control" id="sort_order" value="0">
                        <label>Orden</label>
                    </div>
                </div>
                <div class="col-md-6 mb-3 d-flex align-items-center">
                    <div class="form-check form-switch mt-3">
                        <input class="form-check-input" type="checkbox" id="is_active" checked>
                        <label class="form-check-label" for="is_active">Activo</label>
                    </div>
                </div>
            </div>

        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
            <button type="submit" class="btn btn-primary" id="btnSave">Guardar</button>
        </div>
        </form>
    </div>
    </div>
@endsection
@section('script')
    <!-- Form Validation -->
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/popular.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/auto-focus.js') }}"></script>


    <script>
        function closeOpenDropdowns() {
            document
            .querySelectorAll('[data-bs-toggle="dropdown"][aria-expanded="true"]')
            .forEach(btn => {
            const inst = bootstrap.Dropdown.getInstance(btn);
            if (inst) inst.hide();
            });
        }
        $(function () {
        const csrf = $('meta[name="csrf-token"]').attr('content');

        // DataTable (server-side)
        const table = $('#categoriesTable').DataTable({
            serverSide: true,
            ajax: '{{ route('categories.list') }}',
            order: [[1, 'asc']], // por nombre
            columns: [
            { data: 'code',        name: 'code',        defaultContent: '' },
            { data: 'name',        name: 'name' },
            { data: 'description', name: 'description', defaultContent: '' },
            { data: 'is_active',   name: 'is_active' },
            { data: 'sort_order',  name: 'sort_order', defaultContent: '' },
            {
                data: null,
                orderable: false,
                searchable: false,
                className: 'text-end',
                render: function (row) {
                return `
                <div class="dropdown">
                    <button
                    class="btn btn-outline-secondary btn-sm dropdown-toggle d-inline-flex align-items-center"
                    type="button"
                    data-bs-toggle="dropdown"
                    data-bs-boundary="viewport"
                    data-bs-reference="parent"
                    data-bs-offset="0,8"
                    aria-expanded="false">
                    <i class="mdi mdi-dots-vertical me-1"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow">
                    <li><a href="#" class="dropdown-item btn-edit" data-id="${row.id}">
                        <i class="mdi mdi-pencil-outline me-1"></i> Editar
                    </a></li>
                    <li><a href="#" class="dropdown-item text-danger btn-delete" data-id="${row.id}">
                        <i class="mdi mdi-trash-can-outline me-1"></i> Eliminar
                    </a></li>
                    </ul>
                </div>`;
                }

            }
            ],
            // Búsqueda general ya funciona; si quieres solo por nombre, puedes usar columnDefs.
            language: {
            url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            }
        });
        // Fijar dropdown sobre la tabla sin clipping
        $('#categoriesTable')
        .on('show.bs.dropdown', '.dropdown', function () {
            const $dd   = $(this);
            const $btn  = $dd.find('[data-bs-toggle="dropdown"]');
            const $menu = $dd.find('.dropdown-menu');

            // Guardamos referencia para devolverlo luego
            $dd.data('dd-menu', $menu);

            // Movemos el menú al body
            $('body').append($menu.detach());

            // Posicionamos al pie del botón
            const rect = $btn[0].getBoundingClientRect();
            $menu.css({
            position: 'absolute',
            display : 'block',
            top     : (rect.bottom + window.scrollY) + 'px',
            left    : (rect.right  + window.scrollX - $menu.outerWidth()) + 'px',
            zIndex  : 2000,
            minWidth: Math.max(rect.width, 160) + 'px' // opcional
            });
        })
        .on('hidden.bs.dropdown', '.dropdown', function () {
            const $dd   = $(this);
            const $menu = $dd.data('dd-menu');
            if ($menu && $menu.length) {
            // Devolver al DOM original y limpiar estilos inline
            $dd.append($menu.detach());
            $menu.attr('style', '');
            }
        });

        // Abrir modal Crear
        $('#btnAdd').on('click', function () {
            resetForm();
            $('#modalTitle').text('Nueva categoría');
            $('#categoryModal').modal('show');
        });

        // Editar: obtener y abrir modal
        $(document).on('click', '.btn-edit', function (e) {
            e.preventDefault();
            closeOpenDropdowns();  // <— cierra el menú
            const id = $(this).data('id');

            $.get(`{{ url('categories') }}/${id}`, function (res) {
                resetForm();
                $('#modalTitle').text('Editar categoría');
                $('#catId').val(res.id);
                $('#name').val(res.name);
                $('#code').val(res.code);
                $('#description').val(res.description);
                $('#icon').val(res.icon);
                $('#color').val(res.color);
                $('#sort_order').val(res.sort_order);
                $('#is_active').prop('checked', !!res.is_active);
                $('#categoryModal').modal('show');
            });
        });

        // Guardar (crear/editar)
        $('#categoryForm').on('submit', function (e) {
            e.preventDefault();

            const id = $('#catId').val();
            const payload = {
            name:        $('#name').val().trim(),
            code:        $('#code').val().trim() || null,
            description: $('#description').val().trim() || null,
            icon:        $('#icon').val().trim() || null,
            color:       $('#color').val().trim() || null,
            sort_order:  $('#sort_order').val() ? parseInt($('#sort_order').val(), 10) : null,
            is_active:   $('#is_active').is(':checked') ? 1 : 0,
            _token: csrf
            };

            const method = id ? 'PUT' : 'POST';
            const url    = id ? `{{ url('categories') }}/${id}` : `{{ route('categories.store') }}`;

            $.ajax({
            url, method,
            data: payload,
            success: function () {
                $('#categoryModal').modal('hide');
                table.ajax.reload(null, false);
                toast('Guardado correctamente');
            },
            error: function (xhr) {
                let msg = 'Error al guardar';
                if (xhr.responseJSON && xhr.responseJSON.message) msg = xhr.responseJSON.message;
                toast(msg, 'error');
            }
            });
        });

        $(document).on('click', '.btn-delete', function (e) {
            e.preventDefault();
            closeOpenDropdowns();  // <— cierra el menú

            Swal.fire({
                title: '¿Está seguro de eliminar la categoría?',
                icon: 'warning',
                showCancelButton: true,
                showDenyButton: false,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                reverseButtons: true,
                focusCancel: true,
                buttonsStyling: false,
                customClass: {
                confirmButton: 'btn btn-danger me-2',
                cancelButton: 'btn btn-secondary'
                }
            }).then(result => {
                if (result.isConfirmed) {
                $.ajax({
                    url: `{{ url('categories') }}/${$(e.currentTarget).data('id')}`,
                    method: 'DELETE',
                    data: { _token: $('meta[name="csrf-token"]').attr('content') },
                    success: function () {
                    table.ajax.reload(null, false);
                    toast('Eliminada');
                    },
                    error: function () {
                    toast('No se pudo eliminar', 'error');
                    }
                });
                }
            });
        });

        function resetForm() {
            $('#categoryForm')[0].reset();
            $('#catId').val('');
            // si usas validación visual, limpia estados aquí
        }

        // Toast simple
        function toast(text, icon='success') {
            Swal.fire({
            toast: true, position: 'top-end', showConfirmButton: false,
            timer: 2000, icon, title: text
            });
        }
        });
    </script>
@endsection