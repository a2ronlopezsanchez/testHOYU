<?php
// database/migrations/2025_08_15_000004_create_inventory_movements_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->cascadeOnDelete();

            // Tipo y motivo (texto)
            $table->string('movement_type', 30);   // INGRESO | SALIDA | TRASLADO | ASIGNACION | DEVOLUCION | BAJA | AJUSTE
            $table->string('movement_reason', 50)->nullable();

            // Ubicaciones (FKs a locations)
            $table->foreignId('from_location_id')->nullable()->constrained('locations');
            $table->foreignId('to_location_id')->nullable()->constrained('locations');

            // Referencias
            $table->string('reference_type', 20)->nullable(); // EVENT | MAINTENANCE | MANUAL
            $table->unsignedBigInteger('reference_id')->nullable();

            // Fechas
            $table->date('movement_date')->nullable();
            $table->date('effective_date')->nullable();

            // Personal
            $table->string('performed_by', 100)->nullable();
            $table->string('authorized_by', 100)->nullable();

            $table->text('notes')->nullable();
            $table->integer('quantity')->default(1);

            $table->timestamp('created_at')->useCurrent();

            // Índices sencillos
            $table->index(['inventory_item_id']);
            $table->index(['movement_type']);
            $table->index(['movement_date']);
            $table->index(['from_location_id']);
            $table->index(['to_location_id']);
            $table->index(['reference_type', 'reference_id']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('inventory_movements');
    }
};