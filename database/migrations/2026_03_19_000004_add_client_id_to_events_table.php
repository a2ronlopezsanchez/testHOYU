<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('client_id')->nullable()->after('status')->constrained('clients')->nullOnDelete();
            $table->index('client_id');
        });

        DB::table('events')
            ->whereNotNull('client_name')
            ->orderBy('id')
            ->get(['id', 'client_name'])
            ->each(function ($event) {
                $clientId = DB::table('clients')
                    ->where(function ($query) use ($event) {
                        $query->where('trade_name', $event->client_name)
                            ->orWhere('business_name', $event->client_name);
                    })
                    ->value('id');

                if ($clientId) {
                    DB::table('events')
                        ->where('id', $event->id)
                        ->update(['client_id' => $clientId]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('client_id');
        });
    }
};
