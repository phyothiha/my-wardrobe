<?php

namespace Tests\Feature;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Cloth;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class WardrobeTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_filters_and_pagination(): void
    {
        $this->seed();
        $category = Category::firstOrFail();
        $brand = Brand::firstOrFail();
        foreach (range(1, 12) as $number) {
            Brand::create(['name' => sprintf('Studio %02d', $number)]);
        }
        $page = $this->getJson('/api/v1/brands/search?filter[name]=TuD&page=1')
            ->assertOk()->assertJsonCount(10, 'data')->assertJsonPath('meta.total', 12)
            ->assertJsonPath('data.0.name', 'Studio 01');
        $this->getJson($page->json('links.next'))->assertOk()->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.name', 'Studio 11');
        $this->getJson('/api/v1/categories/search?filter[name]=CATEG')->assertOk()
            ->assertJsonPath('data.0.is_default', true);
        foreach ([['M', true], ['M', false], ['L', false]] as [$size, $active]) {
            Cloth::create(['brand_id' => $brand->id, 'category_id' => $category->id,
                'size' => $size, 'is_active' => $active]);
        }
        $this->getJson('/api/v1/clothes/search?filter[size]=M&filter[is_active]=0')
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.is_active', false)
            ->assertJsonPath('data.0.brand_name', $brand->name);
        $this->getJson('/api/v1/clothes/search?filter[size]=M')->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/clothes/search?filter[name]=test')->assertUnprocessable();
        $this->getJson('/api/v1/brands')->assertOk()->assertJsonPath('data.0.clothes_count', 0);
    }

    public function test_photo_order_survives_mixed_uploads_removals_and_reload(): void
    {
        Storage::fake('public');
        $this->seed();
        $url = '/api/v1/clothes';
        $cloth = $this->postJson($url, [
            'brand_id' => Brand::firstOrFail()->id, 'category_id' => Category::firstOrFail()->id, 'size' => 'M',
            'photos' => [UploadedFile::fake()->image('first.jpg'), UploadedFile::fake()->image('second.png')],
            'photo_order' => ['new:1', 'new:0'],
        ])->assertCreated()->json('data');
        $record = $url.'/'.$cloth['id'];
        [$second, $first] = array_column($cloth['photos'], 'id');
        $this->assertStringEndsWith('.png', $second);
        $this->patchJson($record, ['photo_order' => [$first, $second]])->assertOk();
        $this->getJson($url)->assertJsonPath('data.0.photos.0.id', $first);
        $response = $this->postJson($record, [
            '_method' => 'PATCH', 'photos' => [UploadedFile::fake()->image('third.jpg')],
            'remove_photo_ids' => [$first], 'photo_order' => ['new:0', $second],
        ])->assertOk()->assertJsonCount(2, 'data.photos')->assertJsonPath('data.photos.1.id', $second);
        $photos = $response->json('data.photos');
        $this->patchJson($record, ['photo_order' => [$first, $second]])->assertUnprocessable();
        $this->patchJson($record, ['note' => 'Updated'])->assertOk();
        $this->getJson($record)->assertJsonPath('data.photos', $photos);
    }

    public function test_wardrobe_lifecycle(): void
    {
        Storage::fake('public');
        $this->seed();
        $ids = [];
        foreach (['brands' => 'brand_id', 'categories' => 'category_id'] as $route => $field) {
            $url = "/api/v1/$route";
            $fallback = $this->getJson($url)->assertOk()->assertJsonStructure(['data', 'meta', 'links'])->json('data.0.id');
            $this->patchJson("$url/$fallback", ['name' => 'changed'])->assertUnprocessable();
            $this->deleteJson("$url/$fallback")->assertUnprocessable();
            $ids[$field] = $this->postJson($url, ['name' => 'New'])->assertCreated()->json('data.id');
            $this->postJson($url, ['name' => 'New'])->assertUnprocessable();
            $this->patchJson("$url/".$ids[$field], ['name' => 'Updated'])->assertOk();
            $this->getJson("$url/".$ids[$field])->assertOk()->assertJsonPath('data.name', 'Updated');
        }
        $url = '/api/v1/clothes';
        $payload = $ids + ['size' => 'M'];
        $this->postJson($url, $payload)->assertUnprocessable();
        $payload['photos'] = [UploadedFile::fake()->image('first.png')];
        $record = $this->postJson($url, $payload)->assertCreated()->json('data');
        $url .= '/'.$record['id'];
        $this->patchJson($url, ['note' => 'changed'])->assertOk()->assertJsonPath('data.photos', $record['photos']);
        $this->patchJson($url, ['remove_photo_ids' => [$record['photos'][0]['id']]])->assertUnprocessable();
        $this->patchJson($url, ['photos' => array_map(fn ($i) => UploadedFile::fake()->image("$i.png"), range(1, 5))])->assertUnprocessable();
        $this->postJson($url, ['_method' => 'PATCH', 'remove_photo_ids' => [$record['photos'][0]['id']], 'photos' => [UploadedFile::fake()->image('second.jpg')]])->assertOk()->assertJsonCount(1, 'data.photos');
        $this->assertCount(1, Storage::disk('public')->allFiles());
        foreach (['brands' => 'brand_id', 'categories' => 'category_id'] as $route => $field) {
            $this->deleteJson("/api/v1/$route/".$ids[$field])->assertOk();
            $fallback = $this->getJson("/api/v1/$route")->json('data.0.id');
            $this->getJson($url)->assertOk()->assertJsonPath("data.$field", $fallback);
        }
        $this->deleteJson($url)->assertOk();
        $this->assertEmpty(Storage::disk('public')->allFiles());
        $this->getJson($url)->assertNotFound()->assertJsonPath('status', 404);
    }
}
