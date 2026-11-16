<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\StatusService;
use Illuminate\Http\JsonResponse;

class StatusController extends Controller
{
    public function __invoke(StatusService $statusService): JsonResponse
    {
        return response()->json(['data' => $statusService->getStatus()]);
    }
}
