@extends('layouts.main')
@section('title','Catálogo')
@section('leve','Inventario')
@section('subleve','Catalogo')
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
                <div class="header-controls mb-3">
                    <div id="exportContainer" class="me-2"></div>
                    {{-- Botón Nuevo Item a la derecha --}}
                    
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
                @foreach($items as $p)
                <tr>
                <td>
                    <label class="switch">
                        <input 
                        type="checkbox" 
                        class="switch-input toggle-active" 
                        id="prod-{{ $p['id'] }}"
                        @if($p['is_active']) checked @endif
                        />
                        <span class="switch-toggle-slider">
                        <span class="switch-on"></span>
                        <span class="switch-off"></span>
                        </span>
                    </label>
                </td>
                <td>{{ $p['sku'] }}</td>
                <td>{{ $p['name'] }}</td>
                <td>{{ $p->parent?->category?->name }}</td>
                <td>{{ $p['item_id'] }}</td>
                <td>
                    <button type="button" class="btn btn-icon btn-label-primary waves-effect">
                        <span class="icon-base ri ri-check-double-line icon-22px">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M1.182 12C2.122 6.88 6.608 3 12 3s9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9M12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0-2a3 3 0 1 1 0-6a3 3 0 0 1 0 6"/></svg>
                        </span>
                    </button>
                </td>
                </tr>
                @endforeach
            </tbody>
            </table>
        </div>
        </div>
    </div>
@endsection
@section('script')
        <!-- Form Validation -->
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/popular.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/auto-focus.js') }}"></script>

    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/tables-datatables-basic.js') }}"></script>
     <!-- Para Excel necesitas JSZip y buttons.html5.js -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js"></script>
    <!-- DataTables JS/CSS ya cargados en el layout -->
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        window.showAlert = function(message, type = 'info') {
        if (typeof Swal !== 'undefined') {
            const config = {
            text: message,
            timer: 3000,
            timerProgressBar: true,
            showConfirmButton: false,
            position: 'top-end',
            toast: true,
            icon: 'info'
            };
            if (type === 'success') config.icon = 'success';
            else if (type === 'warning') config.icon = 'warning';
            else if (type === 'error') config.icon = 'error';
            Swal.fire(config);
        } else {
            alert(message);
        }
        };
    </script>

    <script>
        $(function () {
        var table = $('#productos-table').DataTable({
            dom: 'Bfrtip',
            buttons: [
            {
                extend: 'collection',
                text: '<i class="mdi mdi-file-export me-1"></i> Exportar',
                className: 'btn btn-outline-secondary',
                buttons: [
                {
                    extend: 'excelHtml5',
                    text: 'Excel',
                    exportOptions: { columns: [1,2,3,4] },
                    action: function (e, dt, button, config) {
                    $.fn.dataTable.ext.buttons.excelHtml5.action.call(this, e, dt, button, config);
                    setTimeout(function () { window.showAlert('Exportación completada exitosamente.', 'success'); }, 150);
                    }
                },
                {
                    extend: 'pdfHtml5',
                    text: 'PDF',
                    exportOptions: { columns: [1,2,3,4] },
                    orientation: 'landscape',
                    pageSize: 'A4',
                    action: function (e, dt, button, config) {
                    $.fn.dataTable.ext.buttons.pdfHtml5.action.call(this, e, dt, button, config);
                    setTimeout(function () {
                        try {
                        window.showAlert
                            ? window.showAlert('Exportación completada exitosamente.', 'success')
                            : (window.app && app.showAlert && app.showAlert('Exportación completada exitosamente.', 'success'));
                        } catch (err) { /* noop */ }
                    }, 150);
                    }
                }
                ]
            }
            ],
            language: {
            search: "Buscar:",
            lengthMenu: "Mostrar _MENU_ registros",
            info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
            infoEmpty: "Mostrando 0 registros",
            infoFiltered: "(filtrado de _MAX_ totales)",
            zeroRecords: "No se encontraron resultados",
            paginate: { first: "Primero", last: "Último", next: "Siguiente", previous: "Anterior" }
            },
            columnDefs: [{ targets: [0,5], searchable: false }],
            pageLength: 25,
            lengthMenu: [[25,50,100,-1],[25,50,100,"Todos"]]
        });

        // Mueve “Exportar”
        table.buttons().container().appendTo($('#exportContainer'));

        // “Nuevo Item”
        $('#addItemBtn').on('click', function () {
            window.location.href = '{{ route("catalogo") }}';
        });
        });
</script>

@endsection