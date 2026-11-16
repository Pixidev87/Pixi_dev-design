<?php

namespace App\Services;

use App\InquiryStatus;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class InquiryService
{
    /** @param array{name: string, email: string, description: string, demo_session_id?: int|null} $data */
    public function create(array $data): Inquiry
    {
        return DB::transaction(function () use ($data): Inquiry {
            $inquiry = new Inquiry([
                'name' => $data['name'], 'email' => $data['email'], 'description' => $data['description'],
            ]);
            $inquiry->demo_session_id = $data['demo_session_id'] ?? null;
            $inquiry->status = InquiryStatus::New;
            $inquiry->save();

            Mail::to($inquiry->email)->queue(new InquiryReceived($inquiry));

            return $inquiry;
        });
    }
}
