<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\InquiryController;
use App\Http\Controllers\Api\V1\StatusController;
use App\Http\Controllers\Api\V1\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    Route::post('/inquiries', InquiryController::class)->middleware('throttle:5,1')->name('inquiries.store');
    Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:registration')->name('register');
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login')->name('login');
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('/me', [AuthController::class, 'me'])->middleware('verified')->name('me');
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
        Route::post('/email/verification-notification', [AuthController::class, 'resendVerification'])
            ->middleware('throttle:verification-resend')->name('verification.send');
    });
    Route::get('/status', StatusController::class)->name('status');
});

Route::get('/v1/email/verify/{user}/{hash}', VerifyEmailController::class)
    ->middleware(['signed', 'throttle:verification-link'])->name('verification.verify');
