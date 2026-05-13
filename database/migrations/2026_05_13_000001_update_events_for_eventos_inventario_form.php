<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('status');
            $table->json('recurrence_rule')->nullable()->after('is_recurring');

            $table->time('event_start_time')->nullable()->after('end_date');
            $table->time('event_end_time')->nullable()->after('event_start_time');
            $table->time('setup_start_time')->nullable()->after('setup_start_date');
            $table->time('teardown_end_time')->nullable()->after('teardown_end_date');

            $table->text('general_notes')->nullable()->after('notes');
            $table->text('advisor_notes')->nullable()->after('general_notes');
            $table->text('setup_notes')->nullable()->after('advisor_notes');
            $table->text('additional_notes')->nullable()->after('setup_notes');
        });

        Schema::create('event_contacts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->cascadeOnDelete();
            $table->string('contact_type', 50)->nullable();
            $table->string('name', 150);
            $table->string('email', 150)->nullable();
            $table->string('phone', 60)->nullable();
            $table->text('notes')->nullable();
            $table->boolean('is_primary')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('event_contacts');

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn([
                'is_recurring',
                'recurrence_rule',
                'event_start_time',
                'event_end_time',
                'setup_start_time',
                'teardown_end_time',
                'general_notes',
                'advisor_notes',
                'setup_notes',
                'additional_notes',
            ]);
        });
    }
};
