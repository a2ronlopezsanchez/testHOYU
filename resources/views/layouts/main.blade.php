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

      <title>@yield('title') |  Black Production </title>

    <meta name="description" content="" />

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="{{ asset('/materialize/assets/img/favicon/Favicon.svg') }}" />

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&ampdisplay=swap"
      rel="stylesheet" />

    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/fonts/materialdesignicons.css') }}" />
    <!-- <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/fonts/flag-icons.css') }}" /> -->

    <!-- Menu waves for no-customizer fix -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/node-waves/node-waves.css') }}" />

    <!-- Core CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/rtl/core.css') }}" class="template-customizer-core-css" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/css/rtl/theme-default.css') }}" class="template-customizer-theme-css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/css/demo.css') }}" />

    <!-- Vendors CSS -->
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/perfect-scrollbar/perfect-scrollbar.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/typeahead-js/typeahead.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/datatables-responsive-bs5/responsive.bootstrap5.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/apex-charts/apex-charts.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/animate-css/animate.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/sweetalert2/sweetalert2.css') }}" />
    <link rel="stylesheet" href="{{ asset('/materialize/assets/vendor/libs/tagify/tagify.css') }}" />
    <!-- Other CSS -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@7.0.96/css/materialdesignicons.min.css">

    <!-- Page CSS -->

    <!-- Helpers -->
    <script src="{{ asset('/materialize/assets/vendor/js/helpers.js') }}"></script>
    <!--! Template customizer & Theme config files MUST be included after core stylesheets and helpers.js in the <head> section -->
    <!--? Template customizer: To hide customizer set displayCustomizer value false in config.js.  -->
    <script src="{{ asset('/materialize/assets/vendor/js/template-customizer.js') }}"></script>
    <!--? Config:  Mandatory theme config file contain global vars & default theme options, Set your preferred theme option in this file.  -->
    <script src="{{ asset('/materialize/assets/js/config.js') }}"></script>


  

    <style>
      #template-customizer{
        display: none !important;
      }
      .app-brand-text.demo {
        font-size: 0.9rem !important;
      }
              /* Fondo gris transparente que cubre toda la pantalla */
      #loading-screen {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5); /* Fondo gris con opacidad */
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999; /* Asegura que el fondo esté encima de otros elementos */
        }

        /* Estilo para el círculo de carga */
        .spinner {
            border: 8px solid rgba(0, 0, 0, 0.1);
            border-top: 8px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
        }

        /* Animación para el círculo de carga */
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
    @yield('css')

  </head>

  <body>
    <!-- Layout wrapper -->
    <div class="layout-wrapper layout-content-navbar">
      <div class="layout-container">
        <!-- Menu -->

        <aside id="layout-menu" class="layout-menu menu-vertical menu bg-menu-theme">
          <div class="app-brand demo">
            <a href="{{route('dashboard')}}" class="app-brand-link">
                <span class="app-brand-logo demo">
                <span style="color: var(--bs-primary)">
                  <img
                  src="{{ asset('/materialize/assets/img/logo/Blk_Logo_Dark.svg') }}"
                  height="50"
                  alt="Mi SVG feliz"
                  data-app-light-img="logo/Blk_Logo_Dark.svg"
                  data-app-dark-img="logo/Blk_Logo_White.svg" />
                  
                </span>
              </span>
              <span class="app-brand-text demo menu-text fw-bold ms-2">Black Productions</span>
            </a>

            <a href="javascript:void(0);" class="layout-menu-toggle menu-link text-large ms-auto">
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.4854 4.88844C11.0081 4.41121 10.2344 4.41121 9.75715 4.88844L4.51028 10.1353C4.03297 10.6126 4.03297 11.3865 4.51028 11.8638L9.75715 17.1107C10.2344 17.5879 11.0081 17.5879 11.4854 17.1107C11.9626 16.6334 11.9626 15.8597 11.4854 15.3824L7.96672 11.8638C7.48942 11.3865 7.48942 10.6126 7.96672 10.1353L11.4854 6.61667C11.9626 6.13943 11.9626 5.36568 11.4854 4.88844Z"
                  fill="currentColor"
                  fill-opacity="0.6" />
                <path
                  d="M15.8683 4.88844L10.6214 10.1353C10.1441 10.6126 10.1441 11.3865 10.6214 11.8638L15.8683 17.1107C16.3455 17.5879 17.1192 17.5879 17.5965 17.1107C18.0737 16.6334 18.0737 15.8597 17.5965 15.3824L14.0778 11.8638C13.6005 11.3865 13.6005 10.6126 14.0778 10.1353L17.5965 6.61667C18.0737 6.13943 18.0737 5.36568 17.5965 4.88844C17.1192 4.41121 16.3455 4.41121 15.8683 4.88844Z"
                  fill="currentColor"
                  fill-opacity="0.38" />
              </svg>
            </a>
          </div>

          <div class="menu-inner-shadow"></div>
          
          <ul class="menu-inner py-1">
             <!-- Inventario -->
            <li class="menu-item 
              @if (trim($__env->yieldContent('leve')) == "Inventario")
                  active open
              @endif">
              <a href="javascript:void(0);" class="menu-link menu-toggle">
                <i class="menu-icon tf-icons mdi mdi-package-variant-closed"></i>
                <div data-i18n="Inventario">Inventario</div>
              </a>
              <ul class="menu-sub">
                <li class="menu-item
                @if (trim($__env->yieldContent('subleve')) == "Catalogo")
                  active 
                @endif
                ">
                  <a href="{{route('catalogo')}}" class="menu-link">
                    <div data-i18n="Catálogo">Catálogo</div>
                  </a>
                </li>   
                <li class="menu-item 
                @if (trim($__env->yieldContent('subleve')) == "Disponibilidad")
                  active 
                @endif">
                  <a href="{{route('dashboard')}}" class="menu-link">
                    <div data-i18n="Disponibilidad">Disponibilidad</div>
                  </a>
                </li>
                
                <li class="menu-item
                @if (trim($__env->yieldContent('subleve')) == "Almacen")
                  active 
                @endif
                ">
                  <a href="/reportes-inventario" class="menu-link">
                    <div data-i18n="Almacén">Almacén</div>
                  </a>
                </li>
              </ul>
            </li>
            <!--Marcas-->
            <li class="menu-item
              @if (trim($__env->yieldContent('leve')) == "Brand")
                  active
              @endif">
              <a href="{{route('brands.index')}}" class="menu-link">
                <i class="menu-icon tf-icons mdi mdi-trademark"></i>
                <div data-i18n="Marcas">Marcas</div>
              </a>
            </li>
             <!--Marcas-->
            <li class="menu-item
              @if (trim($__env->yieldContent('leve')) == "Category")
                  active
              @endif">
              <a href="{{route('categories.index')}}" class="menu-link">
                <i class="menu-icon tf-icons mdi mdi-shape"></i>
                <div data-i18n="Categorías">Categorías</div>
              </a>
            </li>
          </ul>
        </aside>
        <!-- / Menu -->

        <!-- Layout container -->
        <div class="layout-page">
          <!-- Navbar -->

          <nav
            class="layout-navbar container-xxl navbar navbar-expand-xl navbar-detached align-items-center bg-navbar-theme"
            id="layout-navbar">
            <div class="layout-menu-toggle navbar-nav align-items-xl-center me-3 me-xl-0 d-xl-none">
              <a class="nav-item nav-link px-0 me-xl-4" href="javascript:void(0)">
                <i class="mdi mdi-menu mdi-24px"></i>
              </a>
            </div>

            <div class="navbar-nav-right d-flex align-items-center" id="navbar-collapse">
              <!-- Style Switcher -->
              <div class="navbar-nav align-items-center">
                <div class="nav-item dropdown-style-switcher dropdown">
                  <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <i class="mdi mdi-24px"></i>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-bottom dropdown-styles">
                    <li>
                      <a class="dropdown-item" href="javascript:void(0);" data-theme="light">
                        <span class="align-middle"><i class="mdi mdi-weather-sunny me-2"></i>Light</span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="javascript:void(0);" data-theme="dark">
                        <span class="align-middle"><i class="mdi mdi-weather-night me-2"></i>Dark</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <!-- / Style Switcher-->

              <ul class="navbar-nav flex-row align-items-center ms-auto">
                <!-- User -->
                <li class="nav-item navbar-dropdown dropdown-user dropdown">
                  <a class="nav-link dropdown-toggle hide-arrow" href="javascript:void(0);" data-bs-toggle="dropdown">
                    <div class="avatar avatar-online">
                      <img src="{{ asset('/materialize/assets/img/avatars/6.png') }}" alt class="w-px-40 h-auto rounded-circle" />
                    </div>
                  </a>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li>
                      <a class="dropdown-item" href="#">
                        <div class="d-flex">
                          <div class="flex-shrink-0 me-3">
                            <div class="avatar avatar-online">
                              <img src="{{ asset('/materialize/assets/img/avatars/6.png') }}" alt class="w-px-40 h-auto rounded-circle" />
                            </div>
                          </div>
                          <div class="flex-grow-1">
                            <span id="nameLayout" class="fw-medium d-block">{{auth()->user()->name}}</span>
                            <small class="text-muted">{{ auth()->user()->getRoleNames()->first() }}</small>
                          </div>
                        </div>
                      </a>
                    </li>
                    <li>
                      <div class="dropdown-divider"></div>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="mdi mdi-account-outline me-2"></i>
                        <span class="align-middle">Mi perfil</span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="pages-account-settings-account.html">
                        <i class="mdi mdi-cog-outline me-2"></i>
                        <span class="align-middle">Configuración</span>
                      </a>
                    </li>
                    <!--
                    <li>
                      <a class="dropdown-item" href="#">
                        <i class="mdi mdi-cog-outline me-2"></i>
                        <span class="align-middle">Settings</span>
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item" href="#">
                        <span class="d-flex align-items-center align-middle">
                          <i class="flex-shrink-0 mdi mdi-credit-card-outline me-2"></i>
                          <span class="flex-grow-1 align-middle ms-1">Billing</span>
                          <span class="flex-shrink-0 badge badge-center rounded-pill bg-danger w-px-20 h-px-20">4</span>
                        </span>
                      </a>
                    </li>
                    -->
                    <li>
                      <div class="dropdown-divider"></div>
                    </li>
                    <li>
                    
                        <a class="dropdown-item" href="#" onclick="event.preventDefault(); document.getElementById('logout-form').submit();" >
                            <i class="mdi mdi-power me-2"></i>
                            <span class="align-middle">Log Out</span>
                        </a>
                        <form id="logout-form" action="{{ route('logout') }}" method="POST" style="display: none;">
                            @csrf
                        </form>
                      
                    </li>
                  </ul>
                </li>
                <!--/ User -->
              </ul>
            </div>
          </nav>

          <!-- / Navbar -->

          <!-- Content wrapper -->
          <div class="content-wrapper">
            <!-- Fondo de carga y círculo de carga -->
            <div id="loading-screen">
              <div class="spinner"></div>
            </div>
            <!-- Content -->
            @yield('content')


            <!-- / Content -->

            <!-- Footer -->
            <footer class="content-footer footer bg-footer-theme">
              <div class="container-xxl">
                <div
                  class="footer-container d-flex align-items-center justify-content-between py-3 flex-md-row flex-column">
                  <div class="mb-2 mb-md-0">
                    ©
                    <script>
                      document.write(new Date().getFullYear());
                    </script>
                    | Sistema de Gestión Publicitaria :: Desarrollado por Happening. 
                  </div>

                </div>
              </div>
            </footer>
            <!-- / Footer -->

            <div class="content-backdrop fade"></div>
          </div>
          <!-- Content wrapper -->
        </div>
        <!-- / Layout page -->
      </div>

      <!-- Overlay -->
      <div class="layout-overlay layout-menu-toggle"></div>

      <!-- Drag Target Area To SlideIn Menu On Small Screens -->
      <div class="drag-target"></div>
    </div>
    <!-- / Layout wrapper -->

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

   
    <!-- Other JS -->
    <script src="https://cdn.jsdelivr.net/npm/flatpickr"></script>
    <script src="https://cdn.jsdelivr.net/npm/flatpickr/dist/l10n/es.js"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>

    <!-- Vendors JS -->
    <script src="{{ asset('/materialize/assets/vendor/libs/datatables-bs5/datatables-bootstrap5.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/apex-charts/apexcharts.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/swiper/swiper.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/sweetalert2/sweetalert2.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/moment/moment.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/flatpickr/flatpickr.js') }}"></script>
    <script src="{{ asset('/materialize/assets/vendor/libs/tagify/tagify.js') }}"></script>


    <!-- Main JS -->
    <script src="{{ asset('/materialize/assets/js/main.js') }}"></script>




    <!-- Main JS -->
    <!-- Page JS -->
    @yield('script')
    <script>
      $(document).ready(function() {
          $('#loading-screen').hide();
      });

    </script>
  </body>
</html>