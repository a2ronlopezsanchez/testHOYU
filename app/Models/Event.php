<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Event extends Model
{
    protected $fillable = [
        'event_code','name','description',
        'start_date','end_date','event_start_time','event_end_time','setup_start_date','setup_start_time','teardown_end_date','teardown_end_time',
        'venue_name','venue_address','venue_lat','venue_lng',
        'event_type','priority','status','is_recurring','recurrence_rule',
        'client_id','client_name','client_contact','client_phone','client_email',
        'crew_size','notes','general_notes','advisor_notes','setup_notes','additional_notes','special_requirements','created_by',
    ];

    protected $casts = [
        'start_date'        => 'date',
        'end_date'          => 'date',
        'setup_start_date'  => 'date',
        'teardown_end_date' => 'date',
        'venue_lat'         => 'float',
        'venue_lng'         => 'float',
        'is_recurring'      => 'boolean',
        'recurrence_rule'   => 'array',
    ];


    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function contacts()
    {
        return $this->hasMany(EventContact::class);
    }

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
