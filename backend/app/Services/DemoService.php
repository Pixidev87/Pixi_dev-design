<?php

namespace App\Services;

use App\Models\DemoSession;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\HttpException;

class DemoService
{
    public function __construct(private ClaudeService $claude) {}

    public function run(User $user, string $prompt, string $idempotencyKey): DemoSession
    {
        try {
            return DB::transaction(function () use ($user, $prompt, $idempotencyKey): DemoSession {
                $lockedUser = User::whereKey($user->id)->lockForUpdate()->firstOrFail();
                $existing = $lockedUser->demoSessions()->where('idempotency_key', $idempotencyKey)->first();
                if ($existing) {
                    if ($existing->prompt !== $prompt) {
                        throw new HttpException(409, 'Ez az Idempotency-Key már másik kéréshez tartozik.');
                    }

                    return $existing->setRelation('user', $lockedUser);
                }

                if ($lockedUser->demo_uses_left < 1) {
                    throw new HttpResponseException(response()->json([
                        'message' => 'Elfogyott az 5 demóhasználatod. Kérj személyre szabott ajánlatot!',
                        'code' => 'demo_quota_exhausted',
                        'inquiry_url' => route('api.v1.inquiries.store', absolute: false),
                    ], 403));
                }

                $result = $this->claude->analyze($prompt);
                $session = $lockedUser->demoSessions()->create([
                    'prompt' => $prompt,
                    'result' => $result,
                    'model' => config('services.anthropic.model'),
                    'idempotency_key' => $idempotencyKey,
                ]);
                $lockedUser->decrement('demo_uses_left');

                return $session->setRelation('user', $lockedUser);
            });
        } catch (QueryException $exception) {
            if (in_array($exception->errorInfo[1] ?? null, [1205, 1213], true)) {
                throw new HttpException(503, 'Egy demókérés még folyamatban van. Próbáld újra ugyanazzal az Idempotency-Key értékkel.');
            }

            throw $exception;
        }
    }
}
