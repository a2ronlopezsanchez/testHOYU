<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Crea una ubicación especial "PENDIENTE" que se usa como placeholder
     * para items en borrador que aún no tienen ubicación o status asignados.
     *
     * Cuando is_draft=true → location_id y status pueden ser PENDIENTE
     * Cuando is_draft=false → NO pueden ser PENDIENTE (validación en Controller)
     */
    public function up(): void
    {
        // Insertar ubicación especial PENDIENTE
        DB::table('locations')->insertOrIgnore([
            'name' => 'PENDIENTE',
            'description' => 'Ubicación temporal para items en borrador sin ubicación asignada',
            'is_active' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // No necesitamos modificar la tabla - usamos status='PENDIENTE' como valor
        // Esto evita problemas de compatibilidad con PostgreSQL
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Eliminar ubicación PENDIENTE
        DB::table('locations')->where('name', 'PENDIENTE')->delete();
    }
};
