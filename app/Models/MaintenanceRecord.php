<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceRecord extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'maintenance_type','scheduled_date','actual_date','completion_date',
        'technician_name','vendor_name','labor_hours','labor_cost','parts_cost','total_cost',
        'work_description','parts_replaced','issues_found','recommendations',
        'maintenance_status','result_condition',
        'next_maintenance_date',
        'photos','documents',
        'created_by',
    ];

    protected $casts = [
        'scheduled_date'       => 'date',
        'actual_date'          => 'date',
        'completion_date'      => 'date',
        'next_maintenance_date'=> 'date',
        'labor_hours'          => 'float',
        'labor_cost'           => 'float',
        'parts_cost'           => 'float',
        'total_cost'           => 'float',
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
