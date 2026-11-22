<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        Brand::factory()->create(['name' => Brand::FALLBACK]);
        Category::factory()->create(['name' => Category::FALLBACK]);
    }
}
