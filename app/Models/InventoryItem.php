<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'sku',
        'item_id',
        'name',
        'public_name',
        'description',
        'item_parent_id',
        'location_id',
        'unit_set',
        'total_units',
        'rack_position',
        'panel_position',
        'rfid_tag',
        'serial_number',
        'status',
        'condition',
        'purchase_date',
        'original_price',
        'ideal_rental_price',
        'minimum_rental_price',
        'warranty_valid',
        'warranty_provider',
        'warranty_expiry',
        'last_maintenance',
        'next_maintenance',
        'maintenance_interval_days',
        'image_url',
        'manual_url',
        'datasheet_url',
        'notes',
        'tags',
        'is_active',
        'is_draft',          // Sistema de autoguardado: true = borrador, false = guardado final
        'created_by',
        'color',
        'location_url',
        'location_latitude',
        'location_longitude',
    ];

    protected $casts = [
        'purchase_date'            => 'date',
        'warranty_valid'           => 'boolean',
        'warranty_expiry'          => 'date',
        'last_maintenance'         => 'date',
        'next_maintenance'         => 'date',
        'maintenance_interval_days'=> 'integer',
        'original_price'           => 'decimal:2',
        'ideal_rental_price'       => 'decimal:2',
        'minimum_rental_price'     => 'decimal:2',
        'total_units'              => 'integer',
        'tags'                     => 'array',     // funciona para JSON en MySQL o text[] en Postgres
        'is_active'                => 'boolean',
        'is_draft'                 => 'boolean',  // Borrador (autoguardado) / Final
    ];

    public function parent()
    {
        return $this->belongsTo(ItemParent::class, 'item_parent_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function assignments()
    {
        return $this->hasMany(EventAssignment::class, 'inventory_item_id');
    }

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class, 'inventory_item_id');
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_item_id');
    }

    /**
     * Especificaciones técnicas del item
     * Vista: Tab "Especificaciones" > Lista de especificaciones
     */
    public function specifications()
    {
        return $this->hasMany(ItemSpecification::class, 'inventory_item_id')->orderBy('display_order');
    }

    public function images()
    {
        return $this->hasMany(ItemImage::class, 'item_id');
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
