<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class UpdateBrandCategoryCodes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'inventory:update-codes {--force : Forzar actualización de todos los codes, incluso los existentes}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Actualiza los codes de brands y categories usando el sistema de auto-generación inteligente';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $force = $this->option('force');

        $this->info('🔄 Iniciando actualización de codes...');
        $this->newLine();

        // Actualizar Categories
        $this->info('📁 Actualizando Categories...');
        $categoriesUpdated = $this->updateCategories($force);
        $this->info("   ✅ {$categoriesUpdated} categorías actualizadas");
        $this->newLine();

        // Actualizar Brands
        $this->info('🏷️  Actualizando Brands...');
        $brandsUpdated = $this->updateBrands($force);
        $this->info("   ✅ {$brandsUpdated} marcas actualizadas");
        $this->newLine();

        $this->info('✨ Proceso completado exitosamente!');
        return Command::SUCCESS;
    }

    /**
     * Actualiza los codes de las categorías
     *
     * @param bool $force
     * @return int Número de categorías actualizadas
     */
    private function updateCategories(bool $force): int
    {
        $query = Category::query();

        if (!$force) {
            // Solo actualizar categorías sin code o con codes largos (> 4 caracteres)
            $query->where(function ($q) {
                $q->whereNull('code')
                  ->orWhere('code', '')
                  ->orWhereRaw('LENGTH(code) > 4');
            });
        }

        $categories = $query->get();
        $updated = 0;

        foreach ($categories as $category) {
            $oldCode = $category->code;
            $newCode = $this->generateUniqueCode($category->name, 'categories', $category->id);

            if ($oldCode !== $newCode) {
                $category->code = $newCode;
                $category->save();
                $this->line("   • {$category->name}: '{$oldCode}' → '{$newCode}'");
                $updated++;
            }
        }

        return $updated;
    }

    /**
     * Actualiza los codes de las marcas
     *
     * @param bool $force
     * @return int Número de marcas actualizadas
     */
    private function updateBrands(bool $force): int
    {
        $query = Brand::query();

        if (!$force) {
            // Solo actualizar marcas sin code o con codes largos (> 4 caracteres)
            $query->where(function ($q) {
                $q->whereNull('code')
                  ->orWhere('code', '')
                  ->orWhereRaw('LENGTH(code) > 4');
            });
        }

        $brands = $query->get();
        $updated = 0;

        foreach ($brands as $brand) {
            $oldCode = $brand->code;
            $newCode = $this->generateUniqueCode($brand->name, 'brands', $brand->id);

            if ($oldCode !== $newCode) {
                $brand->code = $newCode;
                $brand->save();
                $this->line("   • {$brand->name}: '{$oldCode}' → '{$newCode}'");
                $updated++;
            }
        }

        return $updated;
    }

    /**
     * Genera un code único basado en el nombre
     * Igual al método en BrandController/CategoryController
     *
     * @param string $name Nombre de la categoría/marca
     * @param string $table Nombre de la tabla para verificar unicidad
     * @param int|null $excludeId ID a excluir de la verificación (para updates)
     * @return string Code único generado
     */
    private function generateUniqueCode(string $name, string $table, ?int $excludeId = null): string
    {
        // Limpiar el nombre: solo letras y espacios, en mayúsculas
        $cleanName = strtoupper(preg_replace('/[^A-Za-zÑñ\s]/', '', $name));
        $cleanName = trim($cleanName);

        if (empty($cleanName)) {
            // Fallback si el nombre no tiene letras
            return 'X' . rand(1000, 9999);
        }

        // Intentar con longitudes incrementales: 1, 2, 3...
        $maxLength = min(strlen($cleanName), 10); // máximo 10 caracteres

        for ($length = 1; $length <= $maxLength; $length++) {
            $candidate = substr($cleanName, 0, $length);

            // Verificar si este code ya existe
            $query = DB::table($table)
                ->where('code', $candidate)
                ->whereNull('deleted_at');

            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            $exists = $query->exists();

            if (!$exists) {
                return $candidate;
            }
        }

        // Si llegamos aquí, incluso el nombre completo está ocupado
        // Agregar un número al final
        $baseName = substr($cleanName, 0, $maxLength);
        $counter = 1;

        while ($counter < 1000) {
            $candidate = $baseName . $counter;

            $query = DB::table($table)
                ->where('code', $candidate)
                ->whereNull('deleted_at');

            if ($excludeId) {
                $query->where('id', '!=', $excludeId);
            }

            $exists = $query->exists();

            if (!$exists) {
                return $candidate;
            }
            $counter++;
        }

        // Último recurso: timestamp
        return $baseName . time();
    }
}
