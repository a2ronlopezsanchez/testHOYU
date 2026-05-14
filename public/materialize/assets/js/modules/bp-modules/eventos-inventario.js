/**
 * EVENTOS INVENTARIO - JAVASCRIPT
 * Sistema de gestión de eventos para producción
 * Autor: Grupo Tangamanga
 */

// ===== CONFIGURACIÓN GLOBAL =====
const CONFIG = {
    itemsPerPage: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'audio/mpeg'
    ],
    eventTypes: [
        'EMPRESARIAL', 'SOCIAL', 'DEPORTIVO', 'ESCOLAR', 
        'PARTICULAR', 'CONCIERTO', 'AUTOMOVILISTICO', 'OTRO'
    ],
    eventStatuses: [
        'COTIZADO', 'CONFIRMADO', 'POSTPONED', 'REAGENDADO', 'CANCELADO',
        'PICKING', 'LOADING', 'TRASLADO_VENUE', 'EN_MONTAJE', 'EN_PROGRESO',
        'COMPLETADO', 'DESMONTAJE', 'TRASLADO_ALMACEN', 'UNLOADING', 'FINALIZADO'
    ],
    contactTypes: [
        'PRINCIPAL', 'FACTURACION', 'VENUE', 'EN_SITIO', 'TECNICO', 'OTRO'
    ]
};

// ===== VARIABLES GLOBALES =====
let eventsData = [];
let filteredEventsData = [];
let clientsData = [];
let currentPage = 1;
let searchTerm = '';
let activeFilters = {
    statuses: [],
    type: '',
    dateRange: null,
    quickStatus: 'all'
};
let currentView = 'table';
let currentEventId = null;
let contactCounter = 0;
let uploadedFiles = [];
let flatpickrInstances = {};

