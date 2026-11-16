<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use RuntimeException;
use Tests\TestCase;

class InquiryIdempotencyTest extends TestCase
{
    use RefreshDatabase;

    protected function beforeRefreshingDatabase(): void
    {
        if (DB::connection()->getDatabaseName() !== 'testing') {
            throw new RuntimeException('Only the testing database is allowed.');
        }
    }

    public function test_retries_create_one_inquiry_and_one_email(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
        $payload = ['name' => 'Teszt Elek', 'email' => 'test@example.com', 'description' => 'Egy új weboldalt szeretnék.'];
        $this->withHeader('Idempotency-Key', '38f44f36-3d7b-4adf-a7ad-2a7bec93d0fd');
        $first = $this->postJson('/api/v1/inquiries', $payload)->assertCreated();
        $this->postJson('/api/v1/inquiries', $payload)->assertOk()->assertJsonPath('data.id', $first->json('data.id'));
        $this->assertDatabaseCount('inquiries', 1);
        Mail::assertQueuedCount(1);
    }

    public function test_same_key_cannot_be_used_for_a_different_inquiry(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
        $payload = ['name' => 'Teszt', 'email' => 'test@example.com', 'description' => 'Egy új weboldalt szeretnék.'];
        $this->withHeader('Idempotency-Key', '38f44f36-3d7b-4adf-a7ad-2a7bec93d0fd');
        $this->postJson('/api/v1/inquiries', $payload)->assertCreated();
        $this->postJson('/api/v1/inquiries', [...$payload, 'description' => 'Másik kérés.'])->assertConflict();
        $this->assertDatabaseCount('inquiries', 1);
        Mail::assertQueuedCount(1);
    }

    public function test_invalid_key_is_rejected_without_saving(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        Mail::fake();
        $this->withHeader('Idempotency-Key', 'invalid')->postJson('/api/v1/inquiries', [
            'name' => 'Teszt', 'email' => 'test@example.com', 'description' => 'Egy új weboldalt szeretnék.',
        ])->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');
        $this->assertDatabaseCount('inquiries', 0);
        Mail::assertNothingOutgoing();
    }
}
