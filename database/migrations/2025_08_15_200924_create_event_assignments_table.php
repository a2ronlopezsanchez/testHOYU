<?php
// database/migrations/2025_08_15_000002_create_event_assignments_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('event_assignments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('event_id')
                  ->constrained('events')
                  ->cascadeOnDelete();

            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->cascadeOnDelete();

            // Rango de asignación
            $table->date('assigned_from');
            $table->date('assigned_until');

            // Estado (texto libre, validas en app)
            $table->string('assignment_status', 20)->default('ASIGNADO'); // ASIGNADO | ENTREGADO | EN_USO | DEVUELTO | DAÑADO

            // Entrega/devolución
            $table->timestamp('delivered_at')->nullable();
            $table->string('delivered_by', 100)->nullable();
            $table->timestamp('returned_at')->nullable();
            $table->string('returned_by', 100)->nullable();
            $table->string('return_condition', 20)->nullable(); // EXCELENTE|BUENO|REGULAR|MALO|DAÑADO

            // Costos
            $table->decimal('rental_rate', 10, 2)->nullable();
            $table->decimal('total_cost', 10, 2)->nullable();

            $table->text('notes')->nullable();
            $table->text('damage_report')->nullable();

            $table->timestamps();

            // Índices básicos
            $table->index(['event_id']);
            $table->index(['inventory_item_id']);
            $table->index(['assigned_from', 'assigned_until']);
            $table->index(['assignment_status']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('event_assignments');
    }
};
