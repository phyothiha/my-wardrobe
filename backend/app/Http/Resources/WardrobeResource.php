<?php

namespace App\Http\Resources;

use App\Models\Cloth;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class WardrobeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = $this->resource->attributesToArray();
        if ($this->resource instanceof Cloth) {
            $data['brand_name'] = $this->brand->name;
            $data['category_name'] = $this->category->name;
            $data['photos'] = array_map(fn ($path) => [
                'id' => basename($path),
                'url' => Storage::disk('public')->url($path),
            ], $this->images->pluck('path')->all());
        } else {
            $data['is_default'] = $this->name === $this->resource::FALLBACK;
        }

        return $data;
    }
}
