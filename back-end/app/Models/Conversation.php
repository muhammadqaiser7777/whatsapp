<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Conversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user1_id',
        'user2_id',
    ];

    /**
     * Get the messages for the conversation.
     */
    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    /**
     * Get the first user in the conversation.
     */
    public function user1()
    {
        return $this->belongsTo(User::class, 'user1_id','username');
    }

    /**
     * Get the second user in the conversation.
     */
    public function user2()
    {
        return $this->belongsTo(User::class, 'user2_id','username');
    }
}
