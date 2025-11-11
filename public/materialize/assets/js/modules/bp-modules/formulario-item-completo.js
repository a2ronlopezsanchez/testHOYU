/**
 * FORMULARIO COMPLETO DE ITEM - JAVASCRIPT
 * Sistema de registro completo de items para inventario
 * Autor: Happening Network Media
 */

// ===== CONFIGURACIÓN GLOBAL =====
const FORM_CONFIG = {
    autoSaveInterval: 30000, // 30 segundos
    imageMaxSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
    cloudinaryUrl: 'https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload',
    cloudinaryPreset: 'YOUR_UPLOAD_PRESET',
    requiredFields: ['itemName', 'itemCategory', 'itemBrand', 'itemModel', 'itemStatus', 'itemLocation']
};

// ===== VARIABLES GLOBALES =====
let formData = {
    // Información básica
    sku: '',
    nombreProducto: '',
    id: '',
    categoria: '',
    familia: '',
    subFamilia: '',
    marca: '',
    modelo: '',
    nombrePublico: '',
    descripcion: '',
    
    // Identificadores
    numeroSerie: '',
    identificadorRfid: '',
    color: '',
    unitSet: 'UNIT',
    totalUnits: 1,
    
    // Información financiera
    fechaCompra: '',
    garantiaVigente: 'NO',
    precioOriginal: 0,
    precioRentaIdeal: 0,
    precioRentaMinimo: 0,
    
    // Ubicación y estado
    ubicacion: '',
    status: '',
    rack: '',
    panel: '',
    condicion: 'BUENO',
    notas: '',
    
    // Especificaciones técnicas
    especificaciones: [],
    
    // Multimedia
    imagenes: [],
    
    // RFID
    rfidConfig: {
        includeNombre: true,
        includeCategoria: true,
        includeMarca: true,
        includeSerial: false,
        includeFecha: false,
        includeCondicion: true
    }
};

let isEditing = false;
let editingItemId = null;
let currentInventoryItemId = null; // ID del InventoryItem (unidad) una vez guardado como borrador
let autoSaveEnabled = true;
let autoSaveTimer = null;
let unsavedChanges = false;
let tagifyInstances = {};
let dropzoneInstance = null;

// ===== CLASE PRINCIPAL =====
class ItemFormManager {
    constructor() {
        this.init();
    }

    async init() {
        this.checkEditMode();
        this.checkNewUnitMode();
        this.setupEventListeners();
        await this.initializeTagify(); // Ahora es async para cargar ubicaciones
        this.initializeDropzone();
        this.calculateProgress();
        this.setupAutoSave();
        this.initializeValidation();
        this.loadTemplates();
    }

    // ===== VERIFICAR MODO DE EDICIÓN =====
    checkEditMode() {
        // Primero verificar si hay datos de Blade
        if (window.bladeFormData && (window.bladeFormData.mode === 'edit' || window.bladeFormData.mode === 'edit-unit') && window.bladeFormData.itemParent) {
            isEditing = true;
            editingItemId = window.bladeFormData.itemParent.id;
            this.loadItemDataFromBlade(window.bladeFormData);
            // El título ya está configurado en Blade, no es necesario cambiarlo aquí
            return;
        }

        // Si no, verificar el modo antiguo con parámetro URL
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('edit');

        if (itemId) {
            isEditing = true;
            editingItemId = itemId;
            this.loadItemData(itemId);
            document.getElementById('formTitle').textContent = 'Editar Item';
            document.getElementById('saveButtonText').textContent = 'Actualizar Item';
        }
    }

    // ===== CARGAR DATOS DESDE BLADE =====
    loadItemDataFromBlade(bladeData) {
        console.log('Cargando datos desde Blade:', bladeData);

        const { itemParent, inventoryItem } = bladeData;

        // Si estamos editando un item existente, establecer su ID
        if (inventoryItem && inventoryItem.id) {
            currentInventoryItemId = inventoryItem.id;
            console.log('✅ Item cargado para edición. ID:', currentInventoryItemId);
        }

        // Logs detallados de los valores
        console.log('📦 inventoryItem completo:', inventoryItem);
        console.log('🏢 itemParent completo:', itemParent);
        console.log('🎨 inventoryItem.color:', inventoryItem?.color);
        console.log('📍 inventoryItem.location:', inventoryItem?.location);
        console.log('🔄 inventoryItem.status:', inventoryItem?.status);
        console.log('📅 inventoryItem.purchase_date:', inventoryItem?.purchase_date);

        // Determinar qué especificaciones usar: del inventoryItem si existen, sino del parent
        let specifications = [];
        if (bladeData.mode === 'edit-unit' && inventoryItem?.specifications && inventoryItem.specifications.length > 0) {
            // En modo edit-unit, priorizar specifications del inventoryItem
            specifications = inventoryItem.specifications.map(spec => ({
                name: spec.name || spec.key,
                value: spec.value
            }));
            console.log('✅ Usando specifications del InventoryItem:', specifications);
        } else {
            // En otros modos, usar specifications del parent
            specifications = this.parseSpecifications(itemParent.specifications);
            console.log('✅ Usando specifications del ItemParent:', specifications);
        }

        // Convertir datos de Blade al formato esperado por populateForm()
        const formattedData = {
            // Información básica
            sku: inventoryItem?.sku || '',
            // En modo edit-unit, usar nombre del inventoryItem; en otros modos, usar el del parent
            nombreProducto: (bladeData.mode === 'edit-unit' && inventoryItem?.name) ? inventoryItem.name : itemParent.name || '',
            id: inventoryItem?.item_id || '',
            categoria: itemParent.category?.name || '',
            familia: itemParent.family || '',
            subFamilia: itemParent.sub_family || '',
            marca: itemParent.brand?.name || '',
            modelo: itemParent.model || '',
            // En modo edit-unit, usar nombre público del inventoryItem; en otros modos, usar el del parent
            nombrePublico: (bladeData.mode === 'edit-unit' && inventoryItem?.public_name) ? inventoryItem.public_name : itemParent.public_name || '',
            descripcion: itemParent.description || inventoryItem?.description || '',

            // Identificadores
            numeroSerie: inventoryItem?.serial_number || '',
            identificadorRfid: inventoryItem?.rfid_tag || '',
            // Color del inventoryItem si existe, sino del parent
            color: inventoryItem?.color || itemParent.color || '',
            unitSet: inventoryItem?.unit_set || 'UNIT',
            totalUnits: inventoryItem?.total_units || 1,

            // Información financiera
            fechaCompra: inventoryItem?.purchase_date || '',
            garantiaVigente: inventoryItem?.warranty_valid ? 'SI' : 'NO',
            precioOriginal: inventoryItem?.original_price || 0,
            precioRentaIdeal: inventoryItem?.ideal_rental_price || 0,
            precioRentaMinimo: inventoryItem?.minimum_rental_price || 0,

            // Ubicación y estado
            ubicacion: inventoryItem?.location?.name || '',
            status: inventoryItem?.status || '',
            rack: inventoryItem?.rack_position || '',
            panel: inventoryItem?.panel_position || '',
            condicion: inventoryItem?.condition || 'BUENO',
            notas: inventoryItem?.notes || '',

            // Especificaciones (del inventoryItem o del parent según el modo)
            especificaciones: specifications
        };

        // Log para debug
        console.log('📋 Datos formateados para poblar formulario:', formattedData);
        console.log('🎨 Color:', formattedData.color);
        console.log('📍 Ubicación:', formattedData.ubicacion);
        console.log('🔄 Status:', formattedData.status);

        // Poblar el formulario con los datos
        this.populateForm(formattedData);

        // Si estamos en modo edición o edit-unit, bloquear campos que no se deben modificar
        // Usar setTimeout para dar tiempo a Tagify a procesar los tags antes de bloquear
        if (bladeData.mode === 'edit' || bladeData.mode === 'edit-unit') {
            setTimeout(() => {
                this.lockFieldsInEditMode();
            }, 200);
        }
    }

