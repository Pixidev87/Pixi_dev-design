<?php

namespace Tests\Feature;

use App\Models\User;
use App\Notifications\VerifyEmailNotification;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Tests\TestCase;

class AuthFlowTest extends TestCase
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
    }

    /** @return array<string, string> */
    private function registration(): array
    {
        return [
            'name' => 'Teszt Elek', 'email' => 'elek@example.com',
            'password' => 'Pixi-password-123', 'password_confirmation' => 'Pixi-password-123',
        ];
    }

    private function signedUrl(User $user, int $minutes = 60, ?string $hash = null): string
    {
        return URL::temporarySignedRoute('verification.verify', now()->addMinutes($minutes), [
            'user' => $user->id, 'hash' => $hash ?? sha1($user->email),
        ]);
    }

    private function token(User $user): string
    {
        return $user->createToken('test', ['*'], now()->addDay())->plainTextToken;
    }

    public function test_registration_saves_a_hashed_password_and_five_uses_and_queues_verification(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/register', $this->registration());
        $response->assertCreated()->assertJsonPath('data.demo_uses_left', 5)
            ->assertJsonPath('data.email_verified_at', null)
            ->assertJsonMissingPath('data.password')->assertJsonMissingPath('data.remember_token');

        $user = User::findOrFail($response->json('data.id'));
        $this->assertTrue(Hash::check('Pixi-password-123', $user->password));
        $this->assertNotSame('Pixi-password-123', $user->password);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        Notification::assertSentTo($user, VerifyEmailNotification::class);
        Notification::assertCount(1);
    }

    public function test_registration_rejects_invalid_email(): void
    {
        Notification::fake();
        $this->postJson('/api/v1/register', [...$this->registration(), 'email' => 'invalid'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 0);
        Notification::assertNothingSent();
    }

    /** @return array<string, array{string, mixed}> */
    public static function invalidRegistration(): array
    {
        return [
            'name missing' => ['name', null],
            'name too long' => ['name', str_repeat('x', 151)],
            'email missing' => ['email', null],
            'email array' => ['email', ['bad']],
            'password too short' => ['password', 'short'],
            'password too many bytes' => ['password', str_repeat('á', 40)],
            'password null byte' => ['password', "valid-password\0suffix"],
            'confirmation mismatch' => ['password_confirmation', 'different'],
            'self verified' => ['email_verified_at', '2026-11-16'],
            'self awarded uses' => ['demo_uses_left', 100],
        ];
    }

    #[DataProvider('invalidRegistration')]
    public function test_invalid_registration_creates_no_user_or_mail(string $field, mixed $value): void
    {
        Notification::fake();
        $payload = [...$this->registration(), $field => $value];
        if ($field === 'password') {
            $payload['password_confirmation'] = $value;
        }
        $this->postJson('/api/v1/register', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors($field === 'password_confirmation' ? 'password' : $field);
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('jobs', 0);
        Notification::assertNothingSent();
    }

    public function test_emails_are_normalized_and_duplicate_registration_is_rejected(): void
    {
        Notification::fake();
        $this->postJson('/api/v1/register', [...$this->registration(), 'email' => '  ELEK@EXAMPLE.COM  '])
            ->assertCreated()->assertJsonPath('data.email', 'elek@example.com');
        $this->postJson('/api/v1/register', $this->registration())
            ->assertUnprocessable()->assertJsonValidationErrors('email');
        $this->assertDatabaseCount('users', 1);
        Notification::assertCount(1);
    }

    public function test_notification_queue_failure_rolls_back_registration(): void
    {
        Notification::shouldReceive('send')->once()->andThrow(new RuntimeException('Queue unavailable'));
        $this->postJson('/api/v1/register', $this->registration())->assertServerError();
        $this->assertDatabaseCount('users', 0);
        $this->assertDatabaseCount('jobs', 0);
    }

    public function test_database_worker_delivers_a_hungarian_verification_email_with_a_valid_link(): void
    {
        $transport = Mail::mailer('array')->getSymfonyTransport();
        $this->postJson('/api/v1/register', $this->registration())->assertCreated();
        $this->assertDatabaseHas('jobs', ['queue' => 'inquiry-mail']);
        $this->artisan('queue:work', [
            'connection' => 'inquiry-mail', '--queue' => 'inquiry-mail', '--once' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('jobs', 0);
        $this->assertDatabaseCount('failed_jobs', 0);
        $this->assertCount(1, $transport->messages());
        $message = $transport->messages()->first()->getOriginalMessage();
        $this->assertSame('elek@example.com', $message->getTo()[0]->getAddress());
        $this->assertStringContainsString('Erősítsd meg', $message->getSubject());
        $html = $message->getHtmlBody();
        preg_match('~href="([^"]*/api/v1/email/verify/[^"]+)"~', $html, $matches);
        $this->assertArrayHasKey(1, $matches);
        $this->get(html_entity_decode($matches[1]))->assertOk();
        $this->assertTrue(User::firstOrFail()->hasVerifiedEmail());
    }

    public function test_login_issues_a_hashed_expiring_token_and_me_requires_verification(): void
    {
        $user = User::factory()->unverified()->create(['email' => 'elek@example.com', 'password' => 'Pixi-password-123']);
        $response = $this->postJson('/api/v1/login', ['email' => 'ELEK@EXAMPLE.COM', 'password' => 'Pixi-password-123']);
        $response->assertOk()->assertJsonPath('data.token_type', 'Bearer')->assertJsonStructure(['data' => ['token', 'expires_at']]);
        $token = $response->json('data.token');
        $stored = $user->tokens()->firstOrFail();
        $this->assertSame(hash('sha256', explode('|', $token, 2)[1]), $stored->token);
        $this->assertTrue($stored->expires_at->between(now()->addHours(23), now()->addHours(25)));

        $this->app['auth']->forgetGuards();
        $this->withToken($token)->get('/api/v1/me')->assertForbidden()->assertHeader('Content-Type', 'application/json');
        $this->get($this->signedUrl($user))->assertOk();
        $this->app['auth']->forgetGuards();
        $this->withToken($token)->get('/api/v1/me')->assertOk()
            ->assertJsonPath('data.id', $user->id)->assertJsonPath('data.demo_uses_left', 5)
            ->assertJsonMissingPath('data.password');
    }

    public function test_wrong_password_and_unknown_user_receive_the_same_error_without_tokens(): void
    {
        User::factory()->create(['email' => 'elek@example.com']);
        $known = $this->postJson('/api/v1/login', ['email' => 'elek@example.com', 'password' => 'incorrect'])
            ->assertUnprocessable();
        $unknown = $this->postJson('/api/v1/login', ['email' => 'missing@example.com', 'password' => 'incorrect'])
            ->assertUnprocessable();
        $this->assertSame($known->json(), $unknown->json());
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_me_requires_a_valid_token_even_without_accept_header(): void
    {
        $this->get('/api/v1/me')->assertUnauthorized()->assertHeader('Content-Type', 'application/json');
        $this->withToken('invalid')->get('/api/v1/me')->assertUnauthorized();
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('expired', ['*'], now()->subMinute())->plainTextToken;
        $this->withToken($token)->get('/api/v1/me')->assertUnauthorized();
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        $user = User::factory()->create();
        $current = $this->token($user);
        $other = $this->token($user);
        $this->withToken($current)->postJson('/api/v1/logout')->assertNoContent();
        $this->assertSame(1, $user->tokens()->count());
        $this->app['auth']->forgetGuards();
        $this->withToken($current)->getJson('/api/v1/me')->assertUnauthorized();
        $this->app['auth']->forgetGuards();
        $this->withToken($other)->getJson('/api/v1/me')->assertOk();
    }

    public function test_valid_signed_link_verifies_only_its_user_and_is_idempotent(): void
    {
        Event::fake([Verified::class]);
        $user = User::factory()->unverified()->create();
        $other = User::factory()->unverified()->create();
        $url = $this->signedUrl($user);
        $this->get($url)->assertOk();
        $this->get($url)->assertOk();
        $this->assertTrue($user->fresh()->hasVerifiedEmail());
        $this->assertFalse($other->fresh()->hasVerifiedEmail());
        Event::assertDispatchedTimes(Verified::class, 1);
    }

    public function test_expired_tampered_and_wrong_hash_links_cannot_verify_email(): void
    {
        $user = User::factory()->unverified()->create();
        $this->get($this->signedUrl($user, -1))->assertForbidden();
        $this->get($this->signedUrl($user).'&tampered=1')->assertForbidden();
        $this->get($this->signedUrl($user, hash: sha1('wrong@example.com')))->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_link_for_an_old_email_is_rejected(): void
    {
        $user = User::factory()->unverified()->create();
        $url = $this->signedUrl($user);
        $user->update(['email' => 'new@example.com']);
        $this->get($url)->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_only_authenticated_unverified_users_receive_resend_notifications(): void
    {
        Notification::fake();
        $this->postJson('/api/v1/email/verification-notification')->assertUnauthorized();
        $user = User::factory()->unverified()->create();
        $this->withToken($this->token($user))->postJson('/api/v1/email/verification-notification')->assertOk();
        Notification::assertSentTo($user, VerifyEmailNotification::class);
        Notification::assertCount(1);
        $user->markEmailAsVerified();
        $this->app['auth']->forgetGuards();
        $this->postJson('/api/v1/email/verification-notification')->assertOk();
        Notification::assertCount(1);
    }

    public function test_login_rate_limiting_normalizes_email_case(): void
    {
        $this->withMiddleware(ThrottleRequests::class);
        for ($i = 0; $i < 5; $i++) {
            $email = $i % 2 === 0 ? 'elek@example.com' : 'ELEK@EXAMPLE.COM';
            $this->postJson('/api/v1/login', ['email' => $email, 'password' => 'incorrect'])->assertUnprocessable();
        }
        $this->postJson('/api/v1/login', ['email' => 'elek@example.com', 'password' => 'incorrect'])
            ->assertTooManyRequests()->assertHeader('Retry-After');
    }

    public function test_verification_resend_is_rate_limited(): void
    {
        Notification::fake();
        $this->withMiddleware(ThrottleRequests::class);
        $user = User::factory()->unverified()->create();
        $this->withToken($this->token($user));
        for ($i = 0; $i < 3; $i++) {
            $this->postJson('/api/v1/email/verification-notification')->assertOk();
        }
        $this->postJson('/api/v1/email/verification-notification')->assertTooManyRequests();
        Notification::assertCount(3);
    }

    public function test_login_does_not_replenish_demo_uses(): void
    {
        $user = User::factory()->create(['email' => 'elek@example.com', 'password' => 'Pixi-password-123']);
        $user->forceFill(['demo_uses_left' => 0])->save();
        $this->postJson('/api/v1/login', ['email' => $user->email, 'password' => 'Pixi-password-123'])->assertOk();
        $this->assertSame(0, $user->fresh()->demo_uses_left);
    }

    public function test_registration_is_rate_limited(): void
    {
        Notification::fake();
        $this->withMiddleware(ThrottleRequests::class);
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/register', [...$this->registration(), 'email' => 'invalid'])
                ->assertUnprocessable();
        }
        $this->postJson('/api/v1/register', $this->registration())->assertTooManyRequests();
        $this->assertDatabaseCount('users', 0);
        Notification::assertNothingSent();
    }

    public function test_verification_link_expires_after_sixty_minutes(): void
    {
        $user = User::factory()->unverified()->create();
        $url = (new VerifyEmailNotification)->toMail($user)->actionUrl;
        $this->travel(61)->minutes();
        $this->get($url)->assertForbidden();
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_login_rejects_oversized_and_null_byte_passwords_without_server_errors(): void
    {
        $this->postJson('/api/v1/login', ['email' => 'elek@example.com', 'password' => str_repeat('á', 40)])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->postJson('/api/v1/login', ['email' => 'elek@example.com', 'password' => "password\0suffix"])
            ->assertUnprocessable()->assertJsonValidationErrors('password');
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_failover_queue_configuration_contains_only_connection_names(): void
    {
        $this->assertSame(['database', 'deferred'], config('queue.connections.failover.connections'));
    }
}
