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
        Schema::create('inventory_item_images', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_item_id');
            $table->string('url')->comment('URL de la imagen en Cloudinary');
            $table->string('public_id')->comment('Public ID de Cloudinary para poder eliminar');
            $table->boolean('is_primary')->default(false)->comment('Indica si es la imagen principal');
            $table->integer('order')->default(0)->comment('Orden de visualización');
            $table->timestamps();

            // Foreign key
            $table->foreign('inventory_item_id')
                ->references('id')
                ->on('inventory_items')
                ->onDelete('cascade');

            // Index para mejorar búsquedas
            $table->index('inventory_item_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inventory_item_images');
    }
};
