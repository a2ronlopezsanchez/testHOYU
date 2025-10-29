<?php
// database/migrations/2025_08_15_000003_create_maintenance_records_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('maintenance_records', function (Blueprint $table) {
            $table->id();

            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->cascadeOnDelete();

            // Tipos/estados libres (valídalos en app)
            $table->string('maintenance_type', 50); // PREVENTIVO, CORRECTIVO, etc.
            $table->date('scheduled_date')->nullable();
            $table->date('actual_date');
            $table->date('completion_date')->nullable();

            // Personal y costos
            $table->string('technician_name', 100)->nullable();
            $table->string('vendor_name', 100)->nullable();
            $table->decimal('labor_hours', 5,2)->nullable();
            $table->decimal('labor_cost', 10,2)->nullable();
            $table->decimal('parts_cost', 10,2)->nullable();
            $table->decimal('total_cost', 10,2)->nullable();

            // Detalle
            $table->text('work_description');
            $table->text('parts_replaced')->nullable();
            $table->text('issues_found')->nullable();
            $table->text('recommendations')->nullable();

            $table->string('maintenance_status', 20)->default('PROGRAMADO');
            $table->string('result_condition', 20)->nullable();

            $table->date('next_maintenance_date')->nullable();

            // Para máxima portabilidad, como TEXT (puedes guardar JSON string)
            $table->text('photos')->nullable();
            $table->text('documents')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps();

            $table->index(['inventory_item_id']);
            $table->index(['maintenance_type']);
            $table->index(['actual_date']);
            $table->index(['maintenance_status']);
            $table->index(['next_maintenance_date']);
        });
    }
    public function down(): void {
        Schema::dropIfExists('maintenance_records');
    }
};
