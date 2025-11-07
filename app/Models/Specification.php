<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Specification extends Model
{
    use HasFactory;

    protected $fillable = [
        'item_id',
        'name',
        'value',
    ];

    /**
     * Relación lógica con InventoryItem
     * (sin FK en BD, pero útil en Eloquent)
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }
}
