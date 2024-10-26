<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MessagePollOptions extends Model
{
    use HasFactory;

    protected $fillable = [
        'option',
        'msg_id'
    ];

    public function message()
    {
        return $this->belongsTo(Message::class, 'msg_id');
    }

    public function votes()
    {
        return $this->hasMany(MessagePollVotes::class, 'option_id');
    }
}
