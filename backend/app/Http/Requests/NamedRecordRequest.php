<?php

namespace App\Http\Requests;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class NamedRecordRequest extends FormRequest
{
    public function rules(): array
    {
        $brand = $this->routeIs('brands.*');
        $record = $this->route($brand ? 'brand' : 'category');
        if ($this->isMethod('delete')) {
            return [];
        }
        $unique = Rule::unique($brand ? Brand::class : Category::class, 'name');
        if ($record) {
            $unique->ignore($record);
        }

        return ['name' => ['required', 'string', 'max:255', $unique]];
    }

    public function after(): array
    {
        return [function ($validator) {
            $record = $this->route('brand') ?? $this->route('category');
            if ($record && $record->name === $record::FALLBACK) {
                $validator->errors()->add('name', 'The fallback record cannot be changed or deleted.');
            }
        }];
    }
}
