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
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->string('sku', 20)->unique();
            $table->string('item_id', 20)->unique();
            $table->string('name', 500);
            $table->string('public_name', 200)->nullable();

            // Relaciones
            $table->foreignId('item_parent_id')
                  ->constrained('item_parents')
                  ->onDelete('restrict');
            $table->foreignId('location_id')->constrained()->onDelete('restrict');//padre
            
            // Información física
            $table->string('unit_set', 10)->default('UNIT');
            $table->string('rack_position', 50)->nullable();
            $table->string('panel_position', 50)->nullable();
            $table->string('rfid_tag', 50)->nullable();
            $table->string('serial_number', 100)->nullable();

            // Estados y condiciones
            $table->string('status', 20)->default('ACTIVO');
            $table->string('condition', 20)->default('BUENO');

            // Información financiera
            $table->decimal('original_price', 10, 2)->nullable();
            $table->decimal('ideal_rental_price', 10, 2)->nullable();
            $table->decimal('minimum_rental_price', 10, 2)->nullable();

            // Garantía y mantenimiento
            $table->boolean('warranty_valid')->default(false);
            $table->date('warranty_expiry')->nullable();
            $table->date('last_maintenance')->nullable();
            $table->date('next_maintenance')->nullable();
            $table->integer('maintenance_interval_days')->default(365);

            // Imágenes y documentos
            $table->string('image_url', 500)->nullable();
            $table->string('manual_url', 500)->nullable();
            $table->string('datasheet_url', 500)->nullable();

            // Metadatos
            $table->text('notes')->nullable();

            $table->json('tags')->nullable();

            $table->boolean('is_active')->default(true);
            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            // Índices simples
            $table->index('sku');
            $table->index('item_id');
            $table->index('location_id');
            $table->index('status');
            $table->index('condition');
            $table->index('is_active');
            $table->index('next_maintenance');
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
            // si existe la FK, elimínala (nombre por convención)
            if (Schema::hasColumn('inventory_items', 'item_parent_id')) {
                // O bien:
                $table->dropConstrainedForeignId('item_parent_id');
                // Si te pide nombre explícito:
                // $table->dropForeign('inventory_items_item_parent_id_foreign');
                // $table->dropColumn('item_parent_id'); // (solo si agregaste la columna en esta misma migración)
            }
        });

        Schema::dropIfExists('inventory_items');
    }
};
