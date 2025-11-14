<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemImage extends Model
{
    use HasFactory;
     
    protected $fillable = [
        'item_id',
        'name',
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
     * Relación lógica con InventoryItem (sin FK física)
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }
}
