<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class NamedRecordService
{
    public function save(Brand|Category $record, array $attributes): Brand|Category
    {
        $record->fill($attributes)->save();

        return $record;
    }

    public function delete(Brand|Category $record): void
    {
        DB::transaction(function () use ($record) {
            $record = $record::lockForUpdate()->findOrFail($record->getKey());
            $fallback = $record::where('name', $record::FALLBACK)->firstOrFail();
            $clothes = $record->clothes();
            $clothes->update([$clothes->getForeignKeyName() => $fallback->getKey()]);
            $record->delete();
        });
    }
}
