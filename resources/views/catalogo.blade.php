@extends('layouts.main')
@section('title','Catálogo')
@section('leve','Inventario')
@section('subleve','Catalogo')
@section('css')
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/catalogo-inventario.css') }}" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

    <style>
        .btn-outline-secondary { border-color: #b6bcc6 !important; }
        .switch { position: relative; display: inline-block; width: 50px; height: 26px; }
        .switch-input { opacity: 0; width: 0; height: 0; }
    </style>
@endsection

@section('content')
    <meta name="csrf-token" content="{{ csrf_token() }}">

    <div class="container-xxl flex-grow-1 container-p-y">
        <div class="inventory-card-header mb-4">
            <div class="header-info">
                <h4 class="fw-bold py-3 mb-2">
                    <span class="text-muted fw-light">Inventario /</span> Catálogo
                </h4>
            </div>
            <div class="header-controls mb-3">
                <div id="exportContainer" class="me-2"></div>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table id="productos-table" class="table table-bordered w-100">
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
                    </table>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('script')
    <script src="{{ asset('/materialize/assets/js/tables-datatables-basic.js') }}"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.1/js/buttons.html5.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <script>
        window.showAlert = function(message, type = 'info') {
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    text: message,
                    timer: 2500,
                    timerProgressBar: true,
                    showConfirmButton: false,
                    position: 'top-end',
                    toast: true,
                    icon: type,
                });
            }
        };

        $(function () {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

            const table = $('#productos-table').DataTable({
                processing: false,
                serverSide: true,
                deferRender: true,
                searchDelay: 350,
                ajax: {
                    url: '{{ route('catalogo.data') }}',
                    type: 'GET'
                },
                dom: 'Bfrtip',
                buttons: [{
                    extend: 'collection',
                    text: '<i class="mdi mdi-file-export me-1"></i> Exportar',
                    className: 'btn btn-outline-secondary',
                    buttons: [
                        { extend: 'excelHtml5', text: 'Excel', exportOptions: { columns: [1,2,3,4] } },
                        { extend: 'pdfHtml5', text: 'PDF', exportOptions: { columns: [1,2,3,4] }, orientation: 'landscape', pageSize: 'A4' }
                    ]
                }],
                language: {
                    search: 'Buscar:',
                    lengthMenu: 'Mostrar _MENU_ registros',
                    info: 'Mostrando _START_ a _END_ de _TOTAL_ registros',
                    infoEmpty: 'Mostrando 0 registros',
                    infoFiltered: '(filtrado de _MAX_ totales)',
                    zeroRecords: 'No se encontraron resultados',
                    paginate: { first: 'Primero', last: 'Último', next: 'Siguiente', previous: 'Anterior' },
                    processing: ''
                },
                pageLength: 25,
                lengthMenu: [[25,50,100],[25,50,100]],
                order: [[1, 'asc']],
                columns: [
                    {
                        data: 'is_active',
                        orderable: false,
                        searchable: false,
                        render: function (data, type, row) {
                            if (type !== 'display') return data;
                            return `
                                <label class="switch mb-0">
                                    <input
                                        type="checkbox"
                                        class="switch-input toggle-active"
                                        data-id="${row.id}"
                                        data-sku="${row.sku || ''}"
                                        ${data ? 'checked' : ''}
                                    />
                                    <span class="switch-toggle-slider"><span class="switch-on"></span><span class="switch-off"></span></span>
                                </label>`;
                        }
                    },
                    { data: 'sku' },
                    { data: 'name' },
                    {
                        data: 'category',
                        defaultContent: '-',
                        render: function (data) { return data || '-'; }
                    },
                    { data: 'item_id' },
                    {
                        data: 'view_url',
                        orderable: false,
                        searchable: false,
                        render: function (data) {
                            return `<a href="${data}" class="btn btn-icon btn-label-primary waves-effect" title="Ver detalle">
                                        <span class="icon-base icon-22px">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"><path fill="currentColor" d="M1.182 12C2.122 6.88 6.608 3 12 3s9.878 3.88 10.819 9c-.94 5.12-5.427 9-10.819 9s-9.878-3.88-10.818-9M12 17a5 5 0 1 0 0-10a5 5 0 0 0 0 10m0-2a3 3 0 1 1 0-6a3 3 0 0 1 0 6"/></svg>
                                        </span>
                                    </a>`;
                        }
                    }
                ]
            });

            table.buttons().container().appendTo($('#exportContainer'));

            $('#productos-table').on('change', '.toggle-active', async function () {
                const checkbox = this;
                const id = checkbox.dataset.id;
                const sku = checkbox.dataset.sku || 'Sin SKU';
                const isActive = checkbox.checked;
                const actionText = isActive ? 'RE ACTIVAR' : 'DES ACTIVAR';
                const successText = isActive ? 'reactivado' : 'desactivado';

                const confirmation = await Swal.fire({
                    title: `¿Confirmas ${actionText} este SKU?`,
                    text: `SKU: ${sku}`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, confirmar',
                    cancelButtonText: 'Cancelar',
                    reverseButtons: true,
                });

                if (!confirmation.isConfirmed) {
                    checkbox.checked = !isActive;
                    return;
                }

                checkbox.disabled = true;

                try {
                    const response = await fetch(`/catalogo/${id}/toggle-active`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                        },
                        body: JSON.stringify({ is_active: isActive ? 1 : 0 })
                    });

                    const payload = await response.json();
                    if (!response.ok || !payload.success) {
                        throw new Error(payload.message || 'No se pudo actualizar el estado.');
                    }

                    window.showAlert(`SKU ${sku} ${successText} correctamente.`, 'success');
                } catch (error) {
                    checkbox.checked = !isActive;
                    window.showAlert(error.message || 'Error al actualizar el estado.', 'error');
                } finally {
                    checkbox.disabled = false;
                }
            });
        });
    </script>
@endsection
