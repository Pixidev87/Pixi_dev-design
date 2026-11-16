<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('demo', fn (Request $request) => Limit::perMinute(10)->by($request->user()->id));
        RateLimiter::for('registration', fn (Request $request) => Limit::perMinute(5)->by($request->ip()));
        RateLimiter::for('login', function (Request $request): array {
            $email = $request->input('email');
            $normalizedEmail = is_string($email) ? mb_strtolower(trim($email)) : '';

            return [
                Limit::perMinute(20)->by('ip:'.$request->ip()),
                Limit::perMinute(5)->by('email:'.hash('sha256', $normalizedEmail).':'.$request->ip()),
            ];
        });
        RateLimiter::for('verification-resend', fn (Request $request) => Limit::perMinute(3)->by($request->user()->id));
        RateLimiter::for('verification-link', fn (Request $request) => Limit::perMinute(20)->by($request->ip()));
    }
}
