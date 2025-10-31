<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Agrega campos faltantes identificados del formulario de inventario
     * y vista de detalles de items.
     */
    public function up(): void
    {
        // ========================================
        // ItemParent - Producto Padre
        // ========================================
        Schema::table('item_parents', function (Blueprint $table) {
            // Tab 1: Información Básica - Campo "Descripción"
            // Aparece en: Formulario > Tab "Información Básica" > Campo "Descripción"
            // Aparece en: Vista Detalle > Sección "Descripción"
            $table->text('description')->nullable()->after('color');

            // Tab 2: Especificaciones Técnicas - Array de especificaciones
            // Aparece en: Formulario > Tab "Especificaciones" > Lista dinámica de especificaciones
            // Aparece en: Vista Detalle > Sección "Especificaciones" (bullets con iconos de check)
            // Formato JSON: ["Potencia: 1000W", "Peso: 17.69 kg", "Dimensiones: 375 x 654 x 363 mm"]
            $table->json('specifications')->nullable()->after('description');
        });

        // ========================================
        // InventoryItem - Unidad Individual
        // ========================================
        Schema::table('inventory_items', function (Blueprint $table) {
            // Tab 3: Precios y Valores - Campo "Fecha de Compra"
            // Aparece en: Formulario > Tab "Precios y Valores" > Campo "Fecha de Compra"
            // Aparece en: Vista Detalle > Información General > "Fecha de Compra"
            $table->date('purchase_date')->nullable()->after('serial_number');

            // Tab 3: Precios y Valores - Proveedor de la Garantía
            // Aparece en: Vista Detalle > Información General > "Garantía"
            // Se muestra como: "Audio Pro (15/06/2024)"
            // Este campo almacena "Audio Pro"
            $table->string('warranty_provider')->nullable()->after('warranty_valid');

            // Tab 2: Especificaciones Técnicas - Campo "Total de Unidades"
            // Aparece en: Formulario > Tab "Especificaciones" > Campo "Total de Unidades"
            // Se usa cuando unit_set = 'SET' para indicar cuántas piezas componen el conjunto
            // Ejemplo: Un set de micrófonos con 4 unidades
            $table->integer('total_units')->default(1)->after('unit_set');

            // Descripción individual del item (opcional, si difiere del parent)
            // Aparece en: Vista Detalle > Sección "Descripción" (puede override la del parent)
            // Normalmente se usa la descripción del ItemParent, pero este campo permite
            // agregar detalles específicos de esta unidad individual
            $table->text('description')->nullable()->after('notes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_parents', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'specifications'
            ]);
        });

        Schema::table('inventory_items', function (Blueprint $table) {
            $table->dropColumn([
                'purchase_date',
                'warranty_provider',
                'total_units',
                'description'
            ]);
        });
    }
};
