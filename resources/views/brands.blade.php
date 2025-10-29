@extends('layouts.main')
@section('title','Marcas')
@section('leve','Brand')
@section('subleve','Listado')
@section('css')
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-buttons-bs5/buttons.bootstrap5.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/@form-validation/form-validation.css') }}" />
  <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/black-production-css/catalogo-inventario.css') }}" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/sweetalert2@11/dist/sweetalert2.min.css">

  <style>
    /* Evitar clipping de dropdowns sobre la tabla */
    #brandsTable_wrapper, #brandsTable_wrapper .row, .card, .card-body, .table-responsive { overflow: visible !important; }
    .dropdown-menu { z-index: 2000; }
  </style>
@endsection

@section('content')
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="container-xxl flex-grow-1 container-p-y">
  <div class="inventory-card-header mb-4">
    <div class="header-info">
      <h4 class="fw-bold py-3 mb-2">Marcas</h4>
    </div>
    <button id="btnAdd" class="btn btn-primary">
      <i class="mdi mdi-plus me-1"></i> Añadir
    </button>
  </div>

  <div class="card">
    <div class="card-body">
      <div class="table-responsive" style="overflow: visible;">
        <table id="brandsTable" class="table table-bordered w-100 align-middle">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Nombre completo</th>
              <th>Website</th>
              <th>Email soporte</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th class="text-end">Acciones</th>
            </tr>
          </thead>
        </table>
      </div>
    </div>
  </div>
</div>

{{-- Modal Crear/Editar --}}
<div class="modal fade" id="brandModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <form id="brandForm" class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTitle">Nueva marca</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <input type="hidden" id="brandId">

        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="name" placeholder="Nombre" required>
              <label>Nombre *</label>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="code" placeholder="Código">
              <label>Código</label>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control" id="full_name" placeholder="Nombre completo">
            <label>Nombre completo</label>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="website" placeholder="https://...">
              <label>Sitio web</label>
            </div>
          </div>
          <div class="col-md-6 mb-3">
            <div class="form-floating form-floating-outline">
              <input type="email" class="form-control" id="support_email" placeholder="soporte@marca.com">
              <label>Email de soporte</label>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6 mb-3">
            <div class="form-floating form-floating-outline">
              <input type="text" class="form-control" id="support_phone" placeholder="+52 55...">
              <label>Teléfono de soporte</label>
            </div>
          </div>
          <div class="col-md-6 mb-3 d-flex align-items-center">
            <div class="form-check form-switch mt-3">
              <input class="form-check-input" type="checkbox" id="is_active" checked>
              <label class="form-check-label" for="is_active">Activo</label>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <div class="form-floating form-floating-outline">
            <input type="text" class="form-control" id="logo_url" placeholder="https://.../logo.png">
            <label>Logo URL</label>
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
  <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/popular.js') }}"></script>
  <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/bootstrap5.js') }}"></script>
  <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/auto-focus.js') }}"></script>
  {{-- Evita incluir aquí "tables-datatables-basic.js" si inicializa de nuevo la tabla --}}

  <script>
  $(function () {
    const csrf = $('meta[name="csrf-token"]').attr('content');

    const table = $('#brandsTable').DataTable({
      serverSide: true,
      ajax: '{{ route('brands.list') }}',
      order: [[1, 'asc']],
      columns: [
        { data: 'code',          name: 'code', defaultContent: '' },
        { data: 'name',          name: 'name' },
        { data: 'full_name',     name: 'full_name', defaultContent: '' },
        {
          data: 'website', name: 'website', defaultContent: '',
          render: function (val) {
            if (!val) return '';
            const safe = $('<div>').text(val).html();
            return `<a href="${safe}" target="_blank" rel="noopener">web</a>`;
          }
        },
        { data: 'support_email', name: 'support_email', defaultContent: '' },
        { data: 'support_phone', name: 'support_phone', defaultContent: '' },
        { data: 'is_active',     name: 'is_active' },
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
                <li>
                  <a href="#" class="dropdown-item btn-edit" data-id="${row.id}">
                    <i class="mdi mdi-pencil-outline me-1"></i> Editar
                  </a>
                </li>
                <li>
                  <a href="#" class="dropdown-item text-danger btn-delete" data-id="${row.id}">
                    <i class="mdi mdi-trash-can-outline me-1"></i> Eliminar
                  </a>
                </li>
              </ul>
            </div>`;
          }
        }
      ],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
      }
    });

    // ========= Fix: dropdown append-to-body para evitar clipping =========
    $('#brandsTable')
      .on('show.bs.dropdown', '.dropdown', function () {
        const $dd   = $(this);
        const $btn  = $dd.find('[data-bs-toggle="dropdown"]');
        const $menu = $dd.find('.dropdown-menu');
        $dd.data('dd-menu', $menu);
        $('body').append($menu.detach());
        const rect = $btn[0].getBoundingClientRect();
        $menu.css({
          position: 'absolute',
          display : 'block',
          top     : (rect.bottom + window.scrollY) + 'px',
          left    : (rect.right  + window.scrollX - $menu.outerWidth()) + 'px',
          zIndex  : 2000,
          minWidth: Math.max(rect.width, 160) + 'px'
        });
      })
      .on('hidden.bs.dropdown', '.dropdown', function () {
        const $dd   = $(this);
        const $menu = $dd.data('dd-menu');
        if ($menu && $menu.length) {
          $dd.append($menu.detach());
          $menu.attr('style', '');
        }
      });

    function closeOpenDropdowns() {
      document.querySelectorAll('[data-bs-toggle="dropdown"][aria-expanded="true"]').forEach(btn => {
        const inst = bootstrap.Dropdown.getInstance(btn);
        if (inst) inst.hide();
      });
    }

    // =================== Crear ===================
    $('#btnAdd').on('click', function () {
      resetForm();
      $('#modalTitle').text('Nueva marca');
      $('#brandModal').modal('show');
    });

    // =================== Editar ===================
    $(document).on('click', '.btn-edit', function (e) {
      e.preventDefault();
      closeOpenDropdowns();
      const id = $(this).data('id');

      $.get(`{{ url('brands') }}/${id}`, function (res) {
        resetForm();
        $('#modalTitle').text('Editar marca');
        $('#brandId').val(res.id);
        $('#name').val(res.name);
        $('#code').val(res.code);
        $('#full_name').val(res.full_name);
        $('#website').val(res.website);
        $('#support_email').val(res.support_email);
        $('#support_phone').val(res.support_phone);
        $('#logo_url').val(res.logo_url);
        $('#is_active').prop('checked', !!res.is_active);
        $('#brandModal').modal('show');
      });
    });

    // =================== Guardar (crear/editar) ===================
    $('#brandForm').on('submit', function (e) {
      e.preventDefault();

      const id = $('#brandId').val();
      const payload = {
        name:           $('#name').val().trim(),
        code:           $('#code').val().trim() || null,
        full_name:      $('#full_name').val().trim() || null,
        website:        $('#website').val().trim() || null,
        support_email:  $('#support_email').val().trim() || null,
        support_phone:  $('#support_phone').val().trim() || null,
        logo_url:       $('#logo_url').val().trim() || null,
        is_active:      $('#is_active').is(':checked') ? 1 : 0,
        _token: csrf
      };

      const method = id ? 'PUT' : 'POST';
      const url    = id ? `{{ url('brands') }}/${id}` : `{{ route('brands.store') }}`;

      $.ajax({
        url, method, data: payload,
        success: function () {
          $('#brandModal').modal('hide');
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

    // =================== Eliminar ===================
    $(document).on('click', '.btn-delete', function (e) {
      e.preventDefault();
      closeOpenDropdowns();
      const id = $(this).data('id');

      Swal.fire({
        title: '¿Está seguro de eliminar la marca?',
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
            url: `{{ url('brands') }}/${id}`,
            method: 'DELETE',
            data: { _token: csrf },
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
      $('#brandForm')[0].reset();
      $('#brandId').val('');
    }

    function toast(text, icon='success') {
      Swal.fire({ toast: true, position: 'top-end', showConfirmButton: false, timer: 2000, icon, title: text });
    }
  });
  </script>
@endsection
