<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('broadcasts_participants', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('broadcast_id');
            $table->string('participants_username');
            $table->string('participants_fullName');
            $table->string('participants_profilePic');
            $table->timestamps();

            // Foreign Keys
            $table->foreign('participants_username')->references('username')->on('users')->onDelete('cascade');
            $table->foreign('broadcast_id')->references('id')->on('broadcasts')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('broadcasts_participants');
    }
};
