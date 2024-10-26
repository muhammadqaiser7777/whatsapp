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
        Schema::create('group_messages', function (Blueprint $table){
            $table->id();
            $table->string('sender_id');
            $table->string('sender_fullName')->nullable();
            $table->string('sender_profilePic')->nullable();
            $table->unsignedBigInteger('group_id');
            $table->text('message')->nullable();
            $table->string('question')->nullable();
            $table->string('message_type')->default('text');
            $table->string('media_path')->nullable();
            $table->string('caption')->nullable();
            $table->string('fileName')->nullable();
            $table->enum("msg_status",["Original","Edited","Deleted"]);
            $table->timestamps();


            $table->foreign('sender_id')->references('participant_username')->on('group_participants')->onDelete('cascade');
            $table->foreign('group_id')->references('id')->on('groups')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('group_messages');
    }
};
