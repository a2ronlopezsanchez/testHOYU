<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    use HasFactory;
    protected $fillable = [
        'code',
        'name',
        'description',
        'location_type',
        'parent_location_id',
        'address',
        'coordinates',
        'capacity',
        'is_virtual',
        'is_active',
    ];

    public function parent()
    {
        return $this->belongsTo(Location::class, 'parent_location_id');
    }

    public function children()
    {
        return $this->hasMany(Location::class, 'parent_location_id');
    }

    public function items()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
