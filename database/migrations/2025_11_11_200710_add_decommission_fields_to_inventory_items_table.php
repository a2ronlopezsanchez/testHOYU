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
        Schema::table('inventory_items', function (Blueprint $table) {
            // Campos para dar de baja
            $table->string('decommission_reason', 50)->nullable()->after('notes');
            $table->text('decommission_notes')->nullable()->after('decommission_reason');
            $table->foreignId('decommissioned_by')->nullable()->after('decommission_notes')
                  ->constrained('users')->onDelete('set null');
            $table->timestamp('decommissioned_at')->nullable()->after('decommissioned_by');

            // Soft deletes (si no existe ya)
            if (!Schema::hasColumn('inventory_items', 'deleted_at')) {
                $table->softDeletes()->after('decommissioned_at');
            }

            // Índices para mejorar consultas
            $table->index('decommission_reason');
            $table->index('decommissioned_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('inventory_items', function (Blueprint $table) {
            // Eliminar índices
            $table->dropIndex(['decommission_reason']);
            $table->dropIndex(['decommissioned_at']);

            // Eliminar foreign key
            $table->dropForeign(['decommissioned_by']);

            // Eliminar columnas
            $table->dropColumn([
                'decommission_reason',
                'decommission_notes',
                'decommissioned_by',
                'decommissioned_at',
            ]);

            // Solo si se agregó en esta migración
            if (Schema::hasColumn('inventory_items', 'deleted_at')) {
                $table->dropSoftDeletes();
            }
        });
    }
};
