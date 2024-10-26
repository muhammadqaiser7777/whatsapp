<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMessagePollVotes extends Model
{
    use HasFactory;

    protected $fillable = [
        'option_id',
        'grp_messageId',
        'sender_id',
        'vote',
        'sender_fullName',
        'sender_profilePic'
    ];

    public function grpUser()
    {
        return $this->belongsTo(GroupParticipants::class, 'sender_id');
    }

    public function grpOption()
    {
        return $this->belongsTo(GroupMessagePollOptions::class, 'option_id');
    }
}
