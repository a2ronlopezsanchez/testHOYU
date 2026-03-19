<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('address_type', 20); // fiscal | physical
            $table->string('street', 255)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->string('neighborhood', 150)->nullable();
            $table->string('city', 150)->nullable();
            $table->string('state', 100)->nullable();
            $table->string('tax_regime', 10)->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['client_id', 'address_type']);
            $table->index('address_type');
            $table->index('tax_regime');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_addresses');
    }
};
