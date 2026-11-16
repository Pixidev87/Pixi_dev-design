<?php

namespace Tests\Feature;

use App\Models\DemoSession;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Testing\TestResponse;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class DemoTest extends TestCase
{
    use RefreshDatabase;

    protected function beforeRefreshingDatabase(): void
    {
        if (DB::connection()->getDatabaseName() !== 'testing') {
            throw new RuntimeException('Database tests may only run against the testing database.');
        }
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ThrottleRequests::class);
        config(['services.anthropic.key' => 'test-key', 'services.anthropic.model' => 'test-model']);
        Http::preventStrayRequests();
    }

    /** @return array<string, mixed> */
    private function providerResponse(): array
    {
        return [
            'id' => 'msg_test', 'type' => 'message', 'role' => 'assistant', 'model' => 'test-model',
            'stop_reason' => 'end_turn',
            'content' => [['type' => 'text', 'text' => json_encode([
                'summary' => 'Túl sok kézi időpontegyeztetés.',
                'recommendation' => 'Online időpontfoglaló és automatikus visszaigazolás.',
            ], JSON_UNESCAPED_UNICODE)]],
        ];
    }

    private function login(?User $user = null): User
    {
        $user ??= User::factory()->create();
        $this->app['auth']->forgetGuards();
        $this->withToken($user->createToken('test')->plainTextToken);

        return $user;
    }

    private function runDemo(?string $key = null, string $prompt = 'Sok telefonos időpontegyeztetésem van.'): TestResponse
    {
        return $this->withHeader('Idempotency-Key', $key ?? (string) Str::uuid())
            ->postJson('/api/v1/demo', ['prompt' => $prompt]);
    }

    public function test_demo_requires_authentication(): void
    {
        $this->postJson('/api/v1/demo', ['prompt' => 'Weboldalt szeretnék.'])->assertUnauthorized();
        Http::assertNothingSent();
    }

    public function test_demo_requires_verified_email(): void
    {
        $this->login(User::factory()->unverified()->create());
        $this->runDemo()->assertForbidden();
        Http::assertNothingSent();
    }

    public function test_successful_demo_saves_result_and_consumes_one_use(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $user = $this->login();
        $response = $this->runDemo()->assertCreated()->assertJsonPath('meta.demo_uses_left', 4)
            ->assertJsonPath('data.result.summary', 'Túl sok kézi időpontegyeztetés.')
            ->assertJsonMissingPath('data.user_id')->assertJsonMissingPath('data.model');
        $this->assertSame(4, $user->fresh()->demo_uses_left);
        $this->assertDatabaseHas('demo_sessions', ['id' => $response->json('data.id'), 'user_id' => $user->id, 'model' => 'test-model']);
        Http::assertSentCount(1);
        Http::assertSent(fn (Request $request): bool => $request->url() === 'https://api.anthropic.com/v1/messages'
            && $request->hasHeader('x-api-key', 'test-key')
            && $request->hasHeader('anthropic-version', '2023-06-01')
            && $request['max_tokens'] === 1024
            && $request['output_config']['format']['type'] === 'json_schema'
            && ! str_contains($request->body(), $user->email)
        );
    }

    public function test_five_successes_exhaust_quota_and_the_sixth_does_not_call_claude(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $user = $this->login();
        for ($i = 4; $i >= 0; $i--) {
            $this->runDemo()->assertCreated()->assertJsonPath('meta.demo_uses_left', $i);
        }
        $this->runDemo()->assertForbidden()->assertJsonPath('code', 'demo_quota_exhausted')
            ->assertJsonPath('inquiry_url', '/api/v1/inquiries');
        $this->assertSame(0, $user->fresh()->demo_uses_left);
        $this->assertDatabaseCount('demo_sessions', 5);
        Http::assertSentCount(5);
    }

    public function test_same_key_replays_the_result_without_another_charge_even_at_zero_quota(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $user = $this->login();
        $user->forceFill(['demo_uses_left' => 1])->save();
        $key = (string) Str::uuid();
        $first = $this->runDemo($key)->assertCreated();
        $this->runDemo($key)->assertOk()->assertJsonPath('data.id', $first->json('data.id'))
            ->assertJsonPath('meta.demo_uses_left', 0);
        $this->assertDatabaseCount('demo_sessions', 1);
        Http::assertSentCount(1);
    }

    public function test_same_key_with_a_different_prompt_is_rejected(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $user = $this->login();
        $key = (string) Str::uuid();
        $this->runDemo($key)->assertCreated();
        $this->runDemo($key, 'Teljesen más problémát szeretnék megoldani.')->assertConflict();
        $this->assertSame(4, $user->fresh()->demo_uses_left);
        Http::assertSentCount(1);
    }

    public function test_idempotency_keys_are_scoped_to_the_user(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $key = (string) Str::uuid();
        $this->login();
        $first = $this->runDemo($key)->assertCreated();
        $this->login();
        $second = $this->runDemo($key)->assertCreated();
        $this->assertNotSame($first->json('data.id'), $second->json('data.id'));
        Http::assertSentCount(2);
    }

    public function test_missing_provider_configuration_preserves_quota(): void
    {
        $user = $this->login();
        config(['services.anthropic.key' => null]);
        $this->runDemo()->assertServiceUnavailable();
        $this->assertSame(5, $user->fresh()->demo_uses_left);
        $this->assertDatabaseCount('demo_sessions', 0);
        Http::assertNothingSent();
    }

    /** @return array<string, array{int}> */
    public static function upstreamErrors(): array
    {
        return ['unauthorized' => [401], 'rate limited' => [429], 'server error' => [500], 'redirect' => [302]];
    }

    #[DataProvider('upstreamErrors')]
    public function test_upstream_errors_preserve_quota_and_do_not_leak_provider_details(int $status): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response(['secret' => 'do-not-leak'], $status)]);
        $user = $this->login();
        $response = $this->runDemo()->assertServiceUnavailable();
        $this->assertStringNotContainsString('do-not-leak', $response->getContent());
        $this->assertSame(5, $user->fresh()->demo_uses_left);
        $this->assertDatabaseCount('demo_sessions', 0);
        Http::assertSentCount(1);
    }

    public function test_timeout_preserves_quota_and_the_same_key_can_be_retried(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::sequence()->pushFailedConnection()->push($this->providerResponse())]);
        $user = $this->login();
        $key = (string) Str::uuid();
        $this->runDemo($key)->assertServiceUnavailable();
        $this->assertSame(5, $user->fresh()->demo_uses_left);
        $this->runDemo($key)->assertCreated();
        $this->assertSame(4, $user->fresh()->demo_uses_left);
        $this->assertDatabaseCount('demo_sessions', 1);
    }

    /** @return array<string, array{string, mixed}> */
    public static function malformedOutputs(): array
    {
        return [
            'invalid JSON' => ['text', 'not-json'],
            'missing field' => ['text', '{"summary":"Only summary"}'],
            'wrong type' => ['text', '{"summary":1,"recommendation":"Suggestion"}'],
            'blank text' => ['text', '{"summary":" ","recommendation":"Suggestion"}'],
            'extra field' => ['text', '{"summary":"Text","recommendation":"Suggestion","secret":"extra"}'],
            'too long' => ['text', json_encode(['summary' => str_repeat('x', 1001), 'recommendation' => 'Suggestion'])],
            'refusal' => ['stop_reason', 'refusal'],
            'truncated' => ['stop_reason', 'max_tokens'],
            'no content' => ['content', []],
        ];
    }

    #[DataProvider('malformedOutputs')]
    public function test_malformed_or_incomplete_output_preserves_quota(string $field, mixed $value): void
    {
        $body = $this->providerResponse();
        if ($field === 'text') {
            $body['content'][0]['text'] = $value;
        } else {
            $body[$field] = $value;
        }
        Http::fake(['api.anthropic.com/*' => Http::response($body)]);
        $user = $this->login();
        $this->runDemo()->assertStatus(502);
        $this->assertSame(5, $user->fresh()->demo_uses_left);
        $this->assertDatabaseCount('demo_sessions', 0);
    }

    /** @return array<string, array{mixed}> */
    public static function invalidPrompts(): array
    {
        return ['empty' => [''], 'short' => ['short'], 'array' => [['bad']], 'too long' => [str_repeat('x', 3001)]];
    }

    #[DataProvider('invalidPrompts')]
    public function test_invalid_prompt_is_rejected_before_any_provider_call(mixed $prompt): void
    {
        $this->login();
        $this->withHeader('Idempotency-Key', (string) Str::uuid())->postJson('/api/v1/demo', ['prompt' => $prompt])
            ->assertUnprocessable()->assertJsonValidationErrors('prompt');
        Http::assertNothingSent();
    }

    public function test_a_valid_idempotency_header_is_required(): void
    {
        $this->login();
        $this->postJson('/api/v1/demo', ['prompt' => 'Weboldalt szeretnék.'])->assertUnprocessable()
            ->assertJsonValidationErrors('idempotency_key');
        $this->withHeader('Idempotency-Key', 'invalid')->postJson('/api/v1/demo', ['prompt' => 'Weboldalt szeretnék.'])
            ->assertUnprocessable()->assertJsonValidationErrors('idempotency_key');
        Http::assertNothingSent();
    }

    public function test_results_can_only_be_read_by_their_verified_owner(): void
    {
        $session = DemoSession::factory()->create();
        $this->getJson('/api/v1/demo/'.$session->id)->assertUnauthorized();
        $this->login();
        $this->getJson('/api/v1/demo/'.$session->id)->assertNotFound();
        $this->login($session->user);
        $this->getJson('/api/v1/demo/'.$session->id)->assertOk()->assertJsonPath('data.id', $session->id);
        Http::assertNothingSent();
    }

    public function test_an_inquiry_can_reference_the_verified_users_own_demo(): void
    {
        Mail::fake();
        $session = DemoSession::factory()->create();
        $user = $this->login($session->user);
        $this->postJson('/api/v1/inquiries', [
            'name' => $user->name, 'email' => $user->email,
            'description' => $session->result['recommendation'], 'demo_session_id' => $session->id,
        ])->assertCreated();
        $this->assertDatabaseHas('inquiries', ['demo_session_id' => $session->id]);
    }

    public function test_a_foreign_demo_cannot_be_attached_to_an_inquiry(): void
    {
        Mail::fake();
        $session = DemoSession::factory()->create();
        $user = $this->login();
        $this->postJson('/api/v1/inquiries', [
            'name' => $user->name, 'email' => $user->email,
            'description' => 'Ajánlatot szeretnék.', 'demo_session_id' => $session->id,
        ])->assertUnprocessable()->assertJsonValidationErrors('demo_session_id');
        $this->assertDatabaseCount('inquiries', 0);
        Mail::assertNothingOutgoing();
    }

    public function test_guest_cannot_attach_a_demo_to_an_inquiry(): void
    {
        $this->postJson('/api/v1/inquiries', [
            'name' => 'Teszt', 'email' => 'test@example.com', 'description' => 'Ajánlatot szeretnék.', 'demo_session_id' => 1,
        ])->assertUnauthorized();
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_database_failure_after_provider_success_rolls_back_result_and_quota(): void
    {
        Http::fake(['api.anthropic.com/*' => Http::response($this->providerResponse())]);
        $user = $this->login();
        DemoSession::created(function (): void {
            throw new RuntimeException('Simulated persistence failure');
        });
        try {
            $this->runDemo()->assertServerError();
            $this->assertSame(5, $user->fresh()->demo_uses_left);
            $this->assertDatabaseCount('demo_sessions', 0);
            Http::assertSentCount(1);
        } finally {
            DemoSession::flushEventListeners();
        }
    }

    public function test_unverified_user_cannot_attach_a_demo_to_an_inquiry(): void
    {
        $session = DemoSession::factory()->create();
        $session->user->markEmailAsUnverified();
        $this->login($session->user->fresh());
        $this->postJson('/api/v1/inquiries', [
            'name' => 'Teszt', 'email' => 'test@example.com',
            'description' => 'Ajánlatot szeretnék.', 'demo_session_id' => $session->id,
        ])->assertForbidden();
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_unknown_demo_cannot_be_attached_to_an_inquiry(): void
    {
        Mail::fake();
        $this->login();
        $this->postJson('/api/v1/inquiries', [
            'name' => 'Teszt', 'email' => 'test@example.com',
            'description' => 'Ajánlatot szeretnék.', 'demo_session_id' => 999,
        ])->assertUnprocessable()->assertJsonValidationErrors('demo_session_id');
        $this->assertDatabaseCount('inquiries', 0);
    }

    public function test_demo_requests_are_rate_limited(): void
    {
        $this->withMiddleware(ThrottleRequests::class);
        $this->login();
        for ($i = 0; $i < 10; $i++) {
            $this->postJson('/api/v1/demo', ['prompt' => 'short'])->assertUnprocessable();
        }
        $this->runDemo()->assertTooManyRequests();
        Http::assertNothingSent();
    }
}
