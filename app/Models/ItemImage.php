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
    ];

    /**
     * Relación lógica con InventoryItem (sin FK física)
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }
}
