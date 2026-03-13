<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::firstOrCreate(
            ['email' => 'nach.diaz@happeningnm.com'],
            [
                'name' => 'Nach Díaz',
                'password' => Hash::make('123456'),
            ]
        );

        if (!$user->hasRole('Superadministrador')) {
            $user->assignRole('Superadministrador');
        }
    }
}
