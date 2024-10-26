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
        Schema::create('reactions', function (Blueprint $table) {
            $table->id();
            $table->string('reaction');
            $table->unsignedBigInteger('msg_id');
            $table->string('senderId');
            $table->string('senderFullName')->default('');
            $table->string('senderProfilePic')->nullable(); 
            $table->timestamps();

            // Add foreign key constraints
            $table->foreign('msg_id')->references('id')->on('messages')->onDelete('cascade');
            $table->foreign('senderId')->references('username')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reactions');
    }
};