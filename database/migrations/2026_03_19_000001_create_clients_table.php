<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('client_type', 20); // individual | company
            $table->string('status', 20)->default('prospect');
            $table->string('business_name', 200)->nullable();
            $table->string('trade_name', 200)->nullable();
            $table->string('first_name', 100)->nullable();
            $table->string('last_name', 100)->nullable();
            $table->string('middle_name', 100)->nullable();
            $table->string('rfc', 13)->unique();
            $table->string('industry', 150)->nullable();
            $table->text('notes')->nullable();
            $table->text('payment_terms')->nullable();
            $table->string('preferred_payment_method', 50)->nullable();
            $table->string('cfdi_use', 10)->nullable();
            $table->json('preferred_communication_channels')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('client_type');
            $table->index('status');
            $table->index(['business_name', 'trade_name']);
            $table->index(['first_name', 'last_name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
