<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchRequest;
use App\Http\Resources\WardrobeResource;
use App\Services\WardrobeQueryService;
use Illuminate\Database\Eloquent\Model;

abstract class WardrobeController extends Controller
{
    protected const MODEL = null;

    public function index(WardrobeQueryService $service)
    {
        return $this->listing($service, []);
    }

    public function search(SearchRequest $request, WardrobeQueryService $service)
    {
        return $this->listing($service, $request->validated('filter', []));
    }

    private function listing(WardrobeQueryService $service, array $filters)
    {
        $model = static::MODEL;

        return WardrobeResource::collection($service->paginate($model, $filters))
            ->additional(['message' => class_basename($model).' records retrieved.', 'status' => 200]);
    }

    protected function record(Model $record, string $action, int $status = 200)
    {
        return (new WardrobeResource($record))->additional([
            'message' => class_basename($record)." is {$action} successfully.",
            'status' => $status,
        ])->response()->setStatusCode($status);
    }

    protected function deleted()
    {
        return response()->json(['message' => class_basename(static::MODEL).' is deleted successfully.', 'status' => 200]);
    }
}
