/**
 * VISTA DETALLE DE ITEM - JAVASCRIPT
 * Sistema de visualización detallada de items del inventario
 * Autor: Happening Network Media
 */

// ===== CONFIGURACIÓN GLOBAL =====
const DETAIL_CONFIG = {
    dateFormat: 'DD/MM/YYYY',
    currency: '$',
    depreciationRate: 0.20, // 20% anual
    maintenanceAlertDays: 30,
    lowStockThreshold: 5
};

// ===== VARIABLES GLOBALES =====
let currentItemData = null;
let currentTab = 'overview';
let usageHistoryData = [];
let maintenanceHistoryData = [];
let upcomingEventsData = [];

// ===== CLASE PRINCIPAL =====
class ItemDetailManager {
    constructor() {
        this.init();
    }

    init() {
        this.loadItemData();
        this.setupEventListeners();
        this.initializeCharts();
        this.checkMaintenanceStatus();
        this.calculateDepreciation();
        // No inicializar DataTables aquí - se inicializará cuando se muestre el tab correspondiente
        this.dataTablesInitialized = false;
        this.usageDataTablesInitialized = false;
    }

    // ===== CARGAR DATOS DEL ITEM =====
    loadItemData() {
        // Verificar si hay datos de Blade disponibles
        if (window.bladeItemData) {
            console.log('Usando datos de Blade:', window.bladeItemData);
            this.loadFromBladeData(window.bladeItemData);
        } else {
            // Obtener ID del item de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const itemId = urlParams.get('item_id') || 'EQ-AUD-001';

            // En producción, esto sería una llamada AJAX
            this.mockLoadItemData(itemId);
        }
    }

    // ===== CARGAR DATOS DESDE BLADE =====
    loadFromBladeData(bladeData) {
        const { itemParent, availability, inventoryItem } = bladeData;

        // Si es una unidad individual, usar sus datos; sino usar el parent
        const item = inventoryItem || itemParent.items?.[0] || {};

        // Convertir datos de Blade al formato que espera el JS
        currentItemData = {
            id: itemParent.id,
            inventoryItemId: inventoryItem?.id || null, // ID del InventoryItem específico
            item_id: itemParent.item_id,
            sku: item.sku || 'N/A',
            name: itemParent.public_name || itemParent.name,
            category: itemParent.category?.name || 'Sin categoría',
            subcategory: itemParent.sub_family || itemParent.family || '',
            brand: itemParent.brand?.name || 'Sin marca',
            model: itemParent.model || 'Sin modelo',
            purchaseDate: item.purchase_date || 'N/A',
            purchasePrice: item.original_price || 0,  // Usar original_price en lugar de purchase_price
            status: this.translateStatus(item.status) || 'Operativo',
            condition: item.condition || 'Bueno',
            currentLocation: item.location?.name || 'Sin ubicación',
            rfidTag: item.rfid_tag || 'N/A',
            serialNumber: item.serial_number || 'N/A',
            lastInspection: item.last_maintenance || 'N/A',
            nextInspection: item.next_maintenance || 'N/A',
            warranty: {
                provider: item.warranty_provider || 'N/A',
                expiration: item.warranty_expiration || 'N/A',
                expired: true // Por ahora asumimos expirada
            },
            usageCount: 0, // TODO: Obtener de la BD
            totalHours: 0, // TODO: Obtener de la BD
            description: itemParent.description || item.description || 'Sin descripción',
            specifications: this.parseSpecifications(itemParent.specifications),
            notes: item.notes || '',
            images: []
        };

        // Datos de historial (por ahora vacíos, se pueden cargar con AJAX)
        usageHistoryData = [];
        maintenanceHistoryData = bladeData.maintenanceRecords || [];
        upcomingEventsData = [];

        // NO llamar updateUI() porque los datos ya están en el HTML desde Blade
        // Solo actualizar las tablas dinámicas que no están pobladas desde Blade
        // NO llamar updateUpcomingEventsTable() - los datos vienen del servidor vía Blade
        // this.updateUpcomingEventsTable();
        // NO llamar updateUsageHistoryTable() - los datos vienen del servidor vía Blade
        // this.updateUsageHistoryTable();

        // NO actualizar updateMaintenanceHistoryTable() porque ya está renderizada en el HTML
        // En su lugar, calcular métricas desde el DOM después de que cargue
        // Usar setTimeout para asegurar que el DOM esté listo
        setTimeout(() => {
            // Solo actualizar métricas si los elementos existen
            const lastInspectionEl = document.getElementById('lastInspection');
            if (lastInspectionEl) {
                this.updateMaintenanceMetrics();
            }
        }, 100);
    }

    // ===== TRADUCIR ESTADO DE BD A FORMATO UI =====
    translateStatus(status) {
        const statusMap = {
            'DISPONIBLE': 'Operativo',
            'EN_EVENTO': 'En Uso',
            'MANTENIMIENTO': 'En Mantenimiento',
            'EN_REPARACION': 'En Mantenimiento',
            'EXTRAVIADO': 'Fuera de Servicio',
            'DESCOMPUESTO': 'Fuera de Servicio',
            'BAJA': 'Fuera de Servicio'
        };
        return statusMap[status] || 'Operativo';
    }

    // ===== PARSEAR ESPECIFICACIONES SEGURO =====
    parseSpecifications(specs) {
        if (!specs) return [];

        try {
            // Si ya es un array, devolverlo
            if (Array.isArray(specs)) return specs;

            // Si es un string JSON, parsearlo
            if (typeof specs === 'string') {
                return JSON.parse(specs);
            }

            return [];
        } catch (e) {
            console.error('Error parseando especificaciones:', e);
            return [];
        }
    }

    // ===== DATOS DE PRUEBA =====
        mockLoadItemData(itemId) {
            // AGREGAR: Intentar cargar desde el catálogo si existe
            try {
                const catalogData = sessionStorage.getItem('inventoryData');
                if (catalogData) {
                    const inventory = JSON.parse(catalogData);
                    const foundItem = inventory.find(item => item.id === itemId);
                    if (foundItem) {
                        currentItemData = foundItem;
                        this.updateUI();
                        return;
                    }
                }
            } catch (e) {
                console.log('No se pudo cargar desde sesión, usando datos mock');
            }
        // Simulación de datos del item
        currentItemData = {
            id: 1,
            item_id: 'EQ-AUD-001',
            sku: 'BP000123',
            name: 'Altavoz JBL EON615',
            category: 'Audio',
            subcategory: 'Altavoces',
            brand: 'JBL',
            model: 'EON615',
            purchaseDate: '15/06/2022',
            purchasePrice: 499.99,
            status: 'Operativo',
            condition: 'Bueno',
            currentLocation: 'Almacén Principal',
            rfidTag: 'RF-A-12345',
            serialNumber: 'EON615-2204-8743',
            lastInspection: '05/03/2025',
            nextInspection: '05/06/2025',
            warranty: {
                provider: 'Audio Pro',
                expiration: '15/06/2024',
                expired: true
            },
            usageCount: 28,
            totalHours: 187,
            description: 'Altavoz activo de 15 pulgadas con 1000W de potencia. Incluye mezclador de 2 canales y Bluetooth.',
            specifications: [
                'Potencia: 1000W',
                'Respuesta de frecuencia: 50Hz - 20kHz',
                'SPL Máximo: 127 dB',
                'Peso: 17,69 kg',
                'Dimensiones: 375 x 654 x 363 mm'
            ],
            notes: 'El altavoz presenta un leve zumbido en volúmenes altos. Se programó revisión para el próximo mantenimiento.',
            images: [
                '/assets/img/items/jbl-eon615-1.jpg',
                '/assets/img/items/jbl-eon615-2.jpg'
            ]
        };

        // Datos de historial de uso
        usageHistoryData = [
            { 
                id: 1, 
                eventName: 'Concierto Rock City', 
                date: '10/03/2025', 
                location: 'Arena Ciudad', 
                hours: 8, 
                status: 'Finalizado', 
                notes: 'Funcionamiento correcto' 
            },
            { 
                id: 2, 
                eventName: 'Boda García-Mendez', 
                date: '28/02/2025', 
                location: 'Hotel Palace', 
                hours: 6, 
                status: 'Finalizado', 
                notes: 'Se detectó zumbido a volumen alto' 
            },
            { 
                id: 3, 
                eventName: 'Conferencia Anual Tecnología', 
                date: '15/02/2025', 
                location: 'Centro Convenciones', 
                hours: 4, 
                status: 'Finalizado', 
                notes: 'Sin incidencias' 
            },
            { 
                id: 4, 
                eventName: 'Festival de Verano', 
                date: '22/01/2025', 
                location: 'Parque Central', 
                hours: 10, 
                status: 'Finalizado', 
                notes: 'Funcionamiento normal' 
            }
        ];

        // Datos de historial de mantenimiento
        maintenanceHistoryData = [
            { 
                id: 1, 
                type: 'Revisión', 
                date: '05/03/2025', 
                technician: 'Miguel Ángel', 
                cost: 0, 
                status: 'Completado', 
                notes: 'Se verificó el zumbido reportado. Se recomienda revisar los circuitos internos en la próxima revisión.' 
            },
            { 
                id: 2, 
                type: 'Limpieza', 
                date: '10/01/2025', 
                technician: 'Carlos Mendoza', 
                cost: 25, 
                status: 'Completado', 
                notes: 'Limpieza de componentes y carcasa.' 
            },
            { 
                id: 3, 
                type: 'Reparación', 
                date: '15/11/2024', 
                technician: 'Roberto Sánchez', 
                cost: 75, 
                status: 'Completado', 
                notes: 'Sustitución de fusible y revisión de conexiones internas.' 
            }
        ];

        // Próximos eventos
        upcomingEventsData = [
            { 
                id: 1, 
                eventName: 'Conferencia Empresarial', 
                date: '20/04/2025', 
                location: 'Hotel Business', 
                status: 'Confirmado' 
            },
            { 
                id: 2, 
                eventName: 'Boda Rodríguez-López', 
                date: '08/05/2025', 
                location: 'Hacienda Vista Verde', 
                status: 'Confirmado' 
            }
        ];

        // NOTA: NO actualizar la UI porque los datos ya están en el HTML desde Blade
        // Si descomentas esto, sobrescribirá los datos reales con estos datos de prueba
        // this.updateUI();

        console.warn('⚠️ Usando datos mock - No se encontraron datos de Blade ni en sessionStorage');
        console.warn('Los datos se muestran desde el HTML, pero no se sobrescriben con updateUI()');
    }

