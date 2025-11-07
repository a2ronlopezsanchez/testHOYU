<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RfidTag extends Model
{
    use HasFactory;

        protected $fillable = [
        'item_id',
        'include_item_name',
        'include_category',
        'include_brand_model',
        'include_serial_number',
        'include_purchase_date',
        'include_condition',
        'status'
        ];

         protected $casts = [
        'include_item_name'     => 'boolean',
        'include_category'      => 'boolean',
        'include_brand_model'   => 'boolean',
        'include_serial_number' => 'boolean',
        'include_purchase_date' => 'boolean',
        'include_condition'     => 'boolean',
         ];
}
