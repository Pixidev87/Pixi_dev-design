<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Facades\URL;

class VerifyEmailNotification extends VerifyEmail implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @var array<int, int> */
    public array $backoff = [30, 120];

    public function __construct()
    {
        $this->onConnection('inquiry-mail')->onQueue('inquiry-mail')->beforeCommit();
    }

    protected function verificationUrl($notifiable): string
    {
        return URL::temporarySignedRoute(
            'verification.verify', now()->addMinutes(60),
            ['user' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())],
        );
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Erősítsd meg az e-mail-címed – Pixi web & webdesign')
            ->greeting('Szia!')
            ->line('Az e-mail-címed megerősítéséhez kattints az alábbi gombra.')
            ->action('E-mail-cím megerősítése', $this->verificationUrl($notifiable))
            ->line('A link 60 percig érvényes. Ha nem te regisztráltál, hagyd figyelmen kívül ezt a levelet.')
            ->salutation('Pixi web & webdesign');
    }
}
