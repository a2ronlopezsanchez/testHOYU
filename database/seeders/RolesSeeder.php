<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $admin = Role::create(['name' => 'Superadministrador']);
        
        $user = User::create([
            'name' => 'Administrador',
            'email' => 'admin@demo.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole('Superadministrador');

    }
}
