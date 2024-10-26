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
        Schema::create('group_message_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('sender_id');
            $table->string('sender_fullName');
            $table->string('sender_profilePic');
            $table->unsignedBigInteger('option_id');
            $table->unsignedBigInteger('grp_messageId');
            $table->boolean('vote')->default(false);
            $table->timestamps();

            $table->foreign('sender_id')->references('id')->on('group_participants')->onDelete('cascade');
            $table->foreign('option_id')->references('id')->on('group_message_poll_options')->onDelete('cascade');
            $table->foreign('grp_messageId')->references('id')->on('group_messages')->onDelete('cascade');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_message_poll_votes');
    }
};
