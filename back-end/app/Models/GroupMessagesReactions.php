<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMessagesReactions extends Model
{
    use HasFactory;

    protected $fillable = [
        'reaction',
        'msg_id',
        'sender_id',
        'senderFullName',
        'senderProfilePic'
    ];

    public function message()
    {
        return $this->belongsTo(GroupMessages::class, 'msg_id','id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'sender_id','username');
    }
}
