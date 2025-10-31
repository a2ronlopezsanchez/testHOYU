<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * ItemParent - Producto Padre
 *
 * Representa un producto genérico del inventario (ej: "Altavoz JBL EON615")
 * Un ItemParent puede tener múltiples InventoryItems (unidades individuales)
 *
 * Formulario: inventory/formulario/{id}
 * Vista detalle: inventory/item/{id}
 */
class ItemParent extends Model
{
    use HasFactory;

    protected $table = 'item_parents';

    protected $fillable = [
        // Tab 1: Información Básica
        'name',              // Formulario: "Nombre del Producto" - Formato: TIPO | MARCA | MODELO | CARACTERÍSTICAS
        'public_name',       // Formulario: "Nombre Público" - Cómo se muestra en cotizaciones y documentos
        'category_id',       // Formulario: "Categoría" - Relación con tabla categories
        'brand_id',          // Formulario: "Marca" - Relación con tabla brands
        'model',             // Formulario: "Modelo" - Ej: EON615
        'family',            // Formulario: "Familia" - Familia del producto (ej: "Altavoces")
        'sub_family',        // Formulario: "Sub-Familia" - Subfamilia del producto (ej: "Activos")
        'description',       // Formulario: "Descripción" - Descripción detallada del producto

        // Tab 2: Especificaciones Técnicas
        'color',             // Formulario: "Color" - Color del producto
        'specifications',    // Formulario: "Especificaciones" - JSON array ["Potencia: 1000W", "Peso: 17kg"]

        // Tags y Metadata
        'tags',              // JSON array de etiquetas para búsqueda y filtrado

        // Control
        'is_active',         // Soft delete: true = activo, false = eliminado
        'created_by',        // Usuario que creó el registro
    ];

    protected $casts = [
        'tags'           => 'array',      // JSON a Array
        'specifications' => 'array',      // JSON a Array
        'is_active'      => 'boolean',
    ];

    // ========================================
    // Relaciones
    // ========================================

    /**
     * Categoría del producto
     * Vista: Muestra en "Información General" > "Categoría"
     */
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * Marca del producto
     * Vista: Muestra en "Información General" > "Marca / Modelo"
     */
    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    /**
     * Unidades individuales de este producto
     * Vista: Lista en tabla "units-table" en modal de detalles
     */
    public function items()
    {
        return $this->hasMany(InventoryItem::class, 'item_parent_id');
    }
}
