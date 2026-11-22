<?php

use App\Models\Cloth;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            DB::table('clothes')->chunkById(200, function ($clothes) {
                foreach ($clothes as $cloth) {
                    $owner = ['imageable_type' => Cloth::class, 'imageable_id' => $cloth->id];
                    foreach (json_decode($cloth->photos, true, flags: JSON_THROW_ON_ERROR) as $path) {
                        DB::table('images')->updateOrInsert($owner + ['path' => $path], [
                            'created_at' => $cloth->created_at,
                            'updated_at' => $cloth->updated_at,
                        ]);
                    }
                }
            });
        });

        Schema::table('clothes', fn (Blueprint $table) => $table->dropColumn('photos'));
    }

    public function down(): void
    {
        Schema::table('clothes', fn (Blueprint $table) => $table->json('photos')->nullable());
        DB::table('clothes')->chunkById(200, function ($clothes) {
            foreach ($clothes as $cloth) {
                $paths = DB::table('images')->where('imageable_type', Cloth::class)
                    ->where('imageable_id', $cloth->id)->orderBy('id')->pluck('path');
                DB::table('clothes')->where('id', $cloth->id)->update(['photos' => $paths->toJson()]);
            }
        });
        DB::table('images')->where('imageable_type', Cloth::class)->delete();
    }
};
