<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeed extends Seeder
{
    public function run(): void
    {
        User::factory()->admin()->create([
            'name' => 'Administrador',
            'email' => 'admin@portal.com',
            'dni' => '12345678A',
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'name' => 'Usuario Demo',
            'email' => 'user@portal.com',
            'dni' => '11223344C',
            'role' => 'user',
            'status' => 'active',
            'password' => Hash::make('password'),
        ]);

        User::factory()->count(5)->create();

        User::factory()->inactive()->create([
            'name' => 'Usuario Inactivo',
            'email' => 'inactivo@portal.com',
            'dni' => '87654321B',
        ]);
    }
}
