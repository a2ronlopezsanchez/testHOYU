<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Location;
use App\Models\ItemParent;
use App\Models\InventoryItem;
use Illuminate\Support\Str;

class InventoryCSVImportSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ruta al archivo CSV
        $csvPath = database_path('seeders/data/inventory_data.csv');

        if (!file_exists($csvPath)) {
            $this->command->error("❌ No se encontró el archivo CSV en: {$csvPath}");
            $this->command->info("Por favor, coloca tu archivo CSV exportado desde Excel en: database/seeders/data/inventory_data.csv");
            return;
        }

        $this->command->info("📂 Leyendo archivo CSV...");

        $file = fopen($csvPath, 'r');

        // Leer headers
        $headers = fgetcsv($file);

        if (!$headers) {
            $this->command->error("❌ No se pudieron leer los headers del CSV");
            fclose($file);
            return;
        }

        $this->command->info("✓ Headers encontrados: " . implode(', ', array_slice($headers, 0, 5)) . "...");

        $rowNumber = 1; // Empezamos en 1 porque la fila 0 son los headers
        $created = 0;
        $skipped = 0;
        $errors = 0;

        // Procesar cada fila
        while (($row = fgetcsv($file)) !== false) {
            $rowNumber++;

            try {
                // Combinar headers con valores para crear array asociativo
                $data = array_combine($headers, $row);

                // Mapear los datos del CSV al formato que usa nuestro seeder
                $mappedData = $this->mapCSVRow($data);

                // Crear el item
                $result = $this->createInventoryItem($mappedData);

                if ($result === 'created') {
                    $created++;
                } elseif ($result === 'skipped') {
                    $skipped++;
                }

                // Mostrar progreso cada 100 registros
                if ($rowNumber % 100 === 0) {
                    $this->command->info("📊 Procesados: {$rowNumber} | Creados: {$created} | Omitidos: {$skipped} | Errores: {$errors}");
                }

            } catch (\Exception $e) {
                $errors++;
                $this->command->error("❌ Error en fila {$rowNumber}: " . $e->getMessage());

                // Si hay demasiados errores consecutivos, detener
                if ($errors > 50) {
                    $this->command->error("⚠️ Demasiados errores. Deteniendo importación.");
                    break;
                }
            }
        }

        fclose($file);

        // Resumen final
        $this->command->info("\n" . str_repeat('=', 60));
        $this->command->info("✅ Importación completada");
        $this->command->info("📊 Resumen:");
        $this->command->info("   • Total de filas procesadas: " . ($rowNumber - 1));
        $this->command->info("   • Items creados: {$created}");
        $this->command->info("   • Items omitidos (ya existían): {$skipped}");
        $this->command->info("   • Errores: {$errors}");
        $this->command->info(str_repeat('=', 60));
    }

    /**
     * Mapea una fila del CSV al formato esperado
     */
    private function mapCSVRow(array $csvRow): array
    {
        // Mapeo de columnas del CSV
        // Ajusta estos nombres según los headers exactos de tu CSV
        return [
            'nombre_tecnico' => $csvRow['NOMBRE TECNICO'] ?? $csvRow['NOMBRE_TECNICO'] ?? '',
            'categoria' => $csvRow['CATEGORIA'] ?? '',
            'marca' => $csvRow['MARCA'] ?? '',
            'modelo' => $csvRow['MODELO'] ?? null,
            'familia' => $csvRow['FAMILIA'] ?? null,
            'sub_familia' => $csvRow['SUB FAMILIA'] ?? $csvRow['SUB_FAMILIA'] ?? null,
            'nombre_usuario' => $csvRow['NOMBRE PARA USUARIO'] ?? $csvRow['NOMBRE_USUARIO'] ?? '',
            'color' => $csvRow['COLOR'] ?? null,
            'sku' => $csvRow['SKU'] ?? '',
            'item_id' => $csvRow['ID'] ?? '',
            'etiquetado' => $csvRow['ETIQUETADO'] ?? 'NO',
            'comentarios' => $csvRow['COMENTARIOS'] ?? $csvRow['COMENTARIO'] ?? 'BIEN',
            'status' => $csvRow['STATUS'] ?? 'ACTIVO',
            'ubicacion' => $csvRow['UBICACION'] ?? 'INDIVIDUAL',
            'units_set' => $csvRow['UNITS/SET'] ?? $csvRow['UNITS_SET'] ?? 'INDIVIDUAL',
            'rack' => !empty($csvRow['RACK']) ? $csvRow['RACK'] : null,
            'panel' => !empty($csvRow['PANEL']) ? $csvRow['PANEL'] : null,
            'identificador' => $csvRow['IDENTIFICADOR'] ?? null,
            'numero_garantia_vip' => $csvRow['NUMERO DE GARANTIA VIP'] ?? $csvRow['NUMERO_GARANTIA_VIP'] ?? null,
            'precio_original' => $this->parsePrice($csvRow['PRECIO ORIGINAL'] ?? $csvRow['PRECIO_ORIGINAL'] ?? '0'),
            'precio_reciente' => $this->parsePrice($csvRow['PRECIO RECIENTE'] ?? $csvRow['PRECIO_RECIENTE'] ?? '0'),
            'precio_renta' => $this->parsePrice($csvRow['PRECIO RENTA'] ?? $csvRow['PRECIO_RENTA'] ?? '0'),
            'minimo' => !empty($csvRow['MINIMO']) ? $this->parsePrice($csvRow['MINIMO']) : null,
        ];
    }

    /**
     * Convierte un precio con formato a decimal
     */
    private function parsePrice($price): float
    {
        if (empty($price)) {
            return 0.00;
        }

        // Remover símbolos de moneda, comas, espacios
        $cleaned = preg_replace('/[^0-9.]/', '', $price);

        return (float) $cleaned;
    }

    /**
     * Crea o encuentra una marca y retorna su ID
     */
    private function getOrCreateBrand(string $brandName): int
    {
        if (empty($brandName)) {
            throw new \Exception('El nombre de la marca no puede estar vacío');
        }

        $brand = Brand::firstOrCreate(
            ['name' => strtoupper(trim($brandName))],
            [
                'code' => $this->generateBrandCode($brandName),
                'full_name' => ucwords(strtolower(trim($brandName))),
                'is_active' => true,
            ]
        );

        return $brand->id;
    }

    /**
     * Genera un código único para la marca
     */
    private function generateBrandCode(string $brandName): string
    {
        $baseCode = strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($brandName)), 0, 10));
        $code = $baseCode;
        $counter = 1;

        while (Brand::where('code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Crea o encuentra una categoría y retorna su ID
     */
    private function getOrCreateCategory(string $categoryName): int
    {
        if (empty($categoryName)) {
            throw new \Exception('El nombre de la categoría no puede estar vacío');
        }

        $category = Category::firstOrCreate(
            ['name' => strtoupper(trim($categoryName))],
            [
                'code' => $this->generateCategoryCode($categoryName),
                'description' => 'Categoría de ' . ucwords(strtolower(trim($categoryName))),
                'is_active' => true,
            ]
        );

        return $category->id;
    }

    /**
     * Genera un código único para la categoría
     */
    private function generateCategoryCode(string $categoryName): string
    {
        $baseCode = strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($categoryName)), 0, 10));
        $code = $baseCode;
        $counter = 1;

        while (Category::where('code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Crea o encuentra una ubicación y retorna su ID
     */
    private function getOrCreateLocation(string $locationName): int
    {
        if (empty($locationName)) {
            $locationName = 'ALMACEN GENERAL';
        }

        $location = Location::firstOrCreate(
            ['name' => strtoupper(trim($locationName))],
            [
                'code' => $this->generateLocationCode($locationName),
                'location_type' => 'warehouse',
                'description' => 'Ubicación ' . ucwords(strtolower(trim($locationName))),
                'is_active' => true,
            ]
        );

        return $location->id;
    }

    /**
     * Genera un código único para la ubicación
     */
    private function generateLocationCode(string $locationName): string
    {
        $baseCode = strtoupper(substr(preg_replace('/[^A-Z0-9]/', '', strtoupper($locationName)), 0, 10));
        $code = $baseCode;
        $counter = 1;

        while (Location::where('code', $code)->exists()) {
            $code = $baseCode . $counter;
            $counter++;
        }

        return $code;
    }

    /**
     * Crea o encuentra un ItemParent y retorna su ID
     */
    private function getOrCreateItemParent(array $row): int
    {
        $brandId = $this->getOrCreateBrand($row['marca']);
        $categoryId = $this->getOrCreateCategory($row['categoria']);

        // Buscar si ya existe un ItemParent con esta combinación
        $itemParent = ItemParent::where('name', $row['nombre_tecnico'])
            ->where('brand_id', $brandId)
            ->where('category_id', $categoryId)
            ->first();

        if (!$itemParent) {
            $itemParent = ItemParent::create([
                'name' => $row['nombre_tecnico'],
                'public_name' => $row['nombre_usuario'] ?? null,
                'category_id' => $categoryId,
                'brand_id' => $brandId,
                'model' => $row['modelo'] ?? null,
                'family' => $row['familia'] ?? null,
                'sub_family' => $row['sub_familia'] ?? null,
                'color' => $row['color'] ?? null,
                'is_active' => true,
            ]);
        }

        return $itemParent->id;
    }

    /**
     * Crea un InventoryItem completo
     * Retorna 'created', 'skipped' o lanza excepción
     */
    private function createInventoryItem(array $row): string
    {
        // Validar datos requeridos
        if (empty($row['sku']) || empty($row['item_id'])) {
            throw new \Exception("SKU o ID vacío");
        }

        // Verificar si ya existe por SKU o item_id
        $exists = InventoryItem::where('sku', $row['sku'])
            ->orWhere('item_id', $row['item_id'])
            ->exists();

        if ($exists) {
            return 'skipped';
        }

        // Obtener/crear relaciones
        $itemParentId = $this->getOrCreateItemParent($row);
        $locationId = $this->getOrCreateLocation($row['ubicacion'] ?? 'ALMACEN GENERAL');

        // Crear el item de inventario
        InventoryItem::create([
            'sku' => $row['sku'],
            'item_id' => $row['item_id'],
            'name' => $row['nombre_tecnico'],
            'public_name' => $row['nombre_usuario'] ?? null,
            'item_parent_id' => $itemParentId,
            'location_id' => $locationId,
            'unit_set' => $this->mapUnitSet($row['units_set'] ?? 'INDIVIDUAL'),
            'rack_position' => $row['rack'] ?? null,
            'panel_position' => $row['panel'] ?? null,
            'rfid_tag' => $row['etiquetado'] === 'SI' ? $row['identificador'] ?? null : null,
            'serial_number' => $row['numero_garantia_vip'] ?? null,
            'status' => $this->mapStatus($row['status'] ?? 'ACTIVO'),
            'condition' => $this->mapCondition($row['comentarios'] ?? 'BUENO'),
            'original_price' => $row['precio_original'] ?? 0,
            'ideal_rental_price' => $row['precio_renta'] ?? 0,
            'minimum_rental_price' => $row['minimo'] ?? null,
            'warranty_valid' => !empty($row['numero_garantia_vip']),
            'notes' => $row['comentarios'] ?? null,
            'color' => $row['color'] ?? null,
            'is_active' => true,
            'is_draft' => false,
        ]);

        return 'created';
    }

    /**
     * Mapea el valor de units_set a un valor válido
     */
    private function mapUnitSet(?string $value): string
    {
        if (empty($value)) {
            return 'UNIT';
        }

        $mapping = [
            'INDIVIDUAL' => 'UNIT',
            'UNIDAD' => 'UNIT',
            'SET' => 'SET',
            'CONJUNTO' => 'SET',
            'PAR' => 'PAIR',
            'PAIR' => 'PAIR',
        ];

        return $mapping[strtoupper($value)] ?? 'UNIT';
    }

    /**
     * Mapea el status a un valor válido
     */
    private function mapStatus(?string $value): string
    {
        if (empty($value)) {
            return 'ACTIVO';
        }

        if (stripos($value, 'COMPLETO') !== false) {
            return 'ACTIVO';
        }

        $mapping = [
            'ACTIVO' => 'ACTIVO',
            'DISPONIBLE' => 'DISPONIBLE',
            'EN USO' => 'EN_USO',
            'EN MANTENIMIENTO' => 'MANTENIMIENTO',
            'MANTENIMIENTO' => 'MANTENIMIENTO',
            'DAÑADO' => 'DAÑADO',
            'BAJA' => 'BAJA',
        ];

        return $mapping[strtoupper($value)] ?? 'ACTIVO';
    }

    /**
     * Mapea la condición a un valor válido
     */
    private function mapCondition(?string $value): string
    {
        if (empty($value)) {
            return 'BUENO';
        }

        $mapping = [
            'BIEN' => 'BUENO',
            'BUENO' => 'BUENO',
            'EXCELENTE' => 'EXCELENTE',
            'REGULAR' => 'REGULAR',
            'MALO' => 'MALO',
            'DAÑADO' => 'DAÑADO',
        ];

        return $mapping[strtoupper($value)] ?? 'BUENO';
    }
}
