<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItemImage extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'url',
        'public_id',
        'is_primary',
        'order'
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'order' => 'integer'
    ];

    /**
     * Relación con InventoryItem
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
