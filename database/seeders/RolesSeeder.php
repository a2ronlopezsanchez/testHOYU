<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $superAdminRole = Role::firstOrCreate(['name' => 'Superadministrador']);
        $adminRole = Role::firstOrCreate(['name' => 'Administrador']);

        $superAdminEmails = [
            'nach.diaz@happeningnm.com',
            'admin@demo.com',
        ];

        User::query()
            ->whereIn('email', $superAdminEmails)
            ->get()
            ->each(function (User $user) use ($superAdminRole): void {
                $user->syncRoles([$superAdminRole->name]);
            });

        User::query()
            ->whereNotIn('email', $superAdminEmails)
            ->get()
            ->each(function (User $user) use ($adminRole): void {
                $user->syncRoles([$adminRole->name]);
            });
    }
}
