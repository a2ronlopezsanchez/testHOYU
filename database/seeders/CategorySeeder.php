<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        date_default_timezone_set('Etc/GMT+6');
        $now = Carbon::now();
        DB::table('categories')->insert([
            [
                'code'        => 'AUDIO',
                'name'        => 'AUDIO',
                'description' => 'Equipos de sonido y amplificación',
                'icon'        => 'speaker',
                'color'       => '#2196F3',
                'sort_order'  => 0,
                'is_active'   => true,
                'created_at'  => $now,
                'updated_at'  => $now,
            ]
        ]);
    }
}