    // ===== ACTUALIZAR INTERFAZ =====
    updateUI() {
        if (!currentItemData) return;

        // Información del header
        document.getElementById('itemName').textContent = currentItemData.name;
        document.getElementById('itemId').textContent = currentItemData.item_id;
        
        // Badges de estado
        this.updateStatusBadge('itemStatusBadge', currentItemData.status);
        this.updateConditionBadge('itemConditionBadge', currentItemData.condition);

        // Información general
        document.getElementById('itemCategory').textContent = `${currentItemData.category} / ${currentItemData.subcategory}`;
        document.getElementById('itemBrandModel').textContent = `${currentItemData.brand} / ${currentItemData.model}`;
        document.getElementById('itemPurchaseDate').textContent = currentItemData.purchaseDate;
        document.getElementById('itemPurchasePrice').textContent = `${DETAIL_CONFIG.currency}${currentItemData.purchasePrice}`;
        document.getElementById('itemSerialNumber').textContent = currentItemData.serialNumber;
        document.getElementById('itemRfidTag').textContent = currentItemData.rfidTag;
        document.getElementById('itemCondition').textContent = currentItemData.condition;
        document.getElementById('itemDescription').textContent = currentItemData.description;

        // Garantía
        document.getElementById('itemWarranty').textContent = `${currentItemData.warranty.provider} (${currentItemData.warranty.expiration})`;
        const warrantyBadge = document.getElementById('warrantyStatus');
        warrantyBadge.textContent = currentItemData.warranty.expired ? 'Expirada' : 'Vigente';
        warrantyBadge.className = currentItemData.warranty.expired ? 'badge bg-label-danger ms-2' : 'badge bg-label-success ms-2';

        // Especificaciones
        const specsList = document.getElementById('itemSpecifications');
        specsList.innerHTML = currentItemData.specifications.map(spec => 
            `<li class="mb-1"><i class="mdi mdi-check text-primary me-2"></i>${spec}</li>`
        ).join('');

        // Notas
        if (currentItemData.notes) {
            document.getElementById('itemNotes').style.display = 'flex';
            document.querySelector('#itemNotes p').textContent = currentItemData.notes;
        } else {
            document.getElementById('itemNotes').style.display = 'none';
        }

        // Estadísticas
        document.getElementById('totalEvents').textContent = currentItemData.usageCount;
        document.getElementById('totalHours').textContent = `${currentItemData.totalHours} hrs`;
        document.getElementById('totalMaintenances').textContent = maintenanceHistoryData.length;

        // Estado actual
        document.getElementById('currentLocation').textContent = currentItemData.currentLocation;
        document.getElementById('lastInspection').textContent = currentItemData.lastInspection;
        document.getElementById('nextInspection').textContent = currentItemData.nextInspection;
        document.getElementById('originalValue').textContent = `${DETAIL_CONFIG.currency}${currentItemData.purchasePrice}`;

        // Actualizar tablas
        this.updateUpcomingEventsTable();
        this.updateUsageHistoryTable();
        this.updateMaintenanceHistoryTable();
    }

    // ===== ACTUALIZAR BADGE DE ESTADO =====
    updateStatusBadge(elementId, status) {
        const badge = document.getElementById(elementId);
        badge.textContent = status;
        
        // Limpiar clases anteriores
        badge.className = 'badge';
        
        // Aplicar nueva clase según estado
        switch (status) {
            case 'Operativo':
                badge.classList.add('bg-label-success');
                break;
            case 'En Mantenimiento':
                badge.classList.add('bg-label-warning');
                break;
            case 'Fuera de Servicio':
                badge.classList.add('bg-label-danger');
                break;
            default:
                badge.classList.add('bg-label-secondary');
        }
    }

    // ===== ACTUALIZAR BADGE DE CONDICIÓN =====
    updateConditionBadge(elementId, condition) {
        const badge = document.getElementById(elementId);
        badge.textContent = condition;
        
        // Limpiar clases anteriores
        badge.className = 'badge';
        
        // Aplicar nueva clase según condición
        switch (condition) {
            case 'Nuevo':
            case 'Excelente':
                badge.classList.add('bg-label-success');
                break;
            case 'Bueno':
                badge.classList.add('bg-label-primary');
                break;
            case 'Regular':
                badge.classList.add('bg-label-warning');
                break;
            case 'Malo':
            case 'Requiere Reparación':
                badge.classList.add('bg-label-danger');
                break;
            default:
                badge.classList.add('bg-label-secondary');
        }
    }

    // ===== ACTUALIZAR TABLA DE PRÓXIMOS EVENTOS =====
    updateUpcomingEventsTable() {
        const tbody = document.getElementById('upcomingEventsTable');
        tbody.innerHTML = '';

        if (upcomingEventsData.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">No hay eventos programados</td>
                </tr>
            `;
            return;
        }

        upcomingEventsData.forEach(event => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.eventName}</td>
                <td>${event.date}</td>
                <td>${event.location}</td>
                <td><span class="badge bg-label-success">${event.status}</span></td>
            `;
            tbody.appendChild(row);
        });
    }

    // ===== ACTUALIZAR TABLA DE HISTORIAL DE USO =====
    updateUsageHistoryTable() {
        const tbody = document.querySelector('#usageHistoryTable tbody');
        tbody.innerHTML = '';

        usageHistoryData.forEach(usage => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${usage.eventName}</td>
                <td>${usage.date}</td>
                <td>${usage.location}</td>
                <td>${usage.hours} hrs</td>
                <td><span class="badge bg-label-success">${usage.status}</span></td>
                <td>${usage.notes}</td>
            `;
            tbody.appendChild(row);
        });
    }

    // ===== ACTUALIZAR TABLA DE HISTORIAL DE MANTENIMIENTO =====
    updateMaintenanceHistoryTable() {
        const tbody = document.querySelector('#maintenanceHistoryTable tbody');
        tbody.innerHTML = '';

        maintenanceHistoryData.forEach(maintenance => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${maintenance.type}</td>
                <td>${maintenance.date}</td>
                <td>${maintenance.technician}</td>
                <td>${DETAIL_CONFIG.currency}${maintenance.cost}</td>
                <td><span class="badge bg-label-success">${maintenance.status}</span></td>
                <td>${maintenance.notes}</td>
            `;
            tbody.appendChild(row);
        });
    }
