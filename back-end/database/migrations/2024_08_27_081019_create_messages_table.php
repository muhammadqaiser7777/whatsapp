<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
{
    Schema::create('messages', function (Blueprint $table) {
        $table->id();
        $table->string('sender_id');
        $table->string('receiver_id');
        $table->unsignedBigInteger('conversation_id');
        $table->text('message')->nullable();
        $table->string('message_type')->default('text');
        $table->string('media_path')->nullable();
        $table->string('caption')->nullable();
        $table->string('fileName')->nullable();
        $table->string('question')->nullable();
        $table->enum("msg_status",["Original","Edited","Deleted"])->default('Original');        
        $table->enum("received_status",["Sent","Read"])->default('Sent');
        $table->timestamps();

        // Foreign keys
        $table->foreign('conversation_id')->references('id')->on('conversations')->onDelete('cascade');
        $table->foreign('sender_id')->references('username')->on('users')->onDelete('cascade');
        $table->foreign('receiver_id')->references('username')->on('users')->onDelete('cascade');
    });
}

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('messages');
    }
}
