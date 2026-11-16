<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiStatusTest extends TestCase
{
    public function test_status_returns_the_configured_application_name_as_json(): void
    {
        config(['app.name' => 'Pixi test']);

        $this->get('/api/v1/status')
            ->assertOk()
            ->assertHeader('Content-Type', 'application/json')
            ->assertExactJson([
                'data' => [
                    'status' => 'ok',
                    'name' => 'Pixi test',
                    'api_version' => 'v1',
                ],
            ]);
    }

    public function test_unknown_api_route_returns_a_json_not_found_response(): void
    {
        $this->get('/api/v1/does-not-exist')
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json')
            ->assertJsonStructure(['message']);
    }
}
