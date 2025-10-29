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
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();    // Código único :contentReference[oaicite:0]{index=0}
            $table->string('name', 100);             // Nombre legible
            $table->text('description')->nullable();
            $table->string('location_type', 20);     // Tipo con CHECK
            $table->unsignedBigInteger('parent_location_id')->nullable();
            $table->foreign('parent_location_id')
                  ->references('id')->on('locations')
                  ->onDelete('restrict');
            $table->text('address')->nullable();
            // Coordenadas GPS
            $table->string('coordinates')->nullable();
            $table->integer('capacity')->nullable();
            $table->boolean('is_virtual')->default(false); 
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // índices simples :contentReference[oaicite:1]{index=1}
            $table->index('code');
            $table->index('location_type');
            $table->index('parent_location_id');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('locations');
    }
};
