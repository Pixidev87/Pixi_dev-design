<?php

namespace App\Services;

use App\InquiryStatus;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Symfony\Component\HttpKernel\Exception\HttpException;

class InquiryService
{
    /** @param array{name: string, email: string, description: string, demo_session_id?: int|null, idempotency_key?: string|null} $data */
    public function create(array $data): Inquiry
    {
        $key = $data['idempotency_key'] ?? null;
        $fingerprint = hash('sha256', json_encode([
            $data['name'], $data['email'], $data['description'],
            isset($data['demo_session_id']) ? (int) $data['demo_session_id'] : null,
        ], JSON_THROW_ON_ERROR));

        try {
            return DB::transaction(function () use ($data, $key, $fingerprint): Inquiry {
                if ($key && $existing = Inquiry::where('idempotency_key', $key)->first()) {
                    return $this->replay($existing, $fingerprint);
                }

                $inquiry = new Inquiry([
                    'name' => $data['name'], 'email' => $data['email'], 'description' => $data['description'],
                ]);
                $inquiry->demo_session_id = $data['demo_session_id'] ?? null;
                $inquiry->status = InquiryStatus::New;
                $inquiry->idempotency_key = $key;
                $inquiry->request_fingerprint = $fingerprint;
                $inquiry->save();
                Mail::to($inquiry->email)->queue(new InquiryReceived($inquiry));

                return $inquiry;
            });
        } catch (UniqueConstraintViolationException $exception) {
            if ($key && $existing = Inquiry::where('idempotency_key', $key)->first()) {
                return $this->replay($existing, $fingerprint);
            }

            throw $exception;
        }
    }

    private function replay(Inquiry $inquiry, string $fingerprint): Inquiry
    {
        if (! hash_equals($inquiry->request_fingerprint, $fingerprint)) {
            throw new HttpException(409, 'Ez az Idempotency-Key már másik ajánlatkéréshez tartozik.');
        }

        return $inquiry;
    }
}
