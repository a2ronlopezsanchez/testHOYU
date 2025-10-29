<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Event extends Model
{
    protected $fillable = [
        'event_code','name','description',
        'start_date','end_date','setup_start_date','teardown_end_date',
        'venue_name','venue_address','venue_lat','venue_lng',
        'event_type','priority','status',
        'client_name','client_contact','client_phone','client_email',
        'crew_size','notes','special_requirements','created_by',
    ];

    protected $casts = [
        'start_date'        => 'date',
        'end_date'          => 'date',
        'setup_start_date'  => 'date',
        'teardown_end_date' => 'date',
        'venue_lat'         => 'float',
        'venue_lng'         => 'float',
    ];

    public function assignments()
    {
        return $this->hasMany(EventAssignment::class);
    }

    // Útil para listar unidades ligadas a un evento
    public function items()
    {
        return $this->hasManyThrough(
            InventoryItem::class,
            EventAssignment::class,
            'event_id',          // FK en assignments -> events
            'id',                // PK en inventory_items
            'id',                // PK en events
            'inventory_item_id'  // FK en assignments -> inventory_items
        );
    }
}
