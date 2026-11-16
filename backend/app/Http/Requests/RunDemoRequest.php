<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RunDemoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['idempotency_key' => strtolower($this->header('Idempotency-Key', ''))]);
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'prompt' => ['required', 'string', 'min:10', 'max:3000'],
            'idempotency_key' => ['required', 'uuid'],
        ];
    }
}
