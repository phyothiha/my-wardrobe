<?php

namespace App\Services;

use App\Models\Cloth;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use RuntimeException;
use Throwable;

class ClothService
{
    public function save(Cloth $cloth, array $attributes): Cloth
    {
        $added = [];
        $removed = [];
        try {
            $saved = DB::transaction(function () use ($attributes, $cloth, &$added, &$removed) {
                if ($cloth->exists) {
                    $cloth = Cloth::lockForUpdate()->findOrFail($cloth->id);
                }
                $current = $cloth->exists ? $cloth->images()->pluck('path')->all() : [];
                $removeIds = $attributes['remove_photo_ids'] ?? [];
                if (array_diff($removeIds, array_map('basename', $current))) {
                    throw ValidationException::withMessages(['remove_photo_ids' => 'Select photos belonging to this cloth.']);
                }
                $removed = array_filter($current, fn ($path) => in_array(basename($path), $removeIds, true));
                $kept = array_values(array_diff($current, $removed));
                $files = $attributes['photos'] ?? [];
                $count = count($kept) + count($files);
                if ($count < 1 || $count > 5) {
                    throw ValidationException::withMessages(['photos' => 'Keep between one and five photos.']);
                }
                $tokens = array_map('basename', $kept);
                foreach (array_keys($files) as $index) {
                    $tokens[] = 'new:'.$index;
                }
                $order = $attributes['photo_order'] ?? $tokens;
                if (count($order) !== $count || array_diff($tokens, $order)) {
                    throw ValidationException::withMessages(['photo_order' => 'Include each remaining photo exactly once.']);
                }
                foreach ($files as $file) {
                    $path = $file->store('clothes', 'public');
                    if ($path === false) {
                        throw new RuntimeException('Photo storage failed.');
                    }
                    $added[] = $path;
                }
                $cloth->fill(Arr::except($attributes, ['photos', 'remove_photo_ids', 'photo_order']));
                $cloth->save();
                if ($removed) {
                    $cloth->images()->whereIn('path', $removed)->delete();
                }
                $paths = array_combine($tokens, array_merge($kept, $added));
                foreach ($order as $position => $token) {
                    $cloth->images()->updateOrCreate(['path' => $paths[$token]], ['sort_order' => $position + 1]);
                }

                return $cloth->refresh()->load('images');
            });
        } catch (Throwable $error) {
            Storage::disk('public')->delete($added);
            throw $error;
        }
        Storage::disk('public')->delete($removed);

        return $saved;
    }

    public function delete(Cloth $cloth): void
    {
        $photos = DB::transaction(function () use ($cloth) {
            $cloth = Cloth::lockForUpdate()->findOrFail($cloth->id);
            $paths = $cloth->images()->pluck('path')->all();
            $cloth->images()->delete();
            $cloth->delete();

            return $paths;
        });
        Storage::disk('public')->delete($photos);
    }
}
