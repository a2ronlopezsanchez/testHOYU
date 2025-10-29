<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;   // ⬅️ importa

class Brand extends Model
{
    use HasFactory, SoftDeletes;
        protected $fillable = [
        'code',
        'name',
        'full_name',
        'website',
        'support_email',
        'support_phone',
        'logo_url',
        'is_active',
    ];
    protected static function booted()
    {
        // Antes del soft delete, cambia el code para liberar el UNIQUE
        static::deleting(function (Brand $brand) {
            if (! $brand->isForceDeleting()) {
                // Genera un code único corto basado en el ID (cabe en 20/50 chars)
                $base36 = strtoupper(base_convert((string) $brand->id, 10, 36));
                $brand->code = substr("DEL-{$base36}", 0, 50); // ajusta 50 si tu columna es de otro tamaño
                $brand->saveQuietly(); // guarda sin re-disparar eventos
            }
        });
    }
    public function items()
    {
        return $this->hasMany(InventoryItem::class);
    }
}
