<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ClothRequest extends FormRequest
{
    public function rules(): array
    {
        $presence = $this->route('cloth') ? 'sometimes' : 'required';

        return [
            'brand_id' => [$presence, 'required', 'integer', 'exists:brands,id'],
            'category_id' => [$presence, 'required', 'integer', 'exists:categories,id'],
            'size' => [$presence, 'required', Rule::in(['S', 'M', 'L', 'XL', '2XL', '3XL'])],
            'condition' => ['nullable', Rule::in(['Poor', 'Thrift', 'Good', 'Excellent', 'Mint'])],
            'purchased_date' => ['nullable', 'date_format:Y-m-d'],
            'note' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
            'photos' => [$presence, 'array', 'list', 'max:5'],
            'photos.*' => ['required', 'file', 'mimes:jpg,jpeg,png', 'extensions:jpg,jpeg,png'],
            'photo_order' => ['sometimes', 'array', 'list', 'min:1', 'max:5'],
            'photo_order.*' => ['required', 'string', 'distinct'],
            'remove_photo_ids' => ['sometimes', 'array', 'list', 'max:5'],
            'remove_photo_ids.*' => ['required', 'string', 'distinct'],
        ];
    }
}
