<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ItemParent extends Model
{
    use HasFactory;
        
    protected $table = 'item_parents';
    protected $fillable = [
        'name','public_name','category_id','brand_id',
        'model','family','sub_family','color','tags',
        'is_active','created_by'
    ];
    protected $casts = ['tags'=>'array','is_active'=>'boolean'];

    public function category(){ return $this->belongsTo(Category::class); }
    public function brand()   { return $this->belongsTo(Brand::class); }
    public function items()   { return $this->hasMany(InventoryItem::class, 'item_parent_id'); }
}
