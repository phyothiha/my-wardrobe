<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('images', fn (Blueprint $table) => $table->unsignedBigInteger('sort_order')->default(0));
        // Existing galleries were displayed in ascending image ID order.
        DB::table('images')->update(['sort_order' => DB::raw('id')]);
    }

    public function down(): void
    {
        Schema::table('images', fn (Blueprint $table) => $table->dropColumn('sort_order'));
    }
};
