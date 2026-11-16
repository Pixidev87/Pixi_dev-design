<?php

use App\Http\Controllers\Api\V1\InquiryController;
use App\Http\Controllers\Api\V1\StatusController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('/inquiries', InquiryController::class)->middleware('throttle:5,1')->name('inquiries.store');
    Route::get('/status', StatusController::class)->name('status');
});
