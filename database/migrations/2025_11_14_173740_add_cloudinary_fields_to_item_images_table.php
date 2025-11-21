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
        Schema::table('item_images', function (Blueprint $table) {
            $table->string('public_id')->nullable()->after('url')->comment('Public ID de Cloudinary para poder eliminar');
            $table->boolean('is_primary')->default(false)->after('public_id')->comment('Indica si es la imagen principal');
            $table->integer('order')->default(0)->after('is_primary')->comment('Orden de visualización');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('item_images', function (Blueprint $table) {
            $table->dropColumn(['public_id', 'is_primary', 'order']);
        });
    }
};
