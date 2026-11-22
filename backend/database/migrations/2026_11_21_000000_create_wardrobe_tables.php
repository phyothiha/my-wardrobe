<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['brands', 'categories'] as $name) {
            Schema::create($name, function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->timestamps();
            });
        }
        Schema::create('clothes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('brand_id')->constrained();
            $table->foreignId('category_id')->constrained();
            $table->string('size');
            $table->string('condition')->nullable();
            $table->date('purchased_date')->nullable();
            $table->text('note')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('photos');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clothes');
        Schema::dropIfExists('categories');
        Schema::dropIfExists('brands');
    }
};
