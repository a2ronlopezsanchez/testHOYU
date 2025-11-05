<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Hace nullable location_id y status para permitir guardar borradores
     * sin estos campos obligatorios. Cuando is_draft=true, estos campos
     * pueden ser NULL. Cuando is_draft=false, deben tener valores.
     */
    public function up(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Hacer location_id nullable
            // Primero eliminamos la foreign key constraint
            $table->dropForeign(['location_id']);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Modificar columna a nullable (compatible con PostgreSQL y MySQL)
            // Usamos unsignedBigInteger en lugar de foreignId para ->change()
            $table->unsignedBigInteger('location_id')->nullable()->change();
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Volvemos a agregar la foreign key constraint
            $table->foreign('location_id')
                  ->references('id')
                  ->on('locations')
                  ->onDelete('restrict');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Hacer status nullable (remover default también)
            $table->string('status', 20)->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Eliminar foreign key
            $table->dropForeign(['location_id']);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Restaurar location_id como NOT NULL
            $table->unsignedBigInteger('location_id')->nullable(false)->change();
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Volver a agregar foreign key
            $table->foreign('location_id')
                  ->references('id')
                  ->on('locations')
                  ->onDelete('restrict');
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            // Restaurar status con default
            $table->string('status', 20)->default('ACTIVO')->change();
        });
    }
};
