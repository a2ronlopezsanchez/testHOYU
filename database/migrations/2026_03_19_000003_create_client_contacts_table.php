<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('client_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->string('contact_role', 20)->nullable(); // primary | alternate | additional
            $table->string('full_name', 150);
            $table->string('job_title', 150)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 50)->nullable();
            $table->string('whatsapp', 50)->nullable();
            $table->string('birthday', 5)->nullable(); // DD/MM
            $table->boolean('is_primary')->default(false);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('contact_role');
            $table->index('is_primary');
            $table->index('sort_order');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_contacts');
    }
};
