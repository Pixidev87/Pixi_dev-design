<?php

namespace App\Mail;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InquiryReceived extends Mailable
{
    use Queueable, SerializesModels;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120];

    public function __construct(public Inquiry $inquiry)
    {
        $this->onConnection('inquiry-mail')->onQueue('inquiry-mail')->beforeCommit();
    }

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'Megérkezett az ajánlatkérésed – Pixi web & webdesign');
    }

    public function content(): Content
    {
        return new Content(view: 'mail.inquiries.received');
    }
}
