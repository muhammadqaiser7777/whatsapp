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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('fullName');
            $table->string('username')->unique();
            $table->string('password');
            $table->enum('gender', ['male', 'female', 'other']);
            $table->text('profilePic');
            $table->boolean('is_online')->default(false); // New column for online status
            $table->timestamp('last_seen')->nullable(); // New column for last seen time
            $table->rememberToken();
            $table->timestamps();
        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
