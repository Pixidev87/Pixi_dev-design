<?php

namespace Tests\Feature;

use App\InquiryStatus;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Mockery;
use PHPUnit\Framework\Attributes\DataProvider;
use RuntimeException;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\Transport\TransportInterface;
use Tests\TestCase;

class StoreInquiryTest extends TestCase
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

    /** @return array{name: string, email: string, description: string} */
    private function validPayload(): array
    {
        return [
            'name' => 'Teszt Elek',
            'email' => 'elek@example.com',
            'description' => 'Egy új weboldalt szeretnék.',
        ];
    }

    public function test_invalid_email_is_rejected(): void
    {
        Mail::fake();

        $this->postJson('/api/v1/inquiries', [
            ...$this->validPayload(), 'email' => 'invalid-email',
        ])->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('inquiries', 0);
        Mail::assertNothingOutgoing();
    }

    public function test_valid_inquiry_is_saved_with_new_status_and_confirmation_queued(): void
    {
        Mail::fake();

        $response = $this->postJson('/api/v1/inquiries', $this->validPayload());

        $response->assertCreated()->assertJsonPath('data.status', 'new')
            ->assertJsonStructure(['data' => ['id', 'status', 'created_at']])
            ->assertJsonMissingPath('data.email')->assertJsonMissingPath('data.description');

        $inquiry = Inquiry::findOrFail($response->json('data.id'));
        $this->assertSame(InquiryStatus::New, $inquiry->status);
        $this->assertDatabaseHas('inquiries', [...$this->validPayload(), 'demo_session_id' => null, 'status' => 'new']);
        Mail::assertQueued(InquiryReceived::class, fn (InquiryReceived $mail): bool => $mail->hasTo('elek@example.com') && $mail->inquiry->is($inquiry)
            && $mail->connection === 'inquiry-mail' && $mail->queue === 'inquiry-mail'
        );
        Mail::assertQueuedCount(1);
    }

    /** @return array<string, array{string, mixed}> */
    public static function invalidFields(): array
    {
        return [
            'missing name' => ['name', null],
            'empty name' => ['name', '   '],
            'name too long' => ['name', str_repeat('a', 151)],
            'missing email' => ['email', null],
            'email too long' => ['email', str_repeat('a', 250).'@example.com'],
            'missing description' => ['description', null],
            'description too long' => ['description', str_repeat('a', 5001)],
            'array description' => ['description', ['unexpected']],
            'client status' => ['status', 'sent'],
            'unverified demo' => ['demo_session_id', 1],
        ];
    }

    #[DataProvider('invalidFields')]
    public function test_invalid_fields_do_not_create_inquiries_or_mail(string $field, mixed $value): void
    {
        Mail::fake();

        $this->postJson('/api/v1/inquiries', [...$this->validPayload(), $field => $value])
            ->assertUnprocessable()->assertJsonValidationErrors($field);

        $this->assertDatabaseCount('inquiries', 0);
        $this->assertDatabaseCount('jobs', 0);
        Mail::assertNothingOutgoing();
    }

    public function test_mail_queue_failure_rolls_back_the_inquiry(): void
    {
        Mail::shouldReceive('to')->once()->andThrow(new RuntimeException('Queue unavailable'));

        $this->postJson('/api/v1/inquiries', $this->validPayload())->assertServerError();

        $this->assertDatabaseCount('inquiries', 0);
        $this->assertDatabaseCount('jobs', 0);
    }

    public function test_database_worker_delivers_the_queued_confirmation(): void
    {
        $transport = Mail::mailer('array')->getSymfonyTransport();

        $this->postJson('/api/v1/inquiries', $this->validPayload())->assertCreated();

        $this->assertDatabaseHas('jobs', ['queue' => 'inquiry-mail']);
        $this->assertCount(0, $transport->messages());

        $this->artisan('queue:work', [
            'connection' => 'inquiry-mail', '--queue' => 'inquiry-mail', '--once' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('jobs', 0);
        $this->assertDatabaseCount('failed_jobs', 0);
        $this->assertCount(1, $transport->messages());
        $message = $transport->messages()->first()->getOriginalMessage();
        $this->assertSame('elek@example.com', $message->getTo()[0]->getAddress());
        $this->assertStringContainsString('Köszönjük az ajánlatkérésed!', $message->getHtmlBody());
    }

    public function test_smtp_failure_keeps_the_inquiry_and_retries_the_mail(): void
    {
        $mailer = Mail::mailer('array');
        $originalTransport = $mailer->getSymfonyTransport();
        $brokenTransport = Mockery::mock(TransportInterface::class);
        $brokenTransport->shouldReceive('send')->once()->andThrow(new TransportException('SMTP unavailable'));
        $mailer->setSymfonyTransport($brokenTransport);

        $this->postJson('/api/v1/inquiries', $this->validPayload())->assertCreated();
        $this->artisan('queue:work', [
            'connection' => 'inquiry-mail', '--queue' => 'inquiry-mail', '--once' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('inquiries', 1);
        $this->assertDatabaseCount('failed_jobs', 0);
        $this->assertDatabaseHas('jobs', ['queue' => 'inquiry-mail', 'attempts' => 1, 'reserved_at' => null]);

        $mailer->setSymfonyTransport($originalTransport);
        DB::table('jobs')->where('queue', 'inquiry-mail')->update(['available_at' => now()->timestamp]);
        $this->artisan('queue:work', [
            'connection' => 'inquiry-mail', '--queue' => 'inquiry-mail', '--once' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('jobs', 0);
        $this->assertCount(1, $originalTransport->messages());
    }

    public function test_confirmation_escapes_the_submitted_name(): void
    {
        $inquiry = Inquiry::factory()->create(['name' => '<script>alert(1)</script>']);
        $html = (new InquiryReceived($inquiry))->render();

        $this->assertStringContainsString('&lt;script&gt;', $html);
        $this->assertStringNotContainsString('<script>', $html);
    }

    public function test_requests_are_rate_limited(): void
    {
        Mail::fake();
        $this->withMiddleware(ThrottleRequests::class);

        for ($attempt = 0; $attempt < 5; $attempt++) {
            $this->postJson('/api/v1/inquiries', $this->validPayload())->assertCreated();
        }

        $this->postJson('/api/v1/inquiries', $this->validPayload())
            ->assertTooManyRequests()->assertHeader('Retry-After');
        $this->assertDatabaseCount('inquiries', 5);
        Mail::assertQueuedCount(5);
    }
}
