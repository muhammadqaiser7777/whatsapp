<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessagePollVotes extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_id',
        'messageId',
        'sender_id',
        'vote',
        'sender_fullName',
        'sender_profilePic'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'sender_id','username');
    }

    public function option()
    {
        return $this->belongsTo(MessagePollOptions::class, 'option_id','id');
    }

    public function sender(){
        return $this->belongsTo(Message::class, 'messageId','id');
    }
}
