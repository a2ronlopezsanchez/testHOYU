<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class InventoryItemsSeeder extends Seeder
{
    public function run()
    {
        $now = Carbon::now();

        // 1) Asegurar CATEGORÍA y MARCA
        $categoryId = DB::table('categories')->where('code', 'AUDIO')->value('id');
        if (!$categoryId) {
            $categoryId = DB::table('categories')->insertGetId([
                'code'       => 'AUDIO',
                'name'       => 'Audio',
                'is_active'  => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $brandId = DB::table('brands')->where('code', 'ELECTROVOICE')->value('id');
        if (!$brandId) {
            $brandId = DB::table('brands')->insertGetId([
                'code'       => 'ELECTROVOICE',
                'name'       => 'Electrovoice',
                'full_name'  => 'Electro-Voice',
                'website'    => 'https://electrovoice.com',
                'is_active'  => true,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        // 2) Crear/actualizar ITEM PADRE y obtener su ID
        $parentKey = [
            'name'        => 'AMPLIFICADOR | ELECTROVOICE | P3000',
            'public_name' => 'Amplificador :: Electrovoice | P3000',
            'category_id' => $categoryId,
            'brand_id'    => $brandId,
            'model'       => 'P3000',
            'family'      => 'AMPLIFICADOR',
            'sub_family'  => '-',
            'color'       => 'NEGRO',
        ];

        DB::table('item_parents')->updateOrInsert(
            $parentKey,
            [
                'tags'       => json_encode([]),
                'is_active'  => true,
                'created_by' => null,
                'updated_at' => $now,
                'created_at' => $now,
            ]
        );

        $parentId = DB::table('item_parents')->where($parentKey)->value('id');

        // 3) Ubicación base
        $locationId = DB::table('locations')->where('code', 'ALM_PRINCIPAL')->value('id');

        // 4) Items (hijos)
        $items = [
            [
                'item_parent_id'           => $parentId,
                'sku'                      => 'BP966184',
                'item_id'                  => 'AE001',
                // si tu tabla hija aún tiene estas columnas, déjalas:
                'name'                     => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE001',
                'public_name'              => 'Amplificador :: Electrovoice | P3000',

                'location_id'              => $locationId,
                'unit_set'                 => 'INDIVIDUAL',
                'rack_position'            => null,
                'panel_position'           => null,
                'rfid_tag'                 => null,
                'serial_number'            => 'COLOCAR COMPLETO',
                'status'                   => 'ACTIVO',
                'condition'                => 'BUENO',
                'original_price'           => 0.00,
                'ideal_rental_price'       => 0.00,
                'minimum_rental_price'     => 0.00,
                'warranty_valid'           => false,
                'warranty_expiry'          => null,
                'last_maintenance'         => null,
                'next_maintenance'         => null,
                'maintenance_interval_days'=> 365,
                'image_url'                => null,
                'manual_url'               => null,
                'datasheet_url'            => null,
                'notes'                    => null,
                'tags'                     => json_encode([]),
                'is_active'                => true,
                'created_by'               => null,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],
            [
                'item_parent_id'           => $parentId,
                'sku'                      => 'BP453617',
                'item_id'                  => 'AE002',
                'name'                     => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE002',
                'public_name'              => 'Amplificador :: Electrovoice | P3000',
                'location_id'              => $locationId,
                'unit_set'                 => 'INDIVIDUAL',
                'rack_position'            => null,
                'panel_position'           => null,
                'rfid_tag'                 => null,
                'serial_number'            => 'COLOCAR COMPLETO',
                'status'                   => 'ACTIVO',
                'condition'                => 'BUENO',
                'original_price'           => 0.00,
                'ideal_rental_price'       => 0.00,
                'minimum_rental_price'     => 0.00,
                'warranty_valid'           => false,
                'warranty_expiry'          => null,
                'last_maintenance'         => null,
                'next_maintenance'         => null,
                'maintenance_interval_days'=> 365,
                'image_url'                => null,
                'manual_url'               => null,
                'datasheet_url'            => null,
                'notes'                    => null,
                'tags'                     => json_encode([]),
                'is_active'                => true,
                'created_by'               => null,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],
            [
                'item_parent_id'           => $parentId,
                'sku'                      => 'BP812762',
                'item_id'                  => 'AE003',
                'name'                     => 'AMPLIFICADOR | ELECTROVOICE | P3000 | ID AE003',
                'public_name'              => 'Amplificador :: Electrovoice | P3000',
                'location_id'              => $locationId,
                'unit_set'                 => 'INDIVIDUAL',
                'rack_position'            => null,
                'panel_position'           => null,
                'rfid_tag'                 => null,
                'serial_number'            => 'COLOCAR COMPLETO',
                'status'                   => 'ACTIVO',
                'condition'                => 'BUENO',
                'original_price'           => 0.00,
                'ideal_rental_price'       => 0.00,
                'minimum_rental_price'     => 0.00,
                'warranty_valid'           => false,
                'warranty_expiry'          => null,
                'last_maintenance'         => null,
                'next_maintenance'         => null,
                'maintenance_interval_days'=> 365,
                'image_url'                => null,
                'manual_url'               => null,
                'datasheet_url'            => null,
                'notes'                    => null,
                'tags'                     => json_encode([]),
                'is_active'                => true,
                'created_by'               => null,
                'created_at'               => $now,
                'updated_at'               => $now,
            ],
        ];

        DB::table('inventory_items')->insert($items);
    }
}
