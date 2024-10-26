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
        Schema::create('group_messages_reactions',function (Blueprint $table){
            $table->id();
            $table->string('reaction');
            $table->unsignedBigInteger('msg_id');
            $table->string('sender_id');
            $table->string('senderFullName')->default('');
            $table->string('senderProfilePic')->nullable();
            $table->timestamps();

            $table->foreign('msg_id')->references('id')->on('group_messages')->onDelete('cascade');
            $table->foreign('sender_id')->references('username')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_messages_reactions');
    }
};
