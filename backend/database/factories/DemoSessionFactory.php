<?php

namespace Database\Factories;

use App\Models\DemoSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<DemoSession> */
class DemoSessionFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'prompt' => fake()->paragraph(),
            'result' => ['summary' => 'Összefoglaló.', 'recommendation' => 'Megoldási javaslat.'],
            'model' => 'test-model',
            'idempotency_key' => fake()->uuid(),
        ];
    }
}