// ===== CALCULAR DEPRECIACIÃ"N =====
    calculateDepreciation() {
        if (!currentItemData) return;

        const purchaseDate = this.parseDate(currentItemData.purchaseDate);
        const currentDate = new Date();
        const yearsElapsed = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365);
        
        const depreciationAmount = currentItemData.purchasePrice * DETAIL_CONFIG.depreciationRate * yearsElapsed;
        const currentValue = Math.max(currentItemData.purchasePrice - depreciationAmount, 0);
        const depreciationPercentage = ((depreciationAmount / currentItemData.purchasePrice) * 100).toFixed(0);
        const remainingLifePercentage = (100 - depreciationPercentage).toFixed(0);

        // Actualizar UI
        document.getElementById('currentValue').textContent = `${DETAIL_CONFIG.currency}${currentValue.toFixed(2)}`;
        
        // Actualizar barra de progreso
        const progressBar = document.querySelector('.progress-bar[role="progressbar"]');
        if (progressBar) {
            progressBar.style.width = `${remainingLifePercentage}%`;
            
            // Cambiar color según porcentaje
            progressBar.className = 'progress-bar';
            if (remainingLifePercentage >= 70) {
                progressBar.classList.add('bg-success');
            } else if (remainingLifePercentage >= 40) {
                progressBar.classList.add('bg-warning');
            } else {
                progressBar.classList.add('bg-danger');
            }
        }

        // Actualizar texto de depreciación
        const depreciationText = document.querySelector('.progress + .d-flex .text-muted:first-child span');
        if (depreciationText) {
            depreciationText.textContent = `Depreciación: ${depreciationPercentage}%`;
        }
        
        const lifeText = document.querySelector('.progress + .d-flex .text-muted:last-child span');
        if (lifeText) {
            lifeText.textContent = `Vida útil: ${remainingLifePercentage}%`;
        }
    }

    // ===== VERIFICAR ESTADO DE MANTENIMIENTO =====
    checkMaintenanceStatus() {
        if (!currentItemData) return;

        const nextInspectionDate = this.parseDate(currentItemData.nextInspection);
        const currentDate = new Date();
        const daysUntilInspection = Math.ceil((nextInspectionDate - currentDate) / (1000 * 60 * 60 * 24));

        // Si faltan menos de 30 días, mostrar alerta
        if (daysUntilInspection <= DETAIL_CONFIG.maintenanceAlertDays && daysUntilInspection > 0) {
            this.showMaintenanceAlert(daysUntilInspection);
        } else if (daysUntilInspection < 0) {
            this.showMaintenanceOverdueAlert(Math.abs(daysUntilInspection));
        }
    }

    // ===== MOSTRAR ALERTA DE MANTENIMIENTO PRÓXIMO =====
    showMaintenanceAlert(daysRemaining) {
        const alertHtml = `
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <i class="mdi mdi-alert me-2"></i>
                <strong>Mantenimiento Próximo:</strong> La próxima inspección está programada en ${daysRemaining} días.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        const container = document.querySelector('.container-xxl.flex-grow-1');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
    }

    // ===== MOSTRAR ALERTA DE MANTENIMIENTO VENCIDO =====
    showMaintenanceOverdueAlert(daysOverdue) {
        // DESHABILITADO: La alerta ya se muestra desde Blade con datos del backend
        // para evitar duplicados
        return;

        /* const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="mdi mdi-alert-circle me-2"></i>
                <strong>¡Mantenimiento Vencido!</strong> La inspección está atrasada por ${daysOverdue} días.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        const container = document.querySelector('.container-xxl.flex-grow-1');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        } */
    }

    // ===== PARSEAR FECHA =====
    parseDate(dateString) {
        // Formato: DD/MM/YYYY
        const parts = dateString.split('/');
        return new Date(parts[2], parts[1] - 1, parts[0]);
    }

    // ===== FORMATEAR FECHA =====
    formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // ===== INICIALIZAR GRÁFICOS =====
    initializeCharts() {
        // Aquí se pueden agregar gráficos con ApexCharts si se requiere
        // Por ahora dejamos esta función preparada para futuras implementaciones
        console.log('Charts initialized');
    }

    // ===== CONFIGURAR EVENT LISTENERS =====
    setupEventListeners() {
        // Botón de editar
        const editBtn = document.getElementById('editBtn');
        if (editBtn) {
            editBtn.addEventListener('click', () => this.handleEdit());
        }

        // Botón de compartir
        const shareBtn = document.getElementById('shareBtn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.handleShare());
        }
        
        // Botón de editar notas
        const editNotesBtn = document.getElementById('editNotesBtn');
        if (editNotesBtn) {
            editNotesBtn.addEventListener('click', () => this.handleEditNotes());
        }

        // Botón de programar mantenimiento
        const scheduleMaintenanceBtn = document.getElementById('scheduleMaintenanceBtn');
        if (scheduleMaintenanceBtn) {
            scheduleMaintenanceBtn.addEventListener('click', () => this.handleScheduleMaintenance());
        }

        // Botón de dar de baja
        const decommissionBtn = document.getElementById('decommissionBtn');
        if (decommissionBtn) {
            decommissionBtn.addEventListener('click', () => this.handleDecommission());
        }

        // Botón de registrar uso
        const registerUsageBtn = document.getElementById('registerUsageBtn');
        if (registerUsageBtn) {
            registerUsageBtn.addEventListener('click', () => this.openUsageModal());
        }

        // Botón de guardar uso
        const saveUsageBtn = document.getElementById('saveUsageBtn');
        if (saveUsageBtn) {
            saveUsageBtn.addEventListener('click', () => this.saveUsage());
        }

        // Botón de registrar mantenimiento
        const registerMaintenanceBtn = document.getElementById('registerMaintenanceBtn');
        if (registerMaintenanceBtn) {
            registerMaintenanceBtn.addEventListener('click', () => this.openMaintenanceModal());
        }

        // Botón de guardar mantenimiento
        const saveMaintenanceBtn = document.getElementById('saveMaintenanceBtn');
        if (saveMaintenanceBtn) {
            saveMaintenanceBtn.addEventListener('click', () => this.saveMaintenance());
        }

        // Event delegation para botones de completar mantenimiento
        document.addEventListener('click', (e) => {
            if (e.target.closest('.complete-maintenance-btn')) {
                e.preventDefault();
                const maintenanceId = e.target.closest('.complete-maintenance-btn').dataset.maintenanceId;
                this.openCompleteMaintenanceModal(maintenanceId);
            }
        });

        // Botón de confirmar completar mantenimiento
        const confirmCompleteMaintenanceBtn = document.getElementById('confirmCompleteMaintenanceBtn');
        if (confirmCompleteMaintenanceBtn) {
            confirmCompleteMaintenanceBtn.addEventListener('click', () => this.confirmCompleteMaintenance());
        }

                // Botón de subir documento (en el tab de documentos)
        const uploadDocumentBtn = document.getElementById('uploadDocumentBtn');
        if (uploadDocumentBtn) {
            uploadDocumentBtn.addEventListener('click', () => this.handleUploadDocument());
        }

        // Botón de adjuntar documento (en el placeholder)
        const attachDocumentBtn = document.querySelector('.document-placeholder .btn-outline-primary');
        if (attachDocumentBtn) {
            attachDocumentBtn.addEventListener('click', () => this.handleUploadDocument());
        }

        // Botones de eliminar documento (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.delete-document-btn')) {
                const btn = e.target.closest('.delete-document-btn');
                const documentId = btn.dataset.documentId;
                const documentName = btn.dataset.documentName;
                this.handleDeleteDocument(documentId, documentName);
            }
        });

        // Cambio de tabs
        const tabs = document.querySelectorAll('#detailTabs .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const href = e.target.getAttribute('href') || e.target.closest('.nav-link')?.getAttribute('href');
                if (href) {
                    currentTab = href.replace('#', '');
                    this.handleTabChange(currentTab);
                }
            });
        });
    }

    // ===== MANEJAR CAMBIO DE TAB =====
    handleTabChange(tabName) {
        console.log(`Tab changed to: ${tabName}`);

        // Acciones específicas según el tab
        switch (tabName) {
            case 'usage':
                this.loadUsageHistory();
                // Inicializar DataTables de uso solo la primera vez que se muestra el tab
                if (!this.usageDataTablesInitialized) {
                    setTimeout(() => {
                        this.initializeUsageDataTable();
                        this.usageDataTablesInitialized = true;
                    }, 100);
                }
                break;
            case 'maintenance':
                this.loadMaintenanceHistory();
                // Inicializar DataTables solo la primera vez que se muestra el tab
                if (!this.dataTablesInitialized) {
                    setTimeout(() => {
                        this.initializeDataTables();
                        this.dataTablesInitialized = true;
                    }, 100);
                }
                break;
            case 'documents':
                this.loadDocuments();
                break;
        }
    }

    // ===== CARGAR HISTORIAL DE USO =====
    loadUsageHistory() {
        // En producción, esto sería una llamada AJAX
        console.log('Loading usage history...');
    }

    // ===== CARGAR HISTORIAL DE MANTENIMIENTO =====
    loadMaintenanceHistory() {
        // En producción, esto sería una llamada AJAX
        console.log('Loading maintenance history...');
    }

    // ===== CARGAR DOCUMENTOS =====
    loadDocuments() {
        // En producción, esto sería una llamada AJAX
        console.log('Loading documents...');
    }

    // ===== MANEJAR EDICIÓN =====
    handleEdit() {
        if (!currentItemData) return;

        // Si hay un inventoryItemId, estamos editando una unidad específica
        if (currentItemData.inventoryItemId) {
            window.location.href = `/inventory/formulario/${currentItemData.id}?mode=edit-unit&unit_id=${currentItemData.inventoryItemId}`;
        } else {
            // Si no, editamos el parent
            window.location.href = `/inventory/formulario/${currentItemData.id}?mode=edit`;
        }
    }

    // ===== MANEJAR COMPARTIR =====
    handleShare() {
        if (!currentItemData) return;

        const shareUrl = window.location.href;
        
        // Intentar usar la API de Share si está disponible
        if (navigator.share) {
            navigator.share({
                title: currentItemData.name,
                text: `Detalles del item: ${currentItemData.name}`,
                url: shareUrl
            })
            .then(() => console.log('Compartido exitosamente'))
            .catch(err => console.error('Error al compartir:', err));
        } else {
            // Fallback: copiar al portapapeles
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    this.showToast('success', 'Enlace copiado al portapapeles');
                })
                .catch(err => {
                    console.error('Error al copiar:', err);
                    this.showToast('error', 'No se pudo copiar el enlace');
                });
        }
    }

    // ===== EDITAR NOTAS ===== 
    async handleEditNotes() {
        if (!currentItemData) return;

        // Verificar que tengamos el inventoryItemId
        if (!currentItemData.inventoryItemId) {
            this.showToast('error', 'No se puede editar: ID de unidad no encontrado');
            return;
        }

        Swal.fire({
            title: 'Editar Notas del Item',
            html: `
                <div class="text-start">
                    <label class="form-label">Notas Importantes</label>
                    <textarea class="form-control" id="swal-notes-textarea" rows="5">${currentItemData.notes || ''}</textarea>
                    <small class="text-muted">Agrega observaciones, defectos, recomendaciones, etc.</small>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-primary me-2',
                cancelButton: 'btn btn-outline-secondary'
            },
            buttonsStyling: false,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
                const notes = document.getElementById('swal-notes-textarea').value.trim();

                try {
                    // Obtener CSRF token
                    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

                    // Hacer petición al backend
                    const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/notas`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({ notes })
                    });

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(result.message || 'Error al guardar las notas');
                    }

                    return { notes: result.notes };

                } catch (error) {
                    Swal.showValidationMessage(`Error: ${error.message}`);
                    return false;
                }
            },
            allowOutsideClick: () => !Swal.isLoading()
        }).then((result) => {
            if (result.isConfirmed) {
                // Actualizar notas en memoria
                currentItemData.notes = result.value.notes;

                // Actualizar UI
                const notesContainer = document.getElementById('itemNotes');
                const notesText = document.querySelector('#itemNotes #itemNotesText');

                if (currentItemData.notes) {
                    if (notesContainer) notesContainer.style.display = 'flex';
                    if (notesText) notesText.textContent = currentItemData.notes;
                } else {
                    if (notesContainer) notesContainer.style.display = 'none';
                }

                this.showToast('success', 'Notas actualizadas correctamente');
            }
        });
    }
    // ===== MANEJAR PROGRAMAR MANTENIMIENTO =====
    handleScheduleMaintenance() {
        if (!currentItemData) return;

        Swal.fire({
            title: 'Programar Mantenimiento',
            html: `
                <div class="text-start">
                    <div class="mb-3">
                        <label class="form-label">Tipo de Mantenimiento</label>
                        <select class="form-select" id="swal-maintenance-type">
                            <option value="Preventivo">Preventivo</option>
                            <option value="Correctivo">Correctivo</option>
                            <option value="Revisión">Revisión</option>
                            <option value="Limpieza">Limpieza</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Fecha Programada</label>
                        <input type="date" class="form-control" id="swal-maintenance-date">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Técnico Asignado</label>
                        <input type="text" class="form-control" id="swal-technician" placeholder="Nombre del técnico">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notas</label>
                        <textarea class="form-control" id="swal-maintenance-notes" rows="3"></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Programar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-primary me-2',
                cancelButton: 'btn btn-outline-secondary'
            },
            buttonsStyling: false,
            preConfirm: () => {
                const type = document.getElementById('swal-maintenance-type').value;
                const date = document.getElementById('swal-maintenance-date').value;
                const technician = document.getElementById('swal-technician').value;
                const notes = document.getElementById('swal-maintenance-notes').value;

                if (!date || !technician) {
                    Swal.showValidationMessage('Por favor completa todos los campos obligatorios');
                    return false;
                }

                return { type, date, technician, notes };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.scheduleMaintenance(result.value);
            }
        });
    }

    // ===== PROGRAMAR MANTENIMIENTO =====
    async scheduleMaintenance(data) {
        if (!currentItemData || !currentItemData.inventoryItemId) {
            this.showToast('error', 'Error: No se pudo identificar el item');
            return;
        }

        try {
            // Mostrar indicador de carga
            Swal.fire({
                title: 'Programando mantenimiento...',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/mantenimiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    maintenance_type: data.type,
                    scheduled_date: data.date,
                    technician_name: data.technician,
                    work_description: data.notes || null
                })
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Éxito!',
                    text: 'Mantenimiento programado exitosamente',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Actualizar próxima inspección en la UI
                if (result.data && result.data.scheduled_date) {
                    currentItemData.nextInspection = result.data.scheduled_date;
                    const nextInspectionElement = document.getElementById('nextInspection');
                    if (nextInspectionElement) {
                        nextInspectionElement.textContent = result.data.scheduled_date;
                    }
                }

                // Recargar la página para mostrar el nuevo mantenimiento en la tabla
                setTimeout(() => {
                    window.location.reload();
                }, 2000);

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Error al programar el mantenimiento'
                });
            }

        } catch (error) {
            console.error('Error al programar mantenimiento:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión al programar el mantenimiento'
            });
        }
    }

    // ===== MANEJAR DAR DE BAJA =====
    handleDecommission() {
        if (!currentItemData) return;

        Swal.fire({
            title: '¿Dar de baja este item?',
            html: `
                <p class="text-muted mb-3">Estás a punto de dar de baja el siguiente item:</p>
                <div class="alert alert-warning text-start">
                    <strong>${currentItemData.name}</strong><br>
                    <small>ID: ${currentItemData.item_id}</small>
                </div>
                <div class="text-start">
                    <label class="form-label">Motivo de la baja</label>
                    <select class="form-select mb-3" id="swal-decommission-reason">
                        <option value="">Selecciona un motivo</option>
                        <option value="Obsoleto">Obsoleto</option>
                        <option value="Daño irreparable">Daño irreparable</option>
                        <option value="Pérdida">Pérdida</option>
                        <option value="Robo">Robo</option>
                        <option value="Fin de vida útil">Fin de vida útil</option>
                        <option value="Otro">Otro</option>
                    </select>
                    <label class="form-label">Comentarios adicionales</label>
                    <textarea class="form-control" id="swal-decommission-comments" rows="3"></textarea>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, dar de baja',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-danger me-2',
                cancelButton: 'btn btn-outline-secondary'
            },
            buttonsStyling: false,
            preConfirm: () => {
                const reason = document.getElementById('swal-decommission-reason').value;
                const comments = document.getElementById('swal-decommission-comments').value;

                if (!reason) {
                    Swal.showValidationMessage('Por favor selecciona un motivo');
                    return false;
                }

                return { reason, comments };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.decommissionItem(result.value);
            }
        });
    }

    // ===== DAR DE BAJA ITEM =====
    async decommissionItem(data) {
        // Verificar que tengamos el inventoryItemId
        if (!currentItemData.inventoryItemId) {
            Swal.fire({
                title: 'Error',
                text: 'No se puede dar de baja: ID de unidad no encontrado',
                icon: 'error',
                confirmButtonText: 'Entendido',
                customClass: { confirmButton: 'btn btn-primary' },
                buttonsStyling: false
            });
            return;
        }

        // Mostrar loading
        Swal.fire({
            title: 'Procesando...',
            text: 'Dando de baja el item',
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            // Obtener CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;

            // Hacer petición al backend
            const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/dar-de-baja`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    decommission_reason: data.reason,
                    decommission_notes: data.comments
                })
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Error al dar de baja el item');
            }

            // Mostrar éxito
            Swal.fire({
                title: 'Item dado de baja',
                text: 'El item ha sido dado de baja exitosamente',
                icon: 'success',
                confirmButtonText: 'Entendido',
                customClass: {
                    confirmButton: 'btn btn-primary'
                },
                buttonsStyling: false
            }).then(() => {
                // Redirigir al catálogo
                window.location.href = '/inventory/disponibilidad';
            });

        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: `Error al dar de baja el item: ${error.message}`,
                icon: 'error',
                confirmButtonText: 'Entendido',
                customClass: {
                    confirmButton: 'btn btn-primary'
                },
                buttonsStyling: false
            });
        }
    }

    // ===== ABRIR MODAL DE REGISTRO DE USO =====
    openUsageModal() {
        const modal = new bootstrap.Modal(document.getElementById('registerUsageModal'));
        
        // Limpiar formulario
        document.getElementById('usageForm').reset();
        
        // Establecer fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('eventDate').value = today;
        
        modal.show();
    }

    // ===== GUARDAR REGISTRO DE USO =====
    async saveUsage() {
        const form = document.getElementById('usageForm');

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const eventVenueValue = document.getElementById('eventVenue').value;
        console.log('=== DEBUG eventVenue ===');
        console.log('Valor del campo eventVenue:', eventVenueValue);
        console.log('Tipo:', typeof eventVenueValue);
        console.log('Longitud:', eventVenueValue.length);

        const usageData = {
            event_name: document.getElementById('eventName').value,
            event_date: document.getElementById('eventDate').value,
            event_venue: document.getElementById('eventLocation').value|| null,
            hours_used: parseFloat(document.getElementById('usageHours').value) || null,
            assignment_status: document.getElementById('assignmentStatus').value || null,
            notes: document.getElementById('usageNotes').value || null
        };

        console.log('usageData a enviar:', usageData);

        // Cerrar modal antes de la llamada AJAX
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerUsageModal'));
        modal.hide();

        try {
            // Mostrar loading
            Swal.fire({
                title: 'Guardando uso del equipo...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const inventoryItemId = currentItemData.inventoryItemId;
            const response = await fetch(`/inventory/unidad/${inventoryItemId}/uso`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(usageData)
            });

            const result = await response.json();

            if (result.success) {
                // Cerrar loading
                Swal.close();

                // Agregar registro a la tabla
                this.addUsageRowToTable(result.data);

                // Actualizar estadísticas
                this.updateUsageStatistics(result.data);

                // Mostrar mensaje de éxito
                Swal.fire({
                    icon: 'success',
                    title: 'Uso Registrado',
                    text: 'El uso del equipo se registró correctamente',
                    timer: 2000,
                    showConfirmButton: false
                });

                // Limpiar formulario
                form.reset();
                form.classList.remove('was-validated');
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Error al registrar el uso del equipo'
                });
            }
        } catch (error) {
            console.error('Error al guardar el uso:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Ocurrió un error al registrar el uso del equipo'
            });
        }
    }

    // ===== ABRIR MODAL DE REGISTRO DE MANTENIMIENTO =====
    openMaintenanceModal() {
        const modal = new bootstrap.Modal(document.getElementById('registerMaintenanceModal'));
        
        // Limpiar formulario
        document.getElementById('maintenanceForm').reset();
        
        // Establecer fecha actual por defecto
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('maintenanceDate').value = today;
        
        modal.show();
    }

    // ===== GUARDAR REGISTRO DE MANTENIMIENTO =====
    async saveMaintenance() {
        const form = document.getElementById('maintenanceForm');

        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const maintenanceData = {
            maintenance_type: document.getElementById('maintenanceType').value,
            scheduled_date: document.getElementById('maintenanceDate').value,
            technician_name: document.getElementById('technician').value,
            total_cost: parseFloat(document.getElementById('maintenanceCost').value) || 0,
            work_description: document.getElementById('maintenanceNotes').value || null
        };

        // Cerrar modal antes de la llamada AJAX
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerMaintenanceModal'));
        modal.hide();

        try {
            // Mostrar loading
            Swal.fire({
                title: 'Guardando mantenimiento...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Hacer llamada AJAX
            const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/mantenimiento`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify(maintenanceData)
            });

            const result = await response.json();

            if (result.success) {
                // Agregar nueva fila a la tabla sin recargar
                this.addMaintenanceRowToTable(result.data);

                // Actualizar estadísticas de mantenimiento
                this.updateMaintenanceStatistics();

                // Resetear formulario
                form.reset();
                form.classList.remove('was-validated');

                // Mostrar mensaje de éxito
                Swal.fire({
                    title: 'Mantenimiento registrado',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    customClass: {
                        confirmButton: 'btn btn-primary'
                    },
                    buttonsStyling: false
                });
            } else {
                throw new Error(result.message || 'Error al registrar el mantenimiento');
            }

        } catch (error) {
            console.error('Error saving maintenance:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo registrar el mantenimiento',
                icon: 'error',
                confirmButtonText: 'Entendido',
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
            });
        }
    }

    // ===== AGREGAR FILA DE MANTENIMIENTO A LA TABLA =====
    addUsageRowToTable(usageData) {
        // Determinar clase de badge según el estado
        let badgeClass = 'bg-label-secondary';
        let statusText = usageData.assignment_status;
        if (usageData.assignment_status === 'ASIGNADO') {
            badgeClass = 'bg-label-info';
            statusText = 'Asignado';
        } else if (usageData.assignment_status === 'EN_USO') {
            badgeClass = 'bg-label-primary';
            statusText = 'En Uso';
        } else if (usageData.assignment_status === 'DEVUELTO') {
            badgeClass = 'bg-label-success';
            statusText = 'Devuelto';
        } else if (usageData.assignment_status === 'CANCELADO') {
            badgeClass = 'bg-label-danger';
            statusText = 'Cancelado';
        }

        // Crear el HTML de la fila
        const rowData = [
            usageData.event_name,
            usageData.event_date,
            usageData.venue_address || 'Sin ubicación',
            usageData.hours_used ? `${usageData.hours_used} hrs` : '-',
            `<span class="badge ${badgeClass}" data-status="${usageData.assignment_status}">${statusText}</span>`,
            usageData.notes || 'Sin notas'
        ];

        // Agregar fila al DataTable si existe, sino al tbody directamente
        if (this.usageDataTable) {
            const row = this.usageDataTable.row.add(rowData).draw(false);
            $(row.node()).attr('data-usage-id', usageData.id);
            $(row.node()).addClass('usage-record-row');
        } else {
            // Fallback si DataTable no está inicializado
            const tbody = document.querySelector('#usageHistoryTable tbody');

            // Eliminar fila de "no records" si existe
            const noRecordsRow = tbody.querySelector('tr.no-records');
            if (noRecordsRow) {
                noRecordsRow.remove();
            }

            const newRow = document.createElement('tr');
            newRow.dataset.usageId = usageData.id;
            newRow.classList.add('usage-record-row');
            newRow.innerHTML = rowData.map(data => `<td>${data}</td>`).join('');
            tbody.insertBefore(newRow, tbody.firstChild);
        }
    }

    addMaintenanceRowToTable(maintenanceData) {
        // Determinar clase de badge según el estado
        let badgeClass = 'bg-label-secondary';
        let statusText = maintenanceData.maintenance_status;
        if (maintenanceData.maintenance_status === 'COMPLETADO') {
            badgeClass = 'bg-label-success';
            statusText = 'Completado';
        } else if (maintenanceData.maintenance_status === 'PROGRAMADO') {
            badgeClass = 'bg-label-primary';
            statusText = 'Programado';
        } else if (maintenanceData.maintenance_status === 'VENCIDO') {
            badgeClass = 'bg-label-danger';
            statusText = 'Vencido';
        }

        // Crear el HTML de la fila
        const rowData = [
            maintenanceData.maintenance_type,
            maintenanceData.scheduled_date,
            maintenanceData.technician_name,
            `$${maintenanceData.total_cost}`,
            `<span class="badge ${badgeClass}" data-status="${maintenanceData.maintenance_status}">${statusText}</span>`,
            maintenanceData.work_description || 'Sin notas',
            maintenanceData.maintenance_status !== 'COMPLETADO' ?
                `<div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="mdi mdi-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu">
                        <li>
                            <a class="dropdown-item complete-maintenance-btn" href="#" data-maintenance-id="${maintenanceData.id}">
                                <i class="mdi mdi-check me-2"></i>Completar
                            </a>
                        </li>
                    </ul>
                </div>`
                : '<span class="text-muted">-</span>'
        ];

        // Agregar fila al DataTable si existe, sino al tbody directamente
        if (this.maintenanceDataTable) {
            const row = this.maintenanceDataTable.row.add(rowData).draw(false);
            $(row.node()).attr('data-maintenance-id', maintenanceData.id);
        } else {
            // Fallback si DataTable no está inicializado
            const tbody = document.querySelector('#maintenanceHistoryTable tbody');
            const emptyRow = tbody.querySelector('td[colspan="7"]');
            if (emptyRow) {
                emptyRow.closest('tr').remove();
            }

            const newRow = document.createElement('tr');
            newRow.dataset.maintenanceId = maintenanceData.id;
            newRow.innerHTML = rowData.map(data => `<td>${data}</td>`).join('');
            tbody.insertBefore(newRow, tbody.firstChild);
        }

        // Actualizar alertas y fechas de inspección
        this.updateMaintenanceMetrics();
    }

    // ===== ABRIR MODAL DE COMPLETAR MANTENIMIENTO =====
    openCompleteMaintenanceModal(maintenanceId) {
        // Guardar el ID del mantenimiento que se va a completar
        this.currentMaintenanceId = maintenanceId;

        // Mostrar el modal
        const modal = new bootstrap.Modal(document.getElementById('completeMaintenanceModal'));
        modal.show();
    }

    // ===== CONFIRMAR COMPLETAR MANTENIMIENTO =====
    async confirmCompleteMaintenance() {
        if (!this.currentMaintenanceId) return;

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('completeMaintenanceModal'));
        modal.hide();

        try {
            // Mostrar loading
            Swal.fire({
                title: 'Completando mantenimiento...',
                text: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Hacer llamada AJAX
            const response = await fetch(`/inventory/unidad/mantenimiento/${this.currentMaintenanceId}/completar`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            });

            const result = await response.json();

            if (result.success) {
                // Actualizar la fila en la tabla
                this.updateMaintenanceRowStatus(this.currentMaintenanceId, result.data);

                // Mostrar mensaje de éxito
                Swal.fire({
                    title: 'Mantenimiento completado',
                    text: result.message,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    customClass: {
                        confirmButton: 'btn btn-success'
                    },
                    buttonsStyling: false
                });
            } else {
                throw new Error(result.message || 'Error al completar el mantenimiento');
            }

        } catch (error) {
            console.error('Error completing maintenance:', error);
            Swal.fire({
                title: 'Error',
                text: error.message || 'No se pudo completar el mantenimiento',
                icon: 'error',
                confirmButtonText: 'Entendido',
                customClass: {
                    confirmButton: 'btn btn-danger'
                },
                buttonsStyling: false
            });
        } finally {
            this.currentMaintenanceId = null;
        }
    }

    // ===== ACTUALIZAR ESTADO DE FILA DE MANTENIMIENTO =====
    updateMaintenanceRowStatus(maintenanceId, data) {
        // Si estamos usando DataTable
        if (this.maintenanceDataTable) {
            const row = this.maintenanceDataTable.row(`[data-maintenance-id="${maintenanceId}"]`);
            if (row.length > 0) {
                const rowData = row.data();
                // Actualizar la columna de estado (índice 4)
                rowData[4] = '<span class="badge bg-label-success" data-status="COMPLETADO">Completado</span>';
                // Actualizar la columna de acciones (índice 6)
                rowData[6] = '<span class="text-muted">-</span>';
                row.data(rowData).draw(false);
            }
        } else {
            // Fallback para DOM directo
            const rowElement = document.querySelector(`tr[data-maintenance-id="${maintenanceId}"]`);
            if (!rowElement) return;

            // Actualizar badge de estado
            const statusBadge = rowElement.querySelector('.badge');
            if (statusBadge) {
                statusBadge.className = 'badge bg-label-success';
                statusBadge.textContent = 'Completado';
                statusBadge.dataset.status = 'COMPLETADO';
            }

            // Reemplazar dropdown con guión
            const actionsCell = rowElement.querySelector('td:last-child');
            if (actionsCell) {
                actionsCell.innerHTML = '<span class="text-muted">-</span>';
            }
        }

        // Actualizar alertas y fechas de inspección
        this.updateMaintenanceMetrics();
    }

    // ===== ACTUALIZAR MÉTRICAS DE MANTENIMIENTO =====
    updateMaintenanceMetrics() {
        // Obtener todas las filas de mantenimiento (desde DataTable o DOM)
        let rows;
        if (this.maintenanceDataTable) {
            // Obtener todas las filas del DataTable (incluyendo las no visibles por paginación)
            // Convertir a array porque rows().nodes() no tiene forEach directamente
            rows = Array.from(this.maintenanceDataTable.rows().nodes());
        } else {
            // Fallback a DOM directo
            rows = document.querySelectorAll('#maintenanceHistoryTable tbody tr[data-maintenance-id]');
        }

        let lastInspectionDate = 'Sin registros';
        let nextInspectionDate = 'Sin programar';
        let nextInspectionOverdue = false;
        let hasOverdueMaintenance = false;
        let overdueDays = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let completedMaintenances = [];
        let pendingMaintenances = [];

        // Procesar todas las filas
        rows.forEach(row => {
            const statusBadge = row.querySelector('.badge');
            const status = statusBadge ? statusBadge.dataset.status : null;
            const dateCell = row.querySelector('td:nth-child(2)'); // Segunda columna es la fecha
            const dateText = dateCell ? dateCell.textContent.trim() : null;

            if (dateText && status) {
                // Convertir fecha de formato dd/mm/yyyy a objeto Date
                const dateParts = dateText.split('/');
                if (dateParts.length === 3) {
                    const date = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

                    if (status === 'COMPLETADO') {
                        completedMaintenances.push({ date: date, dateText: dateText });
                    } else if (status === 'PROGRAMADO' || status === 'VENCIDO') {
                        pendingMaintenances.push({ date: date, dateText: dateText, status: status });
                    }
                }
            }
        });

        // Calcular última inspección (último completado)
        if (completedMaintenances.length > 0) {
            completedMaintenances.sort((a, b) => b.date - a.date);
            lastInspectionDate = completedMaintenances[0].dateText;
        }

        // Calcular próxima inspección (siguiente pendiente más cercano)
        if (pendingMaintenances.length > 0) {
            pendingMaintenances.sort((a, b) => a.date - b.date);
            const nextMaintenance = pendingMaintenances[0];
            nextInspectionDate = nextMaintenance.dateText;

            // Verificar si está vencida
            if (nextMaintenance.date < today) {
                nextInspectionOverdue = true;
            }

            // Verificar si hay mantenimientos vencidos
            const overdueList = pendingMaintenances.filter(m => m.status === 'VENCIDO');
            if (overdueList.length > 0) {
                hasOverdueMaintenance = true;
                // Calcular días de atraso del más antiguo
                const oldestOverdue = overdueList[0];
                const diffTime = today - oldestOverdue.date;
                overdueDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }
        }

        // Actualizar la última inspección
        const lastInspectionEl = document.getElementById('lastInspection');
        if (lastInspectionEl && lastInspectionDate) {
            lastInspectionEl.textContent = lastInspectionDate;
        }

        // Actualizar la próxima inspección
        const nextInspectionEl = document.getElementById('nextInspection');
        if (nextInspectionEl && nextInspectionDate) {
            nextInspectionEl.textContent = nextInspectionDate;
            // Cambiar color según si está vencida
            if (nextInspectionOverdue) {
                nextInspectionEl.className = 'fw-medium text-danger';
            } else {
                nextInspectionEl.className = 'fw-medium text-primary';
            }
        }

        // Mostrar/ocultar alerta de mantenimiento vencido
        this.updateOverdueAlert(hasOverdueMaintenance, overdueDays);
    }

    // ===== ACTUALIZAR ALERTA DE MANTENIMIENTO VENCIDO =====
    updateOverdueAlert(hasOverdue, days) {
        // DESHABILITADO: La alerta ya se muestra desde Blade con datos del backend
        // para evitar duplicados
        return;

        /* // Buscar si ya existe la alerta
        let alert = document.querySelector('.alert-danger.maintenance-overdue-alert');

        if (hasOverdue) {
            if (!alert) {
                // Crear la alerta si no existe
                const alertHtml = `
                    <div class="alert alert-danger alert-dismissible fade show maintenance-overdue-alert" role="alert">
                        <i class="mdi mdi-alert-circle me-2"></i>
                        <strong>¡Mantenimiento Vencido!</strong> La inspección está atrasada por <span class="overdue-days">${days}</span> ${days == 1 ? 'día' : 'días'}.
                        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                    </div>
                `;

                // Insertar al inicio del container
                const container = document.querySelector('.container-xxl.flex-grow-1.container-p-y');
                if (container) {
                    container.insertAdjacentHTML('afterbegin', alertHtml);
                }
            } else {
                // Actualizar días si ya existe
                const daysSpan = alert.querySelector('.overdue-days');
                if (daysSpan) {
                    daysSpan.textContent = days;
                }
                // Actualizar texto singular/plural
                const alertText = alert.innerHTML;
                const newText = alertText.replace(/(día|días)/, days == 1 ? 'día' : 'días');
                alert.innerHTML = newText;
            }
        } else {
            // Remover la alerta si ya no hay vencidos
            if (alert) {
                alert.remove();
            }
        } */
    }

    // ===== INICIALIZAR DATATABLES =====
    initializeUsageDataTable() {
        console.log('Intentando inicializar DataTable de uso...');

        // Esperar a que jQuery y DataTables estén disponibles
        if (typeof $ === 'undefined') {
            console.warn('jQuery no está disponible, reintentando en 500ms...');
            setTimeout(() => this.initializeUsageDataTable(), 500);
            return;
        }

        if (typeof $.fn.DataTable === 'undefined') {
            console.warn('DataTables no está disponible, reintentando en 500ms...');
            setTimeout(() => this.initializeUsageDataTable(), 500);
            return;
        }

        console.log('jQuery y DataTables disponibles para tabla de uso');

        // Inicializar DataTable en la tabla de uso
        const usageTable = $('#usageHistoryTable');
        console.log('Tabla de uso encontrada:', usageTable.length);

        if (usageTable.length) {
            // Verificar si ya está inicializado
            if ($.fn.DataTable.isDataTable('#usageHistoryTable')) {
                console.log('DataTable de uso ya inicializado');
                this.usageDataTable = usageTable.DataTable();
                this.setupUsageExportButtons();
                return;
            }

            try {
                // Verificar el contenido del tbody ANTES de hacer cualquier cosa
                const tbody = usageTable.find('tbody');
                const allRows = tbody.find('tr');
                console.log('=== DEBUGGING USAGE TABLE ===');
                console.log('Total de filas <tr> en tbody:', allRows.length);
                console.log('Contenido HTML del tbody:', tbody.html().substring(0, 500));

                // Remover fila de "no records" si existe antes de inicializar DataTable
                const noRecordsRow = usageTable.find('tbody tr.no-records');
                if (noRecordsRow.length) {
                    console.log('Removiendo fila de "no records"');
                    noRecordsRow.remove();
                }

                // Verificar cuántas filas reales hay en la tabla
                const recordRows = usageTable.find('tbody tr.usage-record-row');
                console.log('Filas de registros encontradas en la tabla:', recordRows.length);

                console.log('Inicializando DataTable de uso...');
                this.usageDataTable = usageTable.DataTable({
                    order: [[1, 'desc']], // Ordenar por fecha (columna 1) descendente
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                    },
                    pageLength: 10,
                    lengthMenu: [5, 10, 25, 50, 100],
                    columnDefs: [],
                    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
                    responsive: true,
                    deferRender: true, // No renderizar todas las filas inmediatamente
                    retrieve: true // Permite recuperar una instancia existente sin error
                    // NO usar destroy - queremos mantener los datos del servidor
                });

                console.log('DataTable de uso inicializado exitosamente con', this.usageDataTable.rows().count(), 'filas');

                // Conectar botones de exportación personalizados
                this.setupUsageExportButtons();
            } catch (error) {
                console.error('Error al inicializar DataTable de uso:', error);
            }
        } else {
            console.warn('Tabla usageHistoryTable no encontrada en el DOM');
        }
    }

    initializeDataTables() {
        console.log('Intentando inicializar DataTables...');

        // Esperar a que jQuery y DataTables estén disponibles
        if (typeof $ === 'undefined') {
            console.warn('jQuery no está disponible, reintentando en 500ms...');
            setTimeout(() => this.initializeDataTables(), 500);
            return;
        }

        if (typeof $.fn.DataTable === 'undefined') {
            console.warn('DataTables no está disponible, reintentando en 500ms...');
            setTimeout(() => this.initializeDataTables(), 500);
            return;
        }

        console.log('jQuery y DataTables disponibles');

        // Inicializar DataTable en la tabla de mantenimiento
        const maintenanceTable = $('#maintenanceHistoryTable');
        console.log('Tabla encontrada:', maintenanceTable.length);

        if (maintenanceTable.length) {
            // Verificar si ya está inicializado
            if ($.fn.DataTable.isDataTable('#maintenanceHistoryTable')) {
                console.log('DataTable ya inicializado');
                this.maintenanceDataTable = maintenanceTable.DataTable();
                this.setupMaintenanceExportButtons();
                return;
            }

            try {
                console.log('Inicializando DataTable...');
                this.maintenanceDataTable = maintenanceTable.DataTable({
                    order: [[1, 'desc']], // Ordenar por fecha (columna 1) descendente
                    language: {
                        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
                    },
                    pageLength: 10,
                    lengthMenu: [5, 10, 25, 50, 100],
                    columnDefs: [
                        {
                            // Columna de Acciones (última columna) - no ordenable ni exportable
                            targets: -1,
                            orderable: false,
                            searchable: false
                        }
                    ],
                    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
                    responsive: true,
                    retrieve: true, // Permite recuperar una instancia existente sin error
                    destroy: false // No destruir datos existentes
                });

                console.log('DataTable inicializado exitosamente');

                // Conectar botones de exportación personalizados
                this.setupMaintenanceExportButtons();
            } catch (error) {
                console.error('Error al inicializar DataTable:', error);
            }
        } else {
            console.warn('Tabla maintenanceHistoryTable no encontrada en el DOM');
        }
    }

    // ===== CONFIGURAR BOTONES DE EXPORTACIÓN DE USO =====
    setupUsageExportButtons() {
        console.log('Configurando botones de exportación de uso...');
        const exportButtons = document.querySelectorAll('#usageExportButtons a');
        console.log('Botones de uso encontrados:', exportButtons.length);

        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const exportType = button.dataset.export;

                console.log('Exportando uso como:', exportType);

                if (!this.usageDataTable) {
                    console.error('DataTable de uso no está inicializado');
                    return;
                }

                // Configurar opciones de exportación
                const exportOptions = {
                    columns: [0, 1, 2, 3, 4, 5], // Todas las columnas
                    format: {
                        body: function (data, row, column, node) {
                            // Extraer solo el texto de los badges y otros elementos HTML
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = data;
                            return tempDiv.textContent || tempDiv.innerText || '';
                        }
                    }
                };

                // Exportar según el tipo
                switch (exportType) {
                    case 'excel':
                        $.fn.dataTable.ext.buttons.excelHtml5.action.call(
                            this.usageDataTable.button(),
                            null,
                            this.usageDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: `Historial_Uso_${new Date().getTime()}`,
                                filename: `Historial_Uso_${new Date().getTime()}`
                            }
                        );
                        break;

                    case 'pdf':
                        $.fn.dataTable.ext.buttons.pdfHtml5.action.call(
                            this.usageDataTable.button(),
                            null,
                            this.usageDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: 'Historial de Uso del Equipo',
                                filename: `Historial_Uso_${new Date().getTime()}`,
                                orientation: 'landscape',
                                pageSize: 'LEGAL'
                            }
                        );
                        break;

                    case 'print':
                        $.fn.dataTable.ext.buttons.print.action.call(
                            this.usageDataTable.button(),
                            null,
                            this.usageDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: '<h2>Historial de Uso del Equipo</h2>',
                                customize: function (win) {
                                    $(win.document.body).css('font-size', '10pt');
                                    $(win.document.body).find('table').addClass('compact').css('font-size', 'inherit');
                                }
                            }
                        );
                        break;
                }
            });
        });
    }

    // ===== CONFIGURAR BOTONES DE EXPORTACIÓN =====
    setupMaintenanceExportButtons() {
        console.log('Configurando botones de exportación...');
        const exportButtons = document.querySelectorAll('#maintenanceExportButtons a');
        console.log('Botones encontrados:', exportButtons.length);

        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const exportType = button.dataset.export;

                console.log('Exportando como:', exportType);

                if (!this.maintenanceDataTable) {
                    console.error('DataTable no está inicializado');
                    return;
                }

                // Configurar opciones de exportación
                const exportOptions = {
                    columns: [0, 1, 2, 3, 4, 5], // Excluir columna de Acciones (índice 6)
                    format: {
                        body: function (data, row, column, node) {
                            // Extraer solo el texto de los badges y otros elementos HTML
                            const tempDiv = document.createElement('div');
                            tempDiv.innerHTML = data;
                            return tempDiv.textContent || tempDiv.innerText || '';
                        }
                    }
                };

                // Exportar según el tipo
                switch (exportType) {
                    case 'excel':
                        $.fn.dataTable.ext.buttons.excelHtml5.action.call(
                            this.maintenanceDataTable.button(),
                            null,
                            this.maintenanceDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: `Historial_Mantenimiento_${new Date().getTime()}`,
                                filename: `Historial_Mantenimiento_${new Date().getTime()}`
                            }
                        );
                        break;

                    case 'pdf':
                        $.fn.dataTable.ext.buttons.pdfHtml5.action.call(
                            this.maintenanceDataTable.button(),
                            null,
                            this.maintenanceDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: 'Historial de Mantenimiento',
                                filename: `Historial_Mantenimiento_${new Date().getTime()}`,
                                orientation: 'landscape',
                                pageSize: 'LEGAL'
                            }
                        );
                        break;

                    case 'print':
                        $.fn.dataTable.ext.buttons.print.action.call(
                            this.maintenanceDataTable.button(),
                            null,
                            this.maintenanceDataTable,
                            null,
                            {
                                exportOptions: exportOptions,
                                title: '<h2>Historial de Mantenimiento</h2>',
                                customize: function (win) {
                                    $(win.document.body).css('font-size', '10pt');
                                    $(win.document.body).find('table').addClass('compact').css('font-size', 'inherit');
                                }
                            }
                        );
                        break;
                }
            });
        });
    }

    // ===== MOSTRAR TOAST =====
    showToast(type, message) {
        const bgClass = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-danger' : 'bg-info';
        const icon = type === 'success' ? 'mdi-check-circle' : type === 'error' ? 'mdi-alert-circle' : 'mdi-information';
        
        const toastHtml = `
            <div class="bs-toast toast fade show ${bgClass}" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header ${bgClass} text-white">
                    <i class="mdi ${icon} me-2"></i>
                    <div class="me-auto fw-semibold">${type === 'success' ? 'Éxito' : type === 'error' ? 'Error' : 'Información'}</div>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body text-white">
                    ${message}
                </div>
            </div>
        `;

        // Crear contenedor si no existe
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            toastContainer.style.zIndex = '9999';
            document.body.appendChild(toastContainer);
        }

        // Agregar toast
        toastContainer.insertAdjacentHTML('beforeend', toastHtml);

        // Obtener el toast recién creado
        const toastElement = toastContainer.lastElementChild;
        const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
        toast.show();

        // Eliminar del DOM después de ocultarse
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    // ===== MANEJAR SUBIDA DE DOCUMENTOS =====
    handleUploadDocument() {
        if (!currentItemData) return;

        Swal.fire({
            title: 'Subir Documento',
            html: `
                <div class="text-start">
                    <div class="mb-3">
                        <label class="form-label">Tipo de Documento</label>
                        <select class="form-select" id="swal-document-type">
                            <option value="">Seleccionar tipo</option>
                            <option value="Manual">Manual de Usuario</option>
                            <option value="Factura">Factura de Compra</option>
                            <option value="Garantía">Garantía</option>
                            <option value="Certificado">Certificado</option>
                            <option value="Ficha Técnica">Ficha Técnica</option>
                            <option value="Foto">Fotografía</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nombre del Documento</label>
                        <input type="text" class="form-control" id="swal-document-name" placeholder="Ej: Manual JBL EON615">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Archivo</label>
                        <input type="file" class="form-control" id="swal-document-file" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls">
                        <small class="text-muted">Formatos permitidos: PDF, Word, Excel, Imágenes (Max 10MB)</small>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Notas (Opcional)</label>
                        <textarea class="form-control" id="swal-document-notes" rows="2" placeholder="Descripción o comentarios adicionales"></textarea>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Subir',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-primary me-2',
                cancelButton: 'btn btn-outline-secondary'
            },
            buttonsStyling: false,
            preConfirm: () => {
                const type = document.getElementById('swal-document-type').value;
                const name = document.getElementById('swal-document-name').value.trim();
                const fileInput = document.getElementById('swal-document-file');
                const file = fileInput.files[0];
                const notes = document.getElementById('swal-document-notes').value.trim();

                // Validaciones
                if (!type) {
                    Swal.showValidationMessage('Por favor selecciona el tipo de documento');
                    return false;
                }

                if (!name) {
                    Swal.showValidationMessage('Por favor ingresa un nombre para el documento');
                    return false;
                }

                if (!file) {
                    Swal.showValidationMessage('Por favor selecciona un archivo');
                    return false;
                }

                // Validar tamaño del archivo (10MB máximo)
                const maxSize = 10 * 1024 * 1024; // 10MB en bytes
                if (file.size > maxSize) {
                    Swal.showValidationMessage('El archivo no debe superar los 10MB');
                    return false;
                }

                return { type, name, file, notes };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                this.uploadDocument(result.value);
            }
        });
    }

    // ===== SUBIR DOCUMENTO =====
    async uploadDocument(data) {
        if (!currentItemData || !currentItemData.inventoryItemId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo identificar el item'
            });
            return;
        }

        try {
            // Mostrar loading
            Swal.fire({
                title: 'Subiendo documento...',
                html: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Crear FormData para enviar el archivo
            const formData = new FormData();
            formData.append('document', data.file);
            formData.append('document_type', data.type);
            formData.append('name', data.name);
            if (data.notes) {
                formData.append('notes', data.notes);
            }

            // Enviar petición POST
            const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/documento`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json'
                },
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    title: '¡Documento subido!',
                    html: `
                        <div class="text-start">
                            <p class="mb-2"><strong>Nombre:</strong> ${result.data.name}</p>
                            <p class="mb-2"><strong>Tipo:</strong> ${result.data.document_type}</p>
                            <p class="mb-2"><strong>Tamaño:</strong> ${this.formatFileSize(result.data.file_size)}</p>
                            <p class="text-muted small">El documento ha sido adjuntado exitosamente al item.</p>
                        </div>
                    `,
                    icon: 'success',
                    confirmButtonText: 'Entendido',
                    customClass: {
                    confirmButton: 'btn btn-primary'
                },
                buttonsStyling: false
            }).then(() => {
                // Recargar la página para mostrar el nuevo documento
                window.location.reload();
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: result.message || 'Error al subir el documento'
            });
        }

        } catch (error) {
            console.error('Error al subir documento:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión al subir el documento'
            });
        }
    }

    // ===== MANEJAR ELIMINAR DOCUMENTO =====
    handleDeleteDocument(documentId, documentName) {
        Swal.fire({
            title: '¿Eliminar documento?',
            html: `
                <p class="text-muted mb-3">¿Estás seguro de que deseas eliminar este documento?</p>
                <div class="alert alert-warning text-start">
                    <strong>${documentName}</strong>
                </div>
                <p class="text-muted small">Esta acción no se puede deshacer.</p>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            customClass: {
                confirmButton: 'btn btn-danger me-2',
                cancelButton: 'btn btn-outline-secondary'
            },
            buttonsStyling: false
        }).then((result) => {
            if (result.isConfirmed) {
                this.deleteDocument(documentId);
            }
        });
    }

    // ===== ELIMINAR DOCUMENTO =====
    async deleteDocument(documentId) {
        if (!currentItemData || !currentItemData.inventoryItemId) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo identificar el item'
            });
            return;
        }

        try {
            // Mostrar loading
            Swal.fire({
                title: 'Eliminando documento...',
                html: 'Por favor espera',
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Enviar petición DELETE
            const response = await fetch(`/inventory/unidad/${currentItemData.inventoryItemId}/documento/${documentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Eliminado!',
                    text: 'El documento ha sido eliminado correctamente',
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    // Recargar la página para actualizar la lista
                    window.location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: result.message || 'Error al eliminar el documento'
                });
            }

        } catch (error) {
            console.error('Error al eliminar documento:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error de conexión al eliminar el documento'
            });
        }
    }

    // ===== FORMATEAR TAMAÑO DE ARCHIVO =====
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // ===== ACTUALIZAR VISTA DE DOCUMENTOS =====
    updateDocumentsView() {
        // Por ahora solo mostramos un mensaje
        // En producción, aquí cargarías y mostrarías la lista de documentos
        this.showToast('info', 'Vista de documentos actualizada');
    }

    // ===== ACTUALIZAR ESTADÍSTICAS DE USO =====
    updateUsageStatistics(usageData = null) {
        // Actualizar Total de Eventos (incrementar en 1)
        const totalEventsEl = document.getElementById('totalEvents');
        if (totalEventsEl && usageData) {
            const currentTotal = parseInt(totalEventsEl.textContent) || 0;
            totalEventsEl.textContent = currentTotal + 1;
        }

        // Actualizar Horas de Uso (sumar las horas del nuevo registro)
        const totalHoursEl = document.getElementById('totalHours');
        if (totalHoursEl && usageData && usageData.hours_used) {
            const currentHours = parseFloat(totalHoursEl.textContent.replace(' hrs', '')) || 0;
            const newTotal = currentHours + parseFloat(usageData.hours_used);
            totalHoursEl.textContent = newTotal.toFixed(1) + ' hrs';
        }

        // Actualizar tabla de próximos eventos si el status no es DEVUELTO
        if (usageData && usageData.assignment_status !== 'DEVUELTO') {
            this.addUpcomingEvent(usageData);
        }
    }

    // ===== ACTUALIZAR CONTEO DE MANTENIMIENTOS =====
    updateMaintenanceStatistics() {
        const totalMaintenancesEl = document.getElementById('totalMaintenances');
        if (totalMaintenancesEl) {
            const currentTotal = parseInt(totalMaintenancesEl.textContent) || 0;
            totalMaintenancesEl.textContent = currentTotal + 1;
        }
    }

    // ===== AGREGAR EVENTO A PRÓXIMOS EVENTOS =====
    addUpcomingEvent(usageData) {
        const upcomingEventsTable = document.getElementById('upcomingEventsTable');
        if (!upcomingEventsTable) return;

        // Eliminar mensaje de "no hay eventos" si existe
        const noDataRow = upcomingEventsTable.querySelector('td[colspan="4"]');
        if (noDataRow) {
            noDataRow.parentElement.remove();
        }

        // Mapeo de estados
        const statusMap = {
            'ASIGNADO': { text: 'Asignado', class: 'bg-info' },
            'EN_USO': { text: 'En Uso', class: 'bg-warning' },
            'CANCELADO': { text: 'Cancelado', class: 'bg-secondary' }
        };
        const status = statusMap[usageData.assignment_status] || { text: usageData.assignment_status, class: 'bg-secondary' };

        // Formatear fecha
        const eventDate = new Date(usageData.event_date);
        const formattedDate = eventDate.toLocaleDateString('es-MX', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        // Crear nueva fila
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${usageData.event_name}</td>
            <td>${formattedDate}</td>
            <td>${usageData.venue_address || 'Sin ubicación'}</td>
            <td><span class="badge ${status.class}">${status.text}</span></td>
        `;

        // Insertar al principio de la tabla
        upcomingEventsTable.insertBefore(newRow, upcomingEventsTable.firstChild);
    }
}

// ===== FUNCIONES AUXILIARES GLOBALES =====

// Función para imprimir
function printItemDetails() {
    window.print();
}

// Función para exportar datos
function exportData(type) {
    console.log(`Exporting ${type} data...`);
    
    let dataToExport = [];
    let filename = '';
    
    switch (type) {
        case 'usage':
            dataToExport = usageHistoryData;
            filename = `historial-uso-${currentItemData.id}.csv`;
            break;
        case 'maintenance':
            dataToExport = maintenanceHistoryData;
            filename = `historial-mantenimiento-${currentItemData.id}.csv`;
            break;
        default:
            console.error('Unknown export type');
            return;
    }
    
    if (dataToExport.length === 0) {
        Swal.fire({
            title: 'Sin datos',
            text: 'No hay datos para exportar',
            icon: 'info',
            confirmButtonText: 'Entendido',
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        });
        return;
    }
    
    // Convertir a CSV
    const csv = convertToCSV(dataToExport);
    
    // Crear y descargar archivo
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Convertir array a CSV
function convertToCSV(data) {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
        return headers.map(header => {
            const value = row[header];
            // Escapar comillas y envolver en comillas si contiene comas
            const escaped = String(value).replace(/"/g, '""');
            return `"${escaped}"`;
        }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - Initializing Item Detail Manager...');
    
    // Crear instancia del gestor
    const itemDetailManager = new ItemDetailManager();
    
    // Hacer disponible globalmente para debugging
    window.itemDetailManager = itemDetailManager;
    
    console.log('Item Detail Manager initialized successfully');
});

// ===== MANEJO DE ERRORES GLOBAL =====
window.addEventListener('error', function(e) {
    console.error('Global error:', e.error);
});

// ===== MANEJO DE PROMESAS RECHAZADAS =====
window.addEventListener('unhandledrejection', function(e) {
    console.error('Unhandled promise rejection:', e.reason);
});