<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (! Schema::hasColumn('events', 'id_client')) {
                $table->unsignedBigInteger('id_client')->nullable()->after('status');
                $table->index('id_client');
            }
        });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            if (Schema::hasColumn('events', 'id_client')) {
                $table->dropIndex(['id_client']);
                $table->dropColumn('id_client');
            }
        });
    }
};
