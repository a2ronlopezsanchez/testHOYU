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

    init() {
        this.checkEditMode();
        this.checkNewUnitMode();
        this.setupEventListeners();
        this.initializeTagify();
        this.initializeDropzone();
        this.calculateProgress();
        this.setupAutoSave();
        this.initializeValidation();
        this.loadTemplates();
    }

    // ===== VERIFICAR MODO DE EDICIÓN =====
    checkEditMode() {
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

    checkNewUnitMode() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        const parentId = urlParams.get('id');

        if (mode === 'new-from-parent' && parentId) {
            // Cargar datos del item padre
            document.getElementById('formTitle').textContent = 'Agregar Nueva Unidad';
            document.getElementById('saveButtonText').textContent = 'Guardar Nueva Unidad';

            // Cargar datos del padre desde el servidor
            this.loadParentData(parentId);
        }
    }

    // Cargar datos del item padre para nueva unidad
    async loadParentData(parentId) {
        try {
            const response = await fetch(`/inventory/item-parents/${parentId}/data`);
            const result = await response.json();

            if (result.success) {
                const data = result.data;

                // Poblar campos del padre
                if (data.category && tagifyInstances.category) {
                    tagifyInstances.category.addTags([data.category]);
                }
                if (data.brand && tagifyInstances.brand) {
                    tagifyInstances.brand.addTags([data.brand]);
                }
                if (data.model && tagifyInstances.model) {
                    tagifyInstances.model.addTags([data.model]);
                }
                if (data.family && tagifyInstances.family) {
                    tagifyInstances.family.addTags([data.family]);
                }
                if (data.sub_family && tagifyInstances.subFamily) {
                    tagifyInstances.subFamily.addTags([data.sub_family]);
                }
                if (data.color && tagifyInstances.color) {
                    tagifyInstances.color.addTags([data.color]);
                }

                document.getElementById('itemName').value = data.name || '';
                document.getElementById('itemPublicName').value = data.public_name || '';

                // Guardar el ID del padre para usar al guardar
                formData.item_parent_id = parentId;

                this.updatePreview();
                this.showAlert('Datos del item padre cargados correctamente', 'success');
            }
        } catch (error) {
            console.error('Error al cargar datos del padre:', error);
            this.showAlert('Error al cargar datos del item padre', 'error');
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
                // Si hay cambios sin guardar, guardar automáticamente
                if (unsavedChanges) {
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
    initializeTagify() {
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
                whitelist: ['ACTIVO', 'INACTIVO', 'DESCOMPUESTO', 'EN REPARACION', 'EXTRAVIADO', 'BAJA'],
                enforceWhitelist: true
            });
            
            tagifyInstances.status.on('change', () => {
                unsavedChanges = true;
                this.enableSaveButton();
            });
        }

        // Ubicación
        const locationInput = document.querySelector('#itemLocation');
        if (locationInput) {
            tagifyInstances.location = new Tagify(locationInput, {
                ...tagifyConfig,
                whitelist: ['ALMACEN', 'PICKING', 'TRASLADO', 'EVENTO', 'EXTRAVIADO'],
                enforceWhitelist: true
            });
            
            // 👇 AGREGAR ESTE EVENTO COMPLETO
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
        // Solo contar campos visibles y relevantes (excluir hidden, readonly)
        const allFields = Array.from(document.querySelectorAll('#itemCompleteForm input:not([type="hidden"]):not([readonly]), #itemCompleteForm select, #itemCompleteForm textarea'))
            .filter(field => field.offsetParent !== null); // Solo campos visibles

        // Campos requeridos del config
        const requiredFieldIds = ['itemName', 'itemCategory', 'itemBrand', 'itemModel', 'itemStatus', 'itemLocation'];

        let filledFields = 0;
        let filledRequired = 0;
        let totalRequired = requiredFieldIds.length;

        // Contar campos normales llenos
        allFields.forEach(field => {
            if (this.isFieldFilled(field)) {
                filledFields++;
            }
        });

        // Verificar campos requeridos (Tagify)
        requiredFieldIds.forEach(fieldId => {
            const tagifyKey = Object.keys(tagifyInstances).find(key =>
                tagifyInstances[key].DOM.originalInput.id === fieldId
            );

            if (tagifyKey && tagifyInstances[tagifyKey].value.length > 0) {
                filledRequired++;
                filledFields++; // También cuenta para el total
            } else if (fieldId === 'itemName') {
                // itemName no es Tagify, es input normal
                const nameField = document.getElementById('itemName');
                if (nameField && this.isFieldFilled(nameField)) {
                    filledRequired++;
                }
            }
        });

        const totalFields = allFields.length + Object.keys(tagifyInstances).length;
        const progressPercentage = Math.round((filledFields / totalFields) * 100);

        // Actualizar UI
        document.getElementById('formProgress').style.width = progressPercentage + '%';
        document.getElementById('progressText').textContent = progressPercentage + '% completado';
        document.getElementById('fieldsCompleted').textContent = filledFields;
        document.getElementById('totalFields').textContent = totalFields;

        // Habilitar/deshabilitar botón de guardar según campos requeridos
        // Solo deshabilitar si NO están llenos los campos requeridos
        const saveBtn = document.getElementById('saveFormBtn');
        const allRequiredFilled = filledRequired >= totalRequired;

        if (!allRequiredFilled) {
            saveBtn.disabled = true;
            saveBtn.classList.remove('btn-primary');
            saveBtn.classList.add('btn-secondary');
        } else {
            // Si ya están llenos los requeridos, dejar habilitado
            if (saveBtn.disabled) {
                saveBtn.disabled = false;
                saveBtn.classList.remove('btn-secondary');
                saveBtn.classList.add('btn-primary');
            }
        }
    }

        // ===== HABILITAR BOTÓN DE GUARDAR =====
        enableSaveButton() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');
            
            if (saveBtn.disabled) {
                saveBtn.disabled = false;
                saveBtn.classList.add('btn-primary');
                
                // Cambiar el texto del botón para indicar que hay cambios
                const originalText = saveButtonText.textContent;
                if (!originalText.includes('*')) {
                    saveButtonText.textContent = originalText + ' *';
                }
            }
        }

        // ===== DESHABILITAR BOTÓN DE GUARDAR =====
        disableSaveButton() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');
            
            saveBtn.classList.add('btn-primary');
            
            // Remover el asterisco si existe
            saveButtonText.textContent = saveButtonText.textContent.replace(' *', '');
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
                if (unsavedChanges) {
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

            // Recopilar datos del formulario
            this.collectFormData();

            try {
                // Enviar datos al servidor
                const response = await fetch('/inventory/items/auto-save', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const result = await response.json();
                    autoSaveStatus.textContent = 'Guardado hace un momento';
                    autoSaveStatus.classList.remove('text-warning');
                    autoSaveStatus.classList.add('text-success');
                    unsavedChanges = false;

                    setTimeout(() => {
                        autoSaveStatus.classList.remove('text-success');
                        autoSaveStatus.textContent = 'Último guardado: ' + new Date().toLocaleTimeString();
                    }, 3000);
                } else {
                    throw new Error('Error en el auto-guardado');
                }
            } catch (error) {
                console.error('Error al auto-guardar:', error);
                autoSaveStatus.textContent = 'Error al guardar';
                autoSaveStatus.classList.remove('text-warning');
                autoSaveStatus.classList.add('text-danger');

                setTimeout(() => {
                    autoSaveStatus.classList.remove('text-danger');
                    autoSaveStatus.textContent = 'No guardado';
                }, 3000);
            }
        }

        // ===== AUTO-GUARDAR AL CAMBIAR DE TAB =====
        autoSaveOnTabChange() {
            const saveBtn = document.getElementById('saveFormBtn');
            const saveButtonText = document.getElementById('saveButtonText');
            const originalText = saveButtonText.textContent.replace(' *', '');
            
            // Animación de guardado
            saveBtn.classList.add('btn-success');
            saveBtn.classList.remove('btn-primary');
            saveBtn.disabled = true;
            
            // Icono de check animado
            saveButtonText.innerHTML = '<i class="mdi mdi-check-circle me-1"></i>Cambios Guardados';
            
            // Simular guardado
            setTimeout(() => {
                unsavedChanges = false;
                
                // Después de 2 segundos, restaurar el botón
                setTimeout(() => {
                    saveBtn.classList.remove('btn-success');
                    saveBtn.classList.add('btn-primary');
                    saveButtonText.textContent = originalText;
                    
                    // El botón queda habilitado por si quieren guardar manualmente
                    saveBtn.disabled = false;
                }, 2000);
            }, 500);
            
            console.log('Cambios guardados automáticamente al cambiar de tab');
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
                // Simular envío al servidor
                await this.simulateServerSave();
                
                // Éxito
                unsavedChanges = false;
                this.disableSaveButton(); // 👈 NUEVA LÍNEA
                this.showAlert(
                    isEditing ? 'Item actualizado correctamente' : 'Item creado correctamente', 
                    'success'
                );
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const mode = urlParams.get('mode');
                    const itemId = urlParams.get('id');
                    
                    // Si es edición, volver al detalle
                    if (mode === 'edit' && itemId) {
                        window.location.href = `vista-detalle-item.html?id=${itemId}`;
                    } else {
                        // Si es nuevo, ir al catálogo
                        window.location.href = 'catalogo-inventario.html';
                    }
                }, 2000);
                
            } catch (error) {
                console.error('Error al guardar:', error);
                this.showAlert('Error al guardar el item. Por favor intente nuevamente.', 'error');
                
                // Restaurar botón
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
            }
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
                tagifyInstances.color.addTags([data.color]);
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
                tagifyInstances.location.addTags([data.ubicacion]);
            }
            if (data.status && tagifyInstances.status) {
                tagifyInstances.status.addTags([data.status]);
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
            this.updatePreview();
            this.calculateProgress();
            this.calculateROI();
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
