<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Location;
use App\Models\ItemParent;
use App\Models\InventoryItem;
use Illuminate\Support\Str;

class InventoryDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Array de datos desde tu Excel
        // Cada elemento representa una fila de tu Excel
        $data = [
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE001',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#35617',
                'item_id' => 'AE001',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE002',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#37762',
                'item_id' => 'AE002',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE004',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#88727',
                'item_id' => 'AE004',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE005',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#36826',
                'item_id' => 'AE005',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE006',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#37223',
                'item_id' => 'AE006',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE007',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#38755',
                'item_id' => 'AE007',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE008',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#36335',
                'item_id' => 'AE008',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE009',
                'categoria' => 'AUDIO',
                'marca' => 'ELECTROVOICE',
                'modelo' => 'P3000',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Electrovoice - P3000',
                'color' => 'NEGRO',
                'sku' => 'BP#31137',
                'item_id' => 'AE009',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 740.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | CAMEO | VORTEX-3 | ID AC001',
                'categoria' => 'AUDIO',
                'marca' => 'CAMEO',
                'modelo' => 'VORTEX-3',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Cameo - Vortex-3',
                'color' => 'NEGRO',
                'sku' => 'BV#48158',
                'item_id' => 'AC001',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 940.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'AMPLIFICADOR | CROWN | MIROTECH 2400 | ID AC002',
                'categoria' => 'AUDIO',
                'marca' => 'CROWN',
                'modelo' => 'MIROTECH 2400',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'AMPLIFICADOR',
                'nombre_usuario' => 'Amplificador - Crown - Mirotech 2400',
                'color' => 'NEGRO',
                'sku' => 'BP#65953',
                'item_id' => 'AC002',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 50.00,
                'precio_reciente' => 50.00,
                'precio_renta' => 930.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'BACKLINE | A BF001',
                'categoria' => 'BACKLINE',
                'marca' => 'FENDER',
                'modelo' => 'TWIN REVERB',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'GUITARRA',
                'nombre_usuario' => 'Amplificador de Guitarra :: F NEGRO',
                'color' => 'NEGRO',
                'sku' => 'BP#89957',
                'item_id' => 'AC 091863',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 0.00,
                'precio_reciente' => 0.00,
                'precio_renta' => 1580.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'BACKLINE | A BV001',
                'categoria' => 'BACKLINE',
                'marca' => 'VOX',
                'modelo' => 'AC30C2',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'GUITARRA',
                'nombre_usuario' => 'Amplificador de Guitarra :: F NEGRO',
                'color' => 'NEGRO',
                'sku' => 'BP#77062',
                'item_id' => 'O08-023807',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 0.00,
                'precio_reciente' => 0.00,
                'precio_renta' => 1580.00,
                'minimo' => null,
            ],
            [
                'nombre_tecnico' => 'BACKLINE | A BF002',
                'categoria' => 'BACKLINE',
                'marca' => 'FENDER',
                'modelo' => 'DEVILLE',
                'familia' => 'AMPLIFICADOR',
                'sub_familia' => 'GUITARRA',
                'nombre_usuario' => 'Amplificador de Guitarra :: F NEGRO',
                'color' => 'NEGRO',
                'sku' => 'BP#86796',
                'item_id' => 'B-566231',
                'etiquetado' => 'SI',
                'comentarios' => 'BIEN',
                'status' => 'COLOCAR COMPLETO',
                'ubicacion' => 'INDIVIDUAL',
                'units_set' => 'INDIVIDUAL',
                'rack' => null,
                'panel' => null,
                'identificador' => null,
                'numero_garantia_vip' => null,
                'precio_original' => 0.00,
                'precio_reciente' => 0.00,
                'precio_renta' => 1050.00,
                'minimo' => null,
            ],
        ];

        foreach ($data as $row) {
            $this->createInventoryItem($row);
        }

        $this->command->info('✅ Datos de inventario importados exitosamente');
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
            // Ubicación por defecto si no se especifica
            $locationName = 'ALMACEN GENERAL';
        }

        $location = Location::firstOrCreate(
            ['name' => strtoupper(trim($locationName))],
            [
                'code' => $this->generateLocationCode($locationName),
                'location_type' => 'warehouse', // warehouse, office, event, etc.
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
     */
    private function createInventoryItem(array $row): void
    {
        // Verificar si ya existe por SKU o item_id
        $exists = InventoryItem::where('sku', $row['sku'])
            ->orWhere('item_id', $row['item_id'])
            ->exists();

        if ($exists) {
            $this->command->warn("⊘ Omitido (ya existe): {$row['sku']} - {$row['item_id']}");
            return;
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
            'original_price' => $row['precio_original'] ?? null,
            'ideal_rental_price' => $row['precio_renta'] ?? null,
            'minimum_rental_price' => $row['minimo'] ?? null,
            'warranty_valid' => !empty($row['numero_garantia_vip']),
            'notes' => $row['comentarios'] ?? null,
            'color' => $row['color'] ?? null,
            'is_active' => true,
            'is_draft' => false,
        ]);

        $this->command->info("✓ Creado: {$row['sku']} - {$row['nombre_usuario']}");
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

        // Si contiene "COMPLETO" es ACTIVO
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
