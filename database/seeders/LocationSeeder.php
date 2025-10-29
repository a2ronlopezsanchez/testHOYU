<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class LocationSeeder extends Seeder
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
        DB::table('locations')->insert([
            [
                'code'               => 'ALM_PRINCIPAL',
                'name'               => 'Almacén Principal',
                'location_type'      => 'ALMACEN',
                'is_virtual'         => false,
                'created_at'         => $now,
                'updated_at'         => $now,
            ]
        ]); 
    }
}
