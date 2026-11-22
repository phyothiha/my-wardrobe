<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Cloth extends Model
{
    protected $table = 'clothes';

    protected $fillable = ['brand_id', 'category_id', 'size', 'condition', 'purchased_date', 'note', 'is_active'];

    public function brand()
    {
        return $this->belongsTo(Brand::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): MorphMany
    {
        return $this->morphMany(Image::class, 'imageable')->orderBy('sort_order')->orderBy('id');
    }

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
