/**
 * CATÁLOGO DE INVENTARIO - JAVASCRIPT CON INTEGRACIÓN API
 * Sistema de gestión de inventario para equipos de producción
 * Autor: Grupo Tangamanga
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    itemsPerPage: 10,
    maxCalendarDays: 28,
    dateFormat: 'es-ES',
    // URLs de la API
    apiUrls: {
        items: '/api/inventory/items',
        categories: '/api/inventory/categories',
        brands: '/api/inventory/brands',
        locations: '/api/inventory/locations',
        store: '/api/inventory/items'
    },
    // Configuración para datos de muestra (fallback)
    fallbackData: {
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
    }
};

// ===== VARIABLES GLOBALES =====
let currentDate = new Date();
let inventoryData = [];
let sampleData = []; // Datos de muestra separados
let filteredData = [];
let currentPage = 1;
let currentCategory = 'all';
let searchTerm = '';
let expandedItems = new Set();
let flatpickrInstance = null;
let currentView = 'table';
let isLoadingFromAPI = false;

// ===== CLASE PRINCIPAL ACTUALIZADA =====
class InventoryCatalog {
    constructor() {
        this.tagifyInitialized = false;
        this.apiCategories = [];
        this.apiBrands = [];
        this.apiLocations = [];
        this.init();
    }

    async init() {
        // Generar datos de muestra como respaldo
        this.generateSampleData();
        
        // Configurar event listeners
        this.setupEventListeners();
        this.initializeFlatpickr();
        this.initializePerfectScrollbar();
        
        // Cargar configuraciones desde la API
        await this.loadAPIConfigurations();
        
        // Inicializar Tagify con datos de la API
        this.initializeTagifyFields();
        
        this.updateDateDisplay();
        
        // Cargar datos (API + muestra)
        await this.loadInventoryData();
        
        this.updateItemCount();
        this.updateClearAllButtonState();
    }

    // ===== NUEVOS MÉTODOS PARA API =====
    
    /**
     * Cargar configuraciones desde la API
     */
    async loadAPIConfigurations() {
        try {
            // Cargar categorías
            const categoriesResponse = await this.fetchAPI(CONFIG.apiUrls.categories);
            if (categoriesResponse.success) {
                this.apiCategories = categoriesResponse.data;
                this.updateCategoryButtons();
            }

            // Cargar marcas
            const brandsResponse = await this.fetchAPI(CONFIG.apiUrls.brands);
            if (brandsResponse.success) {
                this.apiBrands = brandsResponse.data;
            }

            // Cargar ubicaciones
            const locationsResponse = await this.fetchAPI(CONFIG.apiUrls.locations);
            if (locationsResponse.success) {
                this.apiLocations = locationsResponse.data;
            }

        } catch (error) {
            console.warn('Error cargando configuraciones de API:', error);
            // Continuar con datos de fallback
        }
    }

    /**
     * Cargar datos de inventario (API + muestra)
     */
    async loadInventoryData() {
        isLoadingFromAPI = true;
        this.showLoading(true);

        try {
            const params = new URLSearchParams({
                date: currentDate.toISOString().split('T')[0],
                category: currentCategory !== 'all' ? currentCategory : '',
                search: searchTerm,
                page: currentPage,
                per_page: CONFIG.itemsPerPage
            });

            const response = await this.fetchAPI(`${CONFIG.apiUrls.items}?${params}`);
            
            if (response.success) {
                // Combinar datos de API con datos de muestra
                inventoryData = [
                    ...response.data, // Datos de la base de datos
                    ...sampleData     // Datos de muestra
                ];

                // Actualizar información de paginación si está disponible
                if (response.pagination) {
                    this.updatePaginationInfo(response.pagination);
                }
            } else {
                throw new Error('Error en respuesta de API');
            }

        } catch (error) {
            console.warn('Error cargando datos de API, usando solo datos de muestra:', error);
            // Usar solo datos de muestra si la API falla
            inventoryData = [...sampleData];
        }

        // Aplicar filtros locales
        this.applyFilters();
        this.showLoading(false);
        isLoadingFromAPI = false;
    }

    /**
     * Realizar petición fetch con manejo de errores
     */
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

    /**
     * Actualizar botones de categoría con datos de API
     */
    updateCategoryButtons() {
        const categoryContainer = document.getElementById('categoryFilters');
        if (!categoryContainer || !this.apiCategories.length) return;

        // Mantener el botón "Todos"
        const allButton = categoryContainer.querySelector('[data-category="all"]');
        categoryContainer.innerHTML = '';
        if (allButton) {
            categoryContainer.appendChild(allButton);
        }

        // Agregar categorías de la API
        this.apiCategories.forEach(category => {
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

    /**
     * Actualizar información de paginación
     */
    updatePaginationInfo(pagination) {
        document.getElementById('showingFrom').textContent = pagination.from || 0;
        document.getElementById('showingTo').textContent = pagination.to || 0;
        document.getElementById('totalItems').textContent = pagination.total || 0;
        
        // Actualizar controles de paginación
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.parentElement.classList.toggle('disabled', pagination.current_page <= 1);
        nextBtn.parentElement.classList.toggle('disabled', pagination.current_page >= pagination.last_page);
    }

    // ===== MÉTODOS MODIFICADOS =====

    /**
     * Aplicar filtros (modificado para manejar datos mixtos)
     */
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

    /**
     * Manejar filtro de categoría (modificado para recargar API)
     */
    async handleCategoryFilter(e) {
        // Remover clase activa de todos los botones
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        
        // Activar botón seleccionado
        e.target.classList.add('active', 'btn-label-primary');
        e.target.classList.remove('btn-outline-primary');
        
        currentCategory = e.target.dataset.category;
        
        // Recargar datos si hay búsqueda o filtros activos
        if (searchTerm || currentCategory !== 'all') {
            await this.loadInventoryData();
        } else {
            this.applyFilters();
        }
        
        this.updateClearAllButtonState();
    }

    /**
     * Manejar búsqueda (modificado para recargar API)
     */
    async handleSearch(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        
        // Mostrar/ocultar botón de limpiar búsqueda
        const clearSearchBtn = document.getElementById('clearSearchBtn');
        if (searchTerm.length > 0) {
            clearSearchBtn.classList.remove('d-none');
        } else {
            clearSearchBtn.classList.add('d-none');
        }
        
        // Debounce para evitar demasiadas peticiones
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            await this.loadInventoryData();
        }, 500);
        
        this.updateClearAllButtonState();
    }

    /**
     * Guardar nuevo item (integrado con API)
     */
    async saveNewItem() {
        const form = document.getElementById('addItemForm');
        
        // Función para obtener valor único de Tagify
        const getTagifyValue = (tagifyInstance) => {
            if (!tagifyInstance) return '';
            const tags = tagifyInstance.value;
            return tags.length > 0 ? tags[0].value : '';
        };

        // Obtener valores del formulario
        const formData = {
            name: document.getElementById('itemName').value.trim(),
            public_name: document.getElementById('itemPublicName')?.value.trim() || '',
            category_id: this.getCategoryIdByCode(getTagifyValue(this.itemCategoryTagify)),
            brand_id: this.getBrandIdByName(getTagifyValue(this.itemBrandTagify)),
            model: getTagifyValue(this.itemModelTagify),
            family: getTagifyValue(this.itemFamilyTagify),
            sub_family: getTagifyValue(this.itemSubFamilyTagify),
            color: getTagifyValue(this.itemColorTagify) || 'NEGRO',
            serial_number: document.getElementById('itemSerial').value.trim(),
            location_id: this.getLocationIdByName(getTagifyValue(this.itemLocationTagify)),
            status: getTagifyValue(this.itemStatusTagify),
            condition: 'BUENO', // Valor por defecto
            unit_set: document.getElementById('itemUnitSet').value || 'UNIT',
            rack_position: document.getElementById('itemRack').value.trim(),
            panel_position: document.getElementById('itemPanel').value.trim(),
            rfid_tag: document.getElementById('itemRfid').value.trim(),
            original_price: parseFloat(document.getElementById('itemOriginalPrice').value) || 0,
            ideal_rental_price: parseFloat(document.getElementById('itemIdealPrice').value) || 0,
            minimum_rental_price: parseFloat(document.getElementById('itemMinPrice').value) || 0,
            warranty_valid: document.getElementById('itemWarranty').value === 'SI'
        };

        // Validaciones básicas
        if (!formData.name || !formData.category_id || !formData.brand_id || !formData.location_id || !formData.status) {
            this.showAlert('Por favor, complete todos los campos requeridos.', 'warning');
            return;
        }

        try {
            this.showLoading(true);
            
            const response = await this.fetchAPI(CONFIG.apiUrls.store, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (response.success) {
                // Cerrar modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('addItemModal'));
                modal.hide();
                
                // Limpiar formulario
                form.reset();
                this.clearTagifyFields();
                document.getElementById('imagePreview').style.display = 'none';
                
                // Recargar datos
                await this.loadInventoryData();
                
                this.showAlert(`Item "${response.data.public_name || response.data.name}" agregado exitosamente.`, 'success');
            } else {
                throw new Error(response.message || 'Error al guardar el item');
            }

        } catch (error) {
            console.error('Error al guardar item:', error);
            this.showAlert('Ocurrió un error al guardar el item. Por favor, inténtelo de nuevo.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    /**
     * Limpiar campos Tagify
     */
    clearTagifyFields() {
        if (this.itemCategoryTagify) this.itemCategoryTagify.removeAllTags();
        if (this.itemBrandTagify) this.itemBrandTagify.removeAllTags();
        if (this.itemModelTagify) this.itemModelTagify.removeAllTags();
        if (this.itemFamilyTagify) this.itemFamilyTagify.removeAllTags();
        if (this.itemSubFamilyTagify) this.itemSubFamilyTagify.removeAllTags();
        if (this.itemColorTagify) this.itemColorTagify.removeAllTags();
        if (this.itemStatusTagify) this.itemStatusTagify.removeAllTags();
        if (this.itemLocationTagify) this.itemLocationTagify.removeAllTags();
    }

    /**
     * Obtener ID de categoría por código
     */
    getCategoryIdByCode(code) {
        const category = this.apiCategories.find(cat => cat.code === code);
        return category ? category.id : null;
    }

    /**
     * Obtener ID de marca por nombre
     */
    getBrandIdByName(name) {
        const brand = this.apiBrands.find(brand => brand.name === name);
        return brand ? brand.id : null;
    }

    /**
     * Obtener ID de ubicación por nombre
     */
    getLocationIdByName(name) {
        const location = this.apiLocations.find(loc => loc.name === name);
        return location ? location.id : null;
    }

    /**
     * Mostrar detalles del item (modificado para API)
     */
    async showItemDetails(itemId) {
        try {
            // Buscar primero en datos locales
            let item = inventoryData.find(i => i.id == itemId);
            
            // Si el item es de la base de datos, obtener detalles completos
            if (item && item.isFromDatabase) {
                const response = await this.fetchAPI(`${CONFIG.apiUrls.items}/${itemId}?date=${currentDate.toISOString().split('T')[0]}`);
                if (response.success) {
                    item = response.data;
                }
            }
            
            if (!item) {
                this.showAlert('Item no encontrado', 'error');
                return;
            }
            
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
                    ${item.isFromDatabase ? '<div class="col-12"><span class="badge bg-success">Desde Base de Datos</span></div>' : '<div class="col-12"><span class="badge bg-info">Datos de Muestra</span></div>'}
                </div>
            `;
            
            // Información de disponibilidad
            const availability = item.availability || this.calculateAvailability(item);
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
            
        } catch (error) {
            console.error('Error al cargar detalles del item:', error);
            this.showAlert('Error al cargar los detalles del item', 'error');
        }
    }

    /**
     * Cambiar página (modificado para API)
     */
    async changePage(newPage) {
        const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        currentPage = newPage;
        
        // Si hay filtros activos, recargar desde API
        if (searchTerm || currentCategory !== 'all') {
            await this.loadInventoryData();
        } else {
            this.renderTable();
            this.updatePagination();
        }
    }

    // ===== INICIALIZACIÓN TAGIFY ACTUALIZADA =====
    
    initializeTagifyFields() {
        // Preparar listas de opciones
        const categoryOptions = this.apiCategories.map(cat => cat.code);
        const brandOptions = this.apiBrands.map(brand => brand.name);
        const locationOptions = this.apiLocations.map(loc => loc.name);
        
        // Usar fallback si no hay datos de API
        const fallbackCategories = categoryOptions.length ? categoryOptions : CONFIG.fallbackData.categories;
        const fallbackBrands = brandOptions.length ? brandOptions : CONFIG.fallbackData.brands;
        const fallbackLocations = locationOptions.length ? locationOptions : CONFIG.fallbackData.locations;

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

        // Inicializar Tagify para cada campo
        const itemCategoryEl = document.querySelector('#itemCategory');
        if (itemCategoryEl) {
            this.itemCategoryTagify = new Tagify(itemCategoryEl, createTagifyConfig(fallbackCategories, 1, true));
        }

        const itemBrandEl = document.querySelector('#itemBrand');
        if (itemBrandEl) {
            this.itemBrandTagify = new Tagify(itemBrandEl, createTagifyConfig(fallbackBrands, 1, false));
        }

        const itemModelEl = document.querySelector('#itemModel');
        if (itemModelEl) {
            this.itemModelTagify = new Tagify(itemModelEl, createTagifyConfig([], 1, false));
        }

        const itemFamilyEl = document.querySelector('#itemFamily');
        if (itemFamilyEl) {
            this.itemFamilyTagify = new Tagify(itemFamilyEl, createTagifyConfig([], 1, false));
        }

        const itemSubFamilyEl = document.querySelector('#itemSubFamily');
        if (itemSubFamilyEl) {
            this.itemSubFamilyTagify = new Tagify(itemSubFamilyEl, createTagifyConfig([], 1, false));
        }

        const itemColorEl = document.querySelector('#itemColor');
        if (itemColorEl) {
            this.itemColorTagify = new Tagify(itemColorEl, createTagifyConfig(['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'AMARILLO'], 1, true));
        }

        const itemStatusEl = document.querySelector('#itemStatus');
        if (itemStatusEl) {
            this.itemStatusTagify = new Tagify(itemStatusEl, createTagifyConfig(CONFIG.fallbackData.statuses, 1, true));
        }

        const itemLocationEl = document.querySelector('#itemLocation');
        if (itemLocationEl) {
            this.itemLocationTagify = new Tagify(itemLocationEl, createTagifyConfig(fallbackLocations, 1, true));
        }
    }

    // ===== MÉTODOS ORIGINALES MANTENIDOS =====
    
    generateSampleData() {
        sampleData = [];
        
        // Datos base con estructura igual
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
            const item = this.createFullItem(baseItem, index + 1000); // IDs altos para evitar conflictos
            item.isFromDatabase = false; // Marcar como datos de muestra
            sampleData.push(item);
        });
    }

    // Mantener todos los métodos existentes de createFullItem, generateFamily, etc.
    // (Los métodos existentes siguen funcionando igual)
    
    createFullItem(baseItem, index) {
        const categoryPrefix = baseItem.categoria.charAt(0);
        const brandPrefix = baseItem.marca.charAt(0);
        const skuNumber = String(index).padStart(6, '0');
        const idNumber = String(index).padStart(2, '0');

        const item = {
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
            totalUnits: baseItem.units,
            units: this.generateUnits(baseItem.units, `${categoryPrefix}${brandPrefix}${idNumber}`, baseItem.modelo || 'GENERIC'),
            isFromDatabase: false
        };

        return item;
    }

    // ... (mantener todos los métodos helper existentes: generateFamily, generateSubFamily, etc.)
    
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
        
        const hasEvents = seed % 3 !== 0;
        
        if (hasEvents) {
            const numEvents = (seed % 3) + 1;
            
            for (let i = 0; i < numEvents; i++) {
                const eventDay = (seed + i * 7) % 30 + 1;
                const eventDate = new Date(today);
                eventDate.setDate(today.getDate() + eventDay);
                
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

    // ===== MANTENER TODOS LOS MÉTODOS DE RENDERIZADO EXISTENTES =====
    
    setupEventListeners() {
        // Navegación de fechas
        document.getElementById('prevDayBtn').addEventListener('click', () => this.changeDate(-1));
        document.getElementById('nextDayBtn').addEventListener('click', () => this.changeDate(1));
        document.getElementById('todayBtn').addEventListener('click', () => this.setToday());
        
        // Búsqueda (modificado para usar async)
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));

        // Botón limpiar búsqueda
        document.getElementById('clearSearchBtn').addEventListener('click', () => this.clearSearch());

        // Botón limpiar todos los filtros
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAllFilters());
        
        // Filtros de categoría - ya están configurados en updateCategoryButtons()
        
        // Botones principales
        document.getElementById('exportBtn').addEventListener('click', () => this.exportData());
        document.getElementById('addItemBtn').addEventListener('click', () => this.showAddItemModal());
        
        // Paginación (modificado para usar async)
        document.getElementById('prevPage').addEventListener('click', async (e) => {
            e.preventDefault();
            await this.changePage(currentPage - 1);
        });
        document.getElementById('nextPage').addEventListener('click', async (e) => {
            e.preventDefault(); 
            await this.changePage(currentPage + 1);
        });
        
        // Modal events
        document.getElementById('saveItemBtn').addEventListener('click', () => this.saveNewItem());
        
        // Filters
        document.getElementById('clearFilters').addEventListener('click', () => this.clearAllFilters());

        // Preview de imagen
        document.getElementById('itemImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            const previewImg = document.getElementById('previewImg');
            
            if (file) {
                if (file.size > 2 * 1024 * 1024) {
                    this.showAlert('La imagen es muy grande. Máximo 2MB permitido.', 'warning');
                    e.target.value = '';
                    preview.style.display = 'none';
                    return;
                }
                
                if (!file.type.startsWith('image/')) {
                    this.showAlert('Por favor selecciona un archivo de imagen válido.', 'warning');
                    e.target.value = '';
                    preview.style.display = 'none';
                    return;
                }
                
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

        // Botones de vista
        document.getElementById('tableViewBtn').addEventListener('click', () => this.switchToTableView());
        document.getElementById('cardViewBtn').addEventListener('click', () => this.switchToGridView());
    }

    // ===== MÉTODOS DE FECHAS MODIFICADOS =====
    
    async changeDate(days) {
        currentDate.setDate(currentDate.getDate() + days);
        this.updateDateDisplay();
        this.updateFlatpickr();
        await this.loadInventoryData();
    }

    async setToday() {
        currentDate = new Date();
        this.updateDateDisplay();
        this.updateFlatpickr();
        await this.loadInventoryData();
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

    initializeFlatpickr() {
        const dateInput = document.getElementById('dateInput');
        if (dateInput) {
            flatpickrInstance = flatpickr(dateInput, {
                dateFormat: 'Y-m-d',
                defaultDate: currentDate,
                inline: true,
                onChange: async (selectedDates, dateStr) => {
                    if (selectedDates.length > 0) {
                        currentDate = selectedDates[0];
                        this.updateDateDisplay();
                        await this.loadInventoryData();
                        
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

    initializePerfectScrollbar() {
        const modalBody = document.querySelector('#unitDetailsModal .modal-body');
        if (modalBody && typeof PerfectScrollbar !== 'undefined') {
            new PerfectScrollbar(modalBody, {
                wheelSpeed: 2,
                wheelPropagation: true,
                minScrollbarLength: 20
            });
        }

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

    // ===== MÉTODOS DE CÁLCULO Y RENDERIZADO MANTENIDOS =====
    
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

    renderTable() {
        const tbody = document.getElementById('inventoryTableBody');
        tbody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = filteredData.slice(startIndex, endIndex);
        
        pageItems.forEach(item => {
            const availability = item.availability || this.calculateAvailability(item);
            const row = this.createTableRow(item, availability);
            tbody.appendChild(row);
            
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
                            ${item.isFromDatabase ? '<i class="mdi mdi-database text-success ms-1" title="Base de Datos"></i>' : '<i class="mdi mdi-test-tube text-info ms-1" title="Datos de Muestra"></i>'}
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
        
        const expandBtn = row.querySelector('.expand-btn');
        expandBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleItemExpansion(item.id);
        });

        row.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown') || e.target.closest('.dropdown-menu')) {
                return;
            }
            
            if (e.target.closest('a') || e.target.closest('button')) {
                return;
            }
            
            this.toggleItemExpansion(item.id);
        });

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
                                ${item.isFromDatabase ? '<span class="badge bg-success ms-2">BD</span>' : '<span class="badge bg-info ms-2">Muestra</span>'}
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
        startDate.setDate(today.getDate() - 14);
        
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

    async selectCalendarDate(dateString) {
        currentDate = new Date(dateString);
        this.updateDateDisplay();
        this.updateFlatpickr();
        await this.loadInventoryData();
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

    updatePagination() {
        const totalPages = Math.ceil(filteredData.length / CONFIG.itemsPerPage);
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = Math.min(startIndex + CONFIG.itemsPerPage, filteredData.length);
        
        document.getElementById('showingFrom').textContent = filteredData.length > 0 ? startIndex + 1 : 0;
        document.getElementById('showingTo').textContent = endIndex;
        document.getElementById('totalItems').textContent = filteredData.length;
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.parentElement.classList.toggle('disabled', currentPage <= 1);
        nextBtn.parentElement.classList.toggle('disabled', currentPage >= totalPages);
    }

    updateItemCount() {
        const countText = `${filteredData.length} ítems encontrados`;
        document.getElementById('itemCount').textContent = countText;
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

    showAddItemModal() {
        const modal = new bootstrap.Modal(document.getElementById('addItemModal'));
        
        if (!this.tagifyInitialized) {
            this.initializeTagifyFields();
            this.tagifyInitialized = true;
        }
        
        document.getElementById('addItemForm').reset();
        document.getElementById('imagePreview').style.display = 'none';
        
        this.clearTagifyFields();
        
        document.querySelectorAll('.is-invalid, .tagify--invalid').forEach(el => {
            el.classList.remove('is-invalid', 'tagify--invalid');
        });
        
        modal.show();
    }

    showCalendarView(itemId) {
        if (!expandedItems.has(itemId)) {
            expandedItems.add(itemId);
            this.renderTable();
        }
    }

    editItem(itemId) {
        this.showAlert('Función de edición en desarrollo.', 'info');
    }

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
            'Precio Renta Mínimo': item.precioRentaMinimo,
            Fuente: item.isFromDatabase ? 'Base de Datos' : 'Datos de Muestra'
        }));
        
        const csvContent = this.convertToCSV(dataToExport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
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
        
        csvRows.push(headers.join(','));
        
        data.forEach(row => {
            const values = headers.map(header => {
                const escaped = ('' + row[header]).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        });
        
        return csvRows.join('\n');
    }

    showAlert(message, type = 'info') {
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

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('d-none');
        searchTerm = '';
        this.applyFilters();
        this.updateClearAllButtonState();
    }

    async clearAllFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchBtn').classList.add('d-none');
        searchTerm = '';
        
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-primary');
        });
        document.querySelector('[data-category="all"]').classList.add('active', 'btn-label-primary');
        document.querySelector('[data-category="all"]').classList.remove('btn-outline-primary');
        currentCategory = 'all';
        
        await this.loadInventoryData();
        this.updateClearAllButtonState();
        
        this.showAlert('Todos los filtros han sido limpiados.', 'success');
    }

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

    switchToTableView() {
        document.getElementById('tableView').classList.remove('d-none');
        document.getElementById('gridView').classList.add('d-none');
        
        document.getElementById('tableViewBtn').classList.add('active');
        document.getElementById('cardViewBtn').classList.remove('active');
        
        this.currentView = 'table';
        this.renderCurrentView();
    }

    switchToGridView() {
        document.getElementById('tableView').classList.add('d-none');
        document.getElementById('gridView').classList.remove('d-none');
        
        document.getElementById('tableViewBtn').classList.remove('active');
        document.getElementById('cardViewBtn').classList.add('active');
        
        this.currentView = 'grid';
        this.renderCurrentView();
    }

    renderCurrentView() {
        if (this.currentView === 'grid') {
            this.renderGrid();
        } else {
            this.renderTable();
        }
    }

    renderGrid() {
        const gridBody = document.getElementById('inventoryGridBody');
        gridBody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageItems = filteredData.slice(startIndex, endIndex);
        
        pageItems.forEach(item => {
            const availability = item.availability || this.calculateAvailability(item);
            const card = this.createItemCard(item, availability);
            gridBody.appendChild(card);
        });
        
        this.updatePagination();
    }

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
                                ${item.isFromDatabase ? '<i class="mdi mdi-database text-success ms-1" title="Base de Datos"></i>' : '<i class="mdi mdi-test-tube text-info ms-1" title="Datos de Muestra"></i>'}
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
                            <i class="mdi mdi-dots-vertical"></i> Acciones
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
        
        cardDiv.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown') || e.target.closest('.dropdown-menu') || e.target.closest('button')) {
                return;
            }
            this.toggleItemExpansion(item.id);
        });
        
        colDiv.appendChild(cardDiv);
        return colDiv;
    }

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
                        <div class="item-detail-item">
                            <div class="item-detail-label">Fuente</div>
                            <div class="item-detail-value">
                                ${item.isFromDatabase ? 
                                    '<span class="badge bg-success">Base de Datos</span>' : 
                                    '<span class="badge bg-info">Datos de Muestra</span>'
                                }
                            </div>
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
    console.log('Modo mixto: API + Datos de muestra habilitado');
});

// ===== FUNCIONES GLOBALES PARA EVENTOS =====
window.inventoryCatalog = {
    showItemDetails: (itemId) => inventoryCatalog.showItemDetails(itemId),
    showCalendarView: (itemId) => inventoryCatalog.showCalendarView(itemId),
    editItem: (itemId) => inventoryCatalog.editItem(itemId),
    selectCalendarDate: (dateString) => inventoryCatalog.selectCalendarDate(dateString),
    toggleItemExpansion: (itemId) => inventoryCatalog.toggleItemExpansion(itemId)
};