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
        Schema::create('inventory_item_documents', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('inventory_item_id');
            $table->string('document_type', 50); // Manual, Datasheet, Warranty, Certificate, etc.
            $table->string('name', 255); // Nombre del documento
            $table->string('url', 500); // URL de Cloudinary
            $table->string('public_id', 255); // Public ID de Cloudinary para eliminar
            $table->text('notes')->nullable(); // Notas opcionales
            $table->integer('file_size')->nullable(); // Tamaño del archivo en bytes
            $table->string('mime_type', 100)->nullable(); // Tipo MIME (application/pdf, etc.)
            $table->unsignedBigInteger('uploaded_by')->nullable(); // Usuario que subió
            $table->timestamps();

            // Índices y llaves foráneas
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
        Schema::dropIfExists('inventory_item_documents');
    }
};