function formatDateForApi(dateValue) {
    if (!dateValue) return null;
    const d = new Date(dateValue);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function parseLocalDate(dateValue) {
    if (!dateValue) return null;
    if (dateValue instanceof Date) return dateValue;
    if (typeof dateValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
        const [y, m, d] = dateValue.split('-').map(Number);
        return new Date(y, m - 1, d);
    }
    const parsed = new Date(dateValue);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getCsrfToken() {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
}

// ===== CLASE PRINCIPAL =====
class EventsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeFlatpickr();
        this.loadClientsFromApi();
        this.loadEventsFromApi();
        this.updateStatistics();
        this.updatePagination();
    }

    // ===== GENERACIÓN DE DATOS DE MUESTRA =====
    generateSampleClients() {
        clientsData = [
            {
                id: 'CLI001',
                type: 'EMPRESA',
                name: 'Corporativo Estrella SA de CV',
                email: 'contacto@estrella.com',
                phone: '+52 442 123 4567'
            },
            {
                id: 'CLI002',
                type: 'EMPRESA',
                name: 'Grupo Industrial Querétaro',
                email: 'eventos@giqro.com',
                phone: '+52 442 234 5678'
            },
            {
                id: 'CLI003',
                type: 'PERSONA',
                name: 'María González Hernández',
                email: 'maria.gonzalez@email.com',
                phone: '+52 442 345 6789'
            },
            {
                id: 'CLI004',
                type: 'EMPRESA',
                name: 'Universidad Tecnológica',
                email: 'coordinacion@utqro.edu.mx',
                phone: '+52 442 456 7890'
            },
            {
                id: 'CLI005',
                type: 'PERSONA',
                name: 'Carlos Ramírez López',
                email: 'carlos.ramirez@email.com',
                phone: '+52 442 567 8901'
            },
            {
                id: 'CLI006',
                type: 'EMPRESA',
                name: 'Arena Deportiva Querétaro',
                email: 'eventos@arenaqdro.mx',
                phone: '+52 442 678 9012'
            },
            {
                id: 'CLI007',
                type: 'EMPRESA',
                name: 'Hotel & Spa Hacienda',
                email: 'eventos@hacienda.com',
                phone: '+52 442 789 0123'
            },
            {
                id: 'CLI008',
                type: 'PERSONA',
                name: 'Ana Patricia Sánchez',
                email: 'ana.sanchez@email.com',
                phone: '+52 442 890 1234'
            }
        ];
    }

    generateSampleEvents() {
        const today = new Date();
        
        eventsData = [
            {
                id: this.generateFolio(), // Ahora será un folio de 6 dígitos
                folio: '000001', // Folio único irrepetible
                cotizacion: this.generateCotizacionNumber(new Date(2025, 3, 1)), // COT-20250401-001
                name: 'Conferencia Anual de Tecnología 2025',
                clientId: 'CLI001',
                type: 'EMPRESARIAL',
                location: 'Centro de Convenciones, Av. 5 de Febrero #101',
                dateConfig: 'single',
                startDate: new Date(2025, 4, 20), // Mayo 20
                endDate: new Date(2025, 4, 20),
                status: 'CONFIRMADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Roberto Méndez',
                        email: 'roberto@estrella.com',
                        phone: '+52 442 111 2222',
                        notes: 'Coordinador general del evento'
                    }
                ],
                schedule: {
                    eventStart: '09:00',
                    eventEnd: '18:00',
                    setupStart: '06:00',
                    setupEnd: '08:30'
                },
                notes: {
                    access: 'Acceso por puerta trasera. Requiere gafete de seguridad.',
                    setup: 'Montaje de 3 pantallas LED y sistema de audio completo.',
                    technical: 'Requiere conexión de fibra óptica y respaldo eléctrico.',
                    additional: 'Evento de alto perfil con 500 asistentes esperados.'
                },
                generalNotes: 'Cliente frecuente, excelente pagador.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 3, 1),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000002',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 3, 5)),
                name: 'Boda González - Ramírez',
                clientId: 'CLI003',
                type: 'SOCIAL',
                location: 'Jardín Hacienda San Pedro, Carretera a San Miguel km 12',
                dateConfig: 'single',
                startDate: new Date(2025, 4, 25),
                endDate: new Date(2025, 4, 25),
                status: 'CONFIRMADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'María González',
                        email: 'maria.gonzalez@email.com',
                        phone: '+52 442 345 6789',
                        notes: 'Novia - contacto principal'
                    },
                    {
                        type: 'VENUE',
                        name: 'Pedro Sánchez',
                        email: 'eventos@hacienda.com',
                        phone: '+52 442 111 3333',
                        notes: 'Coordinador del venue'
                    }
                ],
                schedule: {
                    eventStart: '17:00',
                    eventEnd: '02:00',
                    setupStart: '12:00',
                    setupEnd: '16:30'
                },
                notes: {
                    access: 'Acceso libre por entrada principal desde las 12:00',
                    setup: 'Instalación de iluminación ambiental y pista de baile.',
                    technical: 'DJ en vivo, requiere mesa de mezclas profesional.',
                    additional: '200 invitados confirmados.'
                },
                generalNotes: 'Primera vez trabajando con esta cliente. Muy detallista.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 3, 5),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000003',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 3, 10)),
                name: 'Torneo Regional de Fútbol',
                clientId: 'CLI006',
                type: 'DEPORTIVO',
                location: 'Arena Deportiva Querétaro, Blvd. Bernardo Quintana',
                dateConfig: 'consecutive',
                startDate: new Date(2025, 5, 1),
                endDate: new Date(2025, 5, 3),
                status: 'CONFIRMADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Luis Torres',
                        email: 'luis@arenaqdro.mx',
                        phone: '+52 442 678 9012',
                        notes: 'Director de eventos deportivos'
                    },
                    {
                        type: 'EN_SITIO',
                        name: 'Jorge Martínez',
                        email: 'jorge@arenaqdro.mx',
                        phone: '+52 442 678 9013',
                        notes: 'Coordinador en campo'
                    }
                ],
                schedule: {
                    eventStart: '08:00',
                    eventEnd: '20:00',
                    setupStart: '06:00',
                    setupEnd: '07:30'
                },
                notes: {
                    access: 'Acceso de vehículos por puerta de servicio este.',
                    setup: 'Sistema de sonido perimetral y pantallas gigantes en 4 puntos.',
                    technical: 'Transmisión en vivo. Requiere encoders y streaming.',
                    additional: 'Evento de 3 días consecutivos. Mismo setup diario.'
                },
                generalNotes: 'Cliente corporativo con contrato anual.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 3, 10),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000004',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 4, 1)),
                name: 'Graduación Preparatoria 2025',
                clientId: 'CLI004',
                type: 'ESCOLAR',
                location: 'Universidad Tecnológica, Auditorio Principal',
                dateConfig: 'single',
                startDate: new Date(2025, 6, 15),
                endDate: new Date(2025, 6, 15),
                status: 'COTIZADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Dra. Patricia Ruiz',
                        email: 'patricia.ruiz@utqro.edu.mx',
                        phone: '+52 442 456 7890',
                        notes: 'Coordinadora académica'
                    }
                ],
                schedule: {
                    eventStart: '10:00',
                    eventEnd: '14:00',
                    setupStart: '07:00',
                    setupEnd: '09:30'
                },
                notes: {
                    access: 'Acceso controlado. Requiere identificación institucional.',
                    setup: 'Escenario con backdrop, iluminación ceremonial.',
                    technical: 'Proyección de videos institucionales y música de fondo.',
                    additional: '300 graduados esperados más familias.'
                },
                generalNotes: 'Cotización enviada. Esperando confirmación.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 4, 1),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000005',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 4, 10)),
                name: 'Concierto Rock en Vivo',
                clientId: 'CLI002',
                type: 'CONCIERTO',
                location: 'Explanada del Cerro de las Campanas',
                dateConfig: 'single',
                startDate: new Date(2025, 5, 20),
                endDate: new Date(2025, 5, 20),
                status: 'EN_PROGRESO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Fernando Vega',
                        email: 'fernando@giqro.com',
                        phone: '+52 442 234 5678',
                        notes: 'Productor del evento'
                    },
                    {
                        type: 'TECNICO',
                        name: 'Raúl Hernández',
                        email: 'raul@giqro.com',
                        phone: '+52 442 234 5679',
                        notes: 'Director técnico de audio'
                    }
                ],
                schedule: {
                    eventStart: '19:00',
                    eventEnd: '23:00',
                    setupStart: '10:00',
                    setupEnd: '18:00'
                },
                notes: {
                    access: 'Montaje requiere grúa y personal especializado.',
                    setup: 'Escenario principal 20x15m, torres de line array.',
                    technical: 'Sistema de audio profesional para 5000 personas.',
                    additional: 'Requiere generadores de respaldo y UPS.'
                },
                generalNotes: 'Evento en progreso. Montaje iniciado a las 10:00.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 4, 10),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000006',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 4, 15)),
                name: 'Festival Gastronómico',
                clientId: 'CLI007',
                type: 'EMPRESARIAL',
                location: 'Jardines del Hotel Hacienda',
                dateConfig: 'consecutive',
                startDate: new Date(2025, 6, 5),
                endDate: new Date(2025, 6, 7),
                status: 'CONFIRMADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Chef Rodrigo Mancera',
                        email: 'rmancera@hacienda.com',
                        phone: '+52 442 789 0123',
                        notes: 'Coordinador culinario'
                    }
                ],
                schedule: {
                    eventStart: '12:00',
                    eventEnd: '22:00',
                    setupStart: '08:00',
                    setupEnd: '11:30'
                },
                notes: {
                    access: 'Setup permitido solo por área de servicio.',
                    setup: 'Carpas, iluminación decorativa y sonido ambiental.',
                    technical: 'Sistema de audio multi-zona.',
                    additional: 'Evento familiar. Ambiente relajado.'
                },
                generalNotes: 'Cliente premium. Evento anual.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 4, 15),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000007',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 4, 18)),
                name: 'Cumpleaños 50 Años',
                clientId: 'CLI005',
                type: 'PARTICULAR',
                location: 'Salón de Eventos La Casona, Centro Histórico',
                dateConfig: 'single',
                startDate: new Date(2025, 5, 28),
                endDate: new Date(2025, 5, 28),
                status: 'CONFIRMADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Carlos Ramírez',
                        email: 'carlos.ramirez@email.com',
                        phone: '+52 442 567 8901',
                        notes: 'Festejado'
                    }
                ],
                schedule: {
                    eventStart: '20:00',
                    eventEnd: '02:00',
                    setupStart: '16:00',
                    setupEnd: '19:30'
                },
                notes: {
                    access: 'Calle cerrada los fines de semana. Coordinar con municipio.',
                    setup: 'Iluminación LED, pista y DJ.',
                    technical: 'Sistema de karaoke incluido.',
                    additional: '100 invitados. Ambiente festivo.'
                },
                generalNotes: 'Cliente nuevo. Referido por CLI003.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 4, 18),
                createdBy: 'Nach Díaz'
            },
            {
                id: this.generateFolio(),
                folio: '000008',
                cotizacion: this.generateCotizacionNumber(new Date(2025, 4, 22)),
                name: 'Presentación de Auto Deportivo',
                clientId: 'CLI002',
                type: 'AUTOMOVILISTICO',
                location: 'Autódromo de Querétaro',
                dateConfig: 'single',
                startDate: new Date(2025, 6, 25),
                endDate: new Date(2025, 6, 25),
                status: 'COTIZADO',
                contacts: [
                    {
                        type: 'PRINCIPAL',
                        name: 'Ing. Alberto Flores',
                        email: 'aflores@giqro.com',
                        phone: '+52 442 234 5680',
                        notes: 'Gerente de marketing'
                    }
                ],
                schedule: {
                    eventStart: '11:00',
                    eventEnd: '15:00',
                    setupStart: '07:00',
                    setupEnd: '10:30'
                },
                notes: {
                    access: 'Requiere pase vehicular especial del autódromo.',
                    setup: 'Escenario modular, pantallas y audio premium.',
                    technical: 'Streaming en vivo para redes sociales.',
                    additional: 'Evento para prensa y clientes VIP.'
                },
                generalNotes: 'Propuesta en revisión por el cliente.',
                files: [],
                linkedEvents: [],
                createdAt: new Date(2025, 4, 22),
                createdBy: 'Nach Díaz'
            }
        ];

        filteredEventsData = [...eventsData];
    }

    // ===== INICIALIZACIÓN DE FLATPICKR =====
    initializeFlatpickr() {
        // Inicializar flatpickr en español
        if (typeof flatpickr !== 'undefined' && typeof flatpickr.l10ns !== 'undefined') {
            flatpickr.localize(flatpickr.l10ns.es);
        }

        // Fecha única para evento
        flatpickrInstances.eventDate = flatpickr('#eventDate', {
            dateFormat: 'Y-m-d',
            minDate: 'today',
            locale: 'es'
        });

        // Rango de fechas para eventos consecutivos
        flatpickrInstances.eventDateRange = flatpickr('#eventDateRange', {
            mode: 'range',
            dateFormat: 'Y-m-d',
            minDate: 'today',
            locale: 'es'
        });

        // Rango de fechas para filtros
        flatpickrInstances.filterDateRange = flatpickr('#filterDateRange', {
            mode: 'range',
            dateFormat: 'Y-m-d',
            locale: 'es'
        });

        // Fecha de inicio para eventos recurrentes
        flatpickrInstances.recurrenceStartDate = flatpickr('#recurrenceStartDate', {
            dateFormat: 'Y-m-d',
            minDate: 'today',
            locale: 'es'
        });
    }


    async loadEventsFromApi() {
        try {
            const response = await fetch('/inventory/eventos/data', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los eventos.');
            const data = await response.json();
            eventsData = (data || []).map((event) => ({
                ...event,
                name: event.name || 'Sin nombre',
                folio: String(event.folio || ''),
                cotizacion: String(event.cotizacion || ''),
                location: event.location || 'Sin ubicación',
                type: event.type || 'OTRO',
                status: event.status || 'PLANIFICADO',
                contacts: event.contacts || [],
                linkedEvents: event.linkedEvents || [],
                startDate: parseLocalDate(event.startDate),
                endDate: parseLocalDate(event.endDate),
                createdAt: event.createdAt ? new Date(event.createdAt) : new Date(),
            }));
            this.applyFilters();
            this.updateStatistics();
            this.updatePagination();
        } catch (error) {
            console.error(error);
            this.showAlert('No se pudieron cargar eventos desde la base de datos.', 'warning');
            eventsData = [];
            this.applyFilters();
            this.updateStatistics();
            this.updatePagination();
        }
    }

    async loadClientsFromApi() {
        try {
            const response = await fetch('/inventory/clients', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('No se pudieron cargar los clientes.');
            clientsData = await response.json();
            this.populateClientSelect();
        } catch (error) {
            console.error(error);
            this.showAlert('No se pudieron cargar clientes desde la base de datos.', 'warning');
            clientsData = [];
            this.populateClientSelect();
        }
    }

    // ===== POPULAR SELECT DE CLIENTES =====
    populateClientSelect() {
        const select = document.getElementById('eventClient');
        select.innerHTML = '<option value="">Seleccionar cliente...</option>';
        
        clientsData.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = `${client.name} (${client.type === 'EMPRESA' ? 'Empresa' : 'Persona'})`;
            select.appendChild(option);
        });
    }

    // ===== CONFIGURACIÓN DE EVENT LISTENERS =====
    setupEventListeners() {
        // Búsqueda
        document.getElementById('searchEventsInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('clearSearchEventsBtn').addEventListener('click', () => this.clearSearch());
        document.getElementById('clearAllEventsBtn').addEventListener('click', () => this.clearAllFilters());

        // Filtros rápidos por estado
        document.querySelectorAll('#statusQuickFilters [data-status]').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickStatusFilter(e));
        });

        // Aplicar filtros avanzados
        document.getElementById('applyFiltersBtn').addEventListener('click', () => this.applyAdvancedFilters());

        // Botones principales
        document.getElementById('addEventBtn').addEventListener('click', () => this.showCreateEventModal());
        document.getElementById('exportEventsBtn').addEventListener('click', () => this.exportEvents());
        document.getElementById('calendarViewBtn').addEventListener('click', () => this.openCalendarView());

        // Cambio de vista
        document.getElementById('tableViewEventsBtn').addEventListener('click', () => this.switchView('table'));
        document.getElementById('cardViewEventsBtn').addEventListener('click', () => this.switchView('cards'));

        // Paginación
        document.getElementById('eventsPrevPage').addEventListener('click', (e) => {
            e.preventDefault();
            this.changePage(currentPage - 1);
        });
        document.getElementById('eventsNextPage').addEventListener('click', (e) => {
            e.preventDefault();
            this.changePage(currentPage + 1);
        });

        // Modal de evento
        document.getElementById('saveEventBtn').addEventListener('click', () => this.saveEvent());
        document.getElementById('duplicateEventBtn').addEventListener('click', () => this.showDuplicateModal());

        // Configuración de fechas en modal
        document.querySelectorAll('input[name="dateConfig"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleDateConfigChange(e));
        });

        // Agregar contacto
        document.getElementById('addContactBtn').addEventListener('click', () => this.addContact());

        // Agregar cliente rápido
        document.getElementById('addNewClientLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showQuickAddClientModal();
        });
        document.getElementById('saveQuickClientBtn').addEventListener('click', () => this.saveQuickClient());

        // Preview de archivos
        document.getElementById('eventFiles').addEventListener('change', (e) => this.handleFileUpload(e));

        // Duplicar evento
        document.getElementById('confirmDuplicateEventBtn').addEventListener('click', () => this.confirmDuplicateEvent());

        // Edición rápida de estado
        document.getElementById('saveQuickEditStatusBtn').addEventListener('click', () => this.saveQuickEditStatus());

        // Crear eventos recurrentes
        document.getElementById('createRecurringEventsBtn').addEventListener('click', () => this.createRecurringEvents());
        document.getElementById('recurrenceOccurrences').addEventListener('input', (e) => {
            document.getElementById('occurrencesPreview').textContent = e.target.value;
        });
    }
    // ===== MANEJO DE BÚSQUEDA =====
    handleSearch(e) {
        searchTerm = e.target.value.toLowerCase().trim();
        
        const clearBtn = document.getElementById('clearSearchEventsBtn');
        if (searchTerm.length > 0) {
            clearBtn.classList.remove('d-none');
        } else {
            clearBtn.classList.add('d-none');
        }
        
        this.applyFilters();
    }

    clearSearch() {
        document.getElementById('searchEventsInput').value = '';
        document.getElementById('clearSearchEventsBtn').classList.add('d-none');
        searchTerm = '';
        this.applyFilters();
    }

    clearAllFilters() {
        // Limpiar búsqueda
        this.clearSearch();
        
        // Reset filtros rápidos
        activeFilters.quickStatus = 'all';
        document.querySelectorAll('#statusQuickFilters [data-status]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-secondary');
        });
        const allBtn = document.querySelector('#statusQuickFilters [data-status="all"]');
        allBtn.classList.add('active', 'btn-label-primary');
        allBtn.classList.remove('btn-outline-secondary');
        
        // Reset filtros avanzados
        activeFilters.statuses = [];
        activeFilters.type = '';
        activeFilters.dateRange = null;
        
        document.querySelectorAll('#filterEventsBtn + .dropdown-menu input[type="checkbox"]').forEach(cb => {
            cb.checked = activeFilters.statuses.includes(cb.value);
        });
        document.getElementById('filterEventType').value = '';
        if (flatpickrInstances.filterDateRange) {
            flatpickrInstances.filterDateRange.clear();
        }
        
        this.applyFilters();
        this.showAlert('Todos los filtros han sido limpiados.', 'success');
    }

    // ===== FILTROS =====
    handleQuickStatusFilter(e) {
        const status = e.target.dataset.status;
        
        // Actualizar UI
        document.querySelectorAll('#statusQuickFilters [data-status]').forEach(btn => {
            btn.classList.remove('active', 'btn-label-primary');
            btn.classList.add('btn-outline-secondary');
        });
        e.target.classList.add('active', 'btn-label-primary');
        e.target.classList.remove('btn-outline-secondary');
        
        activeFilters.quickStatus = status;
        this.applyFilters();
    }

    applyAdvancedFilters() {
        // Recopilar estados seleccionados
        const selectedStatuses = [];
        document.querySelectorAll('#filterEventsBtn + .dropdown-menu input[type="checkbox"]:checked').forEach(cb => {
            selectedStatuses.push(cb.value);
        });
        activeFilters.statuses = selectedStatuses;
        
        // Tipo de evento
        activeFilters.type = document.getElementById('filterEventType').value;
        
        // Rango de fechas
        if (flatpickrInstances.filterDateRange && flatpickrInstances.filterDateRange.selectedDates.length === 2) {
            activeFilters.dateRange = {
                start: flatpickrInstances.filterDateRange.selectedDates[0],
                end: flatpickrInstances.filterDateRange.selectedDates[1]
            };
        } else {
            activeFilters.dateRange = null;
        }
        
        this.applyFilters();
    }

    applyFilters() {
        filteredEventsData = eventsData.filter(event => {
            // Filtro de búsqueda
            const matchesSearch = !searchTerm || 
                String(event.name || '').toLowerCase().includes(searchTerm) ||
                String(event.folio || '').toLowerCase().includes(searchTerm) ||
                String(event.cotizacion || '').toLowerCase().includes(searchTerm) ||
                String(this.getClientName(event.clientId) || '').toLowerCase().includes(searchTerm) ||
                String(event.location || '').toLowerCase().includes(searchTerm) ||
                String(event.type || '').toLowerCase().includes(searchTerm);
            
            // Filtro de estado rápido
            const matchesQuickStatus = activeFilters.quickStatus === 'all' || 
                event.status === activeFilters.quickStatus;
            
            // Filtro de estados avanzados
            const matchesStatus = activeFilters.quickStatus === 'all'
                ? true
                : (activeFilters.statuses.length === 0 || activeFilters.statuses.includes(event.status));
            
            // Filtro de tipo
            const matchesType = !activeFilters.type || event.type === activeFilters.type;
            
            // Filtro de rango de fechas
            let matchesDateRange = true;
            if (activeFilters.dateRange) {
                const eventStart = new Date(event.startDate);
                const filterStart = new Date(activeFilters.dateRange.start);
                const filterEnd = new Date(activeFilters.dateRange.end);
                filterStart.setHours(0, 0, 0, 0);
                filterEnd.setHours(23, 59, 59, 999);
                eventStart.setHours(0, 0, 0, 0);
                matchesDateRange = eventStart >= filterStart && eventStart <= filterEnd;
            }
            
            return matchesSearch && matchesQuickStatus && matchesStatus && matchesType && matchesDateRange;
        });
        
        currentPage = 1;
        this.renderEvents();
        this.updatePagination();
    }

    // ===== RENDERIZADO DE EVENTOS =====
    renderEvents() {
        if (currentView === 'table') {
            this.renderEventsTable();
        } else {
            this.renderEventsCards();
        }
        this.updateEventsCount();
    }

    renderEventsTable() {
        const tbody = document.getElementById('eventsTableBody');
        tbody.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageEvents = filteredEventsData.slice(startIndex, endIndex);
        
        if (pageEvents.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center py-5">
                        <div class="empty-state">
                            <i class="mdi mdi-calendar-remove"></i>
                            <h5>No se encontraron eventos</h5>
                            <p>No hay eventos que coincidan con los filtros aplicados.</p>
                            <button class="btn btn-sm btn-primary" onclick="eventsManager.clearAllFilters()">
                                Limpiar Filtros
                            </button>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        pageEvents.forEach(event => {
            const row = this.createEventRow(event);
            tbody.appendChild(row);
        });
    }

    createEventRow(event) {
        const row = document.createElement('tr');
        row.dataset.eventId = event.id;
        
        const client = this.getClient(event.clientId);
        const statusClass = this.getStatusClass(event.status);
        const typeClass = this.getTypeClass(event.type);
        
        const dateDisplay = this.formatEventDate(event);
        const linkedIndicator = event.linkedEvents && event.linkedEvents.length > 0 ? 
            `<span class="linked-events-indicator ms-2" title="Parte de una serie de ${event.linkedEvents.length + 1} eventos">
                <i class="mdi mdi-link-variant"></i> ${event.linkedEvents.length + 1}
            </span>` : '';
        
        row.innerHTML = `
            <td>
                <div class="fw-medium">${this.highlightSearch(event.name)}</div>
                <small class="text-muted">Folio: ${event.folio} | Cotización: ${event.cotizacion}</small>
                ${linkedIndicator}
            </td>
            <td>
                <div>${this.highlightSearch(client.name)}</div>
                <small class="text-muted">${client.type === 'EMPRESA' ? 'Empresa' : 'Persona'}</small>
            </td>
            <td>
                <span class="badge ${typeClass}">${this.getTypeLabel(event.type)}</span>
            </td>
            <td>
                <div>${dateDisplay}</div>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 200px;" title="${event.location}">
                    ${this.highlightSearch(event.location)}
                </div>
            </td>
            <td>
                <span class="badge ${statusClass}">${this.getStatusLabel(event.status)}</span>
            </td>
            <td class="text-center">
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i class="mdi mdi-dots-vertical"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="#" onclick="eventsManager.viewEventDetails('${event.id}')">
                            <i class="mdi mdi-eye me-2"></i>Ver Detalles
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="eventsManager.quickEditStatus('${event.id}')">
                            <i class="mdi mdi-pencil me-2"></i>Cambiar Estado
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" onclick="eventsManager.editEvent('${event.id}')">
                            <i class="mdi mdi-pencil-box me-2"></i>Editar Completo
                        </a></li>
                        <li><a class="dropdown-item" href="#" onclick="eventsManager.duplicateEvent('${event.id}')">
                            <i class="mdi mdi-content-copy me-2"></i>Duplicar
                        </a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item text-danger" href="#" onclick="eventsManager.deleteEvent('${event.id}')">
                            <i class="mdi mdi-delete me-2"></i>Eliminar
                        </a></li>
                    </ul>
                </div>
            </td>
        `;
        
        row.style.cursor = 'pointer';
        row.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('a') && !e.target.closest('button')) {
                this.viewEventDetails(event.id);
            }
        });
        
        return row;
    }

    renderEventsCards() {
        const container = document.getElementById('eventsCardsBody');
        container.innerHTML = '';
        
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = startIndex + CONFIG.itemsPerPage;
        const pageEvents = filteredEventsData.slice(startIndex, endIndex);
        
        if (pageEvents.length === 0) {
            container.innerHTML = `
                <div class="col-12">
                    <div class="empty-state">
                        <i class="mdi mdi-calendar-remove"></i>
                        <h5>No se encontraron eventos</h5>
                        <p>No hay eventos que coincidan con los filtros aplicados.</p>
                        <button class="btn btn-sm btn-primary" onclick="eventsManager.clearAllFilters()">
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            `;
            return;
        }
        
        pageEvents.forEach(event => {
            const card = this.createEventCard(event);
            container.appendChild(card);
        });
    }

    createEventCard(event) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        const client = this.getClient(event.clientId);
        const statusClass = this.getStatusClass(event.status);
        const typeClass = this.getTypeClass(event.type);
        const dateDisplay = this.formatEventDate(event);
        
        col.innerHTML = `
            <div class="event-card" data-event-id="${event.id}">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-start">
                        <span class="badge ${typeClass}">${this.getTypeLabel(event.type)}</span>
                        <span class="badge ${statusClass}">${this.getStatusLabel(event.status)}</span>
                    </div>
                </div>
                <div class="card-body">
                    <h6 class="event-title">${this.highlightSearch(event.name)}</h6>
                    <div class="event-client">
                        <i class="mdi mdi-account-outline me-1"></i>
                        ${this.highlightSearch(client.name)}
                    </div>
                    <div class="event-date">
                        <i class="mdi mdi-calendar-outline me-1"></i>
                        ${dateDisplay}
                    </div>
                    <div class="event-location">
                        <i class="mdi mdi-map-marker-outline me-1"></i>
                        ${this.highlightSearch(event.location)}
                    </div>
                </div>
                <div class="card-footer">
                    <small class="text-muted">Folio: ${event.folio}</small>
                    <div class="dropdown">
                        <button class="btn btn-sm btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                            Acciones
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li><a class="dropdown-item" href="#" onclick="eventsManager.viewEventDetails('${event.id}')">
                                <i class="mdi mdi-eye me-2"></i>Ver Detalles
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="eventsManager.quickEditStatus('${event.id}')">
                                <i class="mdi mdi-pencil me-2"></i>Cambiar Estado
                            </a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="#" onclick="eventsManager.editEvent('${event.id}')">
                                <i class="mdi mdi-pencil-box me-2"></i>Editar Completo
                            </a></li>
                            <li><a class="dropdown-item" href="#" onclick="eventsManager.duplicateEvent('${event.id}')">
                                <i class="mdi mdi-content-copy me-2"></i>Duplicar
                            </a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
        
        const card = col.querySelector('.event-card');
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.dropdown') && !e.target.closest('a') && !e.target.closest('button')) {
                this.viewEventDetails(event.id);
            }
        });
        
        return col;
    }

    // ===== CAMBIO DE VISTA =====
    switchView(view) {
        currentView = view;
        
        if (view === 'table') {
            document.getElementById('eventsTableView').classList.remove('d-none');
            document.getElementById('eventsCardsView').classList.add('d-none');
            document.getElementById('tableViewEventsBtn').classList.add('active');
            document.getElementById('cardViewEventsBtn').classList.remove('active');
        } else {
            document.getElementById('eventsTableView').classList.add('d-none');
            document.getElementById('eventsCardsView').classList.remove('d-none');
            document.getElementById('tableViewEventsBtn').classList.remove('active');
            document.getElementById('cardViewEventsBtn').classList.add('active');
        }
        
        this.renderEvents();
    }

    // ===== PAGINACIÓN =====
    changePage(newPage) {
        const totalPages = Math.ceil(filteredEventsData.length / CONFIG.itemsPerPage);
        
        if (newPage < 1 || newPage > totalPages) return;
        
        currentPage = newPage;
        this.renderEvents();
        this.updatePagination();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    updatePagination() {
        const totalPages = Math.max(1, Math.ceil(filteredEventsData.length / CONFIG.itemsPerPage));
        const startIndex = (currentPage - 1) * CONFIG.itemsPerPage;
        const endIndex = Math.min(startIndex + CONFIG.itemsPerPage, filteredEventsData.length);

        document.getElementById('eventsShowingFrom').textContent = filteredEventsData.length > 0 ? startIndex + 1 : 0;
        document.getElementById('eventsShowingTo').textContent = endIndex;
        document.getElementById('eventsTotalItems').textContent = filteredEventsData.length;

        const pagination = document.getElementById('eventsPaginationControls');
        const prevLi = document.getElementById('eventsPrevPage').parentElement;
        const nextLi = document.getElementById('eventsNextPage').parentElement;

        pagination.querySelectorAll('.events-page-number').forEach(el => el.remove());

        for (let page = 1; page <= totalPages; page++) {
            const li = document.createElement('li');
            li.className = `page-item events-page-number ${page === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#">${page}</a>`;
            li.addEventListener('click', (e) => {
                e.preventDefault();
                this.changePage(page);
            });
            nextLi.before(li);
        }

        prevLi.classList.toggle('disabled', currentPage <= 1);
        nextLi.classList.toggle('disabled', currentPage >= totalPages);
    }

    updateEventsCount() {
        document.getElementById('eventsCount').textContent = `${filteredEventsData.length} eventos encontrados`;
    }

    // ===== ESTADÍSTICAS =====
    updateStatistics() {
        const totalEvents = eventsData.length;
        const confirmedEvents = eventsData.filter(e => e.status === 'CONFIRMADO').length;
        const inProgressEvents = eventsData.filter(e => 
            ['PICKING', 'LOADING', 'TRASLADO_VENUE', 'EN_MONTAJE', 'EN_PROGRESO'].includes(e.status)
        ).length;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        const thisMonthEvents = eventsData.filter(e => {
            const eventDate = new Date(e.startDate);
            return eventDate.getMonth() === currentMonth && eventDate.getFullYear() === currentYear;
        }).length;
        
        document.getElementById('totalEventsCount').textContent = totalEvents;
        document.getElementById('confirmedEventsCount').textContent = confirmedEvents;
        document.getElementById('inProgressEventsCount').textContent = inProgressEvents;
        document.getElementById('thisMonthEventsCount').textContent = thisMonthEvents;
    }

    // ===== MODAL CREAR/EDITAR EVENTO =====
    showCreateEventModal() {
        currentEventId = null;
        this.resetEventModal();
        document.getElementById('eventModalTitle').textContent = 'Crear Nuevo Evento';
        document.getElementById('duplicateEventBtn').style.display = 'none';
        
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    }

    editEvent(eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        currentEventId = eventId;
        this.resetEventModal();
        this.populateEventModal(event);
        
        document.getElementById('eventModalTitle').textContent = 'Editar Evento';
        document.getElementById('duplicateEventBtn').style.display = 'inline-block';
        
        const modal = new bootstrap.Modal(document.getElementById('eventModal'));
        modal.show();
    }

    resetEventModal() {
        // Ocultar campos de folio y cotización en modo creación
        document.getElementById('folioContainer').style.display = 'none';
        document.getElementById('cotizacionContainer').style.display = 'none';
        document.getElementById('eventFolio').value = '';
        document.getElementById('eventCotizacion').value = '';
        
        // Reset formularios
        document.getElementById('eventGeneralForm').reset();
        
        // Limpiar contactos
        contactCounter = 0;
        document.getElementById('contactsContainer').innerHTML = `
            <div class="alert alert-info">
                <i class="mdi mdi-information-outline me-2"></i>
                No hay contactos agregados. Haz clic en "Agregar Contacto" para comenzar.
            </div>
        `;
        
        // Limpiar archivos
        uploadedFiles = [];
        document.getElementById('filesPreviewContainer').innerHTML = '';
        document.getElementById('eventFiles').value = '';
        
        // Reset configuración de fechas
        document.getElementById('singleDate').checked = true;
        this.handleDateConfigChange({ target: document.getElementById('singleDate') });
        
        // Limpiar flatpickr
        if (flatpickrInstances.eventDate) flatpickrInstances.eventDate.clear();
        if (flatpickrInstances.eventDateRange) flatpickrInstances.eventDateRange.clear();
        
        // Ir al primer tab
        const firstTab = document.getElementById('tab-general');
        if (firstTab) {
            const tab = new bootstrap.Tab(firstTab);
            tab.show();
        }
    }

    populateEventModal(event) {
        // Mostrar campos de folio y cotización en modo edición
        document.getElementById('folioContainer').style.display = 'block';
        document.getElementById('cotizacionContainer').style.display = 'block';
        document.getElementById('eventFolio').value = event.folio;
        document.getElementById('eventCotizacion').value = event.cotizacion;
        
        // Tab 1: Información General
        document.getElementById('eventName').value = event.name;
        document.getElementById('eventClient').value = event.clientId;
        document.getElementById('eventType').value = event.type;
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventStatus').value = event.status;
        document.getElementById('eventGeneralNotes').value = event.generalNotes || '';
        
        // Configuración de fechas
        const dateConfig = event.dateConfig;
        document.getElementById(dateConfig === 'single' ? 'singleDate' : 
                               dateConfig === 'consecutive' ? 'multipleConsecutiveDates' : 
                               'recurringEvent').checked = true;
        this.handleDateConfigChange({ 
            target: document.querySelector(`input[name="dateConfig"]:checked`) 
        });
        
        if (dateConfig === 'single') {
            flatpickrInstances.eventDate.setDate(event.startDate);
        } else if (dateConfig === 'consecutive') {
            flatpickrInstances.eventDateRange.setDate([event.startDate, event.endDate]);
        }
        
        // Tab 2: Contactos
        if (event.contacts && event.contacts.length > 0) {
            document.getElementById('contactsContainer').innerHTML = '';
            event.contacts.forEach(contact => {
                this.addContact(contact);
            });
        }
        
        // Tab 3: Horarios
        if (event.schedule) {
            document.getElementById('eventStartTime').value = event.schedule.eventStart || '';
            document.getElementById('eventEndTime').value = event.schedule.eventEnd || '';
            document.getElementById('setupStartTime').value = event.schedule.setupStart || '';
            document.getElementById('setupEndTime').value = event.schedule.setupEnd || '';
        }
        
        if (event.notes) {
            document.getElementById('accessNotes').value = event.notes.access || '';
            document.getElementById('setupNotes').value = event.notes.setup || '';
        }
        
        // Tab 4: Notas Técnicas
        if (event.notes) {
            document.getElementById('technicalSpecs').value = event.notes.technical || '';
            document.getElementById('additionalNotes').value = event.notes.additional || '';
        }
        
        // Archivos (simulado)
        uploadedFiles = event.files || [];
        this.renderFilesPreview();
    }
    handleDateConfigChange(e) {
        const value = e.target.value;
        
        const singleDateContainer = document.getElementById('singleDateContainer');
        const dateRangeContainer = document.getElementById('dateRangeContainer');
        
        if (value === 'single') {
            singleDateContainer.classList.remove('d-none');
            dateRangeContainer.classList.add('d-none');
        } else if (value === 'consecutive') {
            singleDateContainer.classList.add('d-none');
            dateRangeContainer.classList.remove('d-none');
        } else if (value === 'recurring') {
            singleDateContainer.classList.remove('d-none');
            dateRangeContainer.classList.add('d-none');
        }
    }

    // ===== GESTIÓN DE CONTACTOS =====
    addContact(contactData = null) {
        const template = document.getElementById('contactCardTemplate');
        const clone = template.content.cloneNode(true);
        
        contactCounter++;
        
        // Actualizar número de contacto
        clone.querySelector('.contact-number').textContent = `#${contactCounter}`;
        
        // Si hay datos, rellenar el formulario
        if (contactData) {
            clone.querySelector('.contact-type').value = contactData.type;
            clone.querySelector('.contact-name').value = contactData.name;
            clone.querySelector('.contact-email').value = contactData.email || '';
            clone.querySelector('.contact-phone').value = contactData.phone || '';
            clone.querySelector('.contact-notes').value = contactData.notes || '';
        }
        
        // Agregar evento para eliminar
        const removeBtn = clone.querySelector('.remove-contact-btn');
        removeBtn.addEventListener('click', function() {
            this.closest('.contact-card').remove();
            
            // Si no hay contactos, mostrar mensaje
            const container = document.getElementById('contactsContainer');
            if (container.children.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-info">
                        <i class="mdi mdi-information-outline me-2"></i>
                        No hay contactos agregados. Haz clic en "Agregar Contacto" para comenzar.
                    </div>
                `;
            }
        });
        
        const container = document.getElementById('contactsContainer');
        // Remover mensaje de info si existe
        const infoAlert = container.querySelector('.alert-info');
        if (infoAlert) {
            infoAlert.remove();
        }
        
        container.appendChild(clone);
    }

    // ===== GESTIÓN DE ARCHIVOS =====
    handleFileUpload(e) {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            // Validar tamaño
            if (file.size > CONFIG.maxFileSize) {
                this.showAlert(`El archivo "${file.name}" excede el tamaño máximo de 10MB.`, 'warning');
                return;
            }
            
            // Validar tipo
            if (!CONFIG.allowedFileTypes.includes(file.type)) {
                this.showAlert(`El tipo de archivo "${file.name}" no está permitido.`, 'warning');
                return;
            }
            
            uploadedFiles.push(file);
        });
        
        this.renderFilesPreview();
    }

    renderFilesPreview() {
        const container = document.getElementById('filesPreviewContainer');
        container.innerHTML = '';
        
        if (uploadedFiles.length === 0) return;
        
        uploadedFiles.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-preview-item';
            
            const fileIcon = this.getFileIcon(file.type || file.name);
            const fileSize = this.formatFileSize(file.size);
            
            fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="mdi ${fileIcon} mdi-24px"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${fileSize}</div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger remove-file-btn" data-index="${index}">
                    <i class="mdi mdi-delete"></i>
                </button>
            `;
            
            const removeBtn = fileItem.querySelector('.remove-file-btn');
            removeBtn.addEventListener('click', () => {
                uploadedFiles.splice(index, 1);
                this.renderFilesPreview();
            });
            
            container.appendChild(fileItem);
        });
    }

    getFileIcon(type) {
        if (type.includes('pdf')) return 'mdi-file-pdf-box';
        if (type.includes('word') || type.includes('document')) return 'mdi-file-word-box';
        if (type.includes('excel') || type.includes('sheet')) return 'mdi-file-excel-box';
        if (type.includes('powerpoint') || type.includes('presentation')) return 'mdi-file-powerpoint-box';
        if (type.includes('image')) return 'mdi-file-image';
        if (type.includes('video')) return 'mdi-file-video';
        if (type.includes('audio')) return 'mdi-file-music';
        return 'mdi-file-document';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // ===== GUARDAR EVENTO =====
    saveEvent() {
        // Validar formulario general
        const form = document.getElementById('eventGeneralForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            // Ir al tab de información general
            const generalTab = new bootstrap.Tab(document.getElementById('tab-general'));
            generalTab.show();
            return;
        }
        
        // Recopilar datos del evento
        const eventData = {
            id: currentEventId || this.generateEventId(),
            folio: currentEventId ? eventsData.find(e => e.id === currentEventId).folio : this.generateFolio(),
            cotizacion: currentEventId ? eventsData.find(e => e.id === currentEventId).cotizacion : this.generateCotizacionNumber(),
            name: document.getElementById('eventName').value,
            clientId: document.getElementById('eventClient').value,
            type: document.getElementById('eventType').value,
            location: document.getElementById('eventLocation').value,
            status: document.getElementById('eventStatus').value,
            generalNotes: document.getElementById('eventGeneralNotes').value,
            dateConfig: document.querySelector('input[name="dateConfig"]:checked').value,
            startDate: null,
            endDate: null,
            contacts: this.collectContactsData(),
            schedule: {
                eventStart: document.getElementById('eventStartTime').value,
                eventEnd: document.getElementById('eventEndTime').value,
                setupStart: document.getElementById('setupStartTime').value,
                setupEnd: document.getElementById('setupEndTime').value
            },
            notes: {
                access: document.getElementById('accessNotes').value,
                setup: document.getElementById('setupNotes').value,
                technical: document.getElementById('technicalSpecs').value,
                additional: document.getElementById('additionalNotes').value
            },
            files: uploadedFiles,
            linkedEvents: currentEventId ? eventsData.find(e => e.id === currentEventId).linkedEvents : [],
            createdAt: currentEventId ? eventsData.find(e => e.id === currentEventId).createdAt : new Date(),
            createdBy: currentEventId ? eventsData.find(e => e.id === currentEventId).createdBy : 'Nach Díaz'
        };
        
        // Validar y asignar fechas
        if (eventData.dateConfig === 'single') {
            if (!flatpickrInstances.eventDate.selectedDates[0]) {
                this.showAlert('Por favor selecciona una fecha para el evento.', 'warning');
                const generalTab = new bootstrap.Tab(document.getElementById('tab-general'));
                generalTab.show();
                return;
            }
            eventData.startDate = flatpickrInstances.eventDate.selectedDates[0];
            eventData.endDate = flatpickrInstances.eventDate.selectedDates[0];
        } else if (eventData.dateConfig === 'consecutive') {
            if (flatpickrInstances.eventDateRange.selectedDates.length !== 2) {
                this.showAlert('Por favor selecciona el rango de fechas para el evento.', 'warning');
                const generalTab = new bootstrap.Tab(document.getElementById('tab-general'));
                generalTab.show();
                return;
            }
            eventData.startDate = flatpickrInstances.eventDateRange.selectedDates[0];
            eventData.endDate = flatpickrInstances.eventDateRange.selectedDates[1];
        } else if (eventData.dateConfig === 'recurring') {
            if (!flatpickrInstances.eventDate.selectedDates[0]) {
                this.showAlert('Por favor selecciona la fecha base para el evento recurrente.', 'warning');
                const generalTab = new bootstrap.Tab(document.getElementById('tab-general'));
                generalTab.show();
                return;
            }
            eventData.startDate = flatpickrInstances.eventDate.selectedDates[0];
            eventData.endDate = flatpickrInstances.eventDate.selectedDates[0];
        }
        
        // Guardar o actualizar
        if (currentEventId) {
            // Actualizar evento existente
            const index = eventsData.findIndex(e => e.id === currentEventId);
            if (index !== -1) {
                eventsData[index] = eventData;
                this.showAlert('Evento actualizado exitosamente.', 'success');
            }
        } else {
            const payload = {
                name: eventData.name,
                client_id: eventData.clientId || null,
                venue_name: eventData.location || null,
                start_date: formatDateForApi(eventData.startDate),
                end_date: formatDateForApi(eventData.endDate),
                event_start_time: eventData.schedule.eventStart || null,
                event_end_time: eventData.schedule.eventEnd || null,
                setup_start_time: eventData.schedule.setupStart || null,
                teardown_end_time: eventData.schedule.setupEnd || null,
                status: eventData.status,
                description: eventData.notes.technical || null,
                is_recurring: eventData.dateConfig === 'recurring',
                notes: eventData.generalNotes || null,
                general_notes: eventData.generalNotes || null,
                advisor_notes: eventData.notes.access || null,
                setup_notes: eventData.notes.setup || null,
                additional_notes: eventData.notes.additional || null,
                contacts: eventData.contacts.map((contact, index) => ({
                    contact_type: contact.type,
                    name: contact.name,
                    email: contact.email || null,
                    phone: contact.phone || null,
                    notes: contact.notes || null,
                    is_primary: index === 0
                }))
            };

            fetch('/inventory/eventos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify(payload)
            })
            .then(async (response) => {
                if (!response.ok) {
                    const data = await response.json().catch(() => ({}));
                    throw new Error(data?.message || 'No se pudo crear el evento.');
                }
                this.showAlert('Evento creado exitosamente.', 'success');
                window.location.reload();
            })
            .catch((error) => {
                this.showAlert(error.message || 'Ocurrió un error al crear el evento.', 'error');
            });

            return;
        }
        
        // Si es recurrente, mostrar modal de configuración
        if (eventData.dateConfig === 'recurring' && !currentEventId) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
            
            setTimeout(() => {
                this.showRecurringEventModal(eventData.id);
            }, 300);
        } else {
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
            modal.hide();
        }
        
        // Actualizar vista
        this.applyFilters();
        this.updateStatistics();
    }

    collectContactsData() {
        const contacts = [];
        const contactCards = document.querySelectorAll('.contact-card');
        
        contactCards.forEach(card => {
            const contact = {
                type: card.querySelector('.contact-type').value,
                name: card.querySelector('.contact-name').value,
                email: card.querySelector('.contact-email').value,
                phone: card.querySelector('.contact-phone').value,
                notes: card.querySelector('.contact-notes').value
            };
            
            if (contact.type && contact.name) {
                contacts.push(contact);
            }
        });
        
        return contacts;
    }

    generateEventId() {
        const maxId = eventsData.reduce((max, event) => {
            const num = parseInt(event.id.replace('EVT', ''));
            return num > max ? num : max;
        }, 0);
        
        return `EVT${String(maxId + 1).padStart(3, '0')}`;
    }

    // NUEVAS FUNCIONES PARA FOLIO Y COTIZACIÓN
    generateFolio() {
        // Obtener el último folio numérico
        const maxFolio = eventsData.reduce((max, event) => {
            const num = parseInt(event.folio);
            return num > max ? num : max;
        }, 0);
        
        // Generar nuevo folio de 6 dígitos
        return String(maxFolio + 1).padStart(6, '0');
    }

    generateCotizacionNumber(date = new Date()) {
        // Formato: COT-YYYYMMDD-XXX
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // Contar cotizaciones del mismo día
        const sameDay = eventsData.filter(e => {
            if (!e.cotizacion) return false;
            return e.cotizacion.includes(dateStr);
        });
        
        const sequential = String(sameDay.length + 1).padStart(3, '0');
        
        return `COT-${dateStr}-${sequential}`;
    }

    // ===== DUPLICAR EVENTO =====
    duplicateEvent(eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        currentEventId = eventId;
        document.getElementById('duplicateEventName').textContent = event.name;
        
        const modal = new bootstrap.Modal(document.getElementById('duplicateEventModal'));
        modal.show();
    }

    showDuplicateModal() {
        if (!currentEventId) return;
        
        const event = eventsData.find(e => e.id === currentEventId);
        if (!event) return;
        
        // Cerrar modal de edición
        const editModal = bootstrap.Modal.getInstance(document.getElementById('eventModal'));
        if (editModal) editModal.hide();
        
        document.getElementById('duplicateEventName').textContent = event.name;
        
        const modal = new bootstrap.Modal(document.getElementById('duplicateEventModal'));
        modal.show();
    }

    confirmDuplicateEvent() {
        if (!currentEventId) return;
        
        const originalEvent = eventsData.find(e => e.id === currentEventId);
        if (!originalEvent) return;
        
        // Crear copia del evento
        const duplicatedEvent = JSON.parse(JSON.stringify(originalEvent));
        duplicatedEvent.id = this.generateEventId();
        duplicatedEvent.name = `${originalEvent.name} (Copia)`;
        duplicatedEvent.status = 'COTIZADO';
        duplicatedEvent.startDate = null;
        duplicatedEvent.endDate = null;
        duplicatedEvent.createdAt = new Date();
        duplicatedEvent.createdBy = 'Nach Díaz';
        duplicatedEvent.linkedEvents = [];
        
        // Cerrar modal de duplicación
        const dupModal = bootstrap.Modal.getInstance(document.getElementById('duplicateEventModal'));
        if (dupModal) dupModal.hide();
        
        // Abrir modal de edición con el evento duplicado
        setTimeout(() => {
            currentEventId = null; // Para que se trate como nuevo
            this.resetEventModal();
            this.populateEventModal(duplicatedEvent);
            
            // Limpiar fechas
            if (flatpickrInstances.eventDate) flatpickrInstances.eventDate.clear();
            if (flatpickrInstances.eventDateRange) flatpickrInstances.eventDateRange.clear();
            
            document.getElementById('eventModalTitle').textContent = 'Duplicar Evento - Configurar Fechas';
            document.getElementById('duplicateEventBtn').style.display = 'none';
            
            const modal = new bootstrap.Modal(document.getElementById('eventModal'));
            modal.show();
            
            this.showAlert('Evento duplicado. Configura las fechas y ajusta la información necesaria.', 'info');
        }, 300);
    }

    // ===== EVENTOS RECURRENTES =====
    showRecurringEventModal(eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        currentEventId = eventId;
        document.getElementById('recurringBaseEventName').textContent = event.name;
        
        // Configurar fecha de inicio con la fecha del evento base
        flatpickrInstances.recurrenceStartDate.setDate(event.startDate);
        
        const modal = new bootstrap.Modal(document.getElementById('recurringEventModal'));
        modal.show();
    }

    createRecurringEvents() {
        const baseEvent = eventsData.find(e => e.id === currentEventId);
        if (!baseEvent) return;
        
        const recurrenceType = document.querySelector('input[name="recurrenceType"]:checked').value;
        const startDate = flatpickrInstances.recurrenceStartDate.selectedDates[0];
        const occurrences = parseInt(document.getElementById('recurrenceOccurrences').value);
        
        if (!startDate || !occurrences) {
            this.showAlert('Por favor completa todos los campos.', 'warning');
            return;
        }
        
        const linkedEventIds = [];
        
        for (let i = 0; i < occurrences; i++) {
            const newEvent = JSON.parse(JSON.stringify(baseEvent));
            newEvent.id = this.generateEventId();
            newEvent.name = `${baseEvent.name} - Ocurrencia ${i + 1}`;
            
            // Calcular fecha según tipo de recurrencia
            const eventDate = new Date(startDate);
            if (recurrenceType === 'weekly') {
                eventDate.setDate(eventDate.getDate() + (i * 7));
            } else if (recurrenceType === 'biweekly') {
                eventDate.setDate(eventDate.getDate() + (i * 14));
            } else if (recurrenceType === 'monthly') {
                eventDate.setMonth(eventDate.getMonth() + i);
            }
            
            newEvent.startDate = eventDate;
            newEvent.endDate = eventDate;
            newEvent.dateConfig = 'single';
            newEvent.createdAt = new Date();
            newEvent.createdBy = 'Nach Díaz';
            newEvent.linkedEvents = [baseEvent.id]; // Vinculado al evento base
            
            linkedEventIds.push(newEvent.id);
            eventsData.push(newEvent);
        }
        
        // Actualizar evento base con los eventos vinculados
        baseEvent.linkedEvents = linkedEventIds;
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('recurringEventModal'));
        if (modal) modal.hide();
        
        this.showAlert(`Se crearon ${occurrences} eventos recurrentes vinculados exitosamente.`, 'success');
        this.applyFilters();
        this.updateStatistics();
    }

    // ===== CLIENTE RÁPIDO =====
    showQuickAddClientModal() {
        document.getElementById('quickAddClientForm').reset();
        const modal = new bootstrap.Modal(document.getElementById('quickAddClientModal'));
        modal.show();
    }

    saveQuickClient() {
        const form = document.getElementById('quickAddClientForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const payload = {
            client_type: document.getElementById('clientType').value,
            name: document.getElementById('clientName').value,
            email: document.getElementById('clientEmail').value,
            phone: document.getElementById('clientPhone').value
        };

        fetch('/inventory/clients/quick', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': getCsrfToken(),
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(payload)
        })
        .then(async (response) => {
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data?.message || 'No se pudo crear el cliente.');
            }

            clientsData.push(data);
            this.populateClientSelect();
            document.getElementById('eventClient').value = data.id;

            const modal = bootstrap.Modal.getInstance(document.getElementById('quickAddClientModal'));
            if (modal) modal.hide();

            this.showAlert('Cliente agregado exitosamente.', 'success');
        })
        .catch((error) => {
            this.showAlert(error.message || 'Error al crear cliente rápido.', 'error');
        });
    }

    generateClientId() {
        const maxId = clientsData.reduce((max, client) => {
            const num = parseInt(client.id.replace('CLI', ''));
            return num > max ? num : max;
        }, 0);
        
        return `CLI${String(maxId + 1).padStart(3, '0')}`;
    }

    // ===== VER DETALLES DEL EVENTO =====
    viewEventDetails(eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        const client = this.getClient(event.clientId);
        const container = document.getElementById('eventDetailsContent');
        
        let detailsHTML = `
            <!-- Información General -->
            <div class="detail-section">
                <h6 class="detail-section-title">
                    <i class="mdi mdi-information-outline me-2"></i>
                    Información General
                </h6>
                <div class="detail-row">
                    <div class="detail-label">Folio (ID):</div>
                    <div class="detail-value"><code class="fs-5 text-primary">${event.folio}</code></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">No. de Cotización:</div>
                    <div class="detail-value"><code class="text-info">${event.cotizacion}</code></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Nombre:</div>
                    <div class="detail-value"><strong>${event.name}</strong></div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Cliente:</div>
                    <div class="detail-value">
                        ${client.name}
                        <span class="badge bg-label-secondary ms-2">${client.type === 'EMPRESA' ? 'Empresa' : 'Persona'}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Tipo de Evento:</div>
                    <div class="detail-value">
                        <span class="badge ${this.getTypeClass(event.type)}">${this.getTypeLabel(event.type)}</span>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Estado:</div>
                    <div class="detail-value">
                        <span class="badge ${this.getStatusClass(event.status)}">${this.getStatusLabel(event.status)}</span>
                        <button class="btn btn-sm btn-link p-0 ms-2" onclick="eventsManager.quickEditStatus('${event.id}', true)" title="Cambiar estado">
                            <i class="mdi mdi-pencil"></i>
                        </button>
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Ubicación:</div>
                    <div class="detail-value">
                        <i class="mdi mdi-map-marker me-1"></i>
                        ${event.location}
                    </div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Fecha(s):</div>
                    <div class="detail-value">
                        <i class="mdi mdi-calendar me-1"></i>
                        ${this.formatEventDate(event)}
                    </div>
                </div>
                ${event.generalNotes ? `
                <div class="detail-row">
                    <div class="detail-label">Notas Generales:</div>
                    <div class="detail-value">${event.generalNotes}</div>
                </div>
                ` : ''}
            </div>
        `;
        // Contactos
        if (event.contacts && event.contacts.length > 0) {
            detailsHTML += `
                <div class="detail-section">
                    <h6 class="detail-section-title">
                        <i class="mdi mdi-account-multiple-outline me-2"></i>
                        Contactos
                    </h6>
            `;
            
            event.contacts.forEach((contact, index) => {
                detailsHTML += `
                    <div class="card mb-2">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="mb-0">Contacto ${index + 1}</h6>
                                <span class="badge bg-label-primary">${this.getContactTypeLabel(contact.type)}</span>
                            </div>
                            <div class="row">
                                <div class="col-md-6">
                                    <small class="text-muted">Nombre:</small>
                                    <div>${contact.name}</div>
                                </div>
                                ${contact.email ? `
                                <div class="col-md-6">
                                    <small class="text-muted">Email:</small>
                                    <div><a href="mailto:${contact.email}">${contact.email}</a></div>
                                </div>
                                ` : ''}
                                ${contact.phone ? `
                                <div class="col-md-6 mt-2">
                                    <small class="text-muted">Teléfono:</small>
                                    <div><a href="tel:${contact.phone}">${contact.phone}</a></div>
                                </div>
                                ` : ''}
                                ${contact.notes ? `
                                <div class="col-12 mt-2">
                                    <small class="text-muted">Notas:</small>
                                    <div>${contact.notes}</div>
                                </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            
            detailsHTML += `</div>`;
        }
        
        // Horarios
        if (event.schedule) {
            detailsHTML += `
                <div class="detail-section">
                    <h6 class="detail-section-title">
                        <i class="mdi mdi-clock-outline me-2"></i>
                        Horarios
                    </h6>
            `;
            
            if (event.schedule.eventStart || event.schedule.eventEnd) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Horario del Evento:</div>
                        <div class="detail-value">
                            ${event.schedule.eventStart ? event.schedule.eventStart : 'N/A'} - 
                            ${event.schedule.eventEnd ? event.schedule.eventEnd : 'N/A'}
                        </div>
                    </div>
                `;
            }
            
            if (event.schedule.setupStart || event.schedule.setupEnd) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Horario de Montaje:</div>
                        <div class="detail-value">
                            ${event.schedule.setupStart ? event.schedule.setupStart : 'N/A'} - 
                            ${event.schedule.setupEnd ? event.schedule.setupEnd : 'N/A'}
                        </div>
                    </div>
                `;
            }
            
            detailsHTML += `</div>`;
        }
        
        // Notas
        if (event.notes) {
            detailsHTML += `
                <div class="detail-section">
                    <h6 class="detail-section-title">
                        <i class="mdi mdi-note-text-outline me-2"></i>
                        Notas y Especificaciones
                    </h6>
            `;
            
            if (event.notes.access) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Notas de Acceso:</div>
                        <div class="detail-value">${event.notes.access}</div>
                    </div>
                `;
            }
            
            if (event.notes.setup) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Notas de Montaje:</div>
                        <div class="detail-value">${event.notes.setup}</div>
                    </div>
                `;
            }
            
            if (event.notes.technical) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Especificaciones Técnicas:</div>
                        <div class="detail-value">${event.notes.technical}</div>
                    </div>
                `;
            }
            
            if (event.notes.additional) {
                detailsHTML += `
                    <div class="detail-row">
                        <div class="detail-label">Notas Adicionales:</div>
                        <div class="detail-value">${event.notes.additional}</div>
                    </div>
                `;
            }
            
            detailsHTML += `</div>`;
        }
        
        // Archivos
        if (event.files && event.files.length > 0) {
            detailsHTML += `
                <div class="detail-section">
                    <h6 class="detail-section-title">
                        <i class="mdi mdi-file-multiple-outline me-2"></i>
                        Archivos Adjuntos
                    </h6>
                    <div class="row g-2">
            `;
            
            event.files.forEach(file => {
                const fileIcon = this.getFileIcon(file.type || file.name);
                const fileSize = this.formatFileSize(file.size);
                
                detailsHTML += `
                    <div class="col-md-6">
                        <div class="file-preview-item">
                            <div class="file-icon">
                                <i class="mdi ${fileIcon} mdi-24px"></i>
                            </div>
                            <div class="file-info">
                                <div class="file-name">${file.name}</div>
                                <div class="file-size">${fileSize}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            detailsHTML += `
                    </div>
                </div>
            `;
        }
        
        // Eventos vinculados
        if (event.linkedEvents && event.linkedEvents.length > 0) {
            detailsHTML += `
                <div class="detail-section">
                    <h6 class="detail-section-title">
                        <i class="mdi mdi-link-variant me-2"></i>
                        Eventos Vinculados
                    </h6>
                    <div class="alert alert-info">
                        <i class="mdi mdi-information-outline me-2"></i>
                        Este evento es parte de una serie de ${event.linkedEvents.length + 1} eventos recurrentes.
                    </div>
                    <div class="list-group">
            `;
            
            event.linkedEvents.forEach(linkedId => {
                const linkedEvent = eventsData.find(e => e.id === linkedId);
                if (linkedEvent) {
                    detailsHTML += `
                        <a href="#" class="list-group-item list-group-item-action" onclick="eventsManager.viewEventDetails('${linkedEvent.id}'); return false;">
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>${linkedEvent.name}</strong>
                                    <br>
                                    <small class="text-muted">
                                        <i class="mdi mdi-calendar me-1"></i>
                                        ${this.formatEventDate(linkedEvent)}
                                    </small>
                                </div>
                                <span class="badge ${this.getStatusClass(linkedEvent.status)}">
                                    ${this.getStatusLabel(linkedEvent.status)}
                                </span>
                            </div>
                        </a>
                    `;
                }
            });
            
            detailsHTML += `
                    </div>
                </div>
            `;
        }
        
        // Información de creación
        detailsHTML += `
            <div class="detail-section">
                <h6 class="detail-section-title">
                    <i class="mdi mdi-clock-outline me-2"></i>
                    Información de Registro
                </h6>
                <div class="detail-row">
                    <div class="detail-label">Creado el:</div>
                    <div class="detail-value">${this.formatDateTime(event.createdAt)}</div>
                </div>
                <div class="detail-row">
                    <div class="detail-label">Creado por:</div>
                    <div class="detail-value">${event.createdBy}</div>
                </div>
            </div>
        `;
        
        container.innerHTML = detailsHTML;
        
        // Configurar botón de edición
        document.getElementById('editEventFromDetailsBtn').onclick = () => {
            const detailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
            if (detailsModal) detailsModal.hide();
            
            setTimeout(() => {
                this.editEvent(eventId);
            }, 300);
        };
        
        document.getElementById('eventDetailsModalTitle').textContent = `Detalles: ${event.name}`;
        
        const modal = new bootstrap.Modal(document.getElementById('eventDetailsModal'));
        modal.show();
    }

    // ===== ELIMINAR EVENTO =====
    deleteEvent(eventId) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        Swal.fire({
            title: '¿Eliminar evento?',
            html: `¿Estás seguro de que deseas eliminar el evento:<br><strong>${event.name}</strong>?<br><br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // Eliminar evento
                const index = eventsData.findIndex(e => e.id === eventId);
                if (index !== -1) {
                    eventsData.splice(index, 1);
                    
                    // Actualizar vista
                    this.applyFilters();
                    this.updateStatistics();
                    
                    Swal.fire({
                        title: 'Eliminado',
                        text: 'El evento ha sido eliminado exitosamente.',
                        icon: 'success',
                        timer: 2000,
                        showConfirmButton: false
                    });
                }
            }
        });
    }

    // ===== EDICIÓN RÁPIDA DE ESTADO =====
    quickEditStatus(eventId, fromDetailsModal = false) {
        const event = eventsData.find(e => e.id === eventId);
        if (!event) return;
        
        currentEventId = eventId;
        document.getElementById('quickEditEventName').textContent = event.name;
        document.getElementById('quickEditStatus').value = event.status;
        
        // Guardar referencia si viene del modal de detalles
        if (fromDetailsModal) {
            this.fromDetailsModal = true;
        } else {
            this.fromDetailsModal = false;
        }
        
        const modal = new bootstrap.Modal(document.getElementById('quickEditStatusModal'));
        modal.show();
    }

    saveQuickEditStatus() {
        if (!currentEventId) return;
        
        const event = eventsData.find(e => e.id === currentEventId);
        if (!event) return;
        
        const newStatus = document.getElementById('quickEditStatus').value;
        const oldStatus = event.status;
        
        // Actualizar estado
        event.status = newStatus;
        
        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('quickEditStatusModal'));
        if (modal) modal.hide();
        
        // Si venía del modal de detalles, actualizar ese modal también
        if (this.fromDetailsModal) {
            // Cerrar modal de detalles
            const detailsModal = bootstrap.Modal.getInstance(document.getElementById('eventDetailsModal'));
            if (detailsModal) detailsModal.hide();
            
            // Reabrir modal de detalles actualizado
            setTimeout(() => {
                this.viewEventDetails(currentEventId);
            }, 300);
        }
        
        // Actualizar vista
        this.applyFilters();
        this.updateStatistics();
        
        this.showAlert(`Estado actualizado de "${this.getStatusLabel(oldStatus)}" a "${this.getStatusLabel(newStatus)}"`, 'success');
    }

    // ===== EXPORTAR EVENTOS =====
    exportEvents() {
        const dataToExport = filteredEventsData.map(event => {
            const client = this.getClient(event.clientId);
            
            return {
                'Folio': event.folio,
                'No. Cotización': event.cotizacion,
                'Nombre del Evento': event.name,
                'Cliente': client.name,
                'Tipo Cliente': client.type,
                'Tipo Evento': this.getTypeLabel(event.type),
                'Fecha Inicio': this.formatDate(event.startDate),
                'Fecha Fin': this.formatDate(event.endDate),
                'Ubicación': event.location,
                'Estado': this.getStatusLabel(event.status),
                'Horario Evento': event.schedule ? `${event.schedule.eventStart || ''} - ${event.schedule.eventEnd || ''}` : '',
                'Horario Montaje': event.schedule ? `${event.schedule.setupStart || ''} - ${event.schedule.setupEnd || ''}` : '',
                'Contactos': event.contacts ? event.contacts.length : 0,
                'Archivos': event.files ? event.files.length : 0,
                'Creado el': this.formatDateTime(event.createdAt),
                'Creado por': event.createdBy
            };
        });
        
        const csvContent = this.convertToCSV(dataToExport);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0];
        
        link.setAttribute('href', url);
        link.setAttribute('download', `eventos_${dateStr}.csv`);
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

    // ===== ABRIR CALENDARIO =====
    openCalendarView() {
        this.showAlert('La vista de calendario estará disponible próximamente. Se integrará con el módulo de calendario existente del template.', 'info');
    }

    // ===== FUNCIONES DE UTILIDAD =====
    getClient(clientId) {
        return clientsData.find(c => c.id === clientId) || { 
            id: clientId, 
            name: 'Cliente no encontrado', 
            type: 'PERSONA' 
        };
    }

    getClientName(clientId) {
        const client = this.getClient(clientId);
        return client.name;
    }

    getStatusClass(status) {
        const classes = {
            'COTIZADO': 'status-cotizado',
            'CONFIRMADO': 'status-confirmado',
            'POSTPONED': 'status-postponed',
            'REAGENDADO': 'status-reagendado',
            'CANCELADO': 'status-cancelado',
            'PICKING': 'status-picking',
            'LOADING': 'status-loading',
            'TRASLADO_VENUE': 'status-traslado_venue',
            'EN_MONTAJE': 'status-en_montaje',
            'EN_PROGRESO': 'status-en_progreso',
            'COMPLETADO': 'status-completado',
            'DESMONTAJE': 'status-desmontaje',
            'TRASLADO_ALMACEN': 'status-traslado_almacen',
            'UNLOADING': 'status-unloading',
            'FINALIZADO': 'status-finalizado'
        };
        return `badge ${classes[status] || 'bg-secondary'}`;
    }

    getStatusLabel(status) {
        const labels = {
            'COTIZADO': 'Cotizado',
            'CONFIRMADO': 'Confirmado',
            'POSTPONED': 'Pospuesto',
            'REAGENDADO': 'Re-agendado',
            'CANCELADO': 'Cancelado',
            'PICKING': 'Picking',
            'LOADING': 'Loading',
            'TRASLADO_VENUE': 'Traslado :: Venue',
            'EN_MONTAJE': 'En Montaje',
            'EN_PROGRESO': 'En Progreso',
            'COMPLETADO': 'Completado',
            'DESMONTAJE': 'Desmontaje',
            'TRASLADO_ALMACEN': 'Traslado :: Almacén',
            'UNLOADING': 'Unloading',
            'FINALIZADO': 'Finalizado'
        };
        return labels[status] || status;
    }

    getTypeClass(type) {
        const classes = {
            'EMPRESARIAL': 'type-empresarial',
            'SOCIAL': 'type-social',
            'DEPORTIVO': 'type-deportivo',
            'ESCOLAR': 'type-escolar',
            'PARTICULAR': 'type-particular',
            'CONCIERTO': 'type-concierto',
            'AUTOMOVILISTICO': 'type-automovilistico',
            'OTRO': 'type-otro'
        };
        return classes[type] || 'bg-secondary';
    }

    getTypeLabel(type) {
        const labels = {
            'EMPRESARIAL': 'Empresarial',
            'SOCIAL': 'Social',
            'DEPORTIVO': 'Deportivo',
            'ESCOLAR': 'Escolar',
            'PARTICULAR': 'Particular',
            'CONCIERTO': 'Concierto',
            'AUTOMOVILISTICO': 'Automovilístico',
            'OTRO': 'Otro'
        };
        return labels[type] || type;
    }

    getContactTypeLabel(type) {
        const labels = {
            'PRINCIPAL': 'Principal',
            'FACTURACION': 'Facturación',
            'VENUE': 'Venue',
            'EN_SITIO': 'En Sitio',
            'TECNICO': 'Técnico',
            'OTRO': 'Otro'
        };
        return labels[type] || type;
    }

    formatEventDate(event) {
        const start = parseLocalDate(event.startDate);
        const end = parseLocalDate(event.endDate);
        if (!start || !end) return 'N/A';
        
        if (event.dateConfig === 'single' || start.toDateString() === end.toDateString()) {
            return this.formatDate(start);
        } else {
            return `${this.formatDate(start)} - ${this.formatDate(end)}`;
        }
    }

    formatDate(date) {
        if (!date) return 'N/A';
        const d = parseLocalDate(date);
        if (!d) return 'N/A';
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });
    }

    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = parseLocalDate(date);
        if (!d) return 'N/A';
        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    highlightSearch(text) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="search-highlight">$1</span>');
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
}
// ===== INICIALIZACIÓN =====
let eventsManager;

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar Flatpickr en español
    if (typeof flatpickr !== 'undefined' && typeof flatpickr.l10ns !== 'undefined') {
        flatpickr.localize(flatpickr.l10ns.es);
    }
    
    // Inicializar el gestor de eventos
    eventsManager = new EventsManager();
    
    console.log('Sistema de Gestión de Eventos inicializado correctamente');
    console.log('Eventos cargados:', eventsData.length);
    console.log('Clientes cargados:', clientsData.length);
});

// ===== FUNCIONES GLOBALES PARA EVENTOS =====
window.eventsManager = {
    viewEventDetails: (eventId) => eventsManager.viewEventDetails(eventId),
    editEvent: (eventId) => eventsManager.editEvent(eventId),
    duplicateEvent: (eventId) => eventsManager.duplicateEvent(eventId),
    deleteEvent: (eventId) => eventsManager.deleteEvent(eventId),
    clearAllFilters: () => eventsManager.clearAllFilters(),
    quickEditStatus: (eventId, fromDetailsModal) => eventsManager.quickEditStatus(eventId, fromDetailsModal)
};