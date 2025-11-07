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
        Schema::create('item_images', function (Blueprint $table) {
            $table->id();
            // Relación lógica con inventory_items (sin FK)
            $table->unsignedBigInteger('item_id')->index();

            // Nombre descriptivo (opcional): "Frontal", "Interior", etc.
            $table->string('name', 150)->nullable();

            // URL absoluta o relativa de la imagen
            $table->string('url', 2048);

            $table->timestamps();

            // Índice compuesto útil para búsquedas por item y nombre
            $table->index(['item_id', 'name']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('item_images');
    }
};
