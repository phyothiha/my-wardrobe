<?php

namespace App\Http\Controllers;

use App\Http\Requests\NamedRecordRequest;
use App\Models\Brand;
use App\Services\NamedRecordService;

class BrandController extends WardrobeController
{
    protected const MODEL = Brand::class;

    public function __construct(private readonly NamedRecordService $service) {}

    public function show(Brand $brand)
    {
        return $this->record($brand, 'retrieved');
    }

    public function store(NamedRecordRequest $request)
    {
        return $this->record($this->service->save(new Brand, $request->validated()), 'created', 201);
    }

    public function update(NamedRecordRequest $request, Brand $brand)
    {
        return $this->record($this->service->save($brand, $request->validated()), 'updated');
    }

    public function destroy(NamedRecordRequest $request, Brand $brand)
    {
        $this->service->delete($brand);

        return $this->deleted();
    }
}
