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
        Schema::create('item_parents', function (Blueprint $table) {
            $table->id();
            // Nombre(s) del ítem padre
            $table->string('name', 500);               // nombre “maestro”
            $table->string('public_name', 200)->nullable();

            // Relación a catálogos (padre)
            $table->foreignId('category_id')->constrained()->onDelete('restrict');
            $table->foreignId('brand_id')->constrained()->onDelete('restrict');

            // Especificaciones (padre)
            $table->string('model', 100)->nullable();
            $table->string('family', 150)->nullable();
            $table->string('sub_family', 150)->nullable();
            $table->string('color', 50)->nullable();

            // Tags a nivel padre (si los usas para búsqueda)
            $table->json('tags')->nullable();

            // Estado general
            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            // Índices útiles
            $table->index(['category_id','brand_id']);
            $table->index('name');
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::disableForeignKeyConstraints();
        Schema::dropIfExists('item_parents');
        Schema::enableForeignKeyConstraints();
    }
};
