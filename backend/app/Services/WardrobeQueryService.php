<?php

namespace App\Services;

use App\Models\Cloth;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

class WardrobeQueryService
{
    /** @param class-string<Model> $model */
    public function paginate(string $model, array $filters = []): LengthAwarePaginator
    {
        $query = $model::query();
        if ($model === Cloth::class) {
            foreach ($filters as $column => $value) {
                $query->where($column, $value);
            }
            $query->with(['images', 'brand', 'category'])->latest()->orderByDesc('id');
        } else {
            $query->withCount('clothes')->orderBy('name');
            if (isset($filters['name'])) {
                $term = strtr($filters['name'], ['!' => '!!', '%' => '!%', '_' => '!_']);
                $query->whereRaw("LOWER(name) LIKE LOWER(?) ESCAPE '!'", ['%'.$term.'%']);
            }
        }

        return $query->paginate(10)->withQueryString();
    }
}
