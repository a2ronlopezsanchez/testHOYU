/**
 * CATÁLOGO DE INVENTARIO - JAVASCRIPT
 * Sistema de gestión de inventario para equipos de producción
 * Autor: Happening Network Media
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    itemsPerPage: 10,
    maxCalendarDays: 28,
    dateFormat: 'es-ES',
    categories: [
        'AUDIO', 'BACKLINE', 'CABLE', 'COMPUTO', 'CONSOLA', 
        'DISPERSOR', 'EXPANSOR', 'LYFT', 'MICROFONIA', 'MIOTOR',
        'PANTALLAS', 'PEDESTALES', 'POWER', 'PROCESADORES', 'SNAKE',
        'UHF', 'UHF', 'VIDEO'
    ],
    brands: [
        'SHURE', 'SENNHEISER', 'JBL', 'YAMAHA', 'MARTIN', 
        'CHAUVET', 'BLACKMAGIC', 'SONY', 'BOSE', 'QSC'
    ],
    locations: ['ALMACEN', 'PICKING', 'TRASLADO', 'EVENTO', 'EXTRAVIADO'],
    statuses: ['ACTIVO', 'INACTIVO', 'DESCOMPUESTO', 'EN REPARACION', 'EXTRAVIADO', 'BAJA']
};

// ===== VARIABLES GLOBALES =====
let currentDate = new Date();
let inventoryData = [];
let filteredData = [];
let currentPage = 1;
let currentCategory = 'all';
let searchTerm = '';
let expandedItems = new Set();
let flatpickrInstance = null;
let currentView = 'table';

// ===== CLASE PRINCIPAL =====
class InventoryCatalog {
    constructor() {
        this.tagifyInitialized = false;
        this.init();
    }

        init() {
            this.generateSampleData();
            this.renderTable();
            this.updateItemCount();
            this.updatePagination();
            
            this.setupEventListeners();
            this.initializeFlatpickr();
            this.initializePerfectScrollbar();
            this.initializeTagifyFields();
            this.updateDateDisplay();
            this.updateClearAllButtonState();
        }

    // ===== INICIALIZACIÓN DE FLATPICKR =====
    initializeFlatpickr() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            flatpickrInstance = flatpickr(dateInput, {
                dateFormat: 'Y-m-d',
                defaultDate: currentDate,
                inline: true,
                onChange: (selectedDates, dateStr) => {
                    if (selectedDates.length > 0) {
                        currentDate = selectedDates[0];
                        this.updateDateDisplay();
                        this.renderTable();
                        
                        // Cerrar dropdown
                        const dropdown = bootstrap.Dropdown.getInstance(document.getElementById('datePickerBtn'));
                        if (dropdown) {
                            dropdown.hide();
                        }
                    }
                }
            });
        }
    }

    // ===== INICIALIZACIÓN DE PERFECT SCROLLBAR =====
    initializePerfectScrollbar() {
        // Solo aplicar Perfect Scrollbar al modal, no a la tabla principal
        const modalBody = document.querySelector('#unitDetailsModal .modal-body');
        if (modalBody && typeof PerfectScrollbar !== 'undefined') {
            new PerfectScrollbar(modalBody, {
                wheelSpeed: 2,
                wheelPropagation: true,
                minScrollbarLength: 20
            });
        }

        // Aplicar Perfect Scrollbar solo a las filas expandidas cuando se expanden
        document.addEventListener('click', (e) => {
            if (e.target.closest('.expand-btn')) {
                setTimeout(() => {
                    const expandedContent = document.querySelector('.expanded-content.show .expanded-inner');
                    if (expandedContent && typeof PerfectScrollbar !== 'undefined') {
                        new PerfectScrollbar(expandedContent, {
                            wheelSpeed: 2,
                            wheelPropagation: true,
                            minScrollbarLength: 20
                        });
                    }
                }, 100);
            }
        });
    }

    // ===== GENERACIÓN DE DATOS DE MUESTRA =====
    generateSampleData() {
        inventoryData = [];
        
        // Datos base con estructura de 21 columnas
        const baseItems = [
            {
                nombre: 'MICROFONO | SHURE | SM58 | ID MS01',
                categoria: 'MICROFONIA',
                marca: 'SHURE',
                modelo: 'SM58',
                units: 12
            },
            {
                nombre: 'ALTAVOZ | JBL | EON615 | ACTIVO | ID AS02',
                categoria: 'AUDIO', 
                marca: 'JBL',
                modelo: 'EON615',
                units: 8
            },
            {
                nombre: 'CONSOLA | YAMAHA | MG16XU | 16CH | ID AC03',
                categoria: 'AUDIO',
                marca: 'YAMAHA', 
                modelo: 'MG16XU',
                units: 2
            },
            {
                nombre: 'LUZ PAR | CHAUVET | SLIMPAR56 | LED RGBA | ID IL04',
                categoria: 'ILUMINACION',
                marca: 'CHAUVET',
                modelo: 'SLIMPAR56', 
                units: 24
            },
            {
                nombre: 'CABEZA MOVIL | MARTIN | MAC250 | BEAM | ID IL05',
                categoria: 'ILUMINACION',
                marca: 'MARTIN',
                modelo: 'MAC250',
                units: 6
            },
            {
                nombre: 'CAMARA | BLACKMAGIC | URSA4K | BROADCAST | ID VC06',
                categoria: 'VIDEO',
                marca: 'BLACKMAGIC',
                modelo: 'URSA4K',
                units: 3
            },
            {
                nombre: 'PROYECTOR | SONY | VPL-FX40 | 4000LM | ID VP07',
                categoria: 'VIDEO',
                marca: 'SONY',
                modelo: 'VPL-FX40',
                units: 4
            },
            {
                nombre: 'GENERADOR | HONDA | EU3000i | 3KW | ID EG08',
                categoria: 'ENERGIA',
                marca: 'HONDA',
                modelo: 'EU3000i',
                units: 2
            },
            {
                nombre: 'TRUSS | GLOBAL | F34 | 2M | ID ET09',
                categoria: 'ESTRUCTURA',
                marca: 'GLOBAL',
                modelo: 'F34-200',
                units: 16
            },
            {
                nombre: 'MESA | LIFETIME | 80565 | PLEGABLE | ID MF10',
                categoria: 'MOBILIARIO',
                marca: 'LIFETIME',
                modelo: '80565',
                units: 10
            },
            {
                nombre: 'MICROFONO | SENNHEISER | E945 | DINAMICO | ID MS11',
                categoria: 'MICROFONIA',
                marca: 'SENNHEISER', 
                modelo: 'E945',
                units: 8
            },
            {
                nombre: 'SUBWOOFER | JBL | SRX818SP | ACTIVO | ID AS12',
                categoria: 'AUDIO',
                marca: 'JBL',
                modelo: 'SRX818SP',
                units: 4
            }
        ];

        baseItems.forEach((baseItem, index) => {
            const item = this.createFullItem(baseItem, index + 1);
            inventoryData.push(item);
        });

        filteredData = [...inventoryData];

        try {
            sessionStorage.setItem('inventoryData', JSON.stringify(inventoryData));
        } catch (e) {
            console.error('No se pudo guardar en sessionStorage');
        }
    }

    createFullItem(baseItem, index) {
        const categoryPrefix = baseItem.categoria.charAt(0);
        const brandPrefix = baseItem.marca.charAt(0);
        const skuNumber = String(index).padStart(6, '0');
        const idNumber = String(index).padStart(2, '0');

        const item = {
            // Columnas principales (21 campos)
            sku: `BP${skuNumber}`,
            nombreProducto: baseItem.nombre,
            id: `${categoryPrefix}${brandPrefix}${idNumber}`,
            categoria: baseItem.categoria,
            marca: baseItem.marca,
            modelo: baseItem.modelo || '',
            familia: this.generateFamily(baseItem.categoria),
            subFamilia: this.generateSubFamily(baseItem.categoria),
            nombrePublico: this.generatePublicName(baseItem),
            color: this.getRandomColor(),
            status: this.getRandomStatus(),
            ubicacion: this.getRandomLocation(),
            unitSet: Math.random() > 0.8 ? 'SET' : 'UNIT',
            rack: this.generateRackPosition(),
            panel: this.generatePanelPosition(),
            identificadorRfid: `RF${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            numeroSerie: `SN${baseItem.marca.substring(0,2).toUpperCase()}${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
            garantiaVigente: Math.random() > 0.3 ? 'SI' : 'NO',
            precioOriginal: this.generatePrice(1000, 50000),
            precioRentaIdeal: this.generatePrice(100, 5000),
            precioRentaMinimo: this.generatePrice(50, 2500),

            // Campos adicionales para funcionalidad
            totalUnits: baseItem.units,
            units: this.generateUnits(baseItem.units, `${categoryPrefix}${brandPrefix}${idNumber}`, baseItem.modelo || 'GENERIC')
        };

        return item;
    }

    generateFamily(categoria) {
        const families = {
            'MICROFONIA': ['Micrófonos Dinámicos', 'Micrófonos Condensador', 'Micrófonos Inalámbricos'],
            'AUDIO': ['Altavoces Activos', 'Subwoofers', 'Consolas de Mezcla', 'Procesadores'],
            'ILUMINACION': ['Luces PAR', 'Cabezas Móviles', 'Luces LED', 'Controladores DMX'],
            'VIDEO': ['Cámaras', 'Proyectores', 'Pantallas', 'Switchers'],
            'ENERGIA': ['Generadores', 'UPS', 'Extensiones', 'Distribuidores'],
            'ESTRUCTURA': ['Trusses', 'Torres', 'Bases', 'Conectores'],
            'MOBILIARIO': ['Mesas', 'Sillas', 'Tarimas', 'Barriers']
        };
        const categoryFamilies = families[categoria] || ['General'];
        return categoryFamilies[Math.floor(Math.random() * categoryFamilies.length)];
    }

    generateSubFamily(categoria) {
        const subFamilies = {
            'MICROFONIA': ['Cardioide', 'Supercardioide', 'Omnidireccional', 'Bidireccional'],
            'AUDIO': ['Portátil', 'Instalación', 'Profesional', 'Compacto'],
            'ILUMINACION': ['RGB', 'RGBA', 'Blanco', 'UV'],
            'VIDEO': ['HD', '4K', 'Full HD', '8K'],
            'ENERGIA': ['Portátil', 'Estacionario', 'Industrial', 'Compacto'],
            'ESTRUCTURA': ['Cuadrado', 'Triangular', 'Circular', 'Personalizado'],
            'MOBILIARIO': ['Plegable', 'Fijo', 'Ajustable', 'Modular']
        };
        const categorySubFamilies = subFamilies[categoria] || ['Estándar'];
        return categorySubFamilies[Math.floor(Math.random() * categorySubFamilies.length)];
    }

    generatePublicName(baseItem) {
        const publicNames = {
            'MICROFONIA': `Micrófono ${baseItem.marca} ${baseItem.modelo}`,
            'AUDIO': `Altavoz ${baseItem.marca} ${baseItem.modelo}`,
            'ILUMINACION': `Luz ${baseItem.marca} ${baseItem.modelo}`,
            'VIDEO': `Equipo Video ${baseItem.marca} ${baseItem.modelo}`,
            'ENERGIA': `Generador ${baseItem.marca} ${baseItem.modelo}`,
            'ESTRUCTURA': `Estructura ${baseItem.marca} ${baseItem.modelo}`,
            'MOBILIARIO': `Mobiliario ${baseItem.marca} ${baseItem.modelo}`
        };
        return publicNames[baseItem.categoria] || `${baseItem.marca} ${baseItem.modelo}`;
    }

    getRandomColor() {
        const colors = ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'AMARILLO'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    getRandomStatus() {
        const statuses = ['ACTIVO', 'ACTIVO', 'ACTIVO', 'ACTIVO', 'INACTIVO', 'DESCOMPUESTO', 'EN REPARACION'];
        return statuses[Math.floor(Math.random() * statuses.length)];
    }

    getRandomLocation() {
        const locations = ['ALMACEN', 'ALMACEN', 'ALMACEN', 'PICKING', 'TRASLADO', 'EVENTO'];
        return locations[Math.floor(Math.random() * locations.length)];
    }

    generateRackPosition() {
        const letters = 'ABCDEFGH';
        const letter = letters[Math.floor(Math.random() * letters.length)];
        const number = Math.floor(Math.random() * 20) + 1;
        const section = Math.floor(Math.random() * 10) + 1;
        return `${letter}${number}-${section}`;
    }

    generatePanelPosition() {
        return `P${Math.floor(Math.random() * 50) + 1}-${Math.floor(Math.random() * 20) + 1}`;
    }

    generatePrice(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    generateUnits(totalUnits, itemId, model) {
        const units = [];
        
        for (let i = 0; i < totalUnits; i++) {
            const unitId = `${itemId}-${String(i + 1).padStart(2, '0')}`;
            const unit = {
                id: unitId,
                numeroSerie: `${model}-${String(1000 + i).padStart(4, '0')}`,
                condicion: this.getRandomCondition(),
                eventos: this.generateRandomEvents(itemId, i)
            };
            units.push(unit);
        }
        
        return units;
    }

    getRandomCondition() {
        const conditions = ['EXCELENTE', 'BUENO', 'BUENO', 'BUENO', 'REGULAR', 'MALO'];
        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    generateRandomEvents(itemId, unitIndex) {
        const events = [];
        const today = new Date();
        const seed = (parseInt(itemId.slice(-2)) * 100) + unitIndex;
        
        // Determinar si esta unidad tendrá eventos
        const hasEvents = seed % 3 !== 0; // 2/3 de las unidades tendrán eventos
        
        if (hasEvents) {
            // Generar entre 1 y 3 eventos
            const numEvents = (seed % 3) + 1;
            
            for (let i = 0; i < numEvents; i++) {
                // Generar fecha en los próximos 30 días
                const eventDay = (seed + i * 7) % 30 + 1;
                const eventDate = new Date(today);
                eventDate.setDate(today.getDate() + eventDay);
                
                // Duración del evento
                const duration = (seed + i) % 5 === 0 ? (seed % 3) + 1 : 1;
                const endDate = new Date(eventDate);
                endDate.setDate(eventDate.getDate() + duration - 1);
                
                const event = {
                    id: `EV-${itemId}-${unitIndex}-${i}`,
                    nombre: `Evento ${['A', 'B', 'C', 'D'][i % 4]}-${seed % 100}`,
                    startDate: new Date(eventDate),
                    endDate: new Date(endDate),
                    ubicacion: ['Arena Ciudad', 'Hotel Palace', 'Centro Convenciones', 'Parque Central'][seed % 4],
                    isMaintenance: false
                };
                
                events.push(event);
            }
        }
        
        // Agregar mantenimiento para algunas unidades
        if (unitIndex % 7 === 0) {
            const maintenanceDate = new Date(today);
            maintenanceDate.setDate(today.getDate() + (seed % 10));
            const maintenanceEnd = new Date(maintenanceDate);
            maintenanceEnd.setDate(maintenanceDate.getDate() + 2);
            
            events.push({
                id: `MANT-${itemId}-${unitIndex}`,
                nombre: 'Mantenimiento Preventivo',
                startDate: new Date(maintenanceDate),
                endDate: new Date(maintenanceEnd),
                ubicacion: 'Taller Técnico',
                isMaintenance: true
            });
        }
        
        return events;
    }
    // ===== CONFIGURACIÓN DE EVENT LISTENERS =====
    setupEventListeners() {
        // Navegación de fechas
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.setToday());
        
        // Búsqueda
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));

        // Botón limpiar búsqueda
        document.getElementById('clearSearchBtn').addEventListener('click', () => this.clearSearch());

        // Botón limpiar todos los filtros
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllFilters());
        
        // Filtros de categoría
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleCategoryFilter(e));
        });
        
        // Botones principales
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('addItemBtn').addEventListener('click', () => this.showAddItemModal());
        
        // Paginación
        document.getElementById('prevPage').addEventListener('click', (e) => {
            e.preventDefault();
            this.changePage(currentPage - 1);
        });
        document.getElementById('nextPage').addEventListener('click', (e) => {
            e.preventDefault(); 
            this.changePage(currentPage + 1);
        });
        
        // Modal events
        document.getElementById('saveItemBtn').addEventListener('click', () => this.saveNewItem());
        
        // Filters
        document.getElementById('clearFilters').addEventListener('click', () => this.clearAllFilters());

        // Preview de imagen (solo si existe)
        const itemImageEl = document.getElementById('itemImage');
        if (itemImageEl) {
            itemImageEl.addEventListener('change', function(e) {
                const file = e.target.files[0];
                const preview = document.getElementById('imagePreview');
                const previewImg = document.getElementById('previewImg');
                
                if (file && preview && previewImg) {
                    // Validar tamaño (2MB = 2 * 1024 * 1024 bytes)
                    if (file.size > 2 * 1024 * 1024) {
                        this.showAlert('La imagen es muy grande. Máximo 2MB permitido.', 'warning');
                        e.target.value = '';
                        preview.style.display = 'none';
                        return;
                    }
                    
                    // Validar tipo
                    if (!file.type.startsWith('image/')) {
                        this.showAlert('Por favor selecciona un archivo de imagen válido.', 'warning');
                        e.target.value = '';
                        preview.style.display = 'none';
                        return;
                    }
                    
                    // Mostrar preview
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        previewImg.src = e.target.result;
                        preview.style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                } else if (preview) {
                    preview.style.display = 'none';
                }
            }.bind(this));
        }

        // Botones de vista
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchToTableView());
        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchToGridView());
        
        // Botón de reportes (solo si existe)
        const reportsBtnEl = document.getElementById('reportsBtn');
        if (reportsBtnEl) {
            reportsBtnEl.addEventListener('click', () => {
                this.showAlert('Función de reportes en desarrollo', 'info');
            });
        }
    }
    
    // ===== MANEJO DE FECHAS =====
    changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        this.updateDateDisplay();
        this.updateFlatpickr();
        this.renderTable();
    }

    setToday() {
        currentDate = new Date();
        this.updateDateDisplay();
        this.updateFlatpickr();
        this.renderTable();
    }

    updateFlatpickr() {
        if (flatpickrInstance) {
            flatpickrInstance.setDate(currentDate, false);
        }
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

    // ===== FILTROS Y BÚSQUEDA =====
    handleSearch(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        
        // Mostrar/ocultar botón de limpiar búsqueda
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchTerm.length > 0) {
            clearSearchBtn.classList.remove('d-none');
        } else {
            clearSearchBtn.classList.add('d-none');
        }
        
        this.applyFilters();
        this.updateClearAllButtonState();
    }

    handleCategoryFilter(e) {
        // Remover clase activa de todos los botones
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        // Activar botón seleccionado
        e.target.classList.add('active', 'btn-label-primary');
        e.target.classList.remove('btn-outline-primary');
        
        currentCategory = e.target.dataset.category;
        this.applyFilters();
        this.updateClearAllButtonState();
    }

    applyFilters() {
        filteredData = inventoryData.filter(item => {
            // Filtro de categoría
            const matchesCategory = currentCategory === 'all' || item.categoria === currentCategory;
            
            // Filtro de búsqueda
            const matchesSearch = !searchTerm || 
                item.nombreProducto.toLowerCase().includes(searchTerm) ||
                item.marca.toLowerCase().includes(searchTerm) ||
                item.modelo.toLowerCase().includes(searchTerm) ||
                item.nombrePublico.toLowerCase().includes(searchTerm);
            
            return matchesCategory && matchesSearch;
        });
        
        currentPage = 1;
        this.renderTable();
        this.updateItemCount();
        this.updatePagination();
    }

    clearAllFilters() {
        // Reset search
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('d-none');
        searchTerm = '';
        
        // Reset category
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        document.querySelector('[data-category="all"]').classList.add('active', 'btn-label-primary');
        document.querySelector('[data-category="all"]').classList.remove('btn-outline-primary');
        currentCategory = 'all';
        
        this.applyFilters();
        this.updateClearAllButtonState();
        
        // Mostrar feedback al usuario
        this.showAlert('Todos los filtros han sido limpiados.', 'success');
    }

    // ===== CÁLCULOS DE DISPONIBILIDAD =====
    calculateAvailability(item) {
        let available = 0;
        let assigned = 0;
        let maintenance = 0;
        
        const dateToCheck = new Date(currentDate);
        dateToCheck.setHours(0, 0, 0, 0);
        
        item.units.forEach(unit => {
            const hasEvent = unit.eventos.some(event => {
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                
                const eventEndDate = new Date(event.endDate);
                eventEndDate.setHours(0, 0, 0, 0);
                
                return dateToCheck >= eventStartDate && dateToCheck <= eventEndDate;
            });
            
            const isInMaintenance = unit.eventos.some(event => {
                if (!event.isMaintenance) return false;
                
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                
                const eventEndDate = new Date(event.endDate);
                eventEndDate.setHours(0, 0, 0, 0);
                
                return dateToCheck >= eventStartDate && dateToCheck <= eventEndDate;
            });
            
            if (isInMaintenance) {
                maintenance++;
            } else if (hasEvent) {
                assigned++;
            } else {
                available++;
            }
        });
        
        return {
            available,
            assigned,
            maintenance,
            totalUnits: item.totalUnits
        };
    }

    getUnitEventsForDate(unit) {
        const dateToCheck = new Date(currentDate);
        dateToCheck.setHours(0, 0, 0, 0);
        
        return unit.eventos.filter(event => {
            const eventStartDate = new Date(event.startDate);
            eventStartDate.setHours(0, 0, 0, 0);
            
            const eventEndDate = new Date(event.endDate);
            eventEndDate.setHours(0, 0, 0, 0);
            
            return dateToCheck >= eventStartDate && dateToCheck <= eventEndDate;
        });
    }

    // ===== RENDERIZADO DE TABLA =====
    renderTable() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = filteredData.slice(startIndex, endIndex);
        
        pageItems.forEach(item => {
            const availability = this.calculateAvailability(item);
            const row = this.createTableRow(item, availability);
            tbody.appendChild(row);
            
            // Crear fila expandible si el item está expandido
            if (expandedItems.has(item.id)) {
                const expandedRow = this.createExpandedRow(item, availability);
                tbody.appendChild(expandedRow);
            }
        });
        
        this.updatePagination();
        if (this.currentView === 'grid') {
            this.renderGrid();
        }
    }

    createTableRow(item, availability) {
        const row = document.createElement('tr');
        row.className = 'table-expandable-row';
        row.dataset.itemId = item.id;
        
        if (expandedItems.has(item.id)) {
            row.classList.add('expanded');
        }
        
        // NUEVA ESTRUCTURA DE TABLA SIMPLIFICADA
        row.innerHTML = `
            <td>
                <button class="btn btn-sm btn-link p-0 expand-btn" data-item-id="${item.id}">
                    <i class="mdi mdi-chevron-right expand-icon ${expandedItems.has(item.id) ? 'rotated' : ''}"></i>
                </button>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="item-thumbnail me-3">
                        <i class="mdi mdi-${this.getCategoryIcon(item.categoria)}"></i>
                    </div>
                    <div>
                        <div class="fw-medium text-truncate" style="max-width: 200px;" title="${item.nombreProducto}">
                            ${this.highlightSearch(item.nombrePublico)}
                        </div>
                        <small class="text-muted">${item.marca} ${item.modelo}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    <span class="fw-medium">${this.getCategoryName(item.categoria)}</span>
                    <br><small class="text-muted">${item.familia}</small>
                </div>
            </td>
            <td class="text-center">
                <span class="fw-bold">${availability.totalUnits}</span>
            </td>
            <td class="text-center">
                <span class="badge bg-success">${availability.available}</span>
            </td>
            <td class="text-center">
                <span class="badge bg-primary">${availability.assigned}</span>
            </td>
            <td class="text-center">
                <span class="badge bg-warning">${availability.maintenance}</span>
            </td>
            <td class="text-center">
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="mdi mdi-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showItemDetails('${item.id}')">
                            <i class="mdi mdi-eye me-2"></i>Ver Detalles del Item
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.editItemBasic('${item.id}')">
                            <i class="mdi mdi-pencil me-2"></i>Editar Item
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-primary" href="#" onclick="inventoryCatalog.addUnitToItem('${item.id}')">
                            <i class="mdi mdi-plus-circle me-2"></i>Agregar Nueva Unidad
                        </a></li>
                    </ul>
                </div>
            </td>
        `;
        
        // Event listener para expandir/colapsar en el botón
        const expandBtn = row.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleItemExpansion(item.id);
        });

        // Event listener para expandir/colapsar en toda la fila
        row.addEventListener('click', (e) => {
            // No expandir si se hace click en el dropdown o sus elementos
            if (e.target.closest('.dropdown') || e.target.closest('.dropdown-menu')) {
                return;
            }
            
            // No expandir si se hace click en enlaces o botones específicos
            if (e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            this.toggleItemExpansion(item.id);
        });

        // Agregar cursor pointer a la fila
        row.style.cursor = 'pointer';

        // Fix para dropdown: forzar posicionamiento correcto
        const dropdownToggle = row.querySelector('.dropdown-toggle');
        if (dropdownToggle) {
            dropdownToggle.addEventListener('show.bs.dropdown', function(e) {
                const dropdown = e.target.closest('.dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                
                // Cambiar a fixed positioning
                if (menu) {
                    menu.style.position = 'fixed';
                    
                    // Calcular posición
                    const rect = e.target.getBoundingClientRect();
                    menu.style.top = `${rect.bottom + 5}px`;
                    menu.style.left = `${rect.right - menu.offsetWidth}px`;
                }
            });
            
            dropdownToggle.addEventListener('hidden.bs.dropdown', function(e) {
                const dropdown = e.target.closest('.dropdown');
                const menu = dropdown.querySelector('.dropdown-menu');
                if (menu) {
                    menu.style.position = '';
                    menu.style.top = '';
                    menu.style.left = '';
                }
            });
        }

        return row;
    }

    createExpandedRow(item, availability) {
        const expandedRow = document.createElement('tr');
        expandedRow.className = 'expanded-content show';
        expandedRow.innerHTML = `
            <td colspan="8">
                <div class="expanded-inner">
                    <div class="row mb-3">
                        <div class="col-md-8">
                            <h6 class="mb-2">
                                Unidades de ${item.nombrePublico} • 
                                ${this.formatDate(currentDate)}
                            </h6>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-primary view-details-btn" data-item-id="${item.id}">
                                Ver Todos los Detalles
                            </button>
                        </div>
                    </div>
                    
                    ${this.createExpandedUnitsTable(item)}
                    
                    <div class="mt-4">
                        <h6 class="mb-3">Vista de Calendario - Disponibilidad</h6>
                        <div class="alert alert-info alert-sm">
                            <i class="mdi mdi-information me-2"></i>
                            Esta vista muestra el % de unidades disponibles por día
                        </div>
                        ${this.createCalendarView(item)}
                    </div>
                </div>
            </td>
        `;

        // Event listener para el botón Ver Todos los Detalles
        setTimeout(() => {
            const viewDetailsBtn = expandedRow.querySelector('.view-details-btn');
            if (viewDetailsBtn) {
                viewDetailsBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    const itemId = viewDetailsBtn.getAttribute('data-item-id');
                    this.showItemDetails(itemId);
                });
            }
            
            // Event listeners para botones de editar unidad en la tabla expandida
            const editBtns = expandedRow.querySelectorAll('.edit-unit-btn');
            editBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const itemId = btn.getAttribute('data-item-id');
                    const unitId = btn.getAttribute('data-unit-id');
                    this.editUnit(itemId, unitId);
                });
            });
        }, 50);

        return expandedRow;
    }

    createExpandedUnitsTable(item) {
        const maxUnitsToShow = 8;
        const unitsToShow = item.units.slice(0, maxUnitsToShow);
        
        let tableHTML = `
            <div class="table-responsive">
                <table class="table table-sm units-table">
                    <thead>
                        <tr>
                            <th>SKU</th>
                            <th>ID Item</th>
                            <th>No. de Serie</th>
                            <th>Status</th>
                            <th>Evento/Ubicación</th>
                            <th>Duración</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        unitsToShow.forEach(unit => {
            const unitEvents = this.getUnitEventsForDate(unit);
            const hasEvent = unitEvents.length > 0;
            const event = hasEvent ? unitEvents[0] : null;
            
            let status, statusClass, eventInfo, duration;
            
            if (hasEvent) {
                if (event.isMaintenance) {
                    status = 'En Mantenimiento';
                    statusClass = 'bg-warning';
                } else {
                    status = 'Asignado';
                    statusClass = 'bg-primary';
                }
                eventInfo = `
                    <div class="fw-medium">${event.nombre}</div>
                    <small class="text-muted">${event.ubicacion}</small>
                `;
                duration = `
                    <div>${this.formatShortDate(event.startDate)}</div>
                    <small class="text-muted">
                        ${event.startDate.toDateString() !== event.endDate.toDateString() 
                          ? `hasta ${this.formatShortDate(event.endDate)}` 
                          : '1 día'}
                    </small>
                `;
            } else {
                status = 'Disponible';
                statusClass = 'bg-success';
                eventInfo = 'Almacén';
                duration = '-';
            }
            
            tableHTML += `
                <tr>
                    <td><code class="text-primary">${item.sku}</code></td>
                    <td><span class="badge bg-label-dark">${unit.id}</span></td>
                    <td>${unit.numeroSerie}</td>
                    <td><span class="badge ${statusClass}">${status}</span></td>
                    <td>${eventInfo}</td>
                    <td>${duration}</td>
                    <td><span class="badge badge-${unit.condicion.toLowerCase()}">${unit.condicion}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary edit-unit-btn" 
                                data-item-id="${item.id}" 
                                data-unit-id="${unit.id}"
                                title="Editar unidad completa">
                            <i class="mdi mdi-pencil"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
            </div>
        `;
        
        if (item.units.length > maxUnitsToShow) {
            tableHTML += `
                <div class="text-center mt-2">
                    <small class="text-muted">
                        Mostrando ${maxUnitsToShow} de ${item.units.length} unidades. 
                        <a href="#" onclick="event.preventDefault(); event.stopPropagation(); inventoryCatalog.showItemDetails('${item.id}'); return false;">Ver todas</a>
                    </small>
                </div>
            `;
        }
        
        return tableHTML;
        // Agregar event listeners después de insertar en el DOM
        setTimeout(() => {
            const viewAllLink = document.querySelector(`.view-all-units-link[data-item-id="${item.id}"]`);
            if (viewAllLink) {
                viewAllLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.showItemDetails(item.id);
                });
            }
            
            // Event listeners para botones de editar unidad
            const editBtns = document.querySelectorAll(`.edit-unit-btn[data-item-id="${item.id}"]`);
            editBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const unitId = btn.getAttribute('data-unit-id');
                    this.editUnit(item.id, unitId);
                });
            });
        }, 100);

    }
    createCalendarView(item) {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 14); // 2 semanas atrás
        
        let calendarHTML = `
            <div class="calendar-header">
                <div class="calendar-header-day">Dom</div>
                <div class="calendar-header-day">Lun</div>
                <div class="calendar-header-day">Mar</div>
                <div class="calendar-header-day">Mié</div>
                <div class="calendar-header-day">Jue</div>
                <div class="calendar-header-day">Vie</div>
                <div class="calendar-header-day">Sáb</div>
            </div>
            <div class="calendar-grid">
        `;
        
        for (let i = 0; i < CONFIG.maxCalendarDays; i++) {
            const dayDate = new Date(startDate);
            dayDate.setDate(startDate.getDate() + i);
            
            // Calcular disponibilidad para este día
            const availability = this.calculateAvailabilityForDate(item, dayDate);
            const availabilityPercent = Math.round((availability.available / availability.totalUnits) * 100);
            
            let availabilityClass;
            if (availabilityPercent === 100) availabilityClass = 'availability-100';
            else if (availabilityPercent >= 60) availabilityClass = 'availability-high';
            else if (availabilityPercent >= 30) availabilityClass = 'availability-medium';
            else if (availabilityPercent > 0) availabilityClass = 'availability-low';
            else availabilityClass = 'availability-none';
            
            const isSelected = dayDate.toDateString() === currentDate.toDateString();
            
            calendarHTML += `
                <div class="calendar-day ${availabilityClass} ${isSelected ? 'selected' : ''}"
                     onclick="inventoryCatalog.selectCalendarDate('${dayDate.toISOString()}')"
                     title="${dayDate.toLocaleDateString()}: ${availabilityPercent}% disponible">
                    <div class="calendar-day-number">${dayDate.getDate()}</div>
                    <div class="calendar-day-percent">${availabilityPercent}%</div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        return calendarHTML;
    }

    calculateAvailabilityForDate(item, date) {
        let available = 0;
        let assigned = 0;
        let maintenance = 0;
        
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        
        item.units.forEach(unit => {
            const hasEvent = unit.eventos.some(event => {
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                
                const eventEndDate = new Date(event.endDate);
                eventEndDate.setHours(0, 0, 0, 0);
                
                return dateToCheck >= eventStartDate && dateToCheck <= eventEndDate;
            });
            
            const isInMaintenance = unit.eventos.some(event => {
                if (!event.isMaintenance) return false;
                
                const eventStartDate = new Date(event.startDate);
                eventStartDate.setHours(0, 0, 0, 0);
                
                const eventEndDate = new Date(event.endDate);
                eventEndDate.setHours(0, 0, 0, 0);
                
                return dateToCheck >= eventStartDate && dateToCheck <= eventEndDate;
            });
            
            if (isInMaintenance) {
                maintenance++;
            } else if (hasEvent) {
                assigned++;
            } else {
                available++;
            }
        });
        
        return {
            available,
            assigned,
            maintenance,
            totalUnits: item.totalUnits
        };
    }

    // ===== FUNCIONES DE UTILIDAD =====
    toggleItemExpansion(itemId) {
        if (expandedItems.has(itemId)) {
            expandedItems.delete(itemId);
        } else {
            expandedItems.add(itemId);
        }
        
        this.renderTable();
        
        // Reinicializar Perfect Scrollbar después de expandir
        setTimeout(() => {
            const expandedContent = document.querySelector('.expanded-content.show .expanded-inner');
            if (expandedContent && typeof PerfectScrollbar !== 'undefined') {
                new PerfectScrollbar(expandedContent, {
                    wheelSpeed: 2,
                    wheelPropagation: false,
                    minScrollbarLength: 20
                });
            }
        }, 100);
    }

    selectCalendarDate(dateString) {
        currentDate = new Date(dateString);
        this.updateDateDisplay();
        this.updateFlatpickr();
        this.renderTable();
    }

    highlightSearch(text) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
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

    getStatusName(status) {
        const names = {
            'ACTIVO': 'Activo',
            'INACTIVO': 'Inactivo',
            'DESCOMPUESTO': 'Descompuesto',
            'EN_REPARACION': 'En Reparación',
            'EXTRAVIADO': 'Extraviado',
            'BAJA': 'Baja'
        };
        return names[status] || status;
    }

    getLocationName(location) {
        const names = {
            'ALMACEN': 'Almacén',
            'PICKING': 'Picking',
            'TRASLADO': 'Traslado',
            'EVENTO': 'Evento',
            'EXTRAVIADO': 'Extraviado'
        };
        return names[location] || location;
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

    // ===== PAGINACIÓN =====
    updatePagination() {
        const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = Math.min(startIndex + CONFIG.itemsPerPage, filteredData.length);
        
        // Actualizar información de paginación
        document.getElementById('showingFrom').textContent = filteredData.length > 0 ? startIndex + 1 : 0;
        document.getElementById('showingTo').textContent = endIndex;
        document.getElementById('totalItems').textContent = filteredData.length;
        
        // Actualizar controles de paginación
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.parentElement.classList.toggle('disabled', currentPage <= 1);
        nextBtn.parentElement.classList.toggle('disabled', currentPage >= totalPages);
    }

    changePage(newPage) {
        const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        currentPage = newPage;
        this.renderTable();
        this.updatePagination();
    }

    updateItemCount() {
        const countText = `${filteredData.length} ítems encontrados`;
        document.getElementById('itemCount').textContent = countText;
    }

    // ===== MODALES =====
    showItemDetails(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) return;
        
        const modal = new bootstrap.Modal(document.getElementById('unitDetailsModal'));
        
        // Actualizar título del modal
        document.getElementById('unitDetailsModalTitle').textContent = 
            `Detalles: ${item.nombrePublico}`;
        
        // Llenar información general
        const generalInfo = document.getElementById('itemGeneralInfo');
        generalInfo.innerHTML = `
            <div class="row g-2">
                <div class="col-6"><strong>SKU:</strong> ${item.sku}</div>
                <div class="col-6"><strong>ID:</strong> ${item.id}</div>
                <div class="col-6"><strong>Marca:</strong> ${item.marca}</div>
                <div class="col-6"><strong>Modelo:</strong> ${item.modelo}</div>
                <div class="col-6"><strong>Familia:</strong> ${item.familia}</div>
                <div class="col-6"><strong>Color:</strong> ${item.color}</div>
                <div class="col-6"><strong>Serie:</strong> ${item.numeroSerie}</div>
                <div class="col-6"><strong>RFID:</strong> ${item.identificadorRfid}</div>
                <div class="col-12"><strong>Ubicación:</strong> ${item.rack} - ${item.panel}</div>
            </div>
        `;
        
        // Información de disponibilidad
        const availability = this.calculateAvailability(item);
        document.getElementById('modalSelectedDate').textContent = this.formatShortDate(currentDate);
        
        const availabilityInfo = document.getElementById('itemAvailabilityInfo');
        availabilityInfo.innerHTML = `
            <div class="row g-2 text-center">
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
        `;
// Tabla de unidades completa
        this.populateModalUnitsTable(item);
        
        modal.show();
    }

    populateModalUnitsTable(item) {
        const tbody = document.getElementById('modalUnitsTableBody');
        tbody.innerHTML = '';
        
        item.units.forEach(unit => {
            const unitEvents = this.getUnitEventsForDate(unit);
            const hasEvent = unitEvents.length > 0;
            const event = hasEvent ? unitEvents[0] : null;
            
            let status, statusClass, eventInfo, duration;
            
            if (hasEvent) {
                if (event.isMaintenance) {
                    status = 'En Mantenimiento';
                    statusClass = 'bg-warning';
                } else {
                    status = 'Asignado';
                    statusClass = 'bg-primary';
                }
                eventInfo = `${event.nombre} - ${event.ubicacion}`;
                duration = `${this.formatShortDate(event.startDate)} - ${this.formatShortDate(event.endDate)}`;
            } else {
                status = 'Disponible';
                statusClass = 'bg-success';
                eventInfo = 'Almacén';
                duration = '-';
            }
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><code class="text-primary">${item.sku}</code></td>
                <td><span class="badge bg-label-dark">${unit.id}</span></td>
                <td>${unit.numeroSerie}</td>
                <td><span class="badge ${statusClass}">${status}</span></td>
                <td>${eventInfo}</td>
                <td>${duration}</td>
                <td><span class="badge badge-${unit.condicion.toLowerCase()}">${unit.condicion}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary edit-unit-modal-btn" 
                            data-item-id="${item.id}" 
                            data-unit-id="${unit.id}"
                            title="Editar unidad completa">
                        <i class="mdi mdi-pencil"></i>
                    </button>
                </td>
            `;
            
        tbody.appendChild(row);
            });
            
            // Agregar event listeners para los botones de editar del modal
            setTimeout(() => {
                const editBtns = tbody.querySelectorAll('.edit-unit-modal-btn');
                editBtns.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const itemId = btn.getAttribute('data-item-id');
                        const unitId = btn.getAttribute('data-unit-id');
                        this.editUnit(itemId, unitId);
                    });
                });
            }, 50);
        }

    showUnitDetailPage(itemId, unitId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('Item no encontrado', 'error');
            return;
        }
        
        // Guardar el item actual en sessionStorage
        try {
            sessionStorage.setItem('currentItem', JSON.stringify(item));
            sessionStorage.setItem('currentUnitId', unitId);
        } catch (e) {
            console.error('No se pudo guardar en sessionStorage');
        }
        
        // Redirigir a la vista de detalle
        window.location.href = `vista-detalle-item.html?id=${itemId}&unitId=${unitId}`;
    }

    showAddItemModal() {
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        
        // Inicializar Tagify si no está inicializado
        if (!this.tagifyInitialized) {
            this.initializeTagifyFields();
            this.tagifyInitialized = true;
        }
        
        // Limpiar formulario
        document.getElementById('addItemForm').reset();
        
        // Limpiar campos Tagify
        if (this.itemCategoryTagify) this.itemCategoryTagify.removeAllTags();
        if (this.itemBrandTagify) this.itemBrandTagify.removeAllTags();
        if (this.itemModelTagify) this.itemModelTagify.removeAllTags();
        if (this.itemFamilyTagify) this.itemFamilyTagify.removeAllTags();
        
        // Remover clases de error
        document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
            el.classList.remove('is-invalid', 'tagify--invalid');
        });
        
        // Resetear título y botón
        document.querySelector('#addItemModal .modal-title').textContent = 'Agregar Nuevo Item (Producto)';
        document.getElementById('saveItemBtn').textContent = 'Guardar y Agregar Unidades';
        
        modal.show();
    }

    saveNewItem() {
        const form = document.getElementById('addItemForm');
        
        // Función para obtener valor único de Tagify
        const getTagifyValue = (tagifyInstance) => {
            if (!tagifyInstance) return '';
            const tags = tagifyInstance.value;
            return tags.length > 0 ? tags[0].value : '';
        };

        // Función para obtener múltiples valores de Tagify
        const getTagifyValues = (tagifyInstance) => {
            if (!tagifyInstance) return [];
            return tagifyInstance.value.map(tag => tag.value);
        };

        // Obtener valores de Tagify
        const categoria = getTagifyValue(this.itemCategoryTagify);
        const marca = getTagifyValue(this.itemBrandTagify);
        const modelos = getTagifyValues(this.itemModelTagify);
        const familias = getTagifyValues(this.itemFamilyTagify);

        // Obtener valores de campos normales
        const itemName = document.getElementById('itemName').value.trim();
        const nombrePublico = document.getElementById('itemPublicName').value.trim();

        // Validar campos requeridos
        let isValid = true;
        let errorMessages = [];

        // Validar campos de texto requeridos
        if (!itemName) {
            document.getElementById('itemName').classList.add('is-invalid');
            errorMessages.push('Nombre del producto es requerido');
            isValid = false;
        } else {
            document.getElementById('itemName').classList.remove('is-invalid');
        }

        // Validar campos Tagify requeridos
        if (!categoria) {
            const categoryContainer = document.querySelector('#itemCategory').closest('.tagify');
            if (categoryContainer) categoryContainer.classList.add('tagify--invalid');
            errorMessages.push('Categoría es requerida');
            isValid = false;
        } else {
            const categoryContainer = document.querySelector('#itemCategory').closest('.tagify');
            if (categoryContainer) categoryContainer.classList.remove('tagify--invalid');
        }

        if (!marca) {
            const brandContainer = document.querySelector('#itemBrand').closest('.tagify');
            if (brandContainer) brandContainer.classList.add('tagify--invalid');
            errorMessages.push('Marca es requerida');
            isValid = false;
        } else {
            const brandContainer = document.querySelector('#itemBrand').closest('.tagify');
            if (brandContainer) brandContainer.classList.remove('tagify--invalid');
        }

        // Mostrar errores si los hay
        if (!isValid) {
            this.showAlert('Por favor, complete todos los campos requeridos:\n' + errorMessages.join('\n'), 'warning');
            return;
        }

        // Generar SKU e ID automáticos
        const categoryPrefix = categoria.charAt(0);
        const brandPrefix = marca.charAt(0);
        const nextIndex = inventoryData.length + 1;
        const skuNumber = String(nextIndex).padStart(6, '0');
        const idNumber = String(nextIndex).padStart(2, '0');

        // Crear nuevo item
        const newItem = {
            sku: `BP${skuNumber}`,
            nombreProducto: itemName,
            id: `${categoryPrefix}${brandPrefix}${idNumber}`,
            categoria: categoria,
            marca: marca,
            modelo: modelos.join(', ') || '',
            familia: familias.join(', ') || this.generateFamily(categoria),
            subFamilia: this.generateSubFamily(categoria),
            nombrePublico: nombrePublico || itemName,
            color: 'NEGRO',
            status: 'ACTIVO',
            ubicacion: 'ALMACEN',
            unitSet: 'UNIT',
            rack: '',
            panel: '',
            identificadorRfid: '',
            numeroSerie: '',
            garantiaVigente: 'NO',
            precioOriginal: 0,
            precioRentaIdeal: 0,
            precioRentaMinimo: 0,
            totalUnits: 0,
            units: []
        };

        try {
            // Agregar a la lista
            inventoryData.unshift(newItem);
            this.applyFilters();

            // Limpiar formulario y campos Tagify
            form.reset();
            
            if (this.itemCategoryTagify) this.itemCategoryTagify.removeAllTags();
            if (this.itemBrandTagify) this.itemBrandTagify.removeAllTags();
            if (this.itemModelTagify) this.itemModelTagify.removeAllTags();
            if (this.itemFamilyTagify) this.itemFamilyTagify.removeAllTags();

            // Remover clases de error
            document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
                el.classList.remove('is-invalid', 'tagify--invalid');
            });

            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
            modal.hide();

            // Preguntar si quiere agregar unidades
            if (typeof Swal !== 'undefined') {
                Swal.fire({
                    title: 'Item creado exitosamente',
                    text: '¿Desea agregar unidades individuales ahora?',
                    icon: 'success',
                    showCancelButton: true,
                    confirmButtonText: 'Sí, agregar unidades',
                    cancelButtonText: 'No, lo haré después'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = `formulario-item-completo.html?parentItem=${newItem.id}&mode=newUnit`;
                    }
                });
            } else {
                this.showAlert(`Item "${newItem.nombrePublico}" creado exitosamente.`, 'success');
            }
            
            console.log('Nuevo item agregado:', newItem);

        } catch (error) {
            console.error('Error al agregar item:', error);
            this.showAlert('Ocurrió un error al agregar el item. Por favor, inténtelo de nuevo.', 'error');
        }
    }
    // ===== NUEVAS FUNCIONES PARA ARQUITECTURA ITEM/UNIDAD =====
    
    // Editar información básica del ITEM (modal rápido)
    editItemBasic(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) return;
        
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        
        // Inicializar Tagify si no está inicializado
        if (!this.tagifyInitialized) {
            this.initializeTagifyFields();
            this.tagifyInitialized = true;
        }
        
        // Prellenar datos del item
        document.getElementById('itemName').value = item.nombreProducto;
        document.getElementById('itemPublicName').value = item.nombrePublico;
        
        // Prellenar campos Tagify
        if (this.itemCategoryTagify && item.categoria) {
            this.itemCategoryTagify.removeAllTags();
            this.itemCategoryTagify.addTags([item.categoria]);
        }
        
        if (this.itemBrandTagify && item.marca) {
            this.itemBrandTagify.removeAllTags();
            this.itemBrandTagify.addTags([item.marca]);
        }
        
        if (this.itemModelTagify && item.modelo) {
            this.itemModelTagify.removeAllTags();
            this.itemModelTagify.addTags([item.modelo]);
        }
        
        if (this.itemFamilyTagify && item.familia) {
            this.itemFamilyTagify.removeAllTags();
            this.itemFamilyTagify.addTags([item.familia]);
        }
        
        // Cambiar título y botón
        document.querySelector('#addItemModal .modal-title').textContent = 'Editar Item';
        document.getElementById('saveItemBtn').textContent = 'Guardar Cambios';
        
        // Modificar el comportamiento del botón guardar
        const saveBtn = document.getElementById('saveItemBtn');
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);

        newSaveBtn.addEventListener('click', () => {
            // Redirigir al formulario completo en modo edición
            window.location.href = `formulario-item-completo.html?id=${itemId}&mode=edit`;
        });
        
        modal.show();
    }
    
    // Actualizar información básica del item
    updateItemBasic(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) return;
        
        // Función para obtener valor único de Tagify
        const getTagifyValue = (tagifyInstance) => {
            if (!tagifyInstance) return '';
            const tags = tagifyInstance.value;
            return tags.length > 0 ? tags[0].value : '';
        };
        
        // Obtener nuevos valores
        const itemName = document.getElementById('itemName').value.trim();
        const nombrePublico = document.getElementById('itemPublicName').value.trim();
        const categoria = getTagifyValue(this.itemCategoryTagify);
        const marca = getTagifyValue(this.itemBrandTagify);
        const modelo = getTagifyValue(this.itemModelTagify);
        const familia = getTagifyValue(this.itemFamilyTagify);
        
        // Validar campos requeridos
        if (!itemName || !categoria || !marca) {
            this.showAlert('Por favor, complete todos los campos requeridos.', 'warning');
            return;
        }
        
        // Actualizar item
        item.nombreProducto = itemName;
        item.nombrePublico = nombrePublico || itemName;
        item.categoria = categoria;
        item.marca = marca;
        item.modelo = modelo;
        item.familia = familia;
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
        modal.hide();
        
        // Refrescar tabla
        this.applyFilters();
        
        this.showAlert(`Item "${item.nombrePublico}" actualizado exitosamente.`, 'success');
    }
    
    // Agregar nueva unidad a un ITEM existente
    addUnitToItem(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('Item no encontrado.', 'error');
            return;
        }
        
        // Redirigir al formulario completo en modo "nueva unidad"
        window.location.href = `formulario-item-completo.html?parentItem=${itemId}&mode=newUnit`;
    }
    
    // Editar UNIDAD específica (formulario completo)
    editUnit(itemId, unitId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) {
            this.showAlert('Item no encontrado.', 'error');
            return;
        }
        
        const unit = item.units.find(u => u.id === unitId);
        if (!unit) {
            this.showAlert('Unidad no encontrada.', 'error');
            return;
        }
        
        // Redirigir a la vista de detalle de la unidad
        this.showUnitDetailPage(itemId, unitId);
    }

    showCalendarView(itemId) {
        // Por ahora solo expandir el item para mostrar el calendario
        if (!expandedItems.has(itemId)) {
            expandedItems.add(itemId);
            this.renderTable();
        }
    }

    // ===== EXPORTACIÓN =====
    exportData() {
        const dataToExport = filteredData.map(item => ({
            SKU: item.sku,
            'Nombre del Producto': item.nombreProducto,
            ID: item.id,
            Categoría: item.categoria,
            Marca: item.marca,
            Modelo: item.modelo,
            'Nombre Público': item.nombrePublico,
            Estado: item.status,
            Ubicación: item.ubicacion,
            'Total Unidades': item.totalUnits,
            'Precio Original': item.precioOriginal,
            'Precio Renta Ideal': item.precioRentaIdeal,
            'Precio Renta Mínimo': item.precioRentaMinimo
        }));
        
        // Convertir a CSV
        const csvContent = this.convertToCSV(dataToExport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        // Descargar archivo
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `inventario_catalogo_${this.formatShortDate(new Date()).replace(/\//g, '-')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showAlert('Exportación completada exitosamente.', 'success');
    }

    convertToCSV(data) {
        if (!data.length) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Agregar headers
        csvRows.push(headers.join(','));
        
        // Agregar filas
        data.forEach(row => {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    // ===== UTILIDADES DE UI =====
    showAlert(message, type = 'info') {
        // Crear alerta usando SweetAlert2 si está disponible, sino usar alert nativo
        if (typeof Swal !== 'undefined') {
            const config = {
                text: message,
                timer: 3000,
                timerProgressBar: true,
                showConfirmButton: false,
                position: 'top-end',
                toast: true
            };
            
            switch (type) {
                case 'success':
                    config.icon = 'success';
                    break;
                case 'warning':
                    config.icon = 'warning';
                    break;
                case 'error':
                    config.icon = 'error';
                    break;
                default:
                    config.icon = 'info';
            }
            
            Swal.fire(config);
        } else {
            alert(message);
        }
    }

    showLoading(show = true) {
        const table = document.getElementById('inventoryTable');
        if (show) {
            table.classList.add('table-loading');
        } else {
            table.classList.remove('table-loading');
        }
    }

    // Nueva función para limpiar solo la búsqueda
    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('d-none');
        searchTerm = '';
        this.applyFilters();
        this.updateClearAllButtonState();
    }

    // Actualizar el estado del botón limpiar todo
    updateClearAllButtonState() {
        const clearAllBtn = document.getElementById('clearAllBtn');
        const hasActiveFilters = searchTerm || currentCategory !== 'all';
        
        if (hasActiveFilters) {
            clearAllBtn.classList.add('has-active-filters');
            clearAllBtn.style.borderColor = 'var(--bs-primary)';
            clearAllBtn.style.color = 'var(--bs-primary)';
        } else {
            clearAllBtn.classList.remove('has-active-filters');
            clearAllBtn.style.borderColor = '#d9dee3';
            clearAllBtn.style.color = '#697a8d';
        }
    }

    // ===== VISTAS DE TABLA Y GRID =====
    
    // Cambiar a vista de tabla
    switchToTableView() {
        document.getElementById('tableView').classList.remove('d-none');
        document.getElementById('gridView').classList.add('d-none');
        
        // Actualizar botones
        document.getElementById('tableViewBtn').classList.add('active');
        document.getElementById('cardViewBtn').classList.remove('active');
        
        this.currentView = 'table';
        this.renderCurrentView();
    }

    // Cambiar a vista de grid
    switchToGridView() {
        document.getElementById('tableView').classList.add('d-none');
        document.getElementById('gridView').classList.remove('d-none');
        
        // Actualizar botones
        document.getElementById('tableViewBtn').classList.remove('active');
        document.getElementById('cardViewBtn').classList.add('active');
        
        this.currentView = 'grid';
        this.renderCurrentView();
    }

    // Renderizar vista actual
    renderCurrentView() {
        if (this.currentView === 'grid') {
            this.renderGrid();
        } else {
            this.renderTable();
        }
    }

    // Renderizar vista de grid
    renderGrid() {
        const gridBody = document.getElementById('inventoryGridBody');
        gridBody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = filteredData.slice(startIndex, endIndex);
        
        pageItems.forEach(item => {
            const availability = this.calculateAvailability(item);
            const card = this.createItemCard(item, availability);
            gridBody.appendChild(card);
        });
        
        this.updatePagination();
    }

    // Crear tarjeta de item
    createItemCard(item, availability) {
        const colDiv = document.createElement('div');
        colDiv.className = 'inventory-grid-col mb-4';
        
        const cardDiv = document.createElement('div');
        cardDiv.className = 'inventory-item-card';
        cardDiv.dataset.itemId = item.id;
        
        if (expandedItems.has(item.id)) {
            cardDiv.classList.add('expanded');
        }
        
        cardDiv.innerHTML = `
            <div class="item-card-header">
                <div class="d-flex align-items-start justify-content-between">
                    <div class="d-flex align-items-center flex-grow-1">
                        <div class="item-thumbnail-large me-3">
                            <i class="mdi mdi-${this.getCategoryIcon(item.categoria)}"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-1 text-truncate" title="${item.nombreProducto}">
                                ${this.highlightSearch(item.nombrePublico)}
                            </h6>
                            <small class="text-muted">${item.marca} ${item.modelo}</small>
                            <span class="badge bg-label-secondary">${this.getCategoryName(item.categoria)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="item-card-body">
                <div class="row text-center">
                    <div class="col-4">
                        <div class="availability-badge">
                            <div class="availability-number text-dark">${availability.totalUnits}</div>
                            <div class="availability-label">Total</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="availability-badge">
                            <div class="availability-number text-success">${availability.available}</div>
                            <div class="availability-label">Disponibles</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="availability-badge">
                            <div class="availability-number text-primary">${availability.assigned}</div>
                            <div class="availability-label">Asignados</div>
                        </div>
                    </div>
                </div>
                
                ${availability.maintenance > 0 ? `
                    <div class="text-center mt-2">
                        <span class="badge bg-warning">${availability.maintenance} en mantenimiento</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="item-card-footer">
                <div class="d-flex justify-content-between align-items-center">
                        <div class="dropdown dropup">
                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                                    type="button" 
                                    data-bs-toggle="dropdown"
                                    data-bs-auto-close="true"
                                    data-bs-offset="0,10"
                                    aria-expanded="false">
                                <i class="mdi mdi-dots-vertical"></i>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end shadow-lg">
                            <li><a class="dropdown-item" href="#" class="inventoryCatalog.showItemDetails('${item.id}')">
                                <i class="mdi mdi-eye me-2"></i>Ver Detalles
                            </a></li>
                            <li><a class="dropdown-item" href="#" class="inventoryCatalog.showCalendarView('${item.id}')">
                                <i class="mdi mdi-calendar me-2"></i>Calendario
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.editItemBasic('${item.id}')">
                                <i class="mdi mdi-pencil me-2"></i>Editar Item
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-primary" href="#" onclick="inventoryCatalog.addUnitToItem('${item.id}')">
                                <i class="mdi mdi-plus-circle me-2"></i>Agregar Unidad
                            </a></li>
                        </ul>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="inventoryCatalog.toggleItemExpansion('${item.id}')">
                        <i class="mdi mdi-${expandedItems.has(item.id) ? 'chevron-up' : 'chevron-down'}"></i>
                        ${expandedItems.has(item.id) ? 'Menos' : 'Más'} info
                    </button>
                </div>
            </div>
            
            ${expandedItems.has(item.id) ? this.createCardExpandedContent(item) : ''}
        `;
        
        // Event listener para hacer click en la tarjeta
        cardDiv.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown') || e.target.closest('.dropdown-menu') || e.target.closest('button')) {
                return;
            }
            this.toggleItemExpansion(item.id);
        });
        
        colDiv.appendChild(cardDiv);
        return colDiv;
    }

    // Crear contenido expandido para tarjetas
    createCardExpandedContent(item) {
        return `
            <div class="border-top">
                <div class="item-card-body">
                    <h6 class="mb-3">Información detallada</h6>
                    <div class="item-details-grid">
                        <div class="item-detail-item">
                            <div class="item-detail-label">ID</div>
                            <div class="item-detail-value">${item.id}</div>
                        </div>
                        <div class="item-detail-item">
                            <div class="item-detail-label">Serie</div>
                            <div class="item-detail-value">${item.numeroSerie}</div>
                        </div>
                        <div class="item-detail-item">
                            <div class="item-detail-label">Ubicación</div>
                            <div class="item-detail-value">${item.rack}</div>
                        </div>
                        <div class="item-detail-item">
                            <div class="item-detail-label">Estado</div>
                            <div class="item-detail-value">${this.getStatusName(item.status)}</div>
                        </div>
                    </div>
                    
                    <div class="col-md-4 text-end">
                        <button class="btn btn-sm btn-primary view-details-btn" data-item-id="${item.id}">
                            Ver Todos los Detalles
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===== CONFIGURACIÓN TAGIFY PARA FORMULARIOS =====
    initializeTagifyFields() {
        // Define las listas de opciones usando las configuraciones existentes
        const inventoryOptions = {
            categories: CONFIG.categories,
            brands: CONFIG.brands,
            colors: ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'AMARILLO'],
            status: CONFIG.statuses,
            locations: CONFIG.locations
        };

        // Función para crear configuración de Tagify
        function createTagifyConfig(whitelist, maxTags = 1, enforceWhitelist = false) {
            return {
                whitelist: whitelist,
                maxTags: maxTags,
                enforceWhitelist: enforceWhitelist,
                dropdown: {
                    maxItems: 20,
                    classname: 'tags-inline',
                    enabled: 0,
                    closeOnSelect: false
                }
            };
        }

        // Inicializar Tagify para cada campo del modal
        const itemCategoryEl = document.querySelector('#itemCategory');
        if (itemCategoryEl) {
            this.itemCategoryTagify = new Tagify(itemCategoryEl, createTagifyConfig(inventoryOptions.categories, 1, true));
        }

        const itemBrandEl = document.querySelector('#itemBrand');
        if (itemBrandEl) {
            this.itemBrandTagify = new Tagify(itemBrandEl, createTagifyConfig(inventoryOptions.brands, 1, false));
        }

        const itemModelEl = document.querySelector('#itemModel');
        if (itemModelEl) {
            this.itemModelTagify = new Tagify(itemModelEl, createTagifyConfig([], 1, false));
        }

        const itemFamilyEl = document.querySelector('#itemFamily');
        if (itemFamilyEl) {
            this.itemFamilyTagify = new Tagify(itemFamilyEl, createTagifyConfig([], 1, false));
        }
    }
}

// ===== INICIALIZACIÓN =====
let inventoryCatalog;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Flatpickr en español
    if (typeof flatpickr !== 'undefined' && typeof flatpickr.l10ns !== 'undefined') {
        flatpickr.localize(flatpickr.l10ns.es);
    }
    
    // Inicializar el catálogo
    inventoryCatalog = new InventoryCatalog();
    
    console.log('Catálogo de Inventario inicializado correctamente');
    console.log('Flatpickr disponible:', typeof flatpickr !== 'undefined');
    console.log('Perfect Scrollbar disponible:', typeof PerfectScrollbar !== 'undefined');
});

// ===== FUNCIONES GLOBALES PARA EVENTOS =====
window.inventoryCatalog = {
    showItemDetails: (itemId) => inventoryCatalog.showItemDetails(itemId),
    showUnitDetailPage: (itemId, unitId) => inventoryCatalog.showUnitDetailPage(itemId, unitId),
    showCalendarView: (itemId) => inventoryCatalog.showCalendarView(itemId),
    editItemBasic: (itemId) => inventoryCatalog.editItemBasic(itemId),
    addUnitToItem: (itemId) => inventoryCatalog.addUnitToItem(itemId),
    editUnit: (itemId, unitId) => inventoryCatalog.editUnit(itemId, unitId),
    selectCalendarDate: (dateString) => inventoryCatalog.selectCalendarDate(dateString),
    toggleItemExpansion: (itemId) => inventoryCatalog.toggleItemExpansion(itemId)
};