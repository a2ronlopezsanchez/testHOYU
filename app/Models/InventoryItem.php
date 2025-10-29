<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;
    protected $fillable = [
        'sku',
        'item_id',
        'name',
        'public_name',
        'item_parent_id',
        'location_id',
        'unit_set',
        'rack_position',
        'panel_position',
        'rfid_tag',
        'serial_number',
        'status',
        'condition',
        'original_price',
        'ideal_rental_price',
        'minimum_rental_price',
        'warranty_valid',
        'warranty_expiry',
        'last_maintenance',
        'next_maintenance',
        'maintenance_interval_days',
        'image_url',
        'manual_url',
        'datasheet_url',
        'notes',
        'tags',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'warranty_valid'           => 'boolean',
        'warranty_expiry'          => 'date',
        'last_maintenance'         => 'date',
        'next_maintenance'         => 'date',
        'maintenance_interval_days'=> 'integer',
        'original_price'           => 'decimal:2',
        'ideal_rental_price'       => 'decimal:2',
        'minimum_rental_price'     => 'decimal:2',
        'tags'                     => 'array',     // funciona para JSON en MySQL o text[] en Postgres
        'is_active'                => 'boolean',
    ];
    public function parent()
    {
        return $this->belongsTo(ItemParent::class, 'item_parent_id');
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }
    
    public function assignments()
    {
        return $this->hasMany(EventAssignment::class, 'inventory_item_id');
    }

    public function maintenanceRecords()
    {
        return $this->hasMany(MaintenanceRecord::class, 'inventory_item_id');
    }

    public function movements()
    {
        return $this->hasMany(InventoryMovement::class, 'inventory_item_id');
    }
}
