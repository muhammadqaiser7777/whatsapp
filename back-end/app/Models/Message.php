<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'receiver_id',
        'message',
        'message_type',
        'question',
        'caption',
        'media_path',
        'fileName',
        'msg_status',
        'received_status'
    ];
    

    
    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id','username');
    }

    public function receiver()
    {
        return $this->belongsTo(User::class, 'receiver_id','username');
    }

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function pollOptions()
    {
        return $this->hasMany(MessagePollOptions::class, 'msg_id');
    }

}