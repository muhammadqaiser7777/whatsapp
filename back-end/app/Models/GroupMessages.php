<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupMessages extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'sender_fullName',
        'sender_profilePic',
        'group_id',
        'message',
        'question',
        'message_type',
        'caption',
        'media_path',
        'fileName',
        'msg_status'
    ];

    public function user()
    {
        return $this->belongsTo(GroupParticipants::class , 'sender_id','participant_username');
    }

    public function groups()
    {
        return $this->belongsTo(Groups::class , 'group_id','id');
    }
}
