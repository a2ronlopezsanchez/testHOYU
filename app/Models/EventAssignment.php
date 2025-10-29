<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EventAssignment extends Model
{
    protected $fillable = [
        'event_id','inventory_item_id',
        'assigned_from','assigned_until',
        'assignment_status',
        'delivered_at','delivered_by',
        'returned_at','returned_by','return_condition',
        'rental_rate','total_cost',
        'notes','damage_report',
    ];

    protected $casts = [
        'assigned_from' => 'date',
        'assigned_until'=> 'date',
        'delivered_at'  => 'datetime',
        'returned_at'   => 'datetime',
        'rental_rate'   => 'float',
        'total_cost'    => 'float',
    ];

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    /** Scope simple para detectar solapes (úsalo antes de crear/actualizar) */
    public function scopeOverlaps($query, int $inventoryItemId, string $from, string $until)
    {
        return $query->where('inventory_item_id', $inventoryItemId)
            ->whereDate('assigned_until', '>=', $from)
            ->whereDate('assigned_from', '<=', $until)
            ->whereNotIn('assignment_status', ['DEVUELTO','CANCELADO']);
    }
}
