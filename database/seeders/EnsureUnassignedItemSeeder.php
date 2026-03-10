<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\ItemParent;
use Illuminate\Database\Seeder;

class EnsureUnassignedItemSeeder extends Seeder
{
    public function run(): void
    {
        $category = Category::firstOrCreate(
            ['name' => 'SIN CATEGORIA'],
            [
                'code' => 'SC',
                'description' => 'Categoría para unidades sin asignar',
                'is_active' => true,
            ]
        );

        $brand = Brand::firstOrCreate(
            ['name' => 'SIN MARCA'],
            [
                'code' => 'SM',
                'full_name' => 'Sin Marca',
                'is_active' => true,
            ]
        );

        ItemParent::updateOrCreate(
            ['name' => 'SIN ASIGNAR'],
            [
                'public_name' => 'SIN ASIGNAR',
                'category_id' => $category->id,
                'brand_id' => $brand->id,
                'model' => 'SIN MODELO',
                'family' => null,
                'sub_family' => null,
                'color' => null,
                'is_active' => true,
                'created_by' => 1,
            ]
        );
    }
}
