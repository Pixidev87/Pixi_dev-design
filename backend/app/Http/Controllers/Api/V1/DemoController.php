<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\RunDemoRequest;
use App\Http\Resources\DemoSessionResource;
use App\Services\DemoService;
use Illuminate\Http\Request;

class DemoController extends Controller
{
    public function store(RunDemoRequest $request, DemoService $service): DemoSessionResource
    {
        $session = $service->run($request->user(), $request->validated('prompt'), $request->validated('idempotency_key'));

        return (new DemoSessionResource($session))->additional([
            'meta' => ['demo_uses_left' => $session->user->demo_uses_left],
        ]);
    }

    public function show(Request $request, int $demoSession): DemoSessionResource
    {
        return new DemoSessionResource($request->user()->demoSessions()->findOrFail($demoSession));
    }
}
