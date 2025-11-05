<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Agrega campo is_draft para implementar sistema de autoguardado
     * con borradores en el formulario de inventario.
     */
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Campo para marcar si el item está en modo borrador (autoguardado)
            // o si ya fue guardado finalmente con validación completa
            //
            // true  = Borrador (autoguardado automático, puede tener campos vacíos)
            // false = Guardado final (validación completa de campos obligatorios)
            //
            // Ubicación: Después de is_active para mantener campos de control juntos
            $table->boolean('is_draft')->default(true)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn('is_draft');
        });
    }
};
