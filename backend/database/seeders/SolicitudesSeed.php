<?php

namespace Database\Seeders;

use App\Models\RequestM;
use App\Models\User;
use Database\Factories\TestAssetFactory;
use Illuminate\Database\Seeder;

class SolicitudesSeed extends Seeder
{
    public function run(): void
    {
        $users = User::where('role', 'user')->where('status', 'active')->get();
        $documentPath = $this->copyExampleDocument();

        foreach ($users as $index => $user) {
            RequestM::factory()
                ->count(2)
                ->pending()
                ->for($user)
                ->create();

            RequestM::factory()->signed()->for($user)->create();
            RequestM::factory()->approved()->for($user)->create();
            RequestM::factory()->rejected()->for($user)->create();

            if ($index === 0) {
                RequestM::factory()->approved()->for($user)->create([
                    'title' => 'Solicitud de software',
                    'description' => 'Solicitud de licencia de software con documentación adjunta.',
                    'document_path' => $documentPath,
                ]);
            }
        }
    }

    private function copyExampleDocument(): string
    {
        return TestAssetFactory::storeDocument('requests/documents/solicitud-software-ejemplo.pdf');
    }
}
