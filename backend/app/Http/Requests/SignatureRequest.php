<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class SignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        if ($this->hasFile('signature')) {
            return [
                'signature' => 'required|file|mimes:png,jpg,jpeg|max:5120',
            ];
        }

        return [
            'signature' => 'required|string',
        ];
    }
}
