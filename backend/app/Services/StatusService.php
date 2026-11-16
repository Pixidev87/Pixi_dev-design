<?php

namespace App\Services;

class StatusService
{
    /**
     * @return array{status: string, name: string, api_version: string}
     */
    public function getStatus(): array
    {
        return [
            'status' => 'ok',
            'name' => config('app.name'),
            'api_version' => 'v1',
        ];
    }
}
