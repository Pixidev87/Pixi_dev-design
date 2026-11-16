<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\DatabaseMigrations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\Process\Process;
use Tests\TestCase;

class DemoConcurrencyTest extends TestCase
{
    use DatabaseMigrations;

    protected function beforeRefreshingDatabase(): void
    {
        if (DB::connection()->getDatabaseName() !== 'testing') {
            throw new RuntimeException('Concurrency tests may only use the testing database.');
        }
    }

    public function test_six_parallel_requests_with_one_use_left_only_call_claude_once(): void
    {
        $this->assertParallelRequests(false);
    }

    public function test_parallel_retries_with_the_same_key_share_one_result(): void
    {
        $this->assertParallelRequests(true);
    }

    public function test_database_lock_timeout_is_retryable_without_calling_claude(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('concurrency-test')->plainTextToken;
        $directory = sys_get_temp_dir().'/pixi-demo-'.Str::uuid();
        mkdir($directory);
        file_put_contents($directory.'/start', 'go');
        DB::beginTransaction();
        User::whereKey($user->id)->lockForUpdate()->firstOrFail();
        $process = new Process([PHP_BINARY, base_path('tests/Fixtures/demo_request.php')], base_path(), [
            'APP_ENV' => 'testing', 'DB_DATABASE' => 'testing', 'DB_URL' => '',
            'PIXI_TEST_DIRECTORY' => $directory, 'PIXI_TEST_TOKEN' => $token,
            'PIXI_TEST_KEY' => (string) Str::uuid(),
        ]);
        try {
            $process->setTimeout(10)->mustRun();
            $this->assertSame(503, json_decode($process->getOutput(), true, flags: JSON_THROW_ON_ERROR)['status']);
            $this->assertFileDoesNotExist($directory.'/calls');
            $this->assertSame(5, $user->fresh()->demo_uses_left);
            $this->assertDatabaseCount('demo_sessions', 0);
        } finally {
            if ($process->isRunning()) {
                $process->stop();
            }
            DB::rollBack();
            foreach (glob($directory.'/*') as $file) {
                unlink($file);
            }
            rmdir($directory);
        }
    }

    public function test_parallel_inquiry_retries_create_one_record_and_one_email_job(): void
    {
        $this->assertParallelRequests(true, 'inquiry');
    }

    private function assertParallelRequests(bool $sameKey, string $kind = 'demo'): void
    {
        $user = User::factory()->create();
        $user->forceFill(['demo_uses_left' => 1])->save();
        $token = $user->createToken('concurrency-test')->plainTextToken;
        $sharedKey = (string) Str::uuid();
        $directory = sys_get_temp_dir().'/pixi-demo-'.Str::uuid();
        mkdir($directory);
        $processes = [];

        try {
            for ($i = 0; $i < 6; $i++) {
                $process = new Process([PHP_BINARY, base_path('tests/Fixtures/demo_request.php')], base_path(), [
                    'APP_ENV' => 'testing', 'DB_DATABASE' => 'testing', 'DB_URL' => '',
                    'PIXI_TEST_DIRECTORY' => $directory, 'PIXI_TEST_TOKEN' => $token,
                    'PIXI_TEST_KEY' => $sameKey ? $sharedKey : (string) Str::uuid(),
                    'PIXI_TEST_KIND' => $kind,
                ]);
                $process->setTimeout(20);
                $process->start();
                $processes[] = $process;
            }

            $deadline = microtime(true) + 10;
            while (count(glob($directory.'/ready-*')) < 6 && microtime(true) < $deadline) {
                usleep(10000);
            }
            $this->assertCount(6, glob($directory.'/ready-*'), 'All six workers must reach the barrier.');
            file_put_contents($directory.'/start', 'go');
            $statuses = [];
            foreach ($processes as $process) {
                $process->wait();
                $this->assertTrue($process->isSuccessful(), $process->getErrorOutput());
                $statuses[] = json_decode($process->getOutput(), true, flags: JSON_THROW_ON_ERROR)['status'];
            }
            sort($statuses);
            $this->assertSame($sameKey ? [200, 200, 200, 200, 200, 201] : [201, 403, 403, 403, 403, 403], $statuses);
            if ($kind === 'inquiry') {
                $this->assertDatabaseCount('inquiries', 1);
                $this->assertDatabaseCount('jobs', 1);
                $this->assertSame(1, $user->fresh()->demo_uses_left);
                $this->assertFileDoesNotExist($directory.'/calls');
            } else {
                $this->assertSame(0, $user->fresh()->demo_uses_left);
                $this->assertDatabaseCount('demo_sessions', 1);
                $this->assertSame("called\n", file_get_contents($directory.'/calls'));
            }
        } finally {
            foreach ($processes as $process) {
                if ($process->isRunning()) {
                    $process->stop();
                }
            }
            foreach (glob($directory.'/*') as $file) {
                unlink($file);
            }
            rmdir($directory);
        }
    }
}
