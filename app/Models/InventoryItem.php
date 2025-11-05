<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * InventoryItem - Unidad Individual de Inventario
 *
 * Representa una unidad física específica de un producto (ej: "Altavoz JBL EON615 #001")
 * Cada InventoryItem pertenece a un ItemParent (producto padre)
 *
 * Formulario: inventory/formulario/{id} (para crear/editar)
 * Vista detalle: inventory/unidad/{id} (detalle de unidad específica)
 */
class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        // Tab 1: Información Básica - Identificadores
        'sku',               // Formulario: "SKU" - Generado automáticamente (BP000000)
        'item_id',           // Formulario: "ID del Item" - Generado según categoría y marca (XX00)
        'name',              // Nombre completo del item (puede heredar del parent)
        'public_name',       // Nombre público para cotizaciones (puede heredar del parent)
        'item_parent_id',    // Relación: Producto padre al que pertenece

        // Tab 4: Ubicación y Estado
        'location_id',       // Formulario: "Ubicación" - Relación con tabla locations
        'rack_position',     // Formulario: "Posición en Rack" - Ej: A1-5
        'panel_position',    // Formulario: "Panel" - Ej: P1-3
        'status',            // Formulario: "Estado" - DISPONIBLE, EN_EVENTO, MANTENIMIENTO, etc.
        'condition',         // Formulario: "Condición Física" - EXCELENTE, BUENO, REGULAR, MALO

        // Tab 2: Especificaciones Técnicas - Identificadores
        'unit_set',          // Formulario: "Tipo de Unidad" - UNIT (individual) o SET (conjunto)
        'total_units',       // Formulario: "Total de Unidades" - Si es SET, cuántas piezas lo componen
        'serial_number',     // Formulario: "Número de Serie" - Número de serie del fabricante
        'rfid_tag',          // Formulario: "Etiqueta RFID" - Código RFID para tracking
        'description',       // Descripción específica de esta unidad (si difiere del parent)

        // Tab 3: Precios y Valores
        'purchase_date',     // Formulario: "Fecha de Compra" - Cuándo se adquirió el equipo
        'original_price',    // Formulario: "Precio Original ($)" - Precio de compra del equipo
        'ideal_rental_price',// Formulario: "Precio Renta Ideal ($)" - Precio objetivo de renta
        'minimum_rental_price',// Formulario: "Precio Renta Mínimo ($)" - Precio mínimo aceptable

        // Tab 3: Garantía
        'warranty_valid',    // Formulario: "Garantía Vigente" - SI/NO (boolean)
        'warranty_provider', // Vista Detalle: "Garantía" - Proveedor (ej: "Audio Pro")
        'warranty_expiry',   // Fecha de expiración de garantía

        // Mantenimiento
        'last_maintenance',  // Vista Detalle: "Última inspección" - Fecha del último mantenimiento
        'next_maintenance',  // Vista Detalle: "Próxima inspección" - Fecha programada próximo mantenimiento
        'maintenance_interval_days', // Cada cuántos días requiere mantenimiento

        // Tab 5: Multimedia
        'image_url',         // URL de imagen principal del item
        'manual_url',        // URL del manual de usuario
        'datasheet_url',     // URL de la ficha técnica

        // Tab 4: Notas y Observaciones
        'notes',             // Formulario: "Notas sobre el Estado" - Observaciones del equipo
        'tags',              // JSON array de etiquetas para búsqueda y filtrado

        // Control
        'is_active',         // Soft delete: true = activo, false = eliminado
        'is_draft',          // Sistema de autoguardado: true = borrador, false = guardado final
        'created_by',        // Usuario que creó el registro
    ];

    protected $casts = [
        'purchase_date'            => 'date',     // Fecha de compra
        'warranty_valid'           => 'boolean',  // Garantía vigente (SI/NO)
        'warranty_expiry'          => 'date',     // Fecha expiración garantía
        'last_maintenance'         => 'date',     // Última inspección
        'next_maintenance'         => 'date',     // Próxima inspección
        'maintenance_interval_days'=> 'integer',  // Días entre mantenimientos
        'original_price'           => 'decimal:2',// Precio de compra
        'ideal_rental_price'       => 'decimal:2',// Precio renta ideal
        'minimum_rental_price'     => 'decimal:2',// Precio renta mínimo
        'total_units'              => 'integer',  // Total de unidades si es SET
        'tags'                     => 'array',    // JSON a Array
        'is_active'                => 'boolean',  // Activo/Inactivo
        'is_draft'                 => 'boolean',  // Borrador (autoguardado) / Final
    ];

    // ========================================
    // Relaciones
    // ========================================

    /**
     * Producto padre al que pertenece esta unidad
     * Vista: Muestra info del parent en header (nombre, categoría, marca)
     */
    public function parent()
    {
        return $this->belongsTo(ItemParent::class, 'item_parent_id');
    }

    /**
     * Ubicación física actual del item
     * Vista Detalle: "Estado Actual" > "Ubicación Actual"
     */
    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    /**
     * Asignaciones de este item a eventos
     * Vista Detalle: Tab "Historial de Uso" > Tabla de eventos
     */
    public function assignments()
    {
        return $this->hasMany(EventAssignment::class, 'inventory_item_id');
    }

    /**
     * Registros de mantenimiento
     * Vista Detalle: Tab "Mantenimiento" > Tabla de historial
     */
    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class, 'inventory_item_id');
    }

    /**
     * Movimientos de inventario
     * Vista: Tracking de movimientos entre ubicaciones
     */
    public function movements()
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_item_id');
    }

    // ========================================
    // Accessors / Métodos Calculados
    // ========================================

    /**
     * ROI Estimado (calculado, no almacenado en BD)
     * Formulario: Tab "Precios y Valores" > "Análisis de Rentabilidad" > "ROI Estimado"
     *
     * Calcula el retorno de inversión basado en precio de renta ideal
     * Fórmula: (precio_renta / precio_original) * 100
     */
    public function getRoiAttribute()
    {
        if (!$this->original_price || !$this->ideal_rental_price) {
            return 0;
        }
        return round(($this->ideal_rental_price / $this->original_price) * 100, 2);
    }

    /**
     * Tiempo de Recuperación (calculado, no almacenado en BD)
     * Formulario: Tab "Precios y Valores" > "Análisis de Rentabilidad" > "Recuperación en"
     *
     * Calcula en cuántas rentas se recupera la inversión
     * Fórmula: precio_original / precio_renta
     */
    public function getRecoveryTimeAttribute()
    {
        if (!$this->original_price || !$this->ideal_rental_price) {
            return 0;
        }
        return ceil($this->original_price / $this->ideal_rental_price);
    }

    /**
     * Margen de Ganancia (calculado, no almacenado en BD)
     * Formulario: Tab "Precios y Valores" > "Análisis de Rentabilidad" > "Margen de Ganancia"
     *
     * Calcula el margen de ganancia por renta
     */
    public function getProfitMarginAttribute()
    {
        if (!$this->original_price || !$this->ideal_rental_price) {
            return 0;
        }
        $costPerRent = $this->original_price / ($this->recovery_time ?: 1);
        $profit = $this->ideal_rental_price - $costPerRent;
        return round(($profit / $this->ideal_rental_price) * 100, 2);
    }
}
