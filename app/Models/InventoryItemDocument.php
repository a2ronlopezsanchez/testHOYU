<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItemDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'inventory_item_id',
        'document_type',
        'name',
        'url',
        'public_id',
        'notes',
        'file_size',
        'mime_type',
        'uploaded_by'
    ];

    /**
     * Relación con InventoryItem
     */
    public function inventoryItem()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /**
     * Usuario que subió el documento
     */
    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
