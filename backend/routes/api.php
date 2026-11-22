<?php

use App\Http\Controllers\BrandController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClothController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('brands/search', [BrandController::class, 'search']);
    Route::get('categories/search', [CategoryController::class, 'search']);
    Route::get('clothes/search', [ClothController::class, 'search']);
    Route::apiResource('brands', BrandController::class);
    Route::apiResource('categories', CategoryController::class);
    Route::apiResource('clothes', ClothController::class)->parameters(['clothes' => 'cloth']);
});
