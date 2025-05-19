<template>
    <VRow class="match-height">
    <VCol cols="12">
      <!-- Encabezado de la página -->
      <VCard class="mb-6">
        <VCardText>
          <h1 class="text-h4">Gestión de Espectaculares</h1>
          <p class="text-body-1">
            Administra el catálogo de espectaculares, su disponibilidad y ubicaciones.
          </p>
        </VCardText>
      </VCard>
    </VCol>
    </VRow>
  <div class="dashboard">
    <!-- Cabecera -->
    <header class="header">
      <div class="logo">
        <h1>PubliSpace</h1>
      </div>
      <div class="user-menu">
        <span class="user-name">Admin</span>
        <button class="btn-user">
          <i class="mdi mdi-account-circle"></i>
        </button>
      </div>
    </header>

    <!-- Contenido principal -->
    <div class="main-container">
      <!-- Menú lateral -->
      <aside class="sidebar">
        <nav class="menu">
          <div class="menu-header">
            <h3>Menú Principal</h3>
          </div>
          <ul class="menu-items">
            <li class="menu-item active">
              <i class="mdi mdi-view-dashboard"></i>
              <span>Dashboard</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-billboard"></i>
              <span>Espectaculares</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-truck"></i>
              <span>Vallas Móviles</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-account-group"></i>
              <span>Clientes</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-file-document"></i>
              <span>Contratos</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-calendar"></i>
              <span>Calendarios</span>
            </li>
            <li class="menu-item">
              <i class="mdi mdi-cog"></i>
              <span>Configuración</span>
            </li>
          </ul>
        </nav>
      </aside>

      <!-- Área de contenido -->
      <main class="content">
        <div class="page-header">
          <h2>Dashboard</h2>
        </div>

        <!-- Tarjetas de resumen -->
        <div class="summary-cards">
          <div class="card">
            <div class="card-icon bg-blue">
              <i class="mdi mdi-billboard"></i>
            </div>
            <div class="card-content">
              <h3>Espectaculares</h3>
              <p class="card-value">24</p>
              <p class="card-subtitle">18 Disponibles</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-green">
              <i class="mdi mdi-truck"></i>
            </div>
            <div class="card-content">
              <h3>Vallas Móviles</h3>
              <p class="card-value">12</p>
              <p class="card-subtitle">8 En servicio</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-purple">
              <i class="mdi mdi-account-group"></i>
            </div>
            <div class="card-content">
              <h3>Clientes</h3>
              <p class="card-value">45</p>
              <p class="card-subtitle">12 Activos</p>
            </div>
          </div>

          <div class="card">
            <div class="card-icon bg-orange">
              <i class="mdi mdi-file-document"></i>
            </div>
            <div class="card-content">
              <h3>Contratos</h3>
              <p class="card-value">36</p>
              <p class="card-subtitle">8 Por vencer</p>
            </div>
          </div>
        </div>

        <!-- Secciones principales -->
        <div class="main-sections">
          <!-- Espectaculares recientes -->
          <div class="section">
            <div class="section-header">
              <h3>Espectaculares Recientes</h3>
              <button class="btn-outline">Ver todos</button>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Ubicación</th>
                    <th>Tamaño</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>ESP-001</td>
                    <td>Av. Universidad 123</td>
                    <td>12x6 m</td>
                    <td><span class="status available">Disponible</span></td>
                    <td>
                      <button class="btn-icon"><i class="mdi mdi-eye"></i></button>
                      <button class="btn-icon"><i class="mdi mdi-pencil"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>ESP-002</td>
                    <td>Blvd. Salvador Nava 456</td>
                    <td>10x8 m</td>
                    <td><span class="status occupied">Ocupado</span></td>
                    <td>
                      <button class="btn-icon"><i class="mdi mdi-eye"></i></button>
                      <button class="btn-icon"><i class="mdi mdi-pencil"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>ESP-003</td>
                    <td>Carr. a Guadalajara km 5</td>
                    <td>14x7 m</td>
                    <td><span class="status available">Disponible</span></td>
                    <td>
                      <button class="btn-icon"><i class="mdi mdi-eye"></i></button>
                      <button class="btn-icon"><i class="mdi mdi-pencil"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Vallas móviles activas -->
          <div class="section">
            <div class="section-header">
              <h3>Vallas Móviles Activas</h3>
              <button class="btn-outline">Ver todas</button>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Vehículo</th>
                    <th>Ruta</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>VM-001</td>
                    <td>Ford Transit</td>
                    <td>Centro - Zona Norte</td>
                    <td><span class="status active">En ruta</span></td>
                    <td>
                      <button class="btn-icon"><i class="mdi mdi-map-marker"></i></button>
                      <button class="btn-icon"><i class="mdi mdi-eye"></i></button>
                    </td>
                  </tr>
                  <tr>
                    <td>VM-002</td>
                    <td>Mercedes Sprinter</td>
                    <td>Zona Industrial</td>
                    <td><span class="status inactive">Estacionado</span></td>
                    <td>
                      <button class="btn-icon"><i class="mdi mdi-map-marker"></i></button>
                      <button class="btn-icon"><i class="mdi mdi-eye"></i></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      // Aquí irán los datos cuando implementemos la funcionalidad
    }
  },
  methods: {
    // Aquí irán los métodos cuando implementemos la funcionalidad
  }
}
</script>

