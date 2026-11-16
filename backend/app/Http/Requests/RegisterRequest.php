<?php

namespace App\Http\Requests;

use App\Rules\PasswordByteLength;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if (is_string($this->input('email'))) {
            $this->merge(['email' => mb_strtolower(trim($this->input('email')))]);
        }
    }

    /** @return array<string, array<int, mixed>> */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'string', 'email:rfc', 'max:254', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(12), new PasswordByteLength],
            'email_verified_at' => ['prohibited'],
            'demo_uses_left' => ['prohibited'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'required' => 'A mező kitöltése kötelező.',
            'string' => 'Szöveges értéket adj meg.',
            'max' => 'A mező legfeljebb :max karakter lehet.',
            'email.email' => 'Adj meg érvényes e-mail-címet.',
            'email.unique' => 'Ehhez az e-mail-címhez már tartozik fiók. Jelentkezz be.',
            'password.confirmed' => 'A két jelszó nem egyezik.',
            'prohibited' => 'Ezt a mezőt nem állíthatod be.',
        ];
    }
}
