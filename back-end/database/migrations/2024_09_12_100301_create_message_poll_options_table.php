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
        Schema::create('message_poll_options', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('msg_id');
            $table->string('option');
            $table->timestamps();

            $table->foreign('msg_id')->references('id')->on('messages')->onDelete('cascade');

        });

    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('message_poll_options');
    }
};
