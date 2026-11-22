<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    public const FALLBACK = 'Uncategorized';

    protected $fillable = ['name'];

    public function clothes()
    {
        return $this->hasMany(Cloth::class);
    }
}
