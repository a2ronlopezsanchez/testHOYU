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
        Schema::create('brands', function (Blueprint $table) {
                        $table->id();
            $table->string('code', 20)->unique();      // :contentReference[oaicite:0]{index=0}
            $table->string('name', 100);
            $table->string('full_name', 200)->nullable();
            $table->string('website', 255)->nullable();
            $table->string('support_email', 255)->nullable();
            $table->string('support_phone', 50)->nullable();
            $table->string('logo_url', 500)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            // índices adicionales
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
        Schema::dropIfExists('brands');
    }
};
