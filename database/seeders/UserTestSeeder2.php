<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use App\Models\User;

class UserTestSeeder2 extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $user1 = User::create([
            'name' => 'JUAN CARLOS JUAREZ',
            'email' => 'j.juarez@blackproduction.com.mx',
            'password' => Hash::make('Temporal-BP-2026'),
        ]);
        $user1->assignRole('Superadministrador');

        $user2 = User::create([
            'name' => 'STEPH ESPARZA',
            'email' => 's.esparza@blackproduction.com.mx',
            'password' => Hash::make('Temporal-BP-2026'),
        ]);
        $user2->assignRole('Superadministrador');

        $user3 = User::create([
            'name' => ' JUAN PABLO RAMIREZ',
            'email' => 'p.ramirez@blackproduction.com.mx',
            'password' => Hash::make('Temporal-BP-2026'),
        ]);
        $user3->assignRole('Superadministrador');
    }
}
