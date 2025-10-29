<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Category extends Model
{
    use HasFactory;
    use SoftDeletes;
    protected static function booted()
    {
        static::deleting(function (Category $cat) {
            // Solo en soft delete (no forceDelete)
            if (! $cat->isForceDeleting()) {
                // genera un code único corto: DEL-<ID en base36>
                $base36 = strtoupper(base_convert((string)$cat->id, 10, 36));
                $cat->code = substr("DEL-{$base36}", 0, 20); // cabe en VARCHAR(20)
                $cat->saveQuietly(); // evita re-disparar eventos/validaciones
            }
        });
    }
    protected $fillable = [
        'code',
        'name',
        'description',
        'icon',
        'color',
        'sort_order',
        'is_active',
    ];

    public function items()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
