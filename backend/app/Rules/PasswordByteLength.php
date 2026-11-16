<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class PasswordByteLength implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (is_string($value) && str_contains($value, "\0")) {
            $fail('A jelszó nem tartalmazhat nulla bájtot.');
        }

        if (is_string($value) && strlen($value) > 72) {
            $fail('A jelszó legfeljebb 72 bájt lehet.');
        }
    }
}
