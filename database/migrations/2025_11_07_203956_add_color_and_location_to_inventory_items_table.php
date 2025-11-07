<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->string('color', 120)->nullable();

            // Opción 1: URL del mapa (no index, puede ser larga)
            $table->string('location_url', 2048)->nullable();

            // Opción 2: Coordenadas (portables; valida rangos en app layer)
            $table->decimal('location_latitude', 10, 7)->nullable();
            $table->decimal('location_longitude', 10, 7)->nullable();

            // Índice útil para búsquedas geográficas simples por bbox o para filtrar no nulos
            $table->index(['location_latitude', 'location_longitude'], 'inventory_items_location_idx');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropIndex('inventory_items_location_idx');

            $table->dropColumn([
                'color',
                'location_url',
                'location_latitude',
                'location_longitude',
            ]);
        });
    }
};
