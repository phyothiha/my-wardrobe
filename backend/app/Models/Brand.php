<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    use HasFactory;

    public const FALLBACK = 'Unknown';

    protected $fillable = ['name'];

    public function clothes()
    {
        return $this->hasMany(Cloth::class);
    }
}
