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
            item_id: itemParent.item_id,
            sku: item.sku || 'N/A',
            name: itemParent.public_name || itemParent.name,
            category: itemParent.category?.name || 'Sin categoría',
            subcategory: itemParent.sub_family || itemParent.family || '',
            brand: itemParent.brand?.name || 'Sin marca',
            model: itemParent.model || 'Sin modelo',
            purchaseDate: item.purchase_date || 'N/A',
            purchasePrice: item.purchase_price || 0,
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
        maintenanceHistoryData = [];
        upcomingEventsData = [];

        // NO llamar updateUI() porque los datos ya están en el HTML desde Blade
        // Solo actualizar las tablas dinámicas que no están pobladas desde Blade
        this.updateUpcomingEventsTable();
        this.updateUsageHistoryTable();
        this.updateMaintenanceHistoryTable();
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

        // Actualizar la UI con los datos
        this.updateUI();
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
        const alertHtml = `
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="mdi mdi-alert-circle me-2"></i>
                <strong>¡Mantenimiento Vencido!</strong> La inspección está atrasada por ${daysOverdue} días.
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;
        
        const container = document.querySelector('.container-xxl.flex-grow-1');
        if (container) {
            container.insertAdjacentHTML('afterbegin', alertHtml);
        }
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

        // Cambio de tabs
        const tabs = document.querySelectorAll('#detailTabs .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                currentTab = e.target.getAttribute('href').replace('#', '');
                this.handleTabChange(currentTab);
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
                break;
            case 'maintenance':
                this.loadMaintenanceHistory();
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

        // Redirigir a la página de edición usando rutas de Laravel
        window.location.href = `/inventory/formulario/${currentItemData.id}`;
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
    handleEditNotes() {
        if (!currentItemData) return;

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
            preConfirm: () => {
                const notes = document.getElementById('swal-notes-textarea').value.trim();
                return { notes };
            }
        }).then((result) => {
            if (result.isConfirmed) {
                // Actualizar notas
                currentItemData.notes = result.value.notes;
                
                // Actualizar UI
                if (currentItemData.notes) {
                    document.getElementById('itemNotes').style.display = 'flex';
                    document.querySelector('#itemNotes p').textContent = currentItemData.notes;
                } else {
                    document.getElementById('itemNotes').style.display = 'none';
                }
                
                // En producción, aquí harías un AJAX para guardar
                console.log('Saving notes:', result.value.notes);
                
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
    scheduleMaintenance(data) {
        // En producción, esto sería una llamada AJAX
        console.log('Scheduling maintenance:', data);

        // Simular guardado exitoso
        this.showToast('success', 'Mantenimiento programado exitosamente');
        
        // Actualizar próxima inspección
        currentItemData.nextInspection = this.formatDate(new Date(data.date));
        document.getElementById('nextInspection').textContent = currentItemData.nextInspection;
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
    decommissionItem(data) {
        // En producción, esto sería una llamada AJAX
        console.log('Decommissioning item:', data);

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
            // Redirigir al catálogo usando ruta de Laravel
            window.location.href = '/inventory/disponibilidad';
        });
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
    saveUsage() {
        const form = document.getElementById('usageForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const usageData = {
            id: usageHistoryData.length + 1,
            eventName: document.getElementById('eventName').value,
            date: this.formatDate(new Date(document.getElementById('eventDate').value)),
            location: document.getElementById('eventLocation').value,
            hours: parseInt(document.getElementById('usageHours').value),
            status: 'Programado',
            notes: document.getElementById('usageNotes').value || 'Sin notas'
        };

        // En producción, esto sería una llamada AJAX
        console.log('Saving usage:', usageData);

        // Agregar a los datos
        usageHistoryData.unshift(usageData);
        
        // Actualizar tabla
        this.updateUsageHistoryTable();
        
        // Actualizar estadísticas
        currentItemData.usageCount++;
        currentItemData.totalHours += usageData.hours;
        document.getElementById('totalEvents').textContent = currentItemData.usageCount;
        document.getElementById('totalHours').textContent = `${currentItemData.totalHours} hrs`;

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerUsageModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        this.showToast('success', 'Uso registrado exitosamente');
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
    saveMaintenance() {
        const form = document.getElementById('maintenanceForm');
        
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }

        const maintenanceData = {
            id: maintenanceHistoryData.length + 1,
            type: document.getElementById('maintenanceType').value,
            date: this.formatDate(new Date(document.getElementById('maintenanceDate').value)),
            technician: document.getElementById('technician').value,
            cost: parseFloat(document.getElementById('maintenanceCost').value) || 0,
            status: 'Completado',
            notes: document.getElementById('maintenanceNotes').value || 'Sin notas'
        };

        // En producción, esto sería una llamada AJAX
        console.log('Saving maintenance:', maintenanceData);

        // Agregar a los datos
        maintenanceHistoryData.unshift(maintenanceData);
        
        // Actualizar tabla
        this.updateMaintenanceHistoryTable();
        
        // Actualizar estadísticas
        document.getElementById('totalMaintenances').textContent = maintenanceHistoryData.length;
        
        // Actualizar última inspección
        currentItemData.lastInspection = maintenanceData.date;
        document.getElementById('lastInspection').textContent = maintenanceData.date;

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('registerMaintenanceModal'));
        modal.hide();

        // Mostrar mensaje de éxito
        this.showToast('success', 'Mantenimiento registrado exitosamente');
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
    uploadDocument(data) {
        // Mostrar loading
        Swal.fire({
            title: 'Subiendo documento...',
            html: 'Por favor espera',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // En producción, aquí harías una llamada AJAX con FormData
        // Simulamos la subida con un timeout
        setTimeout(() => {
            // Simular respuesta exitosa
            const documentData = {
                id: Date.now(),
                type: data.type,
                name: data.name,
                fileName: data.file.name,
                fileSize: this.formatFileSize(data.file.size),
                uploadDate: this.formatDate(new Date()),
                notes: data.notes,
                url: URL.createObjectURL(data.file) // Crear URL temporal para preview
            };

            console.log('Document uploaded:', documentData);

            // En producción, aquí guardarías en la BD y actualizarías la UI
            // Por ahora solo mostramos mensaje de éxito
            Swal.fire({
                title: 'Documento subido',
                html: `
                    <div class="text-start">
                        <p class="mb-2"><strong>Nombre:</strong> ${documentData.name}</p>
                        <p class="mb-2"><strong>Tipo:</strong> ${documentData.type}</p>
                        <p class="mb-2"><strong>Archivo:</strong> ${documentData.fileName}</p>
                        <p class="mb-2"><strong>Tamaño:</strong> ${documentData.fileSize}</p>
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
                // Actualizar la vista de documentos
                this.updateDocumentsView();
            });

        }, 1500); // Simular delay de subida
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