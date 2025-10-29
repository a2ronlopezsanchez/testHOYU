<!doctype html>

<html
  lang="en"
  class="light-style layout-navbar-fixed layout-menu-fixed layout-compact"
  dir="ltr"
  data-theme="theme-default"
  data-assets-path="{{ asset('/materialize/assets') }}/"
  data-template="vertical-menu-template-starter">
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0" />

      <title>Recuperar Contraseña | Black Productions by Showtek</title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('/materialize/assets/img/favicon/Favicon.svg') }}" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&ampdisplay=swap"
      rel="stylesheet" />

    <!-- Icons -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/fonts/materialdesignicons.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/fonts/flag-icons.css') }}" />

    <!-- Menu waves for no-customizer fix -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/node-waves/node-waves.css') }}" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/rtl/core.css') }}" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/rtl/theme-default.css') }}" class="template-customizer-theme-css" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/css/demo.css') }}" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.css') }}" />
    <!-- Vendor -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/@form-validation/form-validation.css') }}" />

    <!-- Page CSS -->
    <!-- Page -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/pages/page-auth.css') }}" />
    <style>
    .panel-logo{
      padding: 0px;
      background: #1a3b3d;
    }
      </style>
    <!-- Helpers -->
    <script src="{{ asset('/materialize/assets/vendor/js/helpers.js') }}"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <!--? Template customizer: To hide customizer set displayCustomizer value false in config.js.  -->
    <script src="{{ asset('/materialize/assets/vendor/js/template-customizer.js') }}"></script>
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
    <script src="{{ asset('/materialize/assets/js/config.js') }}"></script>

  </head>

  <body>
    <!-- Content -->

    <div class="authentication-wrapper authentication-cover">

      <div class="authentication-inner row m-0">
        <!-- /Left Section -->
        <div class="d-none d-lg-flex col-lg-7 col-xl-8 align-items-center justify-content-center panel-logo">
          <img
            src="{{ asset('/materialize/assets/img/illustrations/BP-Background.jpg') }}"
            class="w-100"
            alt="auth-illustration"
            data-app-light-img="illustrations/BP-Background.jpg"
            data-app-dark-img="illustrations/BP-Background.jpg" />
        </div>
        <!-- /Left Section -->
   
        <!-- Login -->
        <div
          class="d-flex col-12 col-lg-5 col-xl-4 align-items-center authentication-bg position-relative py-sm-5 px-4 py-4">
          <div class="w-px-400 mx-auto pt-5 pt-lg-0">
            <img
            src="{{ asset('/materialize/assets/img/logo/Black Production.svg') }}"
            class="w-100 pb-4"
            alt="auth-illustration"
            data-app-light-img="logo/Black Production.svg"
            data-app-dark-img="logo/Black Production White.svg" />
            <h4 class="mb-2">¿Olvidaste tu Contraseña? 🔒</h4>
              <p class="mb-4 text-center">Introduce tu correo electrónico y en breve nos pondremos en contacto para reactivar tu contraseña</p>
                @if ($errors->any())
                    <span class="text-danger mb-4">
                        <ul>
                            @foreach ($errors->all() as $error)
                                <li>{{ $error }}</li>
                            @endforeach
                        </ul>
                    </span>
                @endif
              <form method="POST" action="{{ route('reset_password') }}">
                  @csrf
                <div class="form-floating form-floating-outline mb-3">
                  <input
                    type="email"
                    class="form-control"
                    id="email"
                    name="email"
                    placeholder="Email"
                    value="{{ old('email') }}"
                    required autofocus 
                    />
                  <label for="email">Email</label>
                </div>
                <div class="form-floating form-floating-outline mb-3">
                  <input type="text" id="telefono" class="form-control" name="telefono" pattern="\d{10}" title="El número debe tener exactamente 10 dígitos" placeholder="Teléfono" value="{{ old('telefono') }}" max="10" required autofocus>
                  <label for="telefono">Teléfono</label>
                </div>
                <div class="mb-3">
                  <button class="btn btn-primary d-grid w-100" type="submit">Enviar</button>
                </div>
              </form>
              <div class="text-center">
                    <a href="{{route("login")}}" class="d-flex align-items-center justify-content-center">
                        <i class="mdi mdi-chevron-left scaleX-n1-rtl mdi-24px"></i>
                        Regresa a login
                    </a>
                </div>
            </div>
                  
                </form>
              </div>
          </div>
        </div>
        <!-- /Login -->
      </div>
    </div>

    <!-- / Content -->

    <!-- Core JS -->
    <!-- build:js assets/vendor/js/core.js -->
    <script src="{{ asset('/materialize/assets/vendor/libs/jquery/jquery.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/popper/popper.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/js/bootstrap.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/node-waves/node-waves.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/hammer/hammer.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/i18n/i18n.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/js/menu.js') }}"></script>

    <!-- endbuild -->

    <!-- Vendors JS -->
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/popular.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/@form-validation/auto-focus.js') }}"></script>

    <!-- Main JS -->
    <script src="{{ asset('/materialize/assets/js/main.js') }}"></script>

    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/pages-auth.js') }}"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
      document.getElementById('telefono').addEventListener('input', function (e) {
          // Remover cualquier carácter que no sea un número
          e.target.value = e.target.value.replace(/\D/g, '');
          // Limitar a un máximo de 10 dígitos
          if (e.target.value.length > 10) {
              e.target.value = e.target.value.slice(0, 10);  // Solo permite los primeros 10 caracteres
          }
      });
    </script>
        @if (session('success'))
            <script>
                Swal.fire(
                'Peticion enviada',
                'En breve nos pondremos en contacto para restaurar tu contraseña',
                'success'
                );
            </script>
        @endif
  </body>
</html>