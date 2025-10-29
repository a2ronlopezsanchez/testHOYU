<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;

class BrandSeeder extends Seeder
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
        DB::table('brands')->insert([
            ['code'=>'ELECTROVOICE',      
            'name'=>'ELECTROVOICE',        
            'full_name'=>null,                             
            'website'=>null,
            'is_active'=>true, 
            'created_at'=>$now, 
            'updated_at'=>$now],
        ]);           
    }
}
