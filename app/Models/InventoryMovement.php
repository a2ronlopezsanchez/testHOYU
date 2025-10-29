<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryMovement extends Model
{
    // Solo tiene created_at por DB, sin updated_at
    public $timestamps = false;

    protected $fillable = [
        'inventory_item_id',
        'movement_type','movement_reason',
        'from_location_id','to_location_id',
        'reference_type','reference_id',
        'movement_date','effective_date',
        'performed_by','authorized_by',
        'notes','quantity','created_at',
    ];

    protected $casts = [
        'movement_date'  => 'date',
        'effective_date' => 'date',
        'quantity'       => 'int',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function fromLocation()
    {
        return $this->belongsTo(Location::class, 'from_location_id');
    }

    public function toLocation()
    {
        return $this->belongsTo(Location::class, 'to_location_id');
    }
}
