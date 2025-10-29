<?php
// database/migrations/2025_08_15_000001_create_events_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->string('event_code', 50)->unique();
            $table->string('name', 200);
            $table->text('description')->nullable();

            // Fechas
            $table->date('start_date');
            $table->date('end_date');
            $table->date('setup_start_date')->nullable();
            $table->date('teardown_end_date')->nullable();

            // Lugar
            $table->string('venue_name', 200)->nullable();
            $table->text('venue_address')->nullable();
            $table->decimal('venue_lat', 10, 7)->nullable();
            $table->decimal('venue_lng', 10, 7)->nullable();

            // Clasificación (sin ENUM/CHECK)
            $table->string('event_type', 50)->default('EVENTO');     // EVENTO | MANTENIMIENTO | TRASLADO | INVENTARIO
            $table->string('priority', 20)->default('NORMAL');       // BAJA | NORMAL | ALTA | URGENTE
            $table->string('status', 20)->default('PLANIFICADO');    // PLANIFICADO | CONFIRMADO | EN_CURSO | COMPLETADO | CANCELADO

            // Cliente
            $table->string('client_name', 200)->nullable();
            $table->string('client_contact', 100)->nullable();
            $table->string('client_phone', 50)->nullable();
            $table->string('client_email', 100)->nullable();

            // Operativo
            $table->integer('crew_size')->nullable();
            $table->text('notes')->nullable();
            $table->text('special_requirements')->nullable();

            $table->unsignedBigInteger('created_by')->nullable();
            $table->timestamps(); // portable

            // Índices simples
            $table->index(['start_date', 'end_date']);
            $table->index('event_type');
            $table->index('status');
            $table->index('priority');
            $table->index('client_name');
        });
    }
    public function down(): void {
        Schema::dropIfExists('events');
    }
};
