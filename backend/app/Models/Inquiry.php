<?php

namespace App\Models;

use App\InquiryStatus;
use Database\Factories\InquiryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['name', 'email', 'description'])]
class Inquiry extends Model
{
    /** @use HasFactory<InquiryFactory> */
    use HasFactory;

    protected $attributes = ['status' => 'new'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['status' => InquiryStatus::class];
    }
}
