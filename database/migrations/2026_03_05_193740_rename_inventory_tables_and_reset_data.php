<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (Schema::hasTable('item_parents') && !Schema::hasTable('items')) {
            Schema::rename('item_parents', 'items');
        }

        if (Schema::hasTable('inventory_items') && !Schema::hasTable('units')) {
            Schema::rename('inventory_items', 'units');
        }

        $this->truncateTable('units');
        $this->truncateTable('items');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('units') && !Schema::hasTable('inventory_items')) {
            Schema::rename('units', 'inventory_items');
        }

        if (Schema::hasTable('items') && !Schema::hasTable('item_parents')) {
            Schema::rename('items', 'item_parents');
        }
    }

    private function truncateTable(string $table): void
    {
        if (!Schema::hasTable($table)) {
            return;
        }

        $driver = DB::getDriverName();

        if ($driver === 'pgsql') {
            DB::statement('TRUNCATE TABLE "'.$table.'" RESTART IDENTITY CASCADE');
            return;
        }

        if ($driver === 'sqlite') {
            DB::table($table)->delete();
            return;
        }

        Schema::disableForeignKeyConstraints();
        DB::table($table)->truncate();
        Schema::enableForeignKeyConstraints();
    }
};