<style scoped>
/* Estilos básicos para el dashboard */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

/* Estilos para la cabecera */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 100;
}

.logo h1 {
  font-size: 1.5rem;
  color: #e53935;
  font-weight: bold;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.user-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-user {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #555;
  cursor: pointer;
}

/* Estilos para el contenedor principal */
.main-container {
  display: flex;
  flex: 1;
  background-color: #f5f5f5;
}

/* Estilos para la barra lateral */
.sidebar {
  width: 250px;
  background-color: #fff;
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
}

.menu-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #eee;
}

.menu-header h3 {
  font-size: 0.9rem;
  text-transform: uppercase;
  color: #888;
  font-weight: 600;
}

.menu-items {
  list-style: none;
  padding: 0.5rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  background-color: #f9f9f9;
}

.menu-item.active {
  background-color: #e5393510;
  color: #e53935;
  border-left: 3px solid #e53935;
}

.menu-item i {
  font-size: 1.25rem;
}

/* Estilos para el contenido principal */
.content {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.page-header {
  margin-bottom: 1.5rem;
}

.page-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Estilos para las tarjetas de resumen */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.5rem;
  color: #fff;
}

.bg-blue {
  background-color: #2196f3;
}

.bg-green {
  background-color: #4caf50;
}

.bg-purple {
  background-color: #9c27b0;
}

.bg-orange {
  background-color: #ff9800;
}

.card-content h3 {
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
  margin-bottom: 0.25rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #888;
}

/* Estilos para las secciones principales */
.main-sections {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1200px) {
  .main-sections {
    grid-template-columns: 1fr 1fr;
  }
}

.section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eee;
}

.section-header h3 {
  font-size: 1rem;
  font-weight: 600;
}

.btn-outline {
  background: none;
  border: 1px solid #ddd;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline:hover {
  background-color: #f5f5f5;
}

/* Estilos para tablas */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 0.75rem 1.25rem;
  text-align: left;
}

.data-table th {
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  color: #888;
  border-bottom: 1px solid #eee;
}

.data-table tr {
  border-bottom: 1px solid #eee;
}

.data-table tr:last-child {
  border-bottom: none;
}

.status {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.available {
  background-color: #e8f5e9;
  color: #4caf50;
}

.occupied {
  background-color: #ffebee;
  color: #f44336;
}

.active {
  background-color: #e3f2fd;
  color: #2196f3;
}

.inactive {
  background-color: #f5f5f5;
  color: #9e9e9e;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 1rem;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  margin-right: 0.25rem;
}

.btn-icon:hover {
  color: #e53935;
}
</style>
