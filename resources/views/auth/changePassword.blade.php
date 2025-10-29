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

      <title>Restablecer contraseña | Black Productions by Showtek</title>

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

    <div class="positive-relative">
      <div class="authentication-wrapper authentication-basic">
        <div class="authentication-inner py-4">
          <!--  Two Steps Verification -->
          <div class="card p-2">
            <!-- Logo -->
            <div class="app-brand justify-content-center mt-5">
              <a href="{{route('login')}}" class="app-brand-link gap-2">
                <img
                src="{{ asset('/materialize/assets/img/logo/Black Production.svg') }}"
                class="w-100 pb-4"
                alt="auth-illustration"
                data-app-light-img="logo/Black Production.svg"
                data-app-dark-img="logo/Black Production White.svg" />
              </a>
            </div>
            <!-- /Logo -->
            <!-- Reset Password -->
            <div class="card-body">
              <h4 class="mb-2">Restablecer contraseña 🔒</h4>
              <p class="mb-4">Introduzca su nueva contraseña</p>
              @if ($errors->any())
                  <div class="alert alert-danger">
                      <ul>
                          @foreach ($errors->all() as $error)
                              <li>{{ $error }}</li>
                          @endforeach
                      </ul>
                  </div>
              @endif
              <form method="POST" action="{{ route('newPassword') }}">
                {{ csrf_field() }}
                <input type="hidden" name="email" value="{{ $email }}">
                <div class="mb-3 form-password-toggle">
                  <div class="input-group input-group-merge">
                    <div class="form-floating form-floating-outline">
                      <input
                        type="password"
                        id="password"
                        class="form-control"
                        name="password"
                        placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        aria-describedby="password" />
                      <label for="password">Contraseña</label>
                    </div>
                    <span class="input-group-text cursor-pointer"><i class="mdi mdi-eye-off-outline"></i></span>
                  </div>
                </div>
                <div class="mb-3 form-password-toggle">
                  <div class="input-group input-group-merge">
                    <div class="form-floating form-floating-outline">
                      <input
                        type="password"
                        id="password_confirmation"
                        class="form-control"
                        name="password_confirmation"
                        placeholder="&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;&#xb7;"
                        aria-describedby="password" />
                      <label for="confirm-password">Confirmar contraseña</label>
                    </div>
                    <span class="input-group-text cursor-pointer"><i class="mdi mdi-eye-off-outline"></i></span>
                  </div>
                </div>
                <button class="btn btn-primary d-grid w-100 mb-3">ACEPTAR</button>
                <div class="text-center">
                  <a href="{{route('login')}}" class="d-flex align-items-center justify-content-center">
                    <i class="mdi mdi-chevron-left scaleX-n1-rtl mdi-24px"></i>
                    Regresar al login
                  </a>
                </div>
              </form>
            </div>
          </div>
          <!-- /Reset Password -->
          <img
            alt="mask"
            src="../../assets/img/illustrations/auth-basic-register-mask-light.png"
            class="authentication-image d-none d-lg-block"
            data-app-light-img="illustrations/auth-basic-register-mask-light.png"
            data-app-dark-img="illustrations/auth-basic-register-mask-dark.png" />
        </div>
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
    <script src="{{ asset('/materialize/assets/vendor/libs/cleavejs/cleave.js') }}"></script>

    <!-- Main JS -->
    <script src="{{ asset('/materialize/assets/js/main.js') }}"></script>

    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/pages-auth.js') }}"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Page JS -->
    <script src="{{ asset('/materialize/assets/js/pages-auth.js') }}"></script>
    <script src="{{ asset('/materialize/assets/js/pages-auth-two-steps.js') }}"></script>

    <script>
      document.addEventListener("DOMContentLoaded", function() {
          const inputs = document.querySelectorAll('input.numeral-mask');
      
          // Mover el foco al siguiente campo automáticamente
          inputs.forEach((input, index) => {
              input.addEventListener('input', function() {
                  // Si el valor tiene un dígito, ir al siguiente campo
                  if (this.value.length === 1 && index < inputs.length - 1) {
                      inputs[index + 1].focus();
                  }
              });
      
              // Si se pega un código completo, distribuir los dígitos
              input.addEventListener('paste', function(e) {
                  const paste = (e.clipboardData || window.clipboardData).getData('text');
                  if (paste.length === inputs.length) {
                      for (let i = 0; i < inputs.length; i++) {
                          inputs[i].value = paste[i];
                      }
                  }
                  e.preventDefault();
              });
      
              // Volver al campo anterior si se borra
              input.addEventListener('keydown', function(e) {
                  if (e.key === "Backspace" && this.value === '' && index > 0) {
                      inputs[index - 1].focus();
                  }
              });
          });
      });
    </script>
    
  </body>
</html>