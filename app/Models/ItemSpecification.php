<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ItemSpecification - Especificación Técnica de un Item
 *
 * Almacena especificaciones técnicas de items de inventario
 * Ejemplos: Potencia: 1000W, Peso: 17.69 kg, Dimensiones: 375 x 654 x 363 mm
 */
class ItemSpecification extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',  // ID del item al que pertenece
        'name',               // Nombre de la especificación (ej: "Potencia")
        'value',              // Valor de la especificación (ej: "1000W")
        'display_order',      // Orden de visualización
    ];

    protected $casts = [
        'display_order' => 'integer',
    ];

    /**
     * Item de inventario al que pertenece esta especificación
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
