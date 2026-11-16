<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreInquiryRequest;
use App\Http\Resources\InquiryResource;
use App\Services\InquiryService;

class InquiryController extends Controller
{
    public function __invoke(StoreInquiryRequest $request, InquiryService $service): InquiryResource
    {
        return new InquiryResource($service->create($request->safe()->only([
            'name', 'email', 'description', 'demo_session_id', 'idempotency_key',
        ])));
    }
}
