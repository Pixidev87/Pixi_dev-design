<?php

namespace App\Services;

use App\InquiryStatus;
use App\Mail\InquiryReceived;
use App\Models\Inquiry;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class InquiryService
{
    /** @param array{name: string, email: string, description: string} $data */
    public function create(array $data): Inquiry
    {
        return DB::transaction(function () use ($data): Inquiry {
            $inquiry = new Inquiry($data);
            $inquiry->status = InquiryStatus::New;
            $inquiry->save();

            Mail::to($inquiry->email)->queue(new InquiryReceived($inquiry));

            return $inquiry;
        });
    }
}
