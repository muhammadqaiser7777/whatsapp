<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMessagePollOptions extends Model
{
    use HasFactory;

    protected $fillable = [
        'option',
        'group_msg_id'
    ];

    public function grpMessage()
    {
        return $this->belongsTo(GroupMessages::class, 'msg_id');
    }

    public function grpVotes()
    {
        return $this->hasMany(GroupMessagePollVotes::class, 'option_id');
    }
}