    // ===== PARSEAR ESPECIFICACIONES =====
    parseSpecifications(specs) {
        if (!specs) return [];

        try {
            // Si ya es un array
            if (Array.isArray(specs)) {
                // Convertir strings a objetos {name, value}
                return specs.map(spec => {
                    if (typeof spec === 'string') {
                        // Tratar de separar por ":"
                        const parts = spec.split(':');
                        return {
                            name: parts[0]?.trim() || spec,
                            value: parts[1]?.trim() || ''
                        };
                    }
                    return spec;
                });
            }

            // Si es un string JSON
            if (typeof specs === 'string') {
                const parsed = JSON.parse(specs);
                return this.parseSpecifications(parsed);
            }

            return [];
        } catch (e) {
            console.error('Error parseando especificaciones:', e);
            return [];
        }
    }

    // ===== BLOQUEAR CAMPOS EN MODO EDICIÓN =====
    lockFieldsInEditMode() {
        console.log('🔒 Bloqueando campos no editables en modo edición');

        // Campos que no se pueden modificar en edición
        const fieldsToLock = [
            'itemSku',        // SKU
            'itemId',         // Item ID
        ];

        // Deshabilitar inputs normales
        fieldsToLock.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.disabled = true;
                field.classList.add('bg-light');
                field.style.cursor = 'not-allowed';
            }
        });

        // Deshabilitar Tagify instances (categoria, familia, sub-familia, marca, modelo)
        const tagifyFieldsToLock = ['category', 'family', 'subFamily', 'brand', 'model'];

        tagifyFieldsToLock.forEach(tagifyKey => {
            if (tagifyInstances[tagifyKey]) {
                tagifyInstances[tagifyKey].setReadonly(true);
                // Añadir estilo visual de deshabilitado
                const tagifyElement = tagifyInstances[tagifyKey].DOM.scope;
                if (tagifyElement) {
                    tagifyElement.classList.add('bg-light');
                    tagifyElement.style.cursor = 'not-allowed';
                }
            }
        });
    }

    // ===== CARGAR DATOS DESDE PARENT (MODO NEW-FROM-PARENT) =====
    loadNewFromParentData(bladeData) {
        console.log('Cargando datos desde parent para nueva unidad:', bladeData);

        const { itemParent } = bladeData;

        // Cargar datos del parent en los campos correspondientes
        const formData = {
            // Datos del parent - READONLY
            categoria: itemParent.category?.name || '',
            familia: itemParent.family || '',
            subFamilia: itemParent.sub_family || '',
            marca: itemParent.brand?.name || '',
            modelo: itemParent.model || '',

            // Datos editables - prellenados desde parent
            nombreProducto: itemParent.name || '',
            nombrePublico: itemParent.public_name || '',
            descripcion: itemParent.description || '',
            color: itemParent.color || '',

            // Especificaciones del parent (si existen)
            especificaciones: this.parseSpecifications(itemParent.specifications),

            // Campos de unidad nueva - dejar vacíos para que el usuario o sistema los genere
            sku: '', // Se generará automáticamente
            id: '',  // Se generará automáticamente
            numeroSerie: '',
            identificadorRfid: '',
            unitSet: 'UNIT',
            totalUnits: 1
        };

        // Poblar el formulario
        this.populateForm(formData);

        // Hacer campos readonly: categoria, familia, subfamilia, marca, modelo
        this.makeFieldsReadonly([
            'itemCategory',
            'itemFamily',
            'itemSubFamily',
            'itemBrand',
            'itemModel'
        ]);

        // Generar SKU automáticamente
        this.generateAndSetSku();

        // Generar siguiente ID para este parent
        this.generateNextIdForParent(itemParent.id);
    }

    // ===== HACER CAMPOS READONLY =====
    makeFieldsReadonly(fieldIds) {
        fieldIds.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                // Si es un Tagify input
                if (tagifyInstances[fieldId]) {
                    tagifyInstances[fieldId].setReadonly(true);
                    // Añadir clase visual para indicar readonly
                    field.closest('.form-floating')?.classList.add('readonly-field');
                } else {
                    // Input normal
                    field.readOnly = true;
                    field.disabled = true;
                    field.classList.add('readonly-field');
                }
            }
        });
    }

    // ===== GENERAR SIGUIENTE ID PARA PARENT =====
    async generateNextIdForParent(parentId) {
        try {
            const response = await fetch(`/inventory/item-parents/${parentId}/next-id`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Error al obtener siguiente ID');
            }

            const data = await response.json();

            if (data.success && data.id) {
                const idInput = document.getElementById('itemId');
                if (idInput) {
                    idInput.value = data.id;
                    idInput.disabled = true;
                }
            }
        } catch (error) {
            console.error('Error generando siguiente ID:', error);
            // Mostrar placeholder en caso de error
            const idInput = document.getElementById('itemId');
            if (idInput) {
                idInput.value = 'Se generará automáticamente';
                idInput.disabled = true;
            }
        }
    }

    // ===== GENERAR SKU ÚNICO =====
    randomSixDigits() {
        return String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0');
    }

    generateUniqueSku() {
        // Generar un SKU único tipo "BP123456"
        // En el contexto del formulario, simplemente generamos uno aleatorio
        // La validación de unicidad se hará en el servidor al guardar
        return `BP${this.randomSixDigits()}`;
    }

    generateAndSetSku() {
        const skuInput = document.getElementById('itemSku');
        if (skuInput) {
            const sku = this.generateUniqueSku();
            skuInput.value = sku;
            skuInput.disabled = true;
        }
    }


    checkNewUnitMode() {
        // Verificar si estamos en modo "new-from-parent" desde Blade
        if (window.bladeFormData && window.bladeFormData.mode === 'new-from-parent' && window.bladeFormData.itemParent) {
            console.log('Modo new-from-parent detectado:', window.bladeFormData);
            this.loadNewFromParentData(window.bladeFormData);
            // El título ya está configurado en Blade
            return;
        }

        // Fallback: verificar URL params (modo antiguo)
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const parentItem = urlParams.get('parentItem');

        if (mode === 'newUnit' && parentItem) {
            // Cargar datos del item padre
            document.getElementById('formTitle').textContent = 'Agregar Nueva Unidad';
            document.getElementById('saveButtonText').textContent = 'Guardar Unidad';

            console.log('Agregando nueva unidad al item:', parentItem);
        }
    }

    // ===== CARGAR DATOS DEL ITEM (MODO EDICIÓN) =====
    loadItemData(itemId) {
        // Simulación de carga de datos
        // En producción, esto haría una llamada AJAX al servidor
        console.log('Cargando datos del item:', itemId);
        
        // Simular datos cargados
        const mockData = {
            sku: 'BP000001',
            nombreProducto: 'MICROFONO | SHURE | SM58 | ID MS01',
            id: 'MS01',
            categoria: 'MICROFONIA',
            marca: 'SHURE',
            modelo: 'SM58',
            // ... más datos
        };
        
        // Poblar el formulario con los datos
        this.populateForm(mockData);
    }

    // ===== CONFIGURAR EVENT LISTENERS =====
    setupEventListeners() {
        // Guardar formulario
        document.getElementById('saveFormBtn').addEventListener('click', () => this.saveForm());
        
        // Cambio de tabs
        document.querySelectorAll('#formTabs .nav-link').forEach(tab => {
            tab.addEventListener('shown.bs.tab', () => {
                // Si hay cambios sin guardar Y el guardado automático está activado, guardar automáticamente
                if (unsavedChanges && autoSaveEnabled) {
                    this.autoSaveOnTabChange();
                }
                this.calculateProgress();
            });
        });
        
        // Campos del formulario
        document.querySelectorAll('input, select, textarea').forEach(field => {
            field.addEventListener('change', () => {
                unsavedChanges = true;
                this.enableSaveButton(); // 👈 NUEVA LÍNEA
                this.updatePreview();
                this.calculateProgress();
            });
            
            field.addEventListener('input', () => {
                if (field.type === 'text' || field.type === 'textarea') {
                    unsavedChanges = true;
                    this.enableSaveButton(); // 👈 NUEVA LÍNEA
                    this.updatePreview();
                }
            });
        });
        
        // Especificaciones
        document.getElementById('addSpecBtn').addEventListener('click', () => this.addSpecification());
        
        // RFID
        document.getElementById('scanRfidBtn').addEventListener('click', () => this.scanRFID());
        document.getElementById('scanNewRfidBtn').addEventListener('click', () => this.scanRFID());
        document.getElementById('programRfidBtn').addEventListener('click', () => this.programRFID());
        
        // Auto-guardado toggle
        document.getElementById('autoSaveToggle').addEventListener('change', (e) => {
            autoSaveEnabled = e.target.checked;
            if (autoSaveEnabled) {
                this.setupAutoSave();
            } else {
                this.clearAutoSave();
            }
        });
        
        // Prevenir salida con cambios sin guardar
        window.addEventListener('beforeunload', (e) => {
            if (unsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
        
        // Cálculo de precios
        document.getElementById('itemOriginalPrice').addEventListener('input', () => {
            unsavedChanges = true;
            this.enableSaveButton();
            this.calculateROI();
        });
        document.getElementById('itemIdealRentPrice').addEventListener('input', () => {
            unsavedChanges = true;
            this.enableSaveButton();
            this.calculateROI();
        });
        document.getElementById('itemMinRentPrice').addEventListener('input', () => {
            unsavedChanges = true;
            this.enableSaveButton(); 
            this.calculateROI();
        });
        
        // Generar SKU e ID automáticamente
        document.getElementById('itemCategory').addEventListener('change', () => this.generateIds());
        document.getElementById('itemBrand').addEventListener('change', () => this.generateIds());
    }

    // ===== INICIALIZAR TAGIFY =====
    async initializeTagify() {
        const tagifyConfig = {
            maxTags: 1,
            dropdown: {
                maxItems: 20,
                classname: 'tags-inline',
                enabled: 0,
                closeOnSelect: true
            },
            originalInputValueFormat: valuesArr => valuesArr.map(item => item.value).join(',')
        };

        // Categoría
        const categoryInput = document.querySelector('#itemCategory');
        if (categoryInput) {
            tagifyInstances.category = new Tagify(categoryInput, {
                ...tagifyConfig,
                whitelist: ['AUDIO', 'ILUMINACION', 'VIDEO', 'MICROFONIA', 'BACKLINE', 
                           'CABLE', 'COMPUTO', 'ENERGIA', 'ESTRUCTURA', 'MOBILIARIO'],
                enforceWhitelist: true
            });
            
            tagifyInstances.category.on('change', () => {
                unsavedChanges = true; 
                this.enableSaveButton(); 
                this.updateSubcategories();
                this.updateSpecificationTemplates();
                this.generateIds();
            });
        }

            // Marca
            const brandInput = document.querySelector('#itemBrand');
            if (brandInput) {
                tagifyInstances.brand = new Tagify(brandInput, {
                    ...tagifyConfig,
                    whitelist: ['SHURE', 'SENNHEISER', 'JBL', 'YAMAHA', 'MARTIN', 
                            'CHAUVET', 'BLACKMAGIC', 'SONY', 'BOSE', 'QSC'],
                    enforceWhitelist: false
                });
                
                tagifyInstances.brand.on('change', () => {
                    unsavedChanges = true;
                    this.enableSaveButton();
                    this.generateIds();
                });
            }

        // Modelo
            const modelInput = document.querySelector('#itemModel');
            if (modelInput) {
                tagifyInstances.model = new Tagify(modelInput, {
                    ...tagifyConfig,
                    enforceWhitelist: false
                });
                
                tagifyInstances.model.on('change', () => {
                    unsavedChanges = true;
                    this.enableSaveButton();
                });
            }

        // Familia
        const familyInput = document.querySelector('#itemFamily');
        if (familyInput) {
            tagifyInstances.family = new Tagify(familyInput, {
                ...tagifyConfig,
                enforceWhitelist: false
            });
        }

        // Sub-familia
        const subFamilyInput = document.querySelector('#itemSubFamily');
        if (subFamilyInput) {
            tagifyInstances.subFamily = new Tagify(subFamilyInput, {
                ...tagifyConfig,
                enforceWhitelist: false
            });
        }

        // Color
        const colorInput = document.querySelector('#itemColor');
        if (colorInput) {
            tagifyInstances.color = new Tagify(colorInput, {
                ...tagifyConfig,
                whitelist: ['NEGRO', 'BLANCO', 'GRIS', 'AZUL', 'ROJO', 'VERDE', 'AMARILLO', 'PLATEADO'],
                enforceWhitelist: false
            });
            
            tagifyInstances.color.on('change', () => {
                unsavedChanges = true;
                this.enableSaveButton();
            });
        }

        // Estado
        const statusInput = document.querySelector('#itemStatus');
        if (statusInput) {
            tagifyInstances.status = new Tagify(statusInput, {
                ...tagifyConfig,
                whitelist: ['DISPONIBLE', 'ACTIVO', 'INACTIVO', 'DESCOMPUESTO', 'EN REPARACION', 'EN_REPARACION', 'EXTRAVIADO', 'BAJA', 'EN_EVENTO', 'MANTENIMIENTO'],
                enforceWhitelist: false  // Permitir valores personalizados
            });

            tagifyInstances.status.on('change', () => {
                unsavedChanges = true;
                this.enableSaveButton();
            });
        }

        // Ubicación - Cargar dinámicamente desde el servidor
        const locationInput = document.querySelector('#itemLocation');
        if (locationInput) {
            // Inicializar Tagify sin whitelist (se cargará después)
            tagifyInstances.location = new Tagify(locationInput, {
                ...tagifyConfig,
                whitelist: [],
                enforceWhitelist: false  // Permitir valores personalizados (ubicaciones no en la whitelist)
            });

            // Cargar ubicaciones desde el servidor
            try {
                const response = await fetch('/inventory/locations');
                const result = await response.json();

                if (result.success && Array.isArray(result.data)) {
                    // Extraer solo los nombres de las ubicaciones
                    const locationNames = result.data.map(loc => loc.name);
                    tagifyInstances.location.settings.whitelist = locationNames;
                    console.log('✅ Ubicaciones cargadas desde BD:', locationNames);
                } else {
                    console.warn('Respuesta inesperada del servidor:', result);
                    // Fallback a ubicaciones por defecto
                    tagifyInstances.location.settings.whitelist = ['ALMACEN', 'PICKING', 'TRASLADO', 'EVENTO'];
                }
            } catch (error) {
                console.error('❌ Error al cargar ubicaciones:', error);
                // Fallback a ubicaciones por defecto
                tagifyInstances.location.settings.whitelist = ['ALMACEN', 'PICKING', 'TRASLADO', 'EVENTO'];
            }

            tagifyInstances.location.on('change', () => {
                unsavedChanges = true;
                this.enableSaveButton();
            });
        }
    }

    // ===== INICIALIZAR DROPZONE =====
    initializeDropzone() {
        const dropzoneElement = document.querySelector('#dropzone-multi');
        
        if (dropzoneElement) {
            dropzoneInstance = new Dropzone(dropzoneElement, {
                url: FORM_CONFIG.cloudinaryUrl,
                paramName: 'file',
                maxFilesize: 5, // MB
                maxFiles: 10,
                acceptedFiles: 'image/*',
                addRemoveLinks: true,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                },
                params: {
                    upload_preset: FORM_CONFIG.cloudinaryPreset
                },
                init: function() {
                    this.on('success', (file, response) => {
                        file.cloudinaryId = response.public_id;
                        file.cloudinaryUrl = response.secure_url;
                        formData.imagenes.push({
                            id: response.public_id,
                            url: response.secure_url,
                            thumbnail: response.eager[0].secure_url || response.secure_url
                        });
                        itemFormManager.updateImageGallery();
                    });
                    
                    this.on('removedfile', (file) => {
                        if (file.cloudinaryId) {
                            formData.imagenes = formData.imagenes.filter(img => img.id !== file.cloudinaryId);
                            itemFormManager.updateImageGallery();
                        }
                    });
                    
                    this.on('error', (file, errorMessage) => {
                        itemFormManager.showAlert('Error al subir imagen: ' + errorMessage, 'error');
                    });
                }
            });
        }
    }
    // ===== ACTUALIZAR VISTA PREVIA =====
    updatePreview() {
        // Nombre
        const nameInput = document.getElementById('itemName');
        const publicNameInput = document.getElementById('itemPublicName');
        document.getElementById('previewName').textContent = nameInput.value || 'Nombre del Producto';
        document.getElementById('previewPublicName').textContent = publicNameInput.value || nameInput.value || 'Nombre Público';
        
        // Categoría
        const category = this.getTagifyValue(tagifyInstances.category);
        document.getElementById('previewCategory').textContent = category || 'Categoría';
        
        // Marca
        const brand = this.getTagifyValue(tagifyInstances.brand);
        document.getElementById('previewBrand').textContent = brand || 'Marca';
        
        // Unidades
        const units = document.getElementById('itemTotalUnits').value || 1;
        document.getElementById('previewUnits').textContent = units;
        document.getElementById('previewAvailable').textContent = units; // Por defecto todas disponibles
        
        // Precio
        const price = document.getElementById('itemIdealRentPrice').value || 0;
        document.getElementById('previewPrice').textContent = `$${parseFloat(price).toFixed(2)}`;
    }

    // ===== CALCULAR PROGRESO DEL FORMULARIO =====
    calculateProgress() {
        const allFields = document.querySelectorAll('#itemCompleteForm input, #itemCompleteForm select, #itemCompleteForm textarea');
        const requiredFields = document.querySelectorAll('#itemCompleteForm input[required], #itemCompleteForm select[required]');

        // IDs y nombres a excluir del conteo
        const excludedIds = ['autoSaveToggle', 'rfidName', 'rfidCategory', 'rfidBrand', 'rfidSerial', 'rfidPurchase', 'rfidCondition'];
        const processedRadioGroups = new Set(); // Para trackear grupos de radio ya procesados

        let filledFields = 0;
        let filledRequired = 0;
        let totalFieldsCount = 0;

        allFields.forEach(field => {
            // Excluir campos específicos
            if (excludedIds.includes(field.id)) {
                return;
            }

            // Para radio buttons, solo contar el grupo una vez
            if (field.type === 'radio') {
                const radioName = field.name;

                // Si ya procesamos este grupo de radio, saltar
                if (processedRadioGroups.has(radioName)) {
                    return;
                }

                // Marcar este grupo como procesado
                processedRadioGroups.add(radioName);

                // Contar el grupo como 1 campo
                totalFieldsCount++;

                // Verificar si algún radio del grupo está seleccionado
                const radioGroup = document.querySelectorAll(`input[name="${radioName}"]`);
                const isGroupFilled = Array.from(radioGroup).some(radio => radio.checked);

                if (isGroupFilled) {
                    filledFields++;
                }

                return;
            }

            // Para otros campos normales
            totalFieldsCount++;
            if (this.isFieldFilled(field)) {
                filledFields++;
            }
        });

        requiredFields.forEach(field => {
            // Excluir campos específicos
            if (excludedIds.includes(field.id)) {
                return;
            }

            if (this.isFieldFilled(field)) {
                filledRequired++;
            }
        });

        // Verificar también campos Tagify
        Object.keys(tagifyInstances).forEach(key => {
            totalFieldsCount++;
            if (tagifyInstances[key].value.length > 0) {
                filledFields++;
                if (FORM_CONFIG.requiredFields.includes(tagifyInstances[key].DOM.originalInput.id)) {
                    filledRequired++;
                }
            }
        });

        const progressPercentage = Math.round((filledFields / totalFieldsCount) * 100);

        // Actualizar UI
        document.getElementById('formProgress').style.width = progressPercentage + '%';
        document.getElementById('progressText').textContent = progressPercentage + '% completado';
        document.getElementById('fieldsCompleted').textContent = filledFields;
        document.getElementById('totalFields').textContent = totalFieldsCount;

        // El botón de guardar siempre estará habilitado
        // La validación se realiza al hacer clic en el botón
        const saveBtn = document.getElementById('saveFormBtn');
        saveBtn.disabled = false;
    }

        // ===== HABILITAR BOTÓN DE GUARDAR =====
        enableSaveButton() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');

            if (!saveBtn) return; // Protección si el botón no existe

            if (saveBtn.disabled) {
                saveBtn.disabled = false;
                saveBtn.classList.add('btn-primary');

                // Cambiar el texto del botón para indicar que hay cambios
                if (saveButtonText) {
                    const originalText = saveButtonText.textContent;
                    if (!originalText.includes('*')) {
                        saveButtonText.textContent = originalText + ' *';
                    }
                }
            }
        }

        // ===== DESHABILITAR BOTÓN DE GUARDAR =====
        disableSaveButton() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');

            if (!saveBtn) return; // Protección si el botón no existe

            saveBtn.classList.add('btn-primary');

            // Remover el asterisco si existe
            if (saveButtonText) {
                saveButtonText.textContent = saveButtonText.textContent.replace(' *', '');
            }
        }

        // ===== VERIFICAR SI UN CAMPO ESTÁ LLENO =====
        isFieldFilled(field) {
            if (field.type === 'checkbox' || field.type === 'radio') {
                return field.checked;
            } else if (field.tagName === 'SELECT') {
                return field.value && field.value !== '';
            } else {
                return field.value && field.value.trim() !== '';
            }
        }

        // ===== CONFIGURAR AUTO-GUARDADO =====
        setupAutoSave() {
            if (!autoSaveEnabled) return;
            
            autoSaveTimer = setInterval(() => {
                // Si hay cambios sin guardar Y el guardado automático está activado, guardar automáticamente
                if (unsavedChanges && autoSaveEnabled) {
                    this.autoSave();
                }
            }, FORM_CONFIG.autoSaveInterval);
        }

        // ===== LIMPIAR AUTO-GUARDADO =====
        clearAutoSave() {
            if (autoSaveTimer) {
                clearInterval(autoSaveTimer);
                autoSaveTimer = null;
            }
        }

        // ===== AUTO-GUARDAR =====
        async autoSave() {
            console.log('Auto-guardando...');
            const autoSaveStatus = document.getElementById('autoSaveStatus');
            autoSaveStatus.textContent = 'Guardando...';
            autoSaveStatus.classList.add('text-warning');
            autoSaveStatus.classList.remove('text-success', 'text-danger');

            try {
                // Recopilar datos actuales
                this.collectFormData();

                // Preparar datos para el backend
                const payload = this.prepareBackendPayload(true); // true = is_draft
                const csrfToken = this.getCsrfToken();

                let response;

                if (currentInventoryItemId) {
                    // Actualizar item existente (PUT)
                    response = await fetch(`/inventory/inventory-items/${currentInventoryItemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Crear nuevo item (POST)
                    response = await fetch('/inventory/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    // Si es la primera vez que guardamos, almacenar el ID de base de datos
                    if (!currentInventoryItemId && result.data && result.data.database_id) {
                        currentInventoryItemId = result.data.database_id;
                        console.log('Borrador creado con ID:', currentInventoryItemId);
                    }

                    autoSaveStatus.textContent = 'Guardado hace un momento';
                    autoSaveStatus.classList.remove('text-warning');
                    autoSaveStatus.classList.add('text-success');
                    unsavedChanges = false;

                    setTimeout(() => {
                        autoSaveStatus.classList.remove('text-success');
                    }, 3000);
                } else {
                    throw new Error(result.message || 'Error al guardar');
                }

            } catch (error) {
                console.error('Error en autoguardado:', error);
                autoSaveStatus.textContent = 'Error al guardar';
                autoSaveStatus.classList.remove('text-warning', 'text-success');
                autoSaveStatus.classList.add('text-danger');

                setTimeout(() => {
                    autoSaveStatus.textContent = 'No guardado';
                    autoSaveStatus.classList.remove('text-danger');
                }, 3000);
            }
        }

        // ===== AUTO-GUARDAR AL CAMBIAR DE TAB =====
        async autoSaveOnTabChange() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');

            if (!saveBtn || !saveButtonText) {
                console.warn('Elementos del botón no encontrados, saltando autoguardado en cambio de tab');
                return; // Salir si los elementos no existen
            }

            const originalText = saveButtonText.textContent.replace(' *', '');

            // Animación de guardado
            saveBtn.classList.add('btn-success');
            saveBtn.classList.remove('btn-primary');
            saveBtn.disabled = true;

            // Icono de guardando
            saveButtonText.innerHTML = '<i class="mdi mdi-loading mdi-spin me-1"></i>Guardando...';

            try {
                // Recopilar datos actuales
                this.collectFormData();

                // Preparar datos para el backend
                const payload = this.prepareBackendPayload(true); // true = is_draft
                const csrfToken = this.getCsrfToken();

                let response;

                if (currentInventoryItemId) {
                    // Actualizar item existente (PUT)
                    response = await fetch(`/inventory/inventory-items/${currentInventoryItemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Crear nuevo item (POST)
                    response = await fetch('/inventory/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    // Si es la primera vez que guardamos, almacenar el ID de base de datos
                    if (!currentInventoryItemId && result.data && result.data.database_id) {
                        currentInventoryItemId = result.data.database_id;
                        console.log('Borrador creado con ID:', currentInventoryItemId);
                    }

                    unsavedChanges = false;

                    // Icono de check animado
                    saveButtonText.innerHTML = '<i class="mdi mdi-check-circle me-1"></i>Cambios Guardados';

                    // Después de 2 segundos, restaurar el botón
                    setTimeout(() => {
                        saveBtn.classList.remove('btn-success');
                        saveBtn.classList.add('btn-primary');
                        saveButtonText.textContent = originalText;
                        saveBtn.disabled = false;
                    }, 2000);

                    console.log('Cambios guardados automáticamente al cambiar de tab');
                } else {
                    throw new Error(result.message || 'Error al guardar');
                }

            } catch (error) {
                console.error('Error al guardar en cambio de tab:', error);

                // Mostrar error
                saveButtonText.innerHTML = '<i class="mdi mdi-alert-circle me-1"></i>Error al guardar';
                saveBtn.classList.remove('btn-success');
                saveBtn.classList.add('btn-danger');

                setTimeout(() => {
                    saveBtn.classList.remove('btn-danger');
                    saveBtn.classList.add('btn-primary');
                    saveButtonText.textContent = originalText;
                    saveBtn.disabled = false;
                }, 3000);
            }
        }

        // ===== GUARDAR FORMULARIO =====
        async saveForm() {
            if (!this.validateForm()) {
                return;
            }

            // Recopilar datos del formulario
            this.collectFormData();

            // Mostrar loading
            const saveBtn = document.getElementById('saveFormBtn');
            const originalText = saveBtn.innerHTML;
            saveBtn.disabled = true;
            saveBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Guardando...';

            try {
                // Preparar datos para el backend (is_draft = false para guardado final)
                const payload = this.prepareBackendPayload(false);
                const csrfToken = this.getCsrfToken();

                let response;

                if (currentInventoryItemId) {
                    // Actualizar item existente (PUT) - marcar como no-borrador
                    response = await fetch(`/inventory/inventory-items/${currentInventoryItemId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                } else {
                    // Crear nuevo item (POST) con validación completa
                    response = await fetch('/inventory/items', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                }

                const result = await response.json();

                if (result.success) {
                    // Éxito
                    unsavedChanges = false;
                    this.disableSaveButton();
                    this.showAlert(
                        isEditing ? 'Item actualizado correctamente' : 'Item creado correctamente',
                        'success'
                    );

                    // Redirigir después de 2 segundos
                    setTimeout(() => {
                        // Volver al catálogo
                        window.location.href = '/catalogo';
                    }, 2000);
                } else {
                    throw new Error(result.message || 'Error al guardar');
                }

            } catch (error) {
                console.error('Error al guardar:', error);
                this.showAlert('Error al guardar el item: ' + error.message, 'error');

                // Restaurar botón
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
        }

        // ===== OBTENER CSRF TOKEN =====
        getCsrfToken() {
            const token = document.querySelector('meta[name="csrf-token"]')?.content;
            if (!token) {
                console.error('CSRF token no encontrado. Asegúrate de que existe <meta name="csrf-token"> en el HTML.');
                throw new Error('CSRF token no encontrado');
            }
            return token;
        }

        // ===== PREPARAR PAYLOAD PARA BACKEND =====
        prepareBackendPayload(isDraft = false) {
            // Obtener item_parent_id desde window.bladeFormData
            const itemParentId = window.bladeFormData?.itemParent?.id || null;

            if (!itemParentId) {
                throw new Error('No se encontró item_parent_id');
            }

            // Transformar formData al formato que espera el backend
            const payload = {
                item_parent_id: itemParentId,
                sku: formData.sku || '',
                item_id: formData.id || '',
                name: formData.nombreProducto || '',
                public_name: formData.nombrePublico || formData.nombreProducto || '',
                description: formData.descripcion || '',

                // Identificadores
                serial_number: formData.numeroSerie || '',
                rfid_tag: formData.identificadorRfid || '',
                color: formData.color || '',
                unit_set: formData.unitSet || 'UNIT',
                total_units: formData.totalUnits || 1,

                // Ubicación y estado
                location: formData.ubicacion || '',
                rack_position: formData.rack || '',
                panel_position: formData.panel || '',
                status: formData.status || '',
                condition: formData.condicion || 'BUENO',

                // Precios y garantía
                purchase_date: formData.fechaCompra || '',
                original_price: formData.precioOriginal || 0,
                ideal_rental_price: formData.precioRentaIdeal || 0,
                minimum_rental_price: formData.precioRentaMinimo || 0,
                warranty_valid: formData.garantiaVigente === 'SI',

                // Notas
                notes: formData.notas || '',

                // Especificaciones
                specifications: formData.especificaciones || [],

                // Control
                is_draft: isDraft
            };

            console.log('✅ Payload preparado para backend:', payload);
            console.log('📝 Especificaciones a enviar:', payload.specifications);
            console.log('🎨 Color:', payload.color);
            console.log('📄 Description:', payload.description);
            console.log('📝 Notes:', payload.notes);
            return payload;
        }

        // ===== RECOPILAR DATOS DEL FORMULARIO =====
        collectFormData() {
            // Información básica
            formData.sku = document.getElementById('itemSku').value;
            formData.nombreProducto = document.getElementById('itemName').value;
            formData.id = document.getElementById('itemId').value;
            formData.categoria = this.getTagifyValue(tagifyInstances.category);
            formData.familia = this.getTagifyValue(tagifyInstances.family);
            formData.subFamilia = this.getTagifyValue(tagifyInstances.subFamily);
            formData.marca = this.getTagifyValue(tagifyInstances.brand);
            formData.modelo = this.getTagifyValue(tagifyInstances.model);
            formData.nombrePublico = document.getElementById('itemPublicName').value || formData.nombreProducto;
            formData.descripcion = document.getElementById('itemDescription').value;
            
            // Identificadores
            formData.numeroSerie = document.getElementById('itemSerialNumber').value;
            formData.identificadorRfid = document.getElementById('itemRfidTag').value;
            formData.color = this.getTagifyValue(tagifyInstances.color);
            formData.unitSet = document.getElementById('itemUnitSet').value;
            formData.totalUnits = parseInt(document.getElementById('itemTotalUnits').value) || 1;
            
            // Información financiera
            formData.fechaCompra = document.getElementById('itemPurchaseDate').value;
            formData.garantiaVigente = document.getElementById('itemWarranty').value;
            formData.precioOriginal = parseFloat(document.getElementById('itemOriginalPrice').value) || 0;
            formData.precioRentaIdeal = parseFloat(document.getElementById('itemIdealRentPrice').value) || 0;
            formData.precioRentaMinimo = parseFloat(document.getElementById('itemMinRentPrice').value) || 0;
            
            // Ubicación y estado
            formData.ubicacion = this.getTagifyValue(tagifyInstances.location);
            formData.status = this.getTagifyValue(tagifyInstances.status);
            formData.rack = document.getElementById('itemRack').value;
            formData.panel = document.getElementById('itemPanel').value;
            formData.condicion = document.querySelector('input[name="itemCondition"]:checked')?.value || 'BUENO';
            formData.notas = document.getElementById('itemNotes').value;
            
            // Especificaciones (ya se mantienen actualizadas dinámicamente)
            
            // RFID Config
            formData.rfidConfig = {
                includeNombre: document.getElementById('rfidName').checked,
                includeCategoria: document.getElementById('rfidCategory').checked,
                includeMarca: document.getElementById('rfidBrand').checked,
                includeSerial: document.getElementById('rfidSerial').checked,
                includeFecha: document.getElementById('rfidPurchase').checked,
                includeCondicion: document.getElementById('rfidCondition').checked
            };
            
            console.log('Datos recopilados:', formData);
        }

        // ===== SIMULAR GUARDADO EN SERVIDOR =====
        simulateServerSave() {
            return new Promise((resolve, reject) => {
                // Simular delay de red
                setTimeout(() => {
                    // Simular respuesta exitosa
                    if (Math.random() > 0.1) { // 90% de éxito
                        resolve({ success: true, id: 'BP' + Math.floor(Math.random() * 999999) });
                    } else {
                        reject(new Error('Error de servidor simulado'));
                    }
                }, 2000);
            });
        }

        // ===== VALIDAR FORMULARIO =====
        validateForm() {
            let isValid = true;
            const errors = [];
            
            // Validar campos requeridos
            if (!document.getElementById('itemName').value.trim()) {
                errors.push('El nombre del producto es requerido');
                isValid = false;
            }
            
            if (!this.getTagifyValue(tagifyInstances.category)) {
                errors.push('La categoría es requerida');
                isValid = false;
            }
            
            if (!this.getTagifyValue(tagifyInstances.brand)) {
                errors.push('La marca es requerida');
                isValid = false;
            }
            
            if (!this.getTagifyValue(tagifyInstances.model)) {
                errors.push('El modelo es requerido');
                isValid = false;
            }
            
            if (!this.getTagifyValue(tagifyInstances.status)) {
                errors.push('El estado es requerido');
                isValid = false;
            }
            
            if (!this.getTagifyValue(tagifyInstances.location)) {
                errors.push('La ubicación es requerida');
                isValid = false;
            }
            
            // Validar precios
            const originalPrice = parseFloat(document.getElementById('itemOriginalPrice').value) || 0;
            const idealPrice = parseFloat(document.getElementById('itemIdealRentPrice').value) || 0;
            const minPrice = parseFloat(document.getElementById('itemMinRentPrice').value) || 0;
            
            if (minPrice > idealPrice) {
                errors.push('El precio mínimo no puede ser mayor al precio ideal');
                isValid = false;
            }
            
            // Mostrar errores
            if (!isValid) {
                this.showAlert('Por favor corrija los siguientes errores:\n' + errors.join('\n'), 'warning');
            }
            
            return isValid;
        }
        // ===== AGREGAR ESPECIFICACIÓN =====
        addSpecification(name = '', value = '') {
            const container = document.getElementById('specificationsContainer');
            const specIndex = formData.especificaciones.length;
            
            const specDiv = document.createElement('div');
            specDiv.className = 'specification-item mb-2';
            specDiv.dataset.index = specIndex;
            
            specDiv.innerHTML = `
                <div class="input-group">
                    <input type="text" 
                        class="form-control spec-name" 
                        placeholder="Nombre (ej: Potencia)" 
                        value="${name}">
                    <input type="text" 
                        class="form-control spec-value" 
                        placeholder="Valor (ej: 1000W)" 
                        value="${value}">
                    <button class="btn btn-outline-danger" type="button" onclick="itemFormManager.removeSpecification(${specIndex})">
                        <i class="mdi mdi-delete"></i>
                    </button>
                </div>
            `;
            
            // Remover alerta si existe
            const alert = container.querySelector('.alert');
            if (alert) {
                alert.remove();
            }
            
            container.appendChild(specDiv);
            
            // Agregar al array de datos
            formData.especificaciones.push({ name, value });
            
            // Event listeners para actualizar datos
            const nameInput = specDiv.querySelector('.spec-name');
            const valueInput = specDiv.querySelector('.spec-value');
            
            nameInput.addEventListener('input', () => {
                formData.especificaciones[specIndex].name = nameInput.value;
                unsavedChanges = true;
            });
            
            valueInput.addEventListener('input', () => {
                formData.especificaciones[specIndex].value = valueInput.value;
                unsavedChanges = true;
            });
        }

        // ===== REMOVER ESPECIFICACIÓN =====
        removeSpecification(index) {
            const container = document.getElementById('specificationsContainer');
            const specItem = container.querySelector(`[data-index="${index}"]`);
            
            if (specItem) {
                specItem.remove();
                formData.especificaciones.splice(index, 1);
                unsavedChanges = true;
                
                // Re-indexar elementos restantes
                container.querySelectorAll('.specification-item').forEach((item, newIndex) => {
                    item.dataset.index = newIndex;
                    const deleteBtn = item.querySelector('button');
                    deleteBtn.setAttribute('onclick', `itemFormManager.removeSpecification(${newIndex})`);
                });
                
                // Mostrar alerta si no hay especificaciones
                if (formData.especificaciones.length === 0) {
                    container.innerHTML = `
                        <div class="alert alert-info">
                            <i class="mdi mdi-information me-2"></i>
                            Agregue las especificaciones técnicas del producto. Por ejemplo: Potencia, Dimensiones, Peso, etc.
                        </div>
                    `;
                }
            }
        }

        // ===== CARGAR PLANTILLAS DE ESPECIFICACIONES =====
        loadTemplates() {
            const templates = {
                'AUDIO': [
                    { name: 'Potencia RMS', action: () => this.addSpecification('Potencia RMS', '') },
                    { name: 'Impedancia', action: () => this.addSpecification('Impedancia', '8Ω') },
                    { name: 'Respuesta de Frecuencia', action: () => this.addSpecification('Respuesta de Frecuencia', '20Hz - 20kHz') },
                    { name: 'SPL Máximo', action: () => this.addSpecification('SPL Máximo', '') }
                ],
                'ILUMINACION': [
                    { name: 'Tipo de LED', action: () => this.addSpecification('Tipo de LED', '') },
                    { name: 'Potencia', action: () => this.addSpecification('Potencia', '') },
                    { name: 'Ángulo de Haz', action: () => this.addSpecification('Ángulo de Haz', '') },
                    { name: 'Canales DMX', action: () => this.addSpecification('Canales DMX', '') }
                ],
                'VIDEO': [
                    { name: 'Resolución', action: () => this.addSpecification('Resolución', '') },
                    { name: 'Brillo', action: () => this.addSpecification('Brillo', 'lumens') },
                    { name: 'Contraste', action: () => this.addSpecification('Contraste', '') },
                    { name: 'Entradas', action: () => this.addSpecification('Entradas', '') }
                ],
                'MICROFONIA': [
                    { name: 'Tipo', action: () => this.addSpecification('Tipo', 'Dinámico/Condensador') },
                    { name: 'Patrón Polar', action: () => this.addSpecification('Patrón Polar', '') },
                    { name: 'Respuesta de Frecuencia', action: () => this.addSpecification('Respuesta de Frecuencia', '') },
                    { name: 'Sensibilidad', action: () => this.addSpecification('Sensibilidad', '') }
                ]
            };
            
            this.updateSpecificationTemplates(templates);
        }

        // ===== ACTUALIZAR PLANTILLAS DE ESPECIFICACIONES =====
        updateSpecificationTemplates(templates = null) {
            const container = document.getElementById('specTemplates');
            const category = this.getTagifyValue(tagifyInstances.category);
            
            if (!category) {
                container.innerHTML = '<p class="text-muted mb-0">Seleccione una categoría para ver las plantillas disponibles</p>';
                return;
            }
            
            const categoryTemplates = templates ? templates[category] : null;
            
            if (!categoryTemplates || categoryTemplates.length === 0) {
                container.innerHTML = '<p class="text-muted mb-0">No hay plantillas disponibles para esta categoría</p>';
                return;
            }
            
            container.innerHTML = '';
            categoryTemplates.forEach(template => {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-sm btn-outline-primary';
                btn.textContent = `+ ${template.name}`;
                btn.onclick = template.action;
                container.appendChild(btn);
            });
        }

        // ===== ESCANEAR RFID =====
        scanRFID() {
            // Simulación de escaneo
            const rfidCode = 'RF' + Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            document.getElementById('itemRfidTag').value = rfidCode;
            
            // Actualizar estado
            document.getElementById('rfidStatusText').textContent = `Etiqueta: ${rfidCode}`;
            
            this.showAlert(`RFID escaneado: ${rfidCode}`, 'success');
            unsavedChanges = true;
        }

        // ===== PROGRAMAR RFID =====
        programRFID() {
            const rfidTag = document.getElementById('itemRfidTag').value;
            
            if (!rfidTag) {
                this.showAlert('Primero debe escanear o ingresar un código RFID', 'warning');
                return;
            }
            
            // Recopilar datos a programar
            const rfidData = {
                tag: rfidTag,
                data: {}
            };
            
            if (formData.rfidConfig.includeNombre) {
                rfidData.data.nombre = document.getElementById('itemName').value;
            }
            if (formData.rfidConfig.includeCategoria) {
                rfidData.data.categoria = this.getTagifyValue(tagifyInstances.category);
            }
            if (formData.rfidConfig.includeMarca) {
                rfidData.data.marca = this.getTagifyValue(tagifyInstances.brand);
                rfidData.data.modelo = this.getTagifyValue(tagifyInstances.model);
            }
            if (formData.rfidConfig.includeSerial) {
                rfidData.data.serial = document.getElementById('itemSerialNumber').value;
            }
            if (formData.rfidConfig.includeFecha) {
                rfidData.data.fechaCompra = document.getElementById('itemPurchaseDate').value;
            }
            if (formData.rfidConfig.includeCondicion) {
                rfidData.data.condicion = document.querySelector('input[name="itemCondition"]:checked')?.value;
            }
            
            console.log('Programando RFID:', rfidData);
            
            // Simular programación
            this.showAlert('Etiqueta RFID programada correctamente', 'success');
        }

        // ===== CALCULAR ROI =====
        calculateROI() {
            const originalPrice = parseFloat(document.getElementById('itemOriginalPrice').value) || 0;
            const idealRentPrice = parseFloat(document.getElementById('itemIdealRentPrice').value) || 0;
            const minRentPrice = parseFloat(document.getElementById('itemMinRentPrice').value) || 0;
            
            if (originalPrice > 0 && idealRentPrice > 0) {
                // ROI Estimado
                const monthlyRentals = 4; // Estimado de rentas por mes
                const yearlyIncome = idealRentPrice * monthlyRentals * 12;
                const roi = ((yearlyIncome / originalPrice) * 100).toFixed(1);
                document.getElementById('roiEstimate').textContent = `${roi}%`;
                
                // Tiempo de recuperación
                const recoveryRentals = Math.ceil(originalPrice / idealRentPrice);
                document.getElementById('recoveryTime').textContent = `${recoveryRentals} rentas`;
                
                // Margen de ganancia
                const profitMargin = ((idealRentPrice / originalPrice) * 100).toFixed(1);
                document.getElementById('profitMargin').textContent = `${profitMargin}%`;
                
                // Actualizar precio actual
                document.getElementById('currentPriceDisplay').textContent = `$${idealRentPrice.toFixed(2)}`;
            }
        }

        // ===== GENERAR IDS AUTOMÁTICAMENTE =====
        generateIds() {
            const category = this.getTagifyValue(tagifyInstances.category);
            const brand = this.getTagifyValue(tagifyInstances.brand);
            
            if (category && brand) {
                // Generar ID (primeras 2 letras de categoría + primeras 2 de marca + número)
                const categoryPrefix = category.substring(0, 2).toUpperCase();
                const brandPrefix = brand.substring(0, 2).toUpperCase();
                const randomNum = Math.floor(Math.random() * 99) + 1;
                const itemId = `${categoryPrefix}${brandPrefix}${randomNum.toString().padStart(2, '0')}`;
                
                document.getElementById('itemId').value = itemId;
                
                // Generar SKU
                const sku = `BP${Math.floor(Math.random() * 999999).toString().padStart(6, '0')}`;
                document.getElementById('itemSku').value = sku;
            }
        }

        // ===== ACTUALIZAR GALERÍA DE IMÁGENES =====
        updateImageGallery() {
            const gallery = document.getElementById('imageGallery');
            gallery.innerHTML = '';
            
            if (formData.imagenes.length === 0) {
                gallery.innerHTML = '<div class="col-12 text-center text-muted">No hay imágenes cargadas</div>';
                return;
            }
            
            formData.imagenes.forEach((imagen, index) => {
                const imageCol = document.createElement('div');
                imageCol.className = 'col-md-3 col-sm-6';
                imageCol.innerHTML = `
                    <div class="card">
                        <img src="${imagen.thumbnail}" class="card-img-top" alt="Imagen ${index + 1}">
                        <div class="card-body p-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <small>Imagen ${index + 1}</small>
                                <button type="button" class="btn btn-sm btn-outline-danger" onclick="itemFormManager.removeImage(${index})">
                                    <i class="mdi mdi-delete"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                gallery.appendChild(imageCol);
                
                // Actualizar preview principal con la primera imagen
                if (index === 0) {
                    document.getElementById('previewMainImage').src = imagen.thumbnail;
                }
            });
        }

        // ===== REMOVER IMAGEN =====
        removeImage(index) {
            formData.imagenes.splice(index, 1);
            this.updateImageGallery();
            unsavedChanges = true;
            
            // Si no hay imágenes, restaurar placeholder
            if (formData.imagenes.length === 0) {
                document.getElementById('previewMainImage').src = '/public/materialize/assets/img/products/placeholder.png';
            }
        }
        // ===== OBTENER VALOR DE TAGIFY =====
        getTagifyValue(tagifyInstance) {
            if (!tagifyInstance || !tagifyInstance.value || tagifyInstance.value.length === 0) {
                return '';
            }
            return tagifyInstance.value[0].value;
        }

        // ===== POBLAR FORMULARIO (MODO EDICIÓN) =====
        populateForm(data) {
            // Información básica
            document.getElementById('itemSku').value = data.sku || '';
            document.getElementById('itemName').value = data.nombreProducto || '';
            document.getElementById('itemId').value = data.id || '';
            document.getElementById('itemPublicName').value = data.nombrePublico || '';
            document.getElementById('itemDescription').value = data.descripcion || '';
            
            // Tagify fields
            if (data.categoria && tagifyInstances.category) {
                tagifyInstances.category.addTags([data.categoria]);
            }
            if (data.familia && tagifyInstances.family) {
                tagifyInstances.family.addTags([data.familia]);
            }
            if (data.subFamilia && tagifyInstances.subFamily) {
                tagifyInstances.subFamily.addTags([data.subFamilia]);
            }
            if (data.marca && tagifyInstances.brand) {
                tagifyInstances.brand.addTags([data.marca]);
            }
            if (data.modelo && tagifyInstances.model) {
                tagifyInstances.model.addTags([data.modelo]);
            }
            
            // Identificadores
            document.getElementById('itemSerialNumber').value = data.numeroSerie || '';
            document.getElementById('itemRfidTag').value = data.identificadorRfid || '';
            if (data.color && tagifyInstances.color) {
                console.log('🎨 Agregando tag de color:', data.color);
                tagifyInstances.color.addTags([data.color]);
            } else if (data.color) {
                console.warn('⚠️ Color tiene valor pero tagifyInstances.color no está inicializado:', data.color);
            }
            document.getElementById('itemUnitSet').value = data.unitSet || 'UNIT';
            document.getElementById('itemTotalUnits').value = data.totalUnits || 1;

            // Información financiera
            document.getElementById('itemPurchaseDate').value = data.fechaCompra || '';
            document.getElementById('itemWarranty').value = data.garantiaVigente || 'NO';
            document.getElementById('itemOriginalPrice').value = data.precioOriginal || 0;
            document.getElementById('itemIdealRentPrice').value = data.precioRentaIdeal || 0;
            document.getElementById('itemMinRentPrice').value = data.precioRentaMinimo || 0;

            // Ubicación y estado
            if (data.ubicacion && tagifyInstances.location) {
                console.log('📍 Agregando tag de ubicación:', data.ubicacion);
                tagifyInstances.location.addTags([data.ubicacion]);
            } else if (data.ubicacion) {
                console.warn('⚠️ Ubicación tiene valor pero tagifyInstances.location no está inicializado:', data.ubicacion);
            }
            if (data.status && tagifyInstances.status) {
                console.log('🔄 Agregando tag de status:', data.status);
                tagifyInstances.status.addTags([data.status]);
            } else if (data.status) {
                console.warn('⚠️ Status tiene valor pero tagifyInstances.status no está inicializado:', data.status);
            }
            document.getElementById('itemRack').value = data.rack || '';
            document.getElementById('itemPanel').value = data.panel || '';
            
            // Condición
            if (data.condicion) {
                const conditionRadio = document.querySelector(`input[name="itemCondition"][value="${data.condicion}"]`);
                if (conditionRadio) {
                    conditionRadio.checked = true;
                }
            }
            
            document.getElementById('itemNotes').value = data.notas || '';
            
            // Especificaciones
            if (data.especificaciones && data.especificaciones.length > 0) {
                data.especificaciones.forEach(spec => {
                    this.addSpecification(spec.name, spec.value);
                });
            }

            // Actualizar preview y progreso
            // Usar setTimeout para dar tiempo a que Tagify procese los tags
            setTimeout(() => {
                this.updatePreview();
                this.calculateProgress();
                this.calculateROI();
            }, 100);
        }

        // ===== INICIALIZAR VALIDACIÓN =====
        initializeValidation() {
            // Agregar clases de validación Bootstrap a campos requeridos
            const requiredFields = document.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                field.addEventListener('blur', () => {
                    if (!this.isFieldFilled(field)) {
                        field.classList.add('is-invalid');
                    } else {
                        field.classList.remove('is-invalid');
                    }
                });
            });
        }

        // ===== ACTUALIZAR SUBCATEGORÍAS =====
        updateSubcategories() {
            // Esta función se puede expandir para actualizar dinámicamente
            // las opciones de familia y subfamilia según la categoría
            const category = this.getTagifyValue(tagifyInstances.category);
            console.log('Categoría seleccionada:', category);
            
            // Aquí se podrían cargar dinámicamente las familias correspondientes
        }

        // ===== MOSTRAR ALERTA =====
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
                        config.showConfirmButton = true;
                        config.timer = null;
                        break;
                    case 'error':
                        config.icon = 'error';
                        config.showConfirmButton = true;
                        config.timer = null;
                        break;
                    default:
                        config.icon = 'info';
                }
                
                Swal.fire(config);
            } else {
                alert(message);
            }
        }
    }

// ===== INICIALIZACIÓN =====
let itemFormManager;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar el gestor del formulario
    itemFormManager = new ItemFormManager();
    
    // Configurar Dropzone globalmente
    if (typeof Dropzone !== 'undefined') {
        Dropzone.autoDiscover = false;
    }
    
    console.log('Formulario de Item Completo inicializado correctamente');
});

// ===== FUNCIONES GLOBALES PARA EVENTOS INLINE =====
window.itemFormManager = {
    removeSpecification: (index) => itemFormManager.removeSpecification(index),
    removeImage: (index) => itemFormManager.removeImage(index)
};
