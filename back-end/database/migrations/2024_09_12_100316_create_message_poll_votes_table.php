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
        Schema::create('message_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->string('sender_id');
            $table->string('sender_fullName');
            $table->string('sender_profilePic');
            $table->unsignedBigInteger('option_id');
            $table->unsignedBigInteger('messageId');
            $table->boolean('vote')->default(false);
            $table->timestamps();

            $table->foreign('sender_id')->references('username')->on('users')->onDelete('cascade');
            $table->foreign('option_id')->references('id')->on('message_poll_options')->onDelete('cascade');
            $table->foreign('messageId')->references('id')->on('messages')->onDelete('cascade');


        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_poll_votes');
    }
};
