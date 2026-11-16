<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

require dirname(__DIR__, 2).'/vendor/autoload.php';
$app = require dirname(__DIR__, 2).'/bootstrap/app.php';
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();
config([
    'database.default' => 'mysql',
    'database.connections.mysql.database' => 'testing',
    'database.connections.mysql.url' => null,
    'cache.default' => 'array',
    'services.anthropic.key' => 'test-key',
    'services.anthropic.model' => 'test-model',
]);
DB::purge('mysql');
if (! $app->environment('testing') || DB::connection()->getDatabaseName() !== 'testing') {
    throw new RuntimeException('Concurrency fixture may only use the testing database.');
}

DB::statement('SET SESSION innodb_lock_wait_timeout = 2');

Http::preventStrayRequests();
Http::fake(function () {
    file_put_contents(getenv('PIXI_TEST_DIRECTORY').'/calls', "called\n", FILE_APPEND | LOCK_EX);
    usleep(250000);

    return Http::response([
        'stop_reason' => 'end_turn',
        'content' => [['type' => 'text', 'text' => json_encode([
            'summary' => 'Teszt összefoglaló.', 'recommendation' => 'Teszt javaslat.',
        ])]],
    ]);
});
file_put_contents(getenv('PIXI_TEST_DIRECTORY').'/ready-'.getmypid(), 'ready');
$deadline = microtime(true) + 10;
while (! file_exists(getenv('PIXI_TEST_DIRECTORY').'/start')) {
    if (microtime(true) > $deadline) {
        throw new RuntimeException('Concurrency barrier timed out.');
    }
    usleep(10000);
}

$request = Request::create('/api/v1/demo', 'POST', server: [
    'HTTP_ACCEPT' => 'application/json',
    'CONTENT_TYPE' => 'application/json',
    'HTTP_AUTHORIZATION' => 'Bearer '.getenv('PIXI_TEST_TOKEN'),
    'HTTP_IDEMPOTENCY_KEY' => getenv('PIXI_TEST_KEY'),
], content: json_encode(['prompt' => 'Párhuzamos kérések biztonságos ellenőrzése.']));
$response = $kernel->handle($request);
echo json_encode(['status' => $response->getStatusCode()]);
$kernel->terminate($request, $response);
