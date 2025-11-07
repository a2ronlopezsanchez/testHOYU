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
        Schema::create('rfid_tags', function (Blueprint $table) {
            $table->id();
                        // Relación lógica con inventory_items (sin FK, pero indexado)
            $table->unsignedBigInteger('item_id')->index();

            // Qué campos incluir (checkboxes)
            $table->boolean('include_item_name')->default(false);
            $table->boolean('include_category')->default(false);
            $table->boolean('include_brand_model')->default(false);
            $table->boolean('include_serial_number')->default(false);
            $table->boolean('include_purchase_date')->default(false);
            $table->boolean('include_condition')->default(false);

            // Flujo/estado
            // Recomendado: 'pending' | 'queued' | 'programmed' | 'failed'
            $table->string('status', 32)->default('pending')->index();
            $table->timestamps();

            $table->index(['item_id', 'status'], 'rfid_tags_item_status_idx');

        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('rfid_tags');
    }
};
