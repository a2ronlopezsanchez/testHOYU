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
        Schema::create('specifications', function (Blueprint $table) {
            $table->id();
              // Relación lógica a inventory_items (sin foreign key)
            $table->unsignedBigInteger('item_id')->index();
            
            // Nombre de la especificación, ejemplo: "Motor", "Transmisión", "Potencia"
            $table->string('name', 150);
            
            // Valor de la especificación, ejemplo: "2.0L Turbo", "Automática", "250 HP"
            $table->string('value', 255);
            
            $table->timestamps();

            // Opcional: índice combinado útil para búsquedas
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
        Schema::dropIfExists('specifications');
    }
};
