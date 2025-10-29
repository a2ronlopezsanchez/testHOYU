/**
 * CATÁLOGO DE INVENTARIO CON DATATABLES
 * Implementación simplificada usando DataTables
 * Autor: Grupo Tangamanga
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    apiUrls: {
        items: 'inventory/items',
        categories: 'inventory/categories',
        brands: 'inventory/brands',
        locations: 'inventory/locations',
        store: 'inventory/items'
    },
    datatable: {
        pageLength: 10,
        responsive: true,
        serverSide: true,
        processing: true
    }
};

// ===== VARIABLES GLOBALES =====
let currentDate = new Date();
let inventoryTable;
let flatpickrInstance = null;
let apiCategories = [];
let apiBrands = [];
let apiLocations = [];

// ===== CLASE PRINCIPAL CON DATATABLES =====
class InventoryCatalogDT {
    constructor() {
        this.tagifyInitialized = false;
        this.init();
    }

    async init() {
        // Configurar event listeners básicos
        this.setupEventListeners();
        this.initializeFlatpickr();
        
        // Cargar configuraciones desde la API
        await this.loadAPIConfigurations();
        
        // Inicializar DataTable
        this.initializeDataTable();
        
        // Inicializar Tagify con datos de la API
        this.initializeTagifyFields();
        
        this.updateDateDisplay();
    }

    // ===== INICIALIZACIÓN DE DATATABLES =====
    initializeDataTable() {
        inventoryTable = $('#inventoryTable').DataTable({
            // Configuración básica
            processing: true,
            serverSide: true,
            responsive: true,
            pageLength: CONFIG.datatable.pageLength,
            
            // URLs y datos
            ajax: {
                url: CONFIG.apiUrls.items,
                type: 'GET',
                data: (d) => {
                    // Parámetros personalizados
                    d.date = currentDate.toISOString().split('T')[0];
                    d.category = this.getCurrentCategory();
                    
                    // Mapear parámetros de DataTables a nuestro formato
                    return {
                        page: Math.floor(d.start / d.length) + 1,
                        per_page: d.length,
                        search: d.search.value,
                        date: d.date,
                        category: d.category,
                        order_column: d.columns[d.order[0].column].data,
                        order_direction: d.order[0].dir
                    };
                },
                dataSrc: (json) => {
                    // Procesar respuesta del servidor
                    json.recordsTotal = json.pagination?.total || 0;
                    json.recordsFiltered = json.pagination?.total || 0;
                    return json.data || [];
                },
                error: (xhr, error, thrown) => {
                    console.warn('Error cargando datos:', error);
                    this.showAlert('Error cargando datos. Mostrando datos de muestra.', 'warning');
                    // Cargar datos de muestra como fallback
                    this.loadSampleData();
                }
            },
            
            // Configuración de columnas
            columns: [
                {
                    // Columna de expansión
                    data: null,
                    orderable: false,
                    searchable: false,
                    width: '30px',
                    className: 'control',
                    defaultContent: '<i class="mdi mdi-plus-circle text-primary"></i>'
                },
                {
                    // Item
                    data: null,
                    title: 'Item',
                    width: '300px',
                    render: (data, type, row) => {
                        const icon = this.getCategoryIcon(row.categoria);
                        const sourceIcon = row.isFromDatabase ? 
                            '<i class="mdi mdi-database text-success ms-1" title="Base de Datos"></i>' : 
                            '<i class="mdi mdi-test-tube text-info ms-1" title="Datos de Muestra"></i>';
                        
                        return `
                            <div class="d-flex align-items-center">
                                <div class="item-thumbnail me-3">
                                    <i class="mdi mdi-${icon}"></i>
                                </div>
                                <div>
                                    <div class="fw-medium text-truncate" style="max-width: 200px;" title="${row.nombreProducto}">
                                        ${row.nombrePublico}${sourceIcon}
                                    </div>
                                    <small class="text-muted">${row.marca} ${row.modelo}</small>
                                </div>
                            </div>
                        `;
                    }
                },
                {
                    // Categoría
                    data: 'categoria',
                    title: 'Categoría',
                    width: '120px',
                    render: (data, type, row) => {
                        return `
                            <div>
                                <span class="fw-medium">${this.getCategoryName(data)}</span>
                                <br><small class="text-muted">${row.familia || ''}</small>
                            </div>
                        `;
                    }
                },
                {
                    // Total
                    data: 'totalUnits',
                    title: 'Total',
                    width: '80px',
                    className: 'text-center',
                    render: (data) => `<span class="fw-bold">${data}</span>`
                },
                {
                    // Disponibles
                    data: null,
                    title: 'Disponibles',
                    width: '90px',
                    className: 'text-center',
                    render: (data, type, row) => {
                        const availability = row.availability || this.calculateAvailability(row);
                        return `<span class="badge bg-success">${availability.available}</span>`;
                    }
                },
                {
                    // Asignados
                    data: null,
                    title: 'Asignados',
                    width: '90px',
                    className: 'text-center',
                    render: (data, type, row) => {
                        const availability = row.availability || this.calculateAvailability(row);
                        return `<span class="badge bg-primary">${availability.assigned}</span>`;
                    }
                },
                {
                    // Mantenimiento
                    data: null,
                    title: 'Mantenimiento',
                    width: '90px',
                    className: 'text-center',
                    render: (data, type, row) => {
                        const availability = row.availability || this.calculateAvailability(row);
                        return `<span class="badge bg-warning">${availability.maintenance}</span>`;
                    }
                },
                {
                    // Acciones
                    data: null,
                    title: 'Acciones',
                    width: '100px',
                    className: 'text-center',
                    orderable: false,
                    searchable: false,
                    render: (data, type, row) => {
                        return `
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                    <i class="mdi mdi-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showItemDetails('${row.id}')">
                                        <i class="mdi mdi-eye me-2"></i>Ver Detalles
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showCalendarView('${row.id}')">
                                        <i class="mdi mdi-calendar me-2"></i>Calendario
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.editItem('${row.id}')">
                                        <i class="mdi mdi-pencil me-2"></i>Editar
                                    </a></li>
                                </ul>
                            </div>
                        `;
                    }
                }
            ],
            
            // Configuración de responsive con detalles expandibles
            responsive: {
                details: {
                    type: 'column',
                    target: 0,
                    renderer: (api, rowIdx, columns) => {
                        const data = api.row(rowIdx).data();
                        return this.createDetailRow(data);
                    }
                }
            },
            
            // Configuración de idioma en español
            language: {
                url: 'https://cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json',
                processing: "Procesando...",
                loadingRecords: "Cargando...",
                emptyTable: "No hay datos disponibles"
            },
            
            // Configuración de búsqueda
            search: {
                delay: 500 // Debounce de 500ms
            },
            
            // Callbacks
            initComplete: () => {
                this.onTableInitComplete();
            },
            drawCallback: () => {
                this.onTableDraw();
            }
        });
    }

    // ===== CARGAR DATOS DE MUESTRA COMO FALLBACK =====
    loadSampleData() {
        // Datos de muestra para cuando la API no esté disponible
        const sampleData = [
            {
                id: 'SM01',
                sku: 'BP001001',
                nombreProducto: 'MICROFONO | SHURE | SM58 | ID MS01',
                nombrePublico: 'Micrófono Shure SM58',
                categoria: 'MICROFONIA',
                marca: 'SHURE',
                modelo: 'SM58',
                familia: 'Micrófonos Dinámicos',
                totalUnits: 12,
                isFromDatabase: false
            },
            {
                id: 'AS02',
                sku: 'BP001002',
                nombreProducto: 'ALTAVOZ | JBL | EON615 | ACTIVO | ID AS02',
                nombrePublico: 'Altavoz JBL EON615',
                categoria: 'AUDIO',
                marca: 'JBL',
                modelo: 'EON615',
                familia: 'Altavoces Activos',
                totalUnits: 8,
                isFromDatabase: false
            },
            {
                id: 'AC03',
                sku: 'BP001003',
                nombreProducto: 'CONSOLA | YAMAHA | MG16XU | 16CH | ID AC03',
                nombrePublico: 'Consola Yamaha MG16XU',
                categoria: 'AUDIO',
                marca: 'YAMAHA',
                modelo: 'MG16XU',
                familia: 'Consolas de Mezcla',
                totalUnits: 2,
                isFromDatabase: false
            }
        ];

        // Limpiar y cargar datos de muestra
        inventoryTable.clear();
        inventoryTable.rows.add(sampleData);
        inventoryTable.draw();
    }

    // ===== CREAR FILA DE DETALLES EXPANDIDA =====
    createDetailRow(data) {
        const availability = data.availability || this.calculateAvailability(data);
        
        return `
            <div class="expanded-detail-container">
                <div class="row mb-3">
                    <div class="col-md-8">
                        <h6 class="mb-2">
                            Unidades de ${data.nombrePublico} • 
                            ${this.formatDate(currentDate)}
                            ${data.isFromDatabase ? '<span class="badge bg-success ms-2">BD</span>' : '<span class="badge bg-info ms-2">Muestra</span>'}
                        </h6>
                    </div>
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-primary" onclick="inventoryCatalog.showItemDetails('${data.id}')">
                            Ver Todos los Detalles
                        </button>
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-6">
                        <h6>Información General</h6>
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <tbody>
                                    <tr><td><strong>SKU:</strong></td><td>${data.sku}</td></tr>
                                    <tr><td><strong>ID:</strong></td><td>${data.id}</td></tr>
                                    <tr><td><strong>Marca:</strong></td><td>${data.marca}</td></tr>
                                    <tr><td><strong>Modelo:</strong></td><td>${data.modelo}</td></tr>
                                    <tr><td><strong>Familia:</strong></td><td>${data.familia}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <h6>Disponibilidad - ${this.formatShortDate(currentDate)}</h6>
                        <div class="row text-center">
                            <div class="col-4">
                                <div class="text-success fw-bold fs-4">${availability.available}</div>
                                <small>Disponibles</small>
                            </div>
                            <div class="col-4">
                                <div class="text-primary fw-bold fs-4">${availability.assigned}</div>
                                <small>Asignados</small>
                            </div>
                            <div class="col-4">
                                <div class="text-warning fw-bold fs-4">${availability.maintenance}</div>
                                <small>Mantenimiento</small>
                            </div>
                        </div>
                        
                        <div class="mt-3">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="inventoryCatalog.showCalendarView('${data.id}')">
                                <i class="mdi mdi-calendar me-1"></i>Ver Calendario
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="inventoryCatalog.editItem('${data.id}')">
                                <i class="mdi mdi-pencil me-1"></i>Editar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== CALLBACKS DE DATATABLES =====
    onTableInitComplete() {
        console.log('DataTable inicializado correctamente');
        this.setupCustomFilters();
    }

    onTableDraw() {
        // Actualizar contadores personalizados si los necesitas
        this.updateCustomCounters();
    }

    // ===== CONFIGURAR FILTROS PERSONALIZADOS =====
    setupCustomFilters() {
        // Filtro de categorías personalizado
        this.updateCategoryButtons();
        
        // Búsqueda personalizada (ya manejada por DataTables)
        $('#searchInput').on('keyup', function() {
            inventoryTable.search(this.value).draw();
        });
    }

    // ===== ACTUALIZAR BOTONES DE CATEGORÍA =====
    updateCategoryButtons() {
        const categoryContainer = document.getElementById('categoryFilters');
        if (!categoryContainer) return;

        // Limpiar y agregar botón "Todos"
        categoryContainer.innerHTML = `
            <button class="btn btn-sm btn-label-primary active" data-category="all">
                Todos
            </button>
        `;

        // Agregar categorías de la API
        apiCategories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'btn btn-sm btn-outline-primary';
            button.setAttribute('data-category', category.code);
            button.innerHTML = `
                ${category.icon ? `<i class="mdi mdi-${category.icon} me-1"></i>` : ''}
                ${category.name}
            `;
            
            button.addEventListener('click', (e) => this.handleCategoryFilter(e));
            categoryContainer.appendChild(button);
        });
    }

    // ===== MANEJAR FILTRO DE CATEGORÍA =====
    handleCategoryFilter(e) {
        // Actualizar botones activos
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        e.target.classList.add('active', 'btn-label-primary');
        e.target.classList.remove('btn-outline-primary');
        
        // Recargar tabla con nueva categoría
        inventoryTable.ajax.reload();
    }

    // ===== OBTENER CATEGORÍA ACTUAL =====
    getCurrentCategory() {
        const activeBtn = document.querySelector('[data-category].active');
        return activeBtn ? activeBtn.dataset.category : 'all';
    }

    // ===== CARGAR CONFIGURACIONES DE API =====
    async loadAPIConfigurations() {
        try {
            // Cargar categorías
            const categoriesResponse = await this.fetchAPI(CONFIG.apiUrls.categories);
            if (categoriesResponse.success) {
                apiCategories = categoriesResponse.data;
            }

            // Cargar marcas
            const brandsResponse = await this.fetchAPI(CONFIG.apiUrls.brands);
            if (brandsResponse.success) {
                apiBrands = brandsResponse.data;
            }

            // Cargar ubicaciones
            const locationsResponse = await this.fetchAPI(CONFIG.apiUrls.locations);
            if (locationsResponse.success) {
                apiLocations = locationsResponse.data;
            }

        } catch (error) {
            console.warn('Error cargando configuraciones de API:', error);
        }
    }

    // ===== MÉTODOS DE FECHAS =====
    changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        this.updateDateDisplay();
        this.updateFlatpickr();
        inventoryTable.ajax.reload(); // Recargar tabla con nueva fecha
    }

    setToday() {
        currentDate = new Date();
        this.updateDateDisplay();
        this.updateFlatpickr();
        inventoryTable.ajax.reload();
    }

    updateDateDisplay() {
        const dateText = currentDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
        
        document.getElementById('selectedDateText').textContent = 
            dateText.charAt(0).toUpperCase() + dateText.slice(1);
    }

    // ===== INICIALIZACIÓN DE FLATPICKR =====
    initializeFlatpickr() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            flatpickrInstance = flatpickr(dateInput, {
                dateFormat: 'Y-m-d',
                defaultDate: currentDate,
                inline: true,
                onChange: (selectedDates) => {
                    if (selectedDates.length > 0) {
                        currentDate = selectedDates[0];
                        this.updateDateDisplay();
                        inventoryTable.ajax.reload();
                        
                        // Cerrar dropdown
                        const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('datePickerBtn'));
                        if (dropdown) dropdown.hide();
                    }
                }
            });
        }
    }

    updateFlatpickr() {
        if (flatpickrInstance) {
            flatpickrInstance.setDate(currentDate, false);
        }
    }

    // ===== EVENT LISTENERS =====
    setupEventListeners() {
        // Navegación de fechas
        document.getElementById('prevDayBtn')?.addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn')?.addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn')?.addEventListener('click', () => this.setToday());
        
        // Botones principales
        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('addItemBtn')?.addEventListener('click', () => this.showAddItemModal());
        document.getElementById('saveItemBtn')?.addEventListener('click', () => this.saveNewItem());
        
        // Limpiar filtros
        document.getElementById('clearAllBtn')?.addEventListener('click', () => this.clearAllFilters());
    }

    // ===== MÉTODOS DE UTILIDAD SIMPLIFICADOS =====
    
    calculateAvailability(item) {
        // Lógica simplificada - en producción usar datos reales
        const total = item.totalUnits || 0;
        const available = Math.floor(total * 0.7); // 70% disponible
        const assigned = Math.floor(total * 0.2);  // 20% asignado
        const maintenance = total - available - assigned; // resto en mantenimiento
        
        return { available, assigned, maintenance, totalUnits: total };
    }

    async fetchAPI(url, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            },
            credentials: 'same-origin'
        };

        const response = await fetch(url, { ...defaultOptions, ...options });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    getCategoryIcon(category) {
        const icons = {
            'MICROFONIA': 'microphone',
            'AUDIO': 'speaker',
            'ILUMINACION': 'lightbulb',
            'VIDEO': 'video',
            'ENERGIA': 'flash',
            'ESTRUCTURA': 'grid',
            'MOBILIARIO': 'table-furniture'
        };
        return icons[category] || 'package-variant';
    }

    getCategoryName(category) {
        const names = {
            'MICROFONIA': 'Microfonía',
            'AUDIO': 'Audio',
            'ILUMINACION': 'Iluminación',
            'VIDEO': 'Video',
            'ENERGIA': 'Energía',
            'ESTRUCTURA': 'Estructura',
            'MOBILIARIO': 'Mobiliario'
        };
        return names[category] || category;
    }

    formatDate(date) {
        return date.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    formatShortDate(date) {
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // ===== MÉTODOS DE MODAL Y FORMULARIOS =====
    
    showItemDetails(itemId) {
        // Obtener datos del item de la tabla
        const rowData = inventoryTable.row(function(idx, data) {
            return data.id === itemId;
        }).data();

        if (!rowData) {
            this.showAlert('Item no encontrado', 'error');
            return;
        }

        // Mostrar modal con detalles completos
        const modal = new bootstrap.Modal(document.getElementById('unitDetailsModal'));
        
        document.getElementById('unitDetailsModalTitle').textContent = 
            `Detalles: ${rowData.nombrePublico}`;
        
        // Llenar información general
        document.getElementById('itemGeneralInfo').innerHTML = `
            <div class="row g-2">
                <div class="col-6"><strong>SKU:</strong> ${rowData.sku}</div>
                <div class="col-6"><strong>ID:</strong> ${rowData.id}</div>
                <div class="col-6"><strong>Marca:</strong> ${rowData.marca}</div>
                <div class="col-6"><strong>Modelo:</strong> ${rowData.modelo}</div>
                <div class="col-6"><strong>Familia:</strong> ${rowData.familia}</div>
                <div class="col-12">
                    ${rowData.isFromDatabase ? 
                        '<span class="badge bg-success">Desde Base de Datos</span>' : 
                        '<span class="badge bg-info">Datos de Muestra</span>'
                    }
                </div>
            </div>
        `;
        
        modal.show();
    }

    showAddItemModal() {
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        
        if (!this.tagifyInitialized) {
            this.initializeTagifyFields();
            this.tagifyInitialized = true;
        }
        
        document.getElementById('addItemForm')?.reset();
        modal.show();
    }

    async saveNewItem() {
        // Lógica simplificada para guardar item
        const formData = new FormData(document.getElementById('addItemForm'));
        
        try {
            const response = await this.fetchAPI(CONFIG.apiUrls.store, {
                method: 'POST',
                body: formData
            });

            if (response.success) {
                bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
                inventoryTable.ajax.reload(); // Recargar tabla
                this.showAlert('Item agregado exitosamente.', 'success');
            }
        } catch (error) {
            this.showAlert('Error al guardar el item.', 'error');
        }
    }

    showCalendarView(itemId) {
        this.showAlert('Vista de calendario en desarrollo.', 'info');
    }

    editItem(itemId) {
        this.showAlert('Función de edición en desarrollo.', 'info');
    }

    exportData() {
        // Exportar datos visibles de la tabla
        const visibleData = inventoryTable.rows({ search: 'applied' }).data().toArray();
        const csvContent = this.convertToCSV(visibleData);
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `inventario_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert('Exportación completada.', 'success');
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = ['SKU', 'Nombre', 'Categoría', 'Marca', 'Modelo', 'Total Unidades'];
        const csvRows = [headers.join(',')];
        
        data.forEach(row => {
            const values = [
                row.sku,
                row.nombrePublico,
                row.categoria,
                row.marca,
                row.modelo,
                row.totalUnits
            ].map(val => `"${val}"`);
            
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    clearAllFilters() {
        // Limpiar búsqueda
        inventoryTable.search('').draw();
        document.getElementById('searchInput').value = '';
        
        // Reset categorías
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        document.querySelector('[data-category="all"]')?.classList.add('active', 'btn-label-primary');
        document.querySelector('[data-category="all"]')?.classList.remove('btn-outline-primary');
        
        inventoryTable.ajax.reload();
        this.showAlert('Filtros limpiados.', 'success');
    }

    updateCustomCounters() {
        // Actualizar contadores personalizados si los necesitas
        const info = inventoryTable.page.info();
        document.getElementById('itemCount').textContent = `${info.recordsDisplay} ítems encontrados`;
    }

    initializeTagifyFields() {
        // Implementación simplificada de Tagify
        // Solo si realmente necesitas funcionalidad de tags avanzada
        console.log('Tagify inicializado');
        this.tagifyInitialized = true;
    }

    showAlert(message, type = 'info') {
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                text: message,
                icon: type,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            });
        } else {
            alert(message);
        }
    }
}

// ===== INICIALIZACIÓN =====
let inventoryCatalog;

document.addEventListener('DOMContentLoaded', function() {
    // Verificar que DataTables esté disponible
    if (typeof $.fn.dataTable === 'undefined') {
        console.error('DataTables no está cargado. Asegúrate de incluir la librería.');
        return;
    }
    
    // Inicializar Flatpickr en español
    if (typeof flatpickr !== 'undefined' && typeof flatpickr.l10ns !== 'undefined') {
        flatpickr.localize(flatpickr.l10ns.es);
    }
    
    // Inicializar el catálogo con DataTables
    inventoryCatalog = new InventoryCatalogDT();
    
    console.log('Catálogo de Inventario con DataTables inicializado correctamente');
});

// ===== FUNCIONES GLOBALES =====
window.inventoryCatalog = {
    showItemDetails: (itemId) => inventoryCatalog.showItemDetails(itemId),
    showCalendarView: (itemId) => inventoryCatalog.showCalendarView(itemId),
    editItem: (itemId) => inventoryCatalog.editItem(itemId),
    toggleItemExpansion: (itemId) => {
        // DataTables maneja la expansión automáticamente con responsive
        const row = inventoryTable.row(function(idx, data) {
            return data.id === itemId;
        });
        
        if (row.child.isShown()) {
            row.child.hide();
        } else {
            row.child.show();
        }
    }
};