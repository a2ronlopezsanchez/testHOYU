<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('event_assignments', function (Blueprint $table) {
            $table->decimal('hours_used', 8, 2)->nullable()->after('total_cost')->comment('Total de horas de uso del equipo');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_assignments', function (Blueprint $table) {
            $table->dropColumn('hours_used');
        });
    }
};
