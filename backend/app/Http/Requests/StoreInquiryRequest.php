<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreInquiryRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $key = $this->header('Idempotency-Key');
        $this->merge(['idempotency_key' => is_string($key) ? strtolower($key) : null]);
    }

    public function authorize(): bool
    {
        if ($this->filled('demo_session_id')) {
            $user = $this->user('sanctum');
            abort_unless($user, 401);
            abort_unless($user->hasVerifiedEmail(), 403);
        }

        return true;
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:254'],
            'description' => ['required', 'string', 'max:5000'],
            'demo_session_id' => ['nullable', 'integer', Rule::exists('demo_sessions', 'id')->where('user_id', $this->user('sanctum')?->id ?? 0)],
            'status' => ['prohibited'],
            'idempotency_key' => ['nullable', 'uuid'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => 'A(z) :attribute mező kitöltése kötelező.',
            'string' => 'A(z) :attribute mező szöveg legyen.',
            'max' => 'A(z) :attribute mező legfeljebb :max karakter lehet.',
            'email.email' => 'Adj meg érvényes e-mail-címet.',
            'demo_session_id.exists' => 'A demóeredmény nem érhető el ehhez a fiókhoz.',
            'status.prohibited' => 'Az állapotot a szerver állítja be.',
        ];
    }

    /** @return array<string, string> */
    public function attributes(): array
    {
        return ['name' => 'név', 'email' => 'e-mail', 'description' => 'leírás'];
    }
}
