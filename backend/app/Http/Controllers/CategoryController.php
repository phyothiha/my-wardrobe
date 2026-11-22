<?php

namespace App\Http\Controllers;

use App\Http\Requests\NamedRecordRequest;
use App\Models\Category;
use App\Services\NamedRecordService;

class CategoryController extends WardrobeController
{
    protected const MODEL = Category::class;

    public function __construct(private readonly NamedRecordService $service) {}

    public function show(Category $category)
    {
        return $this->record($category, 'retrieved');
    }

    public function store(NamedRecordRequest $request)
    {
        return $this->record($this->service->save(new Category, $request->validated()), 'created', 201);
    }

    public function update(NamedRecordRequest $request, Category $category)
    {
        return $this->record($this->service->save($category, $request->validated()), 'updated');
    }

    public function destroy(NamedRecordRequest $request, Category $category)
    {
        $this->service->delete($category);

        return $this->deleted();
    }
}
