<?php

namespace Database\Factories;

use App\Models\RequestM;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<RequestM>
 */
class RequestMFactory extends Factory
{
    protected $model = RequestM::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'date' => fake()->dateTimeBetween('-1 month', '+1 month')->format('Y-m-d'),
            'status' => 'pending',
            'document_path' => null,
            'signature_path' => null,
            'signed_at' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'signature_path' => null,
            'signed_at' => null,
        ]);
    }

    public function signed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'signed',
            'signature_path' => TestAssetFactory::storeSignature(),
            'signed_at' => fake()->dateTimeBetween('-1 month', 'now'),
        ]);
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
            'signature_path' => TestAssetFactory::storeSignature(),
            'signed_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
            'signature_path' => TestAssetFactory::storeSignature(),
            'signed_at' => fake()->dateTimeBetween('-2 months', '-1 week'),
        ]);
    }

    public function withDocument(): static
    {
        return $this->state(fn (array $attributes) => [
            'document_path' => TestAssetFactory::storeDocument(),
        ]);
    }
}
