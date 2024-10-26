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
        Schema::create('status', function (Blueprint $table) {
            $table->id();
            $table->string('send_by');
            $table->string('sender_fullName');
            $table->string('sender_profilePic');
            $table->string('text_status')->nullable();
            $table->enum('status_type', ['text', 'image', 'video', 'audio']);
            $table->string('media_path')->nullable();
            $table->string('status_caption')->nullable();
            $table->timestamps();

            // Add foreign key constraint
            $table->foreign('send_by')->references('username')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('status');
    }
};
 