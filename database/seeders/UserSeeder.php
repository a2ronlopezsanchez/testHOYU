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
        $superAdminUsers = [
            [
                'name' => 'Nach Díaz',
                'email' => 'nach.diaz@happeningnm.com',
                'password' => '123456',
            ],
            [
                'name' => 'Administrador Demo',
                'email' => 'admin@demo.com',
                'password' => '12345678',
            ],
        ];

        foreach ($superAdminUsers as $superAdminData) {
            $user = User::updateOrCreate(
                ['email' => $superAdminData['email']],
                [
                    'name' => $superAdminData['name'],
                    'password' => Hash::make($superAdminData['password']),
                ]
            );

            $user->syncRoles(['Superadministrador']);
        }

        User::query()
            ->whereNotIn('email', array_column($superAdminUsers, 'email'))
            ->get()
            ->each(function (User $user): void {
                $user->syncRoles(['Administrador']);
            });
    }
}
