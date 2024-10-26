<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Reaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'reaction',
        'msg_id',
        'senderId',
        'senderFullName',
        'senderProfilePic',
    ];

    /**
     * Relationship with the Message model.
     */
    public function message()
    {
        return $this->belongsTo(Message::class, 'msg_id');
    }

    /**
     * Relationship with the User model.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'senderId');
    }
}
