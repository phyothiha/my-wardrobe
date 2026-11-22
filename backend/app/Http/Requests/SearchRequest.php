<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SearchRequest extends FormRequest
{
    public function rules(): array
    {
        $rules = ['page' => ['sometimes', 'integer', 'min:1']];
        if ($this->is('api/v1/clothes/search')) {
            return $rules + [
                'filter' => ['sometimes', 'array:brand_id,category_id,size,is_active'],
                'filter.brand_id' => ['sometimes', 'integer', 'min:1'],
                'filter.category_id' => ['sometimes', 'integer', 'min:1'],
                'filter.size' => ['sometimes', Rule::in(['S', 'M', 'L', 'XL', '2XL', '3XL'])],
                'filter.is_active' => ['sometimes', 'boolean'],
            ];
        }

        return $rules + [
            'filter' => ['sometimes', 'array:name'],
            'filter.name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
