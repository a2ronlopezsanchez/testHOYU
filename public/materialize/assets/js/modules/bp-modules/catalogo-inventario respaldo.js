/**
 * CATÁLOGO DE INVENTARIO - JAVASCRIPT
 * Sistema de gestión de inventario para equipos de producción
 * Autor: Grupo Tangamanga
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    itemsPerPage: 10,
    maxCalendarDays: 28,
    dateFormat: 'es-ES',

    // Se rellenan dinámicamente desde /inventory/lookups
    categories: [],
    brands: [],
    locations: [],

    statuses: ['ACTIVO', 'INACTIVO', 'DESCOMPUESTO', 'EN REPARACION', 'EXTRAVIADO', 'BAJA']
};
// ===== CARGA DE CATÁLOGOS DESDE BACKEND =====
let LOOKUPS_CACHE = null;
let PARENTS_CACHE = null;

async function loadInventoryLookups() {
    // Cache en memoria para no pedirlos de nuevo
    if (LOOKUPS_CACHE) return LOOKUPS_CACHE;

    const res = await fetch('/inventory/lookups', { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error('No se pudieron cargar los catálogos');

    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'Respuesta inválida de catálogos');

    LOOKUPS_CACHE = {
        categories: Array.from(new Set((data.categories || []).map(s => String(s).trim()))),
        brands:     Array.from(new Set((data.brands || []).map(s => String(s).trim()))),
        locations:  Array.from(new Set((data.locations || []).map(s => String(s).trim())))
    };

    // Actualizamos CONFIG para que initializeTagifyFields use estas listas
    CONFIG.categories = LOOKUPS_CACHE.categories;
    CONFIG.brands     = LOOKUPS_CACHE.brands;
    CONFIG.locations  = LOOKUPS_CACHE.locations;

    return LOOKUPS_CACHE;
}
async function loadItemParents() {
  if (PARENTS_CACHE) return PARENTS_CACHE;
  const res = await fetch('/inventory/item-parents', { headers: { 'Accept': 'application/json' } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo cargar la lista de Item Padres');
  PARENTS_CACHE = data.data || [];
  return PARENTS_CACHE;
}
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

    async init() {
        try {
            // 1) Cargar catálogos desde la BD
            await loadInventoryLookups();
        } catch (e) {
            console.error('Error cargando catálogos:', e);
            this.showAlert('No se pudieron cargar catálogos. Se usarán listas vacías.', 'warning');
            // CONFIG.* ya quedan como [] si falla
        }

        // 2) Resto de inicialización (como lo tenías)
        this.generateSampleData();
        this.setupEventListeners();
        this.initializeFlatpickr();
        this.initializePerfectScrollbar();

        // Importante: ahora que CONFIG ya tiene datos, inicializamos Tagify
        this.initializeTagifyFields();

        this.updateDateDisplay();
        this.renderTable();
        this.updateItemCount();
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
                wheelPropagation: true, // Cambiado a true para permitir propagación
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
                            wheelPropagation: true, // Cambiado a true
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

    // Llena el <select id="itemParent"> con los padres
    async populateItemParentSelect_() {
    const select = document.getElementById('itemParent');
    if (!select) return;

    const parents = await loadItemParents();
    // Limpia y llena
    select.innerHTML = '<option value="">Selecciona...</option>';
    for (const p of parents) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = `${p.public_name} — ${p.brand ?? '-'} / ${p.category ?? '-'}`;
        // Guarda datos útiles por si los necesitas
        opt.dataset.categoryName = p.category || '';
        opt.dataset.brandName = p.brand || '';
        opt.dataset.name = p.name || '';
        opt.dataset.publicName = p.public_name || '';
        select.appendChild(opt);
    }

    // Conecta listener una sola vez
    if (!select.dataset.listenerAttached) {
        select.addEventListener('change', (e) => this.onItemParentChange_(e));
        select.dataset.listenerAttached = '1';
    }
    }

    // Al seleccionar un Padre: autocompleta nombre(s) y pide el siguiente ID al backend
    async onItemParentChange_(e) {
    const parentId = e.target.value;
    const idInput  = document.getElementById('itemId');
    const nameIn   = document.getElementById('itemName');
    const pubIn    = document.getElementById('itemPublicName');
    const hiddenId = document.getElementById('itemParentIdHidden'); // opcional

    if (!parentId) {
        idInput && (idInput.value = '');
        hiddenId && (hiddenId.value = '');
        return;
    }

    // Autorellenar nombres si están vacíos
    const opt = e.target.selectedOptions[0];
    if (opt) {
        if (nameIn && !nameIn.value) nameIn.value = opt.dataset.name || '';
        if (pubIn && !pubIn.value)   pubIn.value  = opt.dataset.publicName || '';
    }

    try {
        const res = await fetch(`/inventory/item-parents/${parentId}/next-id`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json();
        if (!res.ok || !data.success) {
        this.showAlert(data.message || 'No se pudo calcular el ID', 'error');
        return;
        }
        idInput && (idInput.value = data.id);
        hiddenId && (hiddenId.value = parentId);
    } catch (err) {
        console.error(err);
        this.showAlert('Error de red al calcular el ID.', 'error');
    }
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
        document.getElementById('addItemPBtn').addEventListener('click', () => this.showAddItemPModal());
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
        document.getElementById('saveItemPBtn').addEventListener('click', () => this.saveNewItemP());

        // Filters
        document.getElementById('clearFilters').addEventListener('click', () => this.clearAllFilters());

        // Preview de imagen
        document.getElementById('itemImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            
            if (file) {
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
            } else {
                preview.style.display = 'none';
            }
        }.bind(this));

        // Botones de vista (agregar después de los event listeners existentes)
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchToTableView());
        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchToGridView());

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
            
            // Filtro de búsqueda (eliminamos SKU e ID de la búsqueda principal)
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
        
        // TODO: Aquí agregaremos la limpieza de filtros avanzados cuando los implementes
        
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
                            <i class="mdi mdi-eye me-2"></i>Ver Detalles
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showCalendarView('${item.id}')">
                            <i class="mdi mdi-calendar me-2"></i>Calendario
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.editItem('${item.id}')">
                            <i class="mdi mdi-pencil me-2"></i>Editar
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
                            <button class="btn btn-sm btn-primary" onclick="inventoryCatalog.showItemDetails('${item.id}')">
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
                        <a href="#" onclick="inventoryCatalog.showItemDetails('${item.id}')">Ver todas</a>
                    </small>
                </div>
            `;
        }
        
        return tableHTML;
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
    // ===== AUTO-GENERACIÓN: SKU e ID =====

    // Obtiene el primer carácter alfabético en mayúsculas (ej. "LITE TEK" -> "L")
    getInitialLetter_(text) {
    if (!text) return '';
    const m = String(text).toUpperCase().match(/[A-ZÑ]/);
    return m ? m[0] : '';
    }

    // Genera un número aleatorio de 6 dígitos en string: "123456"
    randomSixDigits_() {
    return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    }

    // Devuelve un SKU único tipo "BP123456" que NO exista en inventoryData
    generateUniqueSku_() {
    const used = new Set(inventoryData.map(i => i.sku));
    let tries = 0;
    while (tries < 2000) {
        const candidate = `BP${this.randomSixDigits_()}`;
        if (!used.has(candidate)) return candidate;
        tries++;
    }
    // Si se agotaron intentos (muy improbable), genera con timestamp para evitar colisiones
    return `BP${String(Date.now()).slice(-6)}`;
    }

    // Dado un prefijo "XY", devuelve el siguiente correlativo entero (max+1) escaneando inventoryData
    getNextSequenceForPrefix_(prefix) {
    let max = 0;
    const re = new RegExp(`^${prefix}(\\d+)$`, 'i');
    for (const it of inventoryData) {
        if (!it?.id) continue;
        const m = it.id.match(re);
        if (m && m[1]) {
        const n = parseInt(m[1], 10);
        if (!Number.isNaN(n)) max = Math.max(max, n);
        }
    }
    return max + 1;
    }

    // Formatea el correlativo: 1->"001", 23->"023", 999->"999", 1000->"1000"...
    formatSequence_(n) {
    if (n <= 999) return String(n).padStart(3, '0');
    return String(n);
    }

    // Calcula prefijo de ID "XY" en base a Categoría y Marca
    computeIdPrefix_(categoryName, brandName) {
    const c = this.getInitialLetter_(categoryName);
    const b = this.getInitialLetter_(brandName);
    return `${c || 'X'}${b || 'X'}`;
    }

    /**
     * Genera y coloca en los inputs del modal:
     *  - SKU (si no existe o pedimos regenerarlo)
     *  - ID (si tenemos categoría+marca; si no, lo deja en blanco)
     * options:
     *   - preserveSku: true => no reemplaza el SKU si ya hay uno en el input
     */
    assignAutoSkuAndId_(options = { preserveSku: false }) {
        // SKU
        const skuInput = document.getElementById('itemSku');
        if (skuInput && (!options.preserveSku || !skuInput.value.trim())) {
            const sku = this.generateUniqueSku_();
            skuInput.value = sku;
        }

        // ID: requiere categoría y marca (preferimos #itemCategory/#itemBrand del modal de Item)
        let cat = '';
        let brand = '';

        if (this.itemCategoryTagify && this.itemCategoryTagify.value?.length) {
            cat = this.itemCategoryTagify.value[0].value || '';
        }
        if (this.itemBrandTagify && this.itemBrandTagify.value?.length) {
            brand = this.itemBrandTagify.value[0].value || '';
        }

        // Si no hay Tagify en Item, intenta con los del Padre (por si el flujo es inmediato tras crear Padre)
        if (!cat && this.itemPCategoryTagify && this.itemPCategoryTagify.value?.length) {
            cat = this.itemPCategoryTagify.value[0].value || '';
        }
        if (!brand && this.itemPBrandTagify && this.itemPBrandTagify.value?.length) {
            brand = this.itemPBrandTagify.value[0].value || '';
        }

        const idInput = document.getElementById('itemId');
        if (!idInput) return;

        // Si no hay categoría/marca en el modal de Item, NO sobreescribimos el ID
        // (pudo haberse llenado via /inventory/item-parents/{id}/next-id)
        if (!cat || !brand) {
        return;
        }

        const prefix = this.computeIdPrefix_(cat, brand);  // "XY"
        const nextSeq = this.getNextSequenceForPrefix_(prefix); // 1,2,3...
        idInput.value = `${prefix}${this.formatSequence_(nextSeq)}`;
    }
    ensureSkuOnly_(preserve = true) {
        const skuInput = document.getElementById('itemSku');
        if (skuInput && (!preserve || !skuInput.value.trim())) {
            skuInput.value = this.generateUniqueSku_();
        }
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
            `;
            
            tbody.appendChild(row);
        });
    }
    showAddItemPModal() {
    const modal = new bootstrap.Modal(document.getElementById('addItemPModal'));

    // Inicializa Tagify si hace falta
    if (!this.tagifyInitialized) {
        this.initializeTagifyFields();
        this.tagifyInitialized = true;
    }

    // Limpia SOLO el formulario del PADRE
    const form = document.getElementById('addItemPForm');
    if (form) form.reset();

    // Oculta preview (si lo usas compartido)
    const preview = document.getElementById('imagePreview');
    if (preview) preview.style.display = 'none';

    // Limpia Tagify del PADRE
    if (this.itemPCategoryTagify)   this.itemPCategoryTagify.removeAllTags();
    if (this.itemPBrandTagify)      this.itemPBrandTagify.removeAllTags();
    if (this.itemPModelTagify)      this.itemPModelTagify.removeAllTags();
    if (this.itemPFamilyTagify)     this.itemPFamilyTagify.removeAllTags();
    if (this.itemPSubFamilyTagify)  this.itemPSubFamilyTagify.removeAllTags();
    if (this.itemPColorTagify)      this.itemPColorTagify.removeAllTags();
    // Nota: ya NO hay status/location en el Padre

    // Limpia clases de error
    document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
        el.classList.remove('is-invalid', 'tagify--invalid');
    });

    modal.show();
    }

    async showAddItemModal() {
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));

        if (!this.tagifyInitialized) {
            // Si usas Tagify para status/location, inicialízalo aquí
            await this.initializeTagifyFields?.();
            this.tagifyInitialized = true;
        }

        document.getElementById('addItemForm').reset();
        document.getElementById('imagePreview').style.display = 'none';

        if (this.itemStatusTagify) this.itemStatusTagify.removeAllTags();
        if (this.itemLocationTagify) this.itemLocationTagify.removeAllTags();

        document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
            el.classList.remove('is-invalid', 'tagify--invalid');
        });

        // 1) Cargar/llenar padres
        try {
            await this.populateItemParentSelect_();
        } catch (e) {
            console.error('No se pudo cargar ItemPadres:', e);
            this.showAlert('No se pudo cargar la lista de productos padre.', 'warning');
        }

        // 2) Generar SKU (ID se genera cuando elijas el Padre)
        this.assignAutoSkuAndId_({ preserveSku: false });

        modal.show();
    }
    async refreshParentsSelectAfterCreate_(parent) {
    // invalidar cache para que loadItemParents() vuelva a pedir al backend
    PARENTS_CACHE = null;

    const select = document.getElementById('itemParent');
    if (!select) return; // si el modal de Item no está en el DOM, no hacemos nada

    // volver a poblar el select
    await this.populateItemParentSelect_();

    // (opcional) seleccionar automáticamente el padre recién creado
    if (parent?.id) {
        select.value = String(parent.id);
        // disparamos change para que recalcules el ID via /next-id si así lo tienes
        select.dispatchEvent(new Event('change'));
    }
    }



    async saveNewItem() {
  const form = document.getElementById('addItemForm');

  // Asegura SOLO el SKU (no tocar ID que ya viene del padre)
  this.ensureSkuOnly_(true);

  // Padre seleccionado (obligatorio)
  const parentSelect = document.getElementById('itemParent');
  const itemParentId = parentSelect ? parentSelect.value : '';
  if (!itemParentId) {
    this.showAlert('Selecciona un Producto Padre.', 'warning');
    return;
  }

  // Helpers
  const getTagifyValue = (tagify) =>
    tagify && tagify.value.length ? tagify.value[0].value : '';

  // Lee campos UI
  const sku            = document.getElementById('itemSku').value.trim();
  const itemName       = document.getElementById('itemName').value.trim();
  const itemId         = document.getElementById('itemId').value.trim();
  const nombrePublico  = document.getElementById('itemPublicName').value.trim();
  const status         = getTagifyValue(this.itemStatusTagify);      // texto (p.ej. "ACTIVO", "EN REPARACION")
  const ubicacion      = getTagifyValue(this.itemLocationTagify);    // texto (nombre de ubicación)
  const rack           = document.getElementById('itemRack').value || '';
  const panel          = document.getElementById('itemPanel').value || '';
  const rfid           = document.getElementById('itemRfid').value || '';
  const serie          = document.getElementById('itemSerial').value || '';
  const garantia       = document.getElementById('itemWarranty').value || 'NO'; // "SI" | "NO"
  const unitSet        = document.getElementById('itemUnitSet').value || 'UNIT';
  const precioOriginal = parseFloat(document.getElementById('itemOriginalPrice').value) || 0;
  const precioIdeal    = parseFloat(document.getElementById('itemIdealPrice').value) || 0;
  const precioMin      = parseFloat(document.getElementById('itemMinPrice').value) || 0;

  // Validación mínima UI
  let isValid = true;
  const errors = [];

  if (!itemId) { errors.push('ID es requerido (elige un Producto Padre).'); isValid = false; }
  if (!sku)    { errors.push('SKU es requerido'); isValid = false; }
  if (!itemName) { errors.push('Nombre es requerido'); isValid = false; }
  if (!status) { errors.push('Estado es requerido'); isValid = false; }
  if (!ubicacion) { errors.push('Ubicación es requerida'); isValid = false; }

  if (!isValid) {
    this.showAlert('Corrige:\n' + errors.join('\n'), 'warning');
    return;
  }

  // Payload para backend
  const payload = {
    item_parent_id: parseInt(itemParentId, 10),
    sku,                     // opcionalmente backend puede generar si no lo envías
    item_id: itemId,         // ya lo calculamos con /next-id
    name: itemName,
    public_name: nombrePublico || itemName,

    // Ubicación por NOMBRE (backend resuelve a id)
    location: ubicacion,

    unit_set: unitSet,
    rack_position: rack,
    panel_position: panel,
    rfid_tag: rfid,
    serial_number: serie,

    // Normalizamos status en backend (con/ sin guión bajo)
    status,

    condition: 'BUENO',
    original_price: precioOriginal,
    ideal_rental_price: precioIdeal,
    minimum_rental_price: precioMin,
    warranty_valid: (garantia === 'SI')
  };

  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  try {
    const res = await fetch('/inventory/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'X-CSRF-TOKEN': token } : {})
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const msg = (data && data.message) ? data.message : 'No se pudo crear el Item.';
      this.showAlert(msg, 'error');
      return;
    }

    // El backend devuelve el item ya mapeado a la forma de la grilla
    const gridItem = data.data;
    inventoryData.unshift(gridItem);
    this.applyFilters();

    // Limpieza UI
    form.reset();
    document.getElementById('imagePreview').style.display = 'none';
    if (this.itemStatusTagify) this.itemStatusTagify.removeAllTags();
    if (this.itemLocationTagify) this.itemLocationTagify.removeAllTags();
    document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => el.classList.remove('is-invalid', 'tagify--invalid'));
    bootstrap.Modal.getInstance(document.getElementById('addItemModal')).hide();
    this.showAlert(`Item "${gridItem.nombrePublico}" agregado`, 'success');

  } catch (err) {
    console.error(err);
    this.showAlert('Error de red al guardar el Item.', 'error');
  }
}


    
    async saveNewItemP() {
    const form = document.getElementById('addItemPForm');

    const getTagifyValue = (tagifyInstance) => {
        if (!tagifyInstance) return '';
        const tags = tagifyInstance.value;
        return tags.length ? tags[0].value : '';
    };
    const getTagifyValues = (tagifyInstance) => {
        if (!tagifyInstance) return [];
        return tagifyInstance.value.map(t => t.value);
    };

    // === Valores del Padre (del modal) ===
    const nombre       = document.getElementById('ItemPName')?.value.trim() || '';
    const nombrePublic = document.getElementById('ItemPPublicName')?.value.trim() || '';

    const categoria    = getTagifyValue(this.itemPCategoryTagify);   // nombre de categoría
    const marca        = getTagifyValue(this.itemPBrandTagify);      // nombre de marca
    const modelos      = getTagifyValues(this.itemPModelTagify);
    const familias     = getTagifyValues(this.itemPFamilyTagify);
    const subFamilias  = getTagifyValues(this.itemPSubFamilyTagify);
    const color        = getTagifyValue(this.itemPColorTagify);

    // === Validaciones mínimas ===
    let isValid = true;
    const errs = [];

    if (!nombre) {
        document.getElementById('ItemPName')?.classList.add('is-invalid');
        errs.push('Nombre del Producto es requerido');
        isValid = false;
    } else {
        document.getElementById('ItemPName')?.classList.remove('is-invalid');
    }

    const catEl = document.querySelector('#ItemPCategory')?.closest('.tagify');
    if (!categoria) { catEl?.classList.add('tagify--invalid'); errs.push('Categoría es requerida'); isValid = false; }
    else { catEl?.classList.remove('tagify--invalid'); }

    const brandEl = document.querySelector('#ItemPBrand')?.closest('.tagify');
    if (!marca) { brandEl?.classList.add('tagify--invalid'); errs.push('Marca es requerida'); isValid = false; }
    else { brandEl?.classList.remove('tagify--invalid'); }

    if (!isValid) {
        this.showAlert('Por favor corrige:\n' + errs.join('\n'), 'warning');
        return;
    }

    // === Payload para el backend ===
    // Enviamos NOMBRES de category/brand; el backend los resolverá a IDs.
    const payload = {
        name: nombre,
        public_name: nombrePublic || nombre,
        category: categoria,     // nombre
        brand: marca,            // nombre
        model: (modelos[0] || ''),             // si dejas múltiples, usa join(', ')
        family: (familias[0] || ''),
        sub_family: (subFamilias[0] || ''),
        color: color || null,
        is_active: true
    };

    // CSRF token (Blade: <meta name="csrf-token" content="{{ csrf_token() }}">)
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    try {
        const res = await fetch('/inventory/item-parents', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? {'X-CSRF-TOKEN': token} : {})
        },
        body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (!res.ok || !data.success) {
        const msg = data?.message || 'No se pudo crear el Item Padre.';
        this.showAlert(msg, 'error');
        return;
        }

        // Mapear respuesta a tu estructura visual (tabla)
        const p = data.data;

        const newParentForGrid = {
        // Tu tabla espera algunas columnas; usamos valores del padre
        sku: '', // el padre no tiene sku
        nombreProducto: p.name,
        id: `P${p.id}`, // opcional: prefijo para distinguir padre
        categoria: p.category || '',
        marca: p.brand || '',
        modelo: p.model || '',
        familia: p.family || '',
        subFamilia: p.sub_family || '',
        nombrePublico: p.public_name || p.name,
        color: p.color || 'NEGRO',
        status: p.is_active ? 'ACTIVO' : 'INACTIVO',

        // Campos de unidad no aplican aquí
        ubicacion: '',
        unitSet: '',
        rack: '',
        panel: '',
        identificadorRfid: '',
        numeroSerie: '',
        garantiaVigente: '',

        precioOriginal: 0,
        precioRentaIdeal: 0,
        precioRentaMinimo: 0,

        totalUnits: 0,
        units: []
        };

        // Insertar al principio y refrescar
        inventoryData.unshift(newParentForGrid);
        this.applyFilters();

        // Limpiar form y Tagify
        form?.reset();
        document.getElementById('imagePreview')?.style && (document.getElementById('imagePreview').style.display = 'none');

        if (this.itemPCategoryTagify)   this.itemPCategoryTagify.removeAllTags();
        if (this.itemPBrandTagify)      this.itemPBrandTagify.removeAllTags();
        if (this.itemPModelTagify)      this.itemPModelTagify.removeAllTags();
        if (this.itemPFamilyTagify)     this.itemPFamilyTagify.removeAllTags();
        if (this.itemPSubFamilyTagify)  this.itemPSubFamilyTagify.removeAllTags();
        if (this.itemPColorTagify)      this.itemPColorTagify.removeAllTags();

        document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => el.classList.remove('is-invalid', 'tagify--invalid'));

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('addItemPModal'))?.hide();

        this.showAlert(`Item Padre "${newParentForGrid.nombrePublico}" agregado.`, 'success');
        await this.refreshParentsSelectAfterCreate_(data.data);

    } catch (err) {
        console.error(err);
        this.showAlert('Error de red al guardar el Item Padre.', 'error');
    }
    }


    showCalendarView(itemId) {
        // Por ahora solo expandir el item para mostrar el calendario
        if (!expandedItems.has(itemId)) {
            expandedItems.add(itemId);
            this.renderTable();
        }
    }

    editItem(itemId) {
        this.showAlert('Función de edición en desarrollo.', 'info');
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
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="mdi mdi-dots-vertical">Acciones</i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showItemDetails('${item.id}')">
                            <i class="mdi mdi-eye me-2"></i>Ver Detalles
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.showCalendarView('${item.id}')">
                            <i class="mdi mdi-calendar me-2"></i>Calendario
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.editItem('${item.id}')">
                            <i class="mdi mdi-pencil me-2"></i>Editar
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
                
                <div class="mt-3 text-center">
                    <button class="btn btn-sm btn-primary" onclick="inventoryCatalog.showItemDetails('${item.id}')">
                        Ver todos los detalles
                    </button>
                </div>
            </div>
        </div>
    `;
    }

    // ===== CONFIGURACIÓN TAGIFY PARA FORMULARIOS =====
    initializeTagifyFields() {
    const inventoryOptions = {
        categories: CONFIG.categories,
        brands: CONFIG.brands,
        colors: ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'AMARILLO'],
        status: CONFIG.statuses,
        locations: CONFIG.locations
    };

    const createTagifyConfig = (whitelist, maxTags = 1, enforceWhitelist = false) => ({
        whitelist,
        maxTags,
        enforceWhitelist,
        dropdown: { maxItems: 20, classname: 'tags-inline', enabled: 0, closeOnSelect: false }
    });

    // ====== ITEM (UNIDAD) ======
    const itemCategoryEl = document.querySelector('#itemCategory');
    if (itemCategoryEl) this.itemCategoryTagify = new Tagify(itemCategoryEl, createTagifyConfig(inventoryOptions.categories, 1, true));

    const itemBrandEl = document.querySelector('#itemBrand');
    if (itemBrandEl) this.itemBrandTagify = new Tagify(itemBrandEl, createTagifyConfig(inventoryOptions.brands, 1, false));

    const itemModelEl = document.querySelector('#itemModel');
    if (itemModelEl) this.itemModelTagify = new Tagify(itemModelEl, createTagifyConfig([], 1, false));

    const itemFamilyEl = document.querySelector('#itemFamily');
    if (itemFamilyEl) this.itemFamilyTagify = new Tagify(itemFamilyEl, createTagifyConfig([], 1, false));

    const itemSubFamilyEl = document.querySelector('#itemSubFamily');
    if (itemSubFamilyEl) this.itemSubFamilyTagify = new Tagify(itemSubFamilyEl, createTagifyConfig([], 1, false));

    const itemColorEl = document.querySelector('#itemColor');
    if (itemColorEl) this.itemColorTagify = new Tagify(itemColorEl, createTagifyConfig(inventoryOptions.colors, 1, true));

    const itemStatusEl = document.querySelector('#itemStatus');
    if (itemStatusEl) this.itemStatusTagify = new Tagify(itemStatusEl, createTagifyConfig(inventoryOptions.status, 1, true));

    const itemLocationEl = document.querySelector('#itemLocation');
    if (itemLocationEl) this.itemLocationTagify = new Tagify(itemLocationEl, createTagifyConfig(inventoryOptions.locations, 1, true));

    // ====== ITEM PADRE (CATÁLOGO) ======
    const itemPCategoryEl = document.querySelector('#ItemPCategory');
    if (itemPCategoryEl) this.itemPCategoryTagify = new Tagify(itemPCategoryEl, createTagifyConfig(inventoryOptions.categories, 1, true));

    const itemPBrandEl = document.querySelector('#ItemPBrand');
    if (itemPBrandEl) this.itemPBrandTagify = new Tagify(itemPBrandEl, createTagifyConfig(inventoryOptions.brands, 1, false));

    const itemPModelEl = document.querySelector('#ItemPModel');
    if (itemPModelEl) this.itemPModelTagify = new Tagify(itemPModelEl, createTagifyConfig([], 1, false));

    const itemPFamilyEl = document.querySelector('#ItemPFamily');
    if (itemPFamilyEl) this.itemPFamilyTagify = new Tagify(itemPFamilyEl, createTagifyConfig([], 1, false));

    const itemPSubFamilyEl = document.querySelector('#ItemPSubFamily');
    if (itemPSubFamilyEl) this.itemPSubFamilyTagify = new Tagify(itemPSubFamilyEl, createTagifyConfig([], 1, false));

    const itemPColorEl = document.querySelector('#ItemPColor');
    if (itemPColorEl) this.itemPColorTagify = new Tagify(itemPColorEl, createTagifyConfig(inventoryOptions.colors, 1, true));

    // Después de crear this.itemCategoryTagify
    if (this.itemCategoryTagify) {
    this.itemCategoryTagify.on('add', () => this.assignAutoSkuAndId_({ preserveSku: true }));
    this.itemCategoryTagify.on('remove', () => this.assignAutoSkuAndId_({ preserveSku: true }));
    this.itemCategoryTagify.on('input', () => this.assignAutoSkuAndId_({ preserveSku: true }));
    }

    // Después de crear this.itemBrandTagify
    if (this.itemBrandTagify) {
    this.itemBrandTagify.on('add', () => this.assignAutoSkuAndId_({ preserveSku: true }));
    this.itemBrandTagify.on('remove', () => this.assignAutoSkuAndId_({ preserveSku: true }));
    this.itemBrandTagify.on('input', () => this.assignAutoSkuAndId_({ preserveSku: true }));
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
    showCalendarView: (itemId) => inventoryCatalog.showCalendarView(itemId),
    editItem: (itemId) => inventoryCatalog.editItem(itemId),
    selectCalendarDate: (dateString) => inventoryCatalog.selectCalendarDate(dateString)
};