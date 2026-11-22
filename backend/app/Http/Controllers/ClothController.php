<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClothRequest;
use App\Models\Cloth;
use App\Services\ClothService;

class ClothController extends WardrobeController
{
    protected const MODEL = Cloth::class;

    public function __construct(private readonly ClothService $service) {}

    public function show(Cloth $cloth)
    {
        return $this->record($cloth->load('images'), 'retrieved');
    }

    public function store(ClothRequest $request)
    {
        return $this->record($this->service->save(new Cloth, $request->validated()), 'created', 201);
    }

    public function update(ClothRequest $request, Cloth $cloth)
    {
        return $this->record($this->service->save($cloth, $request->validated()), 'updated');
    }

    public function destroy(Cloth $cloth)
    {
        $this->service->delete($cloth);

        return $this->deleted();
    }
}
