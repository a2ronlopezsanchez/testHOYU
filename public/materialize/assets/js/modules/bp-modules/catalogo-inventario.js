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
    console.log('🌐 Llamando a /inventory/item-parents');

  const res = await fetch('/inventory/item-parents', { headers: { 'Accept': 'application/json' } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudo cargar la lista de Item Padres');
  PARENTS_CACHE = data.data || [];
    console.log('✅ PARENTS_CACHE actualizado:', PARENTS_CACHE.length);

  return PARENTS_CACHE;
}
// ===== CARGA DE UNIDADES POR PADRE =====
let UNITS_BY_PARENT_CACHE = {};

async function loadUnitsByParent(parentId) {
  if (!parentId) return [];
  if (UNITS_BY_PARENT_CACHE[parentId]) return UNITS_BY_PARENT_CACHE[parentId];

  const res = await fetch(`/inventory/item-parents/${parentId}/items`, { headers: { 'Accept': 'application/json' } });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'No se pudieron cargar las unidades');

  // Normaliza status para UI (reemplaza guion bajo por espacio)
  const units = (data.data || []).map(u => ({
    dbId: u.id || '',                 // Database ID para el botón de editar
    sku: u.sku || '',
    id: u.item_id || '',
    numeroSerie: u.serial || '',
    statusText: String(u.status || '').replace(/_/g, ' '),
    locationText: u.location || '-',
    condicion: u.condition || 'BUENO',
    rack: u.rack || '',
    panel: u.panel || '',
  }));

  UNITS_BY_PARENT_CACHE[parentId] = units;
  return units;
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
// Cache para evitar múltiples llamadas a la API
let availabilityCache = new Map();
let detailsCache = new Map();

// ===== CLASE PRINCIPAL =====
class InventoryCatalog {
    constructor() {
        this.tagifyInitialized = false;
        this.init();
    }

    async init() {
        try {
            // 1) Cargar catálogos (categorías, marcas, ubicaciones)
            await loadInventoryLookups();
        } catch (e) {
            console.error('Error cargando catálogos:', e);
            this.showAlert('No se pudieron cargar catálogos. Se usarán listas vacías.', 'warning');
        }

        try {
            // 2) Cargar la grilla desde tus Item Padres (EN VEZ de generateSampleData)
            await this.loadGridFromParents();
        } catch (e) {
            console.error('Error cargando Item Padres para la grilla:', e);
            this.showAlert('No se pudieron cargar los productos padre.', 'error');
            // Si quieres, podrías dejar un fallback:
            // this.generateSampleData();
        }

        // 3) Resto de inicialización
        this.setupEventListeners();
        this.initializeFlatpickr();
        this.initializePerfectScrollbar();

        // Tagify después de lookups
        this.initializeTagifyFields();

        // Pintar UI
        this.updateDateDisplay();
        this.renderTable();
        this.updateItemCount();
        this.updateClearAllButtonState();
    }

    // Carga los Item Padres desde backend y los mapea a la estructura de la grilla
    async loadGridFromParents() {
        console.log('🔄 Cargando parents...');
        const parents = await loadItemParents();
        
        // ✅ LIMPIEZA DEFINITIVA - crear arrays completamente nuevos
        const newInventoryData = parents.map(p => ({
            sku: '',
            nombreProducto: p.name || p.public_name || '',
            nombrePublico: p.public_name || p.name || '',
            id: `P${p.id}`,
            categoria: p.category || '',
            marca: p.brand || '',
            modelo: p.model || '',
            familia: p.family || '',
            subFamilia: p.sub_family || '',
            color: p.color || '',
            status: 'CATÁLOGO',
            ubicacion: '',
            unitSet: '',
            rack: '',
            panel: '',
            identificadorRfid: '',
            numeroSerie: '',
            garantiaVigente: '',
            totalUnits: Number(p.units_count || 0),
            units: []
        }));
        
        // ✅ REEMPLAZAR referencias globales completamente
        inventoryData = newInventoryData;
        filteredData = [...newInventoryData];
        
        console.log('✅ Parents cargados:', inventoryData.length);
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
    parseParentIdFromItem_(item) {
        if (item && item.item_parent_id) return parseInt(item.item_parent_id, 10);
        const m = String(item?.id || '').match(/^P(\d+)$/i);
        return m ? parseInt(m[1], 10) : null;
    }
    async hydrateExpandedUnitsTable_(item, rootEl) {
        try {
            const parentId = this.parseParentIdFromItem_(item);
            if (!parentId) return;

            const tbody = (rootEl || document).querySelector(`#units-tbody-${item.id}`);
            if (!tbody) return;

            // loading…
            tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted">Cargando unidades…</td>
            </tr>
            `;

            const units = await loadUnitsByParent(parentId);

            if (!units.length) {
            tbody.innerHTML = `
                <tr>
                <td colspan="7" class="text-center text-muted">Este producto aún no tiene unidades registradas.</td>
                </tr>
            `;
            return;
            }

            // Render filas
            tbody.innerHTML = '';
            for (const u of units.slice(0, 8)) { // mismo "máximo 8" que tenías
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><code class="text-primary">${u.sku}</code></td>
                <td><span class="badge bg-label-dark">${u.id}</span></td>
                <td>${u.numeroSerie || '-'}</td>
                <td><span class="badge bg-secondary">${u.statusText}</span></td>
                <td>${u.locationText}</td>
                <td>-</td>
                <td><span class="badge badge-${(u.condicion || 'BUENO').toLowerCase()}">${u.condicion || 'BUENO'}</span></td>
                <td class="text-center">
                    <a href="/inventory/unidad/${u.dbId}" class="btn btn-sm btn-outline-primary edit-unit-btn" title="Editar unidad completa">
                        <i class="mdi mdi-pencil me-1"></i>
                    </a>
                </td>
            `;
            tbody.appendChild(row);
            }

            // Si hay más de 8, agregamos nota al final (opcional)
            if (units.length > 8) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="7" class="text-center">
                <small class="text-muted">Mostrando 8 de ${units.length} unidades. 
                <a href="#" onclick="inventoryCatalog.showItemDetails('${item.id}')">Ver todas</a></small>
                </td>
            `;
            tbody.appendChild(tr);
            }
        } catch (e) {
            console.error('hydrateExpandedUnitsTable_ error:', e);
        }
    }

    // ===== GENERACIÓN DE DATOS DE MUESTRA =====

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
        document.getElementById('addItemPBtn').addEventListener('click', () => this.showAddItemPModal());
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
        this.clearAvailabilityCache();
        this.updateDateDisplay();
        this.updateFlatpickr();
        this.renderTable();
    }

    setToday() {
        currentDate = new Date();
        this.clearAvailabilityCache();
        this.updateDateDisplay();
        this.updateFlatpickr();
        this.renderTable();
    }

    // Función para limpiar cache
    clearAvailabilityCache() {
        availabilityCache.clear();
        detailsCache.clear();
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
    
    async calculateAvailability(item) {
        const cacheKey = `${item.id}_${this.formatDate(currentDate)}`;
        
        // Verificar cache primero
        if (availabilityCache.has(cacheKey)) {
            return availabilityCache.get(cacheKey);
        }
        
        try {
            const parentId = this.parseParentIdFromItem_(item);
            if (!parentId) {
                console.warn('No se pudo obtener parentId para item:', item.id);
                return this.getDefaultAvailability(item);
            }
            
            const dateStr = currentDate.toISOString().split('T')[0];
            const response = await fetch(`/inventory/availability/${parentId}?date=${dateStr}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            
            if (data.success) {
            // Normaliza para que SIEMPRE tengas las mismas llaves
            const a = data.data || {};
            const availability = {
                totalUnits: a.totalUnits ?? a.total ?? (item.totalUnits ?? 0),
                available:  a.available ?? 0,
                assigned:   a.assigned  ?? a.busy ?? 0,
                maintenance:a.maintenance ?? 0,
                unavailable:a.unavailable ?? 0
            };

            availabilityCache.set(cacheKey, availability);
            return availability;
            } else {
                throw new Error(data.message || 'Error al obtener disponibilidad');
            }
            
        } catch (error) {
            console.error('Error calculando disponibilidad:', error);
            // Fallback a disponibilidad por defecto en caso de error
            return this.getDefaultAvailability(item);
        }
    }
    calculateSampleAvailability(item) {
        let available = 2;
        let assigned = 0;
        let maintenance = 0;
        
        const dateToCheck = new Date(currentDate);
        dateToCheck.setHours(0, 0, 0, 0);
        
        if (item.units && item.units.length > 0) {
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
        } else {
            available = item.totalUnits || 0;
        }
        
        return {
            available,
            assigned,
            maintenance,
            unavailable: 0,
            totalUnits: item.totalUnits || available + assigned + maintenance
        };
    }

    // Disponibilidad por defecto en caso de error
    getDefaultAvailability(item) {
        const total = item.totalUnits || 0;
        return {
            available: Math.max(0, total - 1),
            assigned: Math.min(1, total),
            maintenance: 0,
            unavailable: 0,
            totalUnits: total
        };
    }

    // Función para obtener disponibilidades múltiples (optimización)
    async getBulkAvailability(items) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const parentIds = [];
        const itemsToFetch = [];
        
        // Separar items que necesitan fetch vs los que están en cache
        for (const item of items) {
            const cacheKey = `${item.id}_${this.formatDate(currentDate)}`;
            if (!availabilityCache.has(cacheKey)) {
                const parentId = this.parseParentIdFromItem_(item);
                if (parentId && !item.id.startsWith('SAMPLE_')) {
                    parentIds.push(parentId);
                    itemsToFetch.push(item);
                }
            }
        }
        
        if (parentIds.length === 0) {
            return; // Todos están en cache o son samples
        }
        
        try {
            const response = await fetch('/inventory/availability/bulk', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
                },
                body: JSON.stringify({
                    item_parent_ids: parentIds,
                    date: dateStr
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Guardar en cache
                    itemsToFetch.forEach(item => {
                        const parentId = this.parseParentIdFromItem_(item);
                        if (parentId && data.data[parentId]) {
                            const cacheKey = `${item.id}_${this.formatDate(currentDate)}`;
                            availabilityCache.set(cacheKey, data.data[parentId]);
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error en getBulkAvailability:', error);
        }
    }

    // Función para obtener detalles de unidades
    async getUnitDetails(itemId) {
        const cacheKey = `details_${itemId}_${this.formatDate(currentDate)}`;
        
        if (detailsCache.has(cacheKey)) {
            return detailsCache.get(cacheKey);
        }
        
        try {
            const parentId = this.parseParentIdFromItem_({ id: itemId });
            if (!parentId) {
                throw new Error('No se pudo obtener parentId');
            }
            
            const dateStr = currentDate.toISOString().split('T')[0];
            const response = await fetch(`/inventory/units/${parentId}/details?date=${dateStr}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            
            if (data.success) {
                detailsCache.set(cacheKey, data.data);
                return data.data;
            } else {
                throw new Error(data.message || 'Error al obtener detalles');
            }
            
        } catch (error) {
            console.error('Error obteniendo detalles de unidades:', error);
            throw error;
        }
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
    async renderTable() {
            console.log('🎨 renderTable iniciado - items a renderizar:', filteredData.length);

        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
            console.log('🧹 tbody limpiado');

        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = filteredData.slice(startIndex, endIndex);
            console.log(`📄 Renderizando página ${currentPage}: items ${startIndex}-${endIndex} (${pageItems.length} items)`);

        // Optimización: cargar todas las disponibilidades de una vez
        await this.getBulkAvailability(pageItems);
        
        for (const item of pageItems) {
            const availability = await this.calculateAvailability(item);
            const row = this.createTableRow(item, availability);
            tbody.appendChild(row);
            
            // Crear fila expandible si el item está expandido
            if (expandedItems.has(item.id)) {
                const expandedRow = this.createExpandedRow(item, availability);
                tbody.appendChild(expandedRow);
            }
        }
        
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
                <div class="dropdown" data-item-id="${item.id}">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" 
                            type="button" 
                            data-bs-toggle="dropdown"
                            aria-expanded="false">
                        <i class="mdi mdi-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.addItemToParent('${item.id}')">
                            <i class="mdi mdi-plus me-2"></i>Añadir Item
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
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
                        <div id="calendar-container-${item.id}">
                            Cargando calendario...
                        </div>
                    </div>
                </div>
            </td>
        `;
        
        // Cargar calendario asíncronamente
        setTimeout(async () => {
            const calendarContainer = document.getElementById(`calendar-container-${item.id}`);
            if (calendarContainer) {
                const calendarHTML = await this.createCalendarView(item);
                calendarContainer.innerHTML = calendarHTML;
            }
        }, 100);
        
        this.hydrateExpandedUnitsTable_(item, expandedRow);

        return expandedRow;
    }

    createExpandedUnitsTable(item) {
        return `
            <div class="table-responsive">
            <table class="table table-sm units-table">
                <thead>
                <tr>
                    <th>SKU</th>
                    <th>ID Item</th>
                    <th>No. de Serie</th>
                    <th>Status</th>
                    <th>Ubicación</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                </tr>
                </thead>
                <tbody id="units-tbody-${item.id}">
                <tr>
                    <td colspan="7" class="text-center text-muted">Cargando…</td>
                </tr>
                </tbody>
            </table>
            </div>
        `;
    }

    async createCalendarView(item) {
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
            <div class="calendar-grid" id="calendar-grid-${item.id}">
        `;
        
        // Calcular el primer día que se mostrará (primer domingo de la primera semana)
        const firstDay = new Date(startDate);
        const dayOfWeek = firstDay.getDay(); // 0 = domingo, 1 = lunes, etc.
        firstDay.setDate(firstDay.getDate() - dayOfWeek); // Retroceder al domingo anterior
        
        // Calcular cuántas semanas necesitamos mostrar
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // 2 semanas adelante
        
        const totalDays = Math.ceil((endDate - firstDay) / (1000 * 60 * 60 * 24)) + 7; // +7 para asegurar cobertura completa
        const weeksToShow = Math.ceil(totalDays / 7);
        const daysToShow = weeksToShow * 7;
        
        // Generar todas las celdas del calendario
        for (let i = 0; i < daysToShow; i++) {
            const currentDay = new Date(firstDay);
            currentDay.setDate(firstDay.getDate() + i);
            
            const isToday = currentDay.toDateString() === today.toDateString();
            const isSelected = currentDay.toDateString() === currentDate.toDateString();
            const isInRange = currentDay >= startDate && currentDay <= endDate;
            
            // Determinar clases CSS
            let dayClasses = 'calendar-day';
            if (!isInRange) {
                dayClasses += ' calendar-day-outside-range';
            } else {
                dayClasses += ' availability-loading';
            }
            if (isSelected) dayClasses += ' selected';
            if (isToday) dayClasses += ' today';
            
            calendarHTML += `
                <div class="${dayClasses}"
                    data-date="${currentDay.toISOString()}"
                    data-item-id="${item.id}"
                    onclick="inventoryCatalog.selectCalendarDate('${currentDay.toISOString()}')"
                    title="${isInRange ? 'Cargando...' : 'Fuera de rango'}">
                    <div class="calendar-day-number">${currentDay.getDate()}</div>
                    <div class="calendar-day-percent">${isInRange ? '...' : ''}</div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Cargar disponibilidades asíncronamente solo para días en rango
        setTimeout(() => this.loadCalendarAvailabilities(item, startDate, endDate), 100);
        
        return calendarHTML;
    }
    async loadCalendarAvailabilities(item, startDate, endDate) {
        const calendarGrid = document.getElementById(`calendar-grid-${item.id}`);
        if (!calendarGrid) return;
        
        const calendarDays = calendarGrid.querySelectorAll('.calendar-day:not(.calendar-day-outside-range)');
        
        for (const calendarDay of calendarDays) {
            const dayDate = new Date(calendarDay.dataset.date);
            
            // Solo procesar días en el rango válido
            if (dayDate < startDate || dayDate > endDate) continue;
            
            try {
                // Calcular disponibilidad para este día
                const availability = await this.calculateAvailabilityForDate(item, dayDate);
                const availabilityPercent = availability.totalUnits > 0 
                    ? Math.round((availability.available / availability.totalUnits) * 100)
                    : 100;
                
                let availabilityClass;
                if (availabilityPercent === 100) availabilityClass = 'availability-100';
                else if (availabilityPercent >= 60) availabilityClass = 'availability-high';
                else if (availabilityPercent >= 30) availabilityClass = 'availability-medium';
                else if (availabilityPercent > 0) availabilityClass = 'availability-low';
                else availabilityClass = 'availability-none';
                
                const isSelected = dayDate.toDateString() === currentDate.toDateString();
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                // Actualizar el día del calendario
                let dayClasses = `calendar-day ${availabilityClass}`;
                if (isSelected) dayClasses += ' selected';
                if (isToday) dayClasses += ' today';
                
                calendarDay.className = dayClasses;
                calendarDay.title = `${dayDate.toLocaleDateString()}: ${availabilityPercent}% disponible`;
                calendarDay.querySelector('.calendar-day-percent').textContent = `${availabilityPercent}%`;
                
            } catch (error) {
                console.error(`Error cargando disponibilidad para ${dayDate.toDateString()}:`, error);
                
                // En caso de error, mostrar como 100% disponible
                const isSelected = dayDate.toDateString() === currentDate.toDateString();
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                let dayClasses = 'calendar-day availability-100';
                if (isSelected) dayClasses += ' selected';
                if (isToday) dayClasses += ' today';
                
                calendarDay.className = dayClasses;
                calendarDay.title = `${dayDate.toLocaleDateString()}: Error al cargar`;
                calendarDay.querySelector('.calendar-day-percent').textContent = '100%';
            }
        }
    }
    async calculateAvailabilityForDate(item, date) {
        // Para items reales, usar la API
        const parentId = this.parseParentIdFromItem_(item);
        if (!parentId) {
            // Fallback: si no hay unidades, todo está disponible
            return {
                available: item.totalUnits || 0,
                assigned: 0,
                maintenance: 0,
                totalUnits: item.totalUnits || 0
            };
        }
        
        try {
            const dateStr = date.toISOString().split('T')[0];
            const response = await fetch(`/inventory/availability/${parentId}?date=${dateStr}`, {
                headers: { 'Accept': 'application/json' }
            });
            
            if (!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            
            const data = await response.json();
            
            if (data.success) {
                return {
                    available: data.data.available || 0,
                    assigned: data.data.assigned || 0,
                    maintenance: data.data.maintenance || 0,
                    unavailable: data.data.unavailable || 0,
                    totalUnits: data.data.totalUnits || item.totalUnits || 0
                };
            } else {
                throw new Error(data.message || 'Error al obtener disponibilidad');
            }
            
        } catch (error) {
            console.error('Error calculando disponibilidad para fecha:', error);
            // Fallback: si no hay eventos, todo está disponible
            return {
                available: item.totalUnits || 0,
                assigned: 0,
                maintenance: 0,
                unavailable: 0,
                totalUnits: item.totalUnits || 0
            };
        }
    }
    calculateSampleAvailabilityForDate(item, date) {
        let available = 0;
        let assigned = 0;
        let maintenance = 0;
        
        const dateToCheck = new Date(date);
        dateToCheck.setHours(0, 0, 0, 0);
        
        if (item.units && item.units.length > 0) {
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
        } else {
            available = item.totalUnits || 0;
        }
        
        return {
            available,
            assigned,
            maintenance,
            totalUnits: item.totalUnits || available + assigned + maintenance
        };
    }
    // ===== FUNCIONES DE UTILIDAD =====
    toggleItemExpansion(itemId) {
        if (expandedItems.has(itemId)) {
            // Si el item ya está expandido, colapsarlo
            expandedItems.delete(itemId);
        } else {
            // Si el item no está expandido, colapsar todos los demás y expandir este
            expandedItems.clear(); // Limpiar todas las expansiones
            expandedItems.add(itemId); // Agregar solo el nuevo item
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
        this.clearAvailabilityCache();
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
    async showItemDetails(itemId) {
        const item = inventoryData.find(i => i.id === itemId);
        if (!item) return;
        
        const modal = new bootstrap.Modal(document.getElementById('unitDetailsModal'));
        
        // Mostrar modal con loading
        document.getElementById('unitDetailsModalTitle').textContent = 
            `Detalles: ${item.nombrePublico}`;
        
        const modalBody = document.getElementById('modalUnitsTableBody');
        modalBody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando detalles...</td></tr>';
        
        // *** NUEVO: Inicializar calendario del modal con loading ***
        const calendarView = document.getElementById('calendarView');
        if (calendarView) {
            calendarView.innerHTML = '<div class="text-center p-3"><i class="mdi mdi-loading mdi-spin me-2"></i>Cargando calendario...</div>';
        }
        
        modal.show();
        
        try {
            // Cargar detalles reales
            const details = await this.getUnitDetails(itemId);
            
            // Actualizar información general
            const generalInfo = document.getElementById('itemGeneralInfo');
            generalInfo.innerHTML = `
                <div class="row g-2">
                    <div class="col-6"><strong>SKU:</strong> ${item.sku || '-'}</div>
                    <div class="col-6"><strong>ID:</strong> ${item.id}</div>
                    <div class="col-6"><strong>Marca:</strong> ${item.marca}</div>
                    <div class="col-6"><strong>Modelo:</strong> ${item.modelo}</div>
                    <div class="col-6"><strong>Familia:</strong> ${item.familia}</div>
                    <div class="col-6"><strong>Color:</strong> ${item.color}</div>
                    <div class="col-12"><strong>Fecha:</strong> ${this.formatShortDate(currentDate)}</div>
                </div>
            `;
            
            // Información de disponibilidad
            const summary = details.summary;
            document.getElementById('modalSelectedDate').textContent = this.formatShortDate(currentDate);
            
            const availabilityInfo = document.getElementById('itemAvailabilityInfo');
            availabilityInfo.innerHTML = `
                <div class="row g-2 text-center">
                    <div class="col-3">
                        <div class="text-success fw-bold fs-4">${summary.available}</div>
                        <small>Disponibles</small>
                    </div>
                    <div class="col-3">
                        <div class="text-primary fw-bold fs-4">${summary.assigned}</div>
                        <small>Asignados</small>
                    </div>
                    <div class="col-3">
                        <div class="text-warning fw-bold fs-4">${summary.maintenance}</div>
                        <small>Mantenimiento</small>
                    </div>
                    <div class="col-3">
                        <div class="text-danger fw-bold fs-4">${summary.unavailable || 0}</div>
                        <small>No disponibles</small>
                    </div>
                </div>
            `;
            
            // Tabla de unidades con datos reales
            this.populateModalUnitsTableWithRealData(details.units);
            
            // *** NUEVO: Generar calendario en el modal ***
            await this.generateModalCalendar(item);
            
        } catch (error) {
            console.error('Error cargando detalles:', error);
            modalBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error al cargar detalles</td></tr>';
            
            // En caso de error, mostrar mensaje en el calendario
            const calendarView = document.getElementById('calendarView');
            if (calendarView) {
                calendarView.innerHTML = '<div class="text-center text-danger p-3"><i class="mdi mdi-alert me-2"></i>Error al cargar calendario</div>';
            }
        }
    }
    // Nueva función para generar el calendario en el modal
    async generateModalCalendar(item) {
        const calendarView = document.getElementById('calendarView');
        if (!calendarView) return;
        
        try {
            // Generar el HTML del calendario usando la función existente
            const calendarHTML = await this.createModalCalendarView(item);
            calendarView.innerHTML = calendarHTML;
            
        } catch (error) {
            console.error('Error generando calendario del modal:', error);
            calendarView.innerHTML = '<div class="text-center text-danger p-3">Error al cargar calendario</div>';
        }
    }
    async createModalCalendarView(item) {
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
            <div class="calendar-grid" id="modal-calendar-grid">
        `;
        
        // Calcular el primer día que se mostrará (primer domingo de la primera semana)
        const firstDay = new Date(startDate);
        const dayOfWeek = firstDay.getDay(); // 0 = domingo, 1 = lunes, etc.
        firstDay.setDate(firstDay.getDate() - dayOfWeek); // Retroceder al domingo anterior
        
        // Calcular cuántas semanas necesitamos mostrar
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // 2 semanas adelante
        
        const totalDays = Math.ceil((endDate - firstDay) / (1000 * 60 * 60 * 24)) + 7;
        const weeksToShow = Math.ceil(totalDays / 7);
        const daysToShow = weeksToShow * 7;
        
        // Generar todas las celdas del calendario
        for (let i = 0; i < daysToShow; i++) {
            const currentDay = new Date(firstDay);
            currentDay.setDate(firstDay.getDate() + i);
            
            const isToday = currentDay.toDateString() === today.toDateString();
            const isSelected = currentDay.toDateString() === currentDate.toDateString();
            const isInRange = currentDay >= startDate && currentDay <= endDate;
            
            // Determinar clases CSS
            let dayClasses = 'calendar-day';
            if (!isInRange) {
                dayClasses += ' calendar-day-outside-range';
            } else {
                dayClasses += ' availability-loading';
            }
            if (isSelected) dayClasses += ' selected';
            if (isToday) dayClasses += ' today';
            
            calendarHTML += `
                <div class="${dayClasses}"
                    data-date="${currentDay.toISOString()}"
                    onclick="inventoryCatalog.selectModalCalendarDate('${currentDay.toISOString()}')"
                    title="${isInRange ? 'Cargando...' : 'Fuera de rango'}">
                    <div class="calendar-day-number">${currentDay.getDate()}</div>
                    <div class="calendar-day-percent">${isInRange ? '...' : ''}</div>
                </div>
            `;
        }
        
        calendarHTML += '</div>';
        
        // Cargar disponibilidades asíncronamente solo para días en rango
        setTimeout(() => this.loadModalCalendarAvailabilities(item, startDate, endDate), 100);
        
        return calendarHTML;
    }

    // Función para cargar las disponibilidades del calendario del modal
    async loadModalCalendarAvailabilities(item, startDate, endDate) {
        const calendarGrid = document.getElementById('modal-calendar-grid');
        if (!calendarGrid) return;
        
        const calendarDays = calendarGrid.querySelectorAll('.calendar-day:not(.calendar-day-outside-range)');
        
        for (const calendarDay of calendarDays) {
            const dayDate = new Date(calendarDay.dataset.date);
            
            // Solo procesar días en el rango válido
            if (dayDate < startDate || dayDate > endDate) continue;
            
            try {
                // Calcular disponibilidad para este día
                const availability = await this.calculateAvailabilityForDate(item, dayDate);
                const availabilityPercent = availability.totalUnits > 0 
                    ? Math.round((availability.available / availability.totalUnits) * 100)
                    : 100;
                
                let availabilityClass;
                if (availabilityPercent === 100) availabilityClass = 'availability-100';
                else if (availabilityPercent >= 60) availabilityClass = 'availability-high';
                else if (availabilityPercent >= 30) availabilityClass = 'availability-medium';
                else if (availabilityPercent > 0) availabilityClass = 'availability-low';
                else availabilityClass = 'availability-none';
                
                const isSelected = dayDate.toDateString() === currentDate.toDateString();
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                // Actualizar el día del calendario
                let dayClasses = `calendar-day ${availabilityClass}`;
                if (isSelected) dayClasses += ' selected';
                if (isToday) dayClasses += ' today';
                
                calendarDay.className = dayClasses;
                calendarDay.title = `${dayDate.toLocaleDateString()}: ${availabilityPercent}% disponible`;
                calendarDay.querySelector('.calendar-day-percent').textContent = `${availabilityPercent}%`;
                
            } catch (error) {
                console.error(`Error cargando disponibilidad para ${dayDate.toDateString()}:`, error);
                
                // En caso de error, mostrar como 100% disponible
                const isSelected = dayDate.toDateString() === currentDate.toDateString();
                const isToday = dayDate.toDateString() === new Date().toDateString();
                
                let dayClasses = 'calendar-day availability-100';
                if (isSelected) dayClasses += ' selected';
                if (isToday) dayClasses += ' today';
                
                calendarDay.className = dayClasses;
                calendarDay.title = `${dayDate.toLocaleDateString()}: Error al cargar`;
                calendarDay.querySelector('.calendar-day-percent').textContent = '100%';
            }
        }
    }

    // Nueva función para manejar clicks en el calendario del modal
    selectModalCalendarDate(dateString) {
        // Actualizar la fecha global
        currentDate = new Date(dateString);
        this.clearAvailabilityCache();
        this.updateDateDisplay();
        this.updateFlatpickr();
        
        // Actualizar las clases de selección en el calendario del modal
        const modalCalendarDays = document.querySelectorAll('#modal-calendar-grid .calendar-day');
        modalCalendarDays.forEach(day => {
            const dayDate = new Date(day.dataset.date);
            if (dayDate.toDateString() === currentDate.toDateString()) {
                day.classList.add('selected');
            } else {
                day.classList.remove('selected');
            }
        });
        
        // Actualizar la fecha mostrada en el modal
        document.getElementById('modalSelectedDate').textContent = this.formatShortDate(currentDate);
        
        // Recargar la tabla principal en segundo plano
        this.renderTable();
        
        // Opcional: recargar los detalles del modal para la nueva fecha
        const modalTitle = document.getElementById('unitDetailsModalTitle').textContent;
        const itemName = modalTitle.replace('Detalles: ', '');
        const item = inventoryData.find(i => i.nombrePublico === itemName);
        
        if (item) {
            this.refreshModalForNewDate(item);
        }
    }

    // Función auxiliar para refrescar el modal cuando cambia la fecha
    async refreshModalForNewDate(item) {
        try {
            // Mostrar loading en disponibilidad
            const availabilityInfo = document.getElementById('itemAvailabilityInfo');
            availabilityInfo.innerHTML = '<div class="text-center"><i class="mdi mdi-loading mdi-spin"></i> Actualizando...</div>';
            
            // Recargar detalles para la nueva fecha
            const details = await this.getUnitDetails(item.id);
            const summary = details.summary;
            
            // Actualizar información de disponibilidad
            availabilityInfo.innerHTML = `
                <div class="row g-2 text-center">
                    <div class="col-3">
                        <div class="text-success fw-bold fs-4">${summary.available}</div>
                        <small>Disponibles</small>
                    </div>
                    <div class="col-3">
                        <div class="text-primary fw-bold fs-4">${summary.assigned}</div>
                        <small>Asignados</small>
                    </div>
                    <div class="col-3">
                        <div class="text-warning fw-bold fs-4">${summary.maintenance}</div>
                        <small>Mantenimiento</small>
                    </div>
                    <div class="col-3">
                        <div class="text-danger fw-bold fs-4">${summary.unavailable || 0}</div>
                        <small>No disponibles</small>
                    </div>
                </div>
            `;
            
            // Actualizar tabla de unidades
            this.populateModalUnitsTableWithRealData(details.units);
            
        } catch (error) {
            console.error('Error refrescando modal:', error);
            const availabilityInfo = document.getElementById('itemAvailabilityInfo');
            availabilityInfo.innerHTML = '<div class="text-center text-danger">Error al actualizar</div>';
        }
    }
    // Función para llenar tabla modal con datos reales
    populateModalUnitsTableWithRealData(units) {
        const tbody = document.getElementById('modalUnitsTableBody');
        if (!tbody || !units) return;
        
        tbody.innerHTML = '';
        
        if (units.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Sin unidades registradas.</td></tr>';
            return;
        }
        
        units.forEach(unit => {
            const tr = document.createElement('tr');
            
            // Determinar badge de estado
            let statusBadge = '';
            switch (unit.status) {
                case 'available':
                    statusBadge = '<span class="badge bg-success">Disponible</span>';
                    break;
                case 'assigned':
                    statusBadge = '<span class="badge bg-primary">Asignado</span>';
                    break;
                case 'maintenance':
                    statusBadge = '<span class="badge bg-warning">Mantenimiento</span>';
                    break;
                case 'unavailable':
                    statusBadge = '<span class="badge bg-danger">No disponible</span>';
                    break;
                default:
                    statusBadge = '<span class="badge bg-secondary">Desconocido</span>';
            }
            
            // Información del evento si existe
            let eventInfo = '-';
            if (unit.event) {
                eventInfo = `<small title="${unit.event.event_name}">
                    ${unit.event.event_code || 'Sin código'}<br>
                    <span class="text-muted">${unit.event.venue || 'Sin venue'}</span>
                </small>`;
            }
            
            tr.innerHTML = `
                <td><code class="text-primary">${unit.sku || '-'}</code></td>
                <td><span class="badge bg-label-dark">${unit.id}</span></td>
                <td>${unit.serial_number || '-'}</td>
                <td>${statusBadge}</td>
                <td>${unit.location}</td>
                <td>-</td>
                <td><span class="badge badge-${(unit.condicion || 'BUENO').toLowerCase()}">${unit.condicion || 'BUENO'}</span></td>
                <td class="text-center">
                    <a href="/inventory/unidad/${unit.id}" class="btn btn-sm btn-outline-primary edit-unit-btn" title="Editar unidad completa">
                        <i class="mdi mdi-pencil me-1"></i>
                    </a>
                </td>
            `;
            
            tbody.appendChild(tr);
        });
    }
    
    async populateModalUnitsTable(item) {
    const tbody = document.getElementById('modalUnitsTableBody');
    if (!tbody) return;

    // loading…
    tbody.innerHTML = `
        <tr><td colspan="8" class="text-center text-muted">Cargando unidades…</td></tr>
    `;

    const parentId = this.parseParentIdFromItem_(item);
    if (!parentId) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Sin padre asociado.</td></tr>`;
        return;
    }

    try {
        const units = await loadUnitsByParent(parentId);

        if (!units.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Sin unidades registradas.</td></tr>`;
        return;
        }

        tbody.innerHTML = '';
        for (const u of units) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><code class="text-primary">${u.sku}</code></td>
            <td><span class="badge bg-label-dark">${u.id}</span></td>
            <td>${u.numeroSerie || '-'}</td>
            <td><span class="badge bg-secondary">${u.statusText}</span></td>
            <td>${u.locationText}</td>
            <td>-</td>
            <td><span class="badge badge-${(u.condicion || 'BUENO').toLowerCase()}">${u.condicion || 'BUENO'}</span></td>
            <td class="text-center">
                <a href="/inventory/unidad/${u.dbId}" class="btn btn-sm btn-primary" title="Editar unidad completa">
                    <i class="mdi mdi-pencil me-1"></i>
                    Editar
                </a>
            </td>
        `;
        tbody.appendChild(tr);
        }
    } catch (e) {
        console.error(e);
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-danger">Error al cargar unidades.</td></tr>`;
    }
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
    // Refresca la tabla y el <select> de Padres después de crear uno nuevo
    async refreshGridAfterParentCreate_(createdParent) {
        console.log('🔄 refreshGridAfterParentCreate_ iniciado');
        
        // 1) Limpiar cache completo
        this.clearAvailabilityCache();
        
        // 2) invalidar cache de padres
        PARENTS_CACHE = null;
        
        // 3) Limpiar arrays globales
        inventoryData.length = 0;
        filteredData.length = 0;

        // 4) recargar la grilla
        await this.loadGridFromParents();
        
        console.log('✅ Grid recargado, aplicando filtros...');
        
        // 5) SOLO llamar applyFilters() - este ya hace renderTable() internamente
        this.currentPage = 1;
        this.applyFilters(); // ✅ Esta línea YA incluye renderTable()
        this.updateItemCount();
        this.updateClearAllButtonState();

        // 6) Select de padres
        const itemModal = document.getElementById('addItemModal');
        if (itemModal && bootstrap.Modal.getInstance(itemModal)) {
            await this.refreshParentsSelectAfterCreate_(createdParent);
        }
        
        console.log('✅ refreshGridAfterParentCreate_ completado');
        // ❌ QUITAR: No más setTimeout ni llamadas adicionales a renderTable()
    }
    // Refresca la grilla y el cache de unidades tras crear una UNIDAD (InventoryItem)
    async refreshGridAfterItemCreate_(parentId) {
        try {
            // 1) Limpiar cache completo cuando hay una recarga total
            this.clearAvailabilityCache();
            
            // 2) invalidar cache de unidades del padre afectado
            if (parentId) UNITS_BY_PARENT_CACHE[parentId] = null;

            // 3) recargar grilla de PADRES desde backend (para actualizar units_count)
            const prevPage = this.currentPage || 1;
            await this.loadGridFromParents();
            this.applyFilters();
            this.currentPage = prevPage; // mantiene la página actual si quieres
            this.renderTable();
            this.updateItemCount();
            this.updateClearAllButtonState();

            // 4) (opcional) precargar unidades del padre para que expandir sea instantáneo
            if (parentId) { try { await loadUnitsByParent(parentId); } catch(e){} }
        } catch (e) {
            console.error('refreshGridAfterItemCreate_ error:', e);
        }
    }
    async optimisticUpdateAfterItemCreate_(parentId) {
        const pid = Number(parentId);
        const rowId = `P${pid}`;

        // 1) LIMPIAR CACHE DE DISPONIBILIDAD para forzar recarga
        this.clearAvailabilityCacheForItem(rowId);

        // 2) Incrementar SOLO en inventoryData
        const rowInv = Array.isArray(inventoryData)
            ? inventoryData.find(r => String(r.id) === rowId)
            : null;

        if (!rowInv) {
            // Fallback: si no encontramos la fila, recarga completa
            if (typeof this.refreshGridAfterItemCreate_ === 'function') {
                await this.refreshGridAfterItemCreate_(pid);
            }
            return;
        }

        rowInv.totalUnits = (Number(rowInv.totalUnits) || 0) + 1;

        // 3) Sincronizar en filteredData SOLO si es OTRO objeto (para no sumar 2 veces)
        const rowFilt = Array.isArray(filteredData)
            ? filteredData.find(r => String(r.id) === rowId)
            : null;

        if (rowFilt && rowFilt !== rowInv) {
            rowFilt.totalUnits = rowInv.totalUnits; // copiar valor, no volver a sumar
        }

        // 4) Re-pintar manteniendo página
        const prevPage = this.currentPage || 1;
        this.currentPage = prevPage;
        this.renderTable();
        this.updateItemCount();
        this.updateClearAllButtonState();

        // 5) Si la fila está expandida, rehidratar sus unidades
        if (typeof UNITS_BY_PARENT_CACHE !== 'undefined') {
            UNITS_BY_PARENT_CACHE[pid] = null; // invalidar cache
        }
        const expandedTbody = document.getElementById(`units-tbody-${rowId}`);
        if (expandedTbody) {
            this.hydrateExpandedUnitsTable_({ id: rowId, item_parent_id: pid });
        }
    }
    clearAvailabilityCacheForItem(itemId) {
        // Limpiar todas las entradas de cache que correspondan a este item
        const keysToDelete = [];
        for (const [key, value] of availabilityCache.entries()) {
            if (key.startsWith(`${itemId}_`)) {
                keysToDelete.push(key);
            }
        }
        keysToDelete.forEach(key => availabilityCache.delete(key));
        
        // También limpiar detalles
        const detailKeysToDelete = [];
        for (const [key, value] of detailsCache.entries()) {
            if (key.startsWith(`details_${itemId}_`)) {
                detailKeysToDelete.push(key);
            }
        }
        detailKeysToDelete.forEach(key => detailsCache.delete(key));
    }
    async saveNewItem() {
        const form = document.getElementById('addItemForm');

        // Asegura SOLO el SKU (no tocar ID que ya viene del padre)
        this.ensureSkuOnly_(true);

        // *** NUEVO: Obtener padre desde variable global en lugar del select ***
        let itemParentId;
        
        if (window.selectedParentId) {
            // Modo: añadir a padre específico
            itemParentId = window.selectedParentId;
        } else {
            // Modo: selección manual de padre (fallback por si acaso)
            const parentSelect = document.getElementById('itemParent');
            itemParentId = parentSelect ? parentSelect.value : '';
        }

        if (!itemParentId) {
            this.showAlert('No se pudo determinar el Producto Padre.', 'warning');
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

        if (!itemId) { errors.push('ID es requerido.'); isValid = false; }
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

            // ✅ IMPORTANTE: Limpiar cache específico del padre antes de la actualización optimista
            const parentRowId = `P${payload.item_parent_id}`;
            this.clearAvailabilityCacheForItem(parentRowId);

            // ✅ update optimista: sube el contador del PADRE y rehidrata si está expandido
            await this.optimisticUpdateAfterItemCreate_(payload.item_parent_id);

            // *** NUEVO: Limpiar variables globales ***
            window.selectedParentId = null;
            window.selectedParentItem = null;

            // *** NUEVO: Restaurar el select del padre ***
            const parentSelectContainer = document.querySelector('label[for="itemParent"]')?.closest('.col-md-12');
            if (parentSelectContainer) {
                parentSelectContainer.style.display = '';
            }

            // *** NUEVO: Remover información del padre ***
            const parentInfo = document.getElementById('selectedParentInfo');
            if (parentInfo) {
                parentInfo.remove();
            }

            // Limpieza UI
            form.reset();
            document.getElementById('imagePreview').style.display = 'none';
            if (this.itemStatusTagify) this.itemStatusTagify.removeAllTags();
            if (this.itemLocationTagify) this.itemLocationTagify.removeAllTags();
            document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => el.classList.remove('is-invalid', 'tagify--invalid'));
            bootstrap.Modal.getInstance(document.getElementById('addItemModal'))?.hide();
            this.showAlert(`Item "${nombrePublico || itemName}" agregado`, 'success');

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
        //await this.loadGridFromParents();
        //this.applyFilters();

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
        // ✅ REFRESCAR grilla + select con el nuevo padre
        await this.refreshGridAfterParentCreate_(data.data);
        this.showAlert(`Item Padre "${newParentForGrid.nombrePublico}" agregado.`, 'success');
         
    } catch (err) {
        console.error(err);
        this.showAlert('Error de red al guardar el Item Padre.', 'error');
    }
    }


    showCalendarView(itemId) {
        // Colapsar todos los items expandidos
        expandedItems.clear();
        
        // Expandir solo el item solicitado
        expandedItems.add(itemId);
        
        // Re-renderizar la tabla
        this.renderTable();
        
        // Scroll suave hacia la fila expandida
        setTimeout(() => {
            const expandedRow = document.querySelector(`tr[data-item-id="${itemId}"]`);
            if (expandedRow) {
                expandedRow.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }
            
            // Reinicializar Perfect Scrollbar
            const expandedContent = document.querySelector('.expanded-content.show .expanded-inner');
            if (expandedContent && typeof PerfectScrollbar !== 'undefined') {
                new PerfectScrollbar(expandedContent, {
                    wheelSpeed: 2,
                    wheelPropagation: false,
                    minScrollbarLength: 20
                });
            }
        }, 300);
    }

    editItem(itemId) {
        this.showAlert('Función de edición en desarrollo.', 'info');
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

    // Renderizar vista de grid (ASÍNCRONO)
    async renderGrid() {
    const gridBody = document.getElementById('inventoryGridBody');
    gridBody.innerHTML = '';

    const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
    const endIndex = startIndex + CONFIG.itemsPerPage;
    const pageItems = filteredData.slice(startIndex, endIndex);

    // (opcional) precarga en lote para acelerar
    await this.getBulkAvailability(pageItems);

    // Esperar disponibilidad por item antes de crear la tarjeta
    for (const item of pageItems) {
        const availability = await this.calculateAvailability(item);
        const card = this.createItemCard(item, availability);
        gridBody.appendChild(card);
    }

    this.updatePagination();
    }


    // Crear tarjeta de item
    createItemCard(item, availability) {
        // Normaliza por seguridad
        const av = {
            totalUnits: availability?.totalUnits ?? item.totalUnits ?? 0,
            available:  availability?.available  ?? 0,
            assigned:   availability?.assigned   ?? 0,
            maintenance:availability?.maintenance?? 0
        };

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
                            <li><a class="dropdown-item" href="#" onclick="inventoryCatalog.addItemToParent('${item.id}')">
                                <i class="mdi mdi-plus me-2"></i>Añadir Item
                            </a></li>
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

    async addItemToParent(itemId) {
        // Encontrar el item padre
        const parentItem = inventoryData.find(i => i.id === itemId);
        if (!parentItem) {
            this.showAlert('No se encontró el producto padre.', 'error');
            return;
        }

        // Obtener el ID numérico del padre (extraer de P123 -> 123)
        const parentId = this.parseParentIdFromItem_(parentItem);
        if (!parentId) {
            this.showAlert('ID del producto padre inválido.', 'error');
            return;
        }

        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));

        if (!this.tagifyInitialized) {
            await this.initializeTagifyFields?.();
            this.tagifyInitialized = true;
        }

        // Limpiar formulario
        document.getElementById('addItemForm').reset();
        document.getElementById('imagePreview').style.display = 'none';

        if (this.itemStatusTagify) this.itemStatusTagify.removeAllTags();
        if (this.itemLocationTagify) this.itemLocationTagify.removeAllTags();

        document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
            el.classList.remove('is-invalid', 'tagify--invalid');
        });

        // *** NUEVO: Ocultar el select de Producto Padre ***
        const parentSelectContainer = document.querySelector('label[for="itemParent"]')?.closest('.col-md-12');
        if (parentSelectContainer) {
            parentSelectContainer.style.display = 'none';
        }

        // *** NUEVO: Guardar el padre seleccionado en una variable global o dataset ***
        window.selectedParentId = parentId;
        window.selectedParentItem = parentItem;

        // Autorellenar campos basados en el padre
        const nameInput = document.getElementById('itemName');
        const publicNameInput = document.getElementById('itemPublicName');
        
        if (nameInput && !nameInput.value) {
            nameInput.value = parentItem.nombreProducto || '';
        }
        if (publicNameInput && !publicNameInput.value) {
            publicNameInput.value = parentItem.nombrePublico || '';
        }

        // Generar SKU automáticamente
        this.ensureSkuOnly_(false);

        // Obtener el siguiente ID para este padre
        try {
            const res = await fetch(`/inventory/item-parents/${parentId}/next-id`, { 
                headers: { 'Accept': 'application/json' } 
            });
            const data = await res.json();
            if (res.ok && data.success) {
                const idInput = document.getElementById('itemId');
                if (idInput) idInput.value = data.id;
            }
        } catch (err) {
            console.error('Error obteniendo siguiente ID:', err);
        }

        // Mostrar información del padre en el modal
        this.showParentInfoInModal(parentItem);

        modal.show();
    }

    // Función auxiliar para mostrar información del padre en el modal
    showParentInfoInModal(parentItem) {
        // Crear o actualizar un elemento que muestre información del padre
        let parentInfo = document.getElementById('selectedParentInfo');
        
        if (!parentInfo) {
            // Crear el elemento si no existe
            parentInfo = document.createElement('div');
            parentInfo.id = 'selectedParentInfo';
            parentInfo.className = 'alert alert-info mb-3';
            
            // Insertarlo al principio del modal body
            const modalBody = document.querySelector('#addItemModal .modal-body');
            modalBody.insertBefore(parentInfo, modalBody.firstChild);
        }

        parentInfo.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="mdi mdi-information me-2"></i>
                <div>
                    <strong>Añadiendo item a:</strong> ${parentItem.nombrePublico}<br>
                    <small class="text-muted">${parentItem.marca} ${parentItem.modelo} - ${parentItem.categoria}</small>
                </div>
            </div>
        `;
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
    selectCalendarDate: (dateString) => inventoryCatalog.selectCalendarDate(dateString),
    addItemToParent: (itemId) => inventoryCatalog.addItemToParent(itemId),
    selectModalCalendarDate: (dateString) => inventoryCatalog.selectModalCalendarDate(dateString) // *** NUEVA FUNCIÓN ***
};