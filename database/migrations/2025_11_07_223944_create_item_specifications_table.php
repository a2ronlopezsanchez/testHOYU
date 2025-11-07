<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Tabla para almacenar especificaciones técnicas de items de inventario.
     * Cada item puede tener múltiples especificaciones (ej: Potencia, Peso, Dimensiones)
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_specifications', function (Blueprint $table) {
            $table->id();

            // Relación con el item de inventario
            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->onDelete('cascade'); // Si se elimina el item, se eliminan sus especificaciones

            // Nombre de la especificación (ej: "Potencia", "Peso", "Dimensiones")
            $table->string('name', 100);

            // Valor de la especificación (ej: "1000W", "17.69 kg", "375 x 654 x 363 mm")
            $table->string('value', 255)->nullable();

            // Orden de visualización (para mantener el orden en que fueron agregadas)
            $table->integer('display_order')->default(0);

            $table->timestamps();

            // Índices para búsqueda
            $table->index('inventory_item_id');
            $table->index('name');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('item_specifications');
    }
};
