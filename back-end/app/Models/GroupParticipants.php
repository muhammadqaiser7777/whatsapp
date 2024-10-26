<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GroupParticipants extends Model
{
    use HasFactory;
    protected $fillable = [
        'participant_username',
        'participant_fullName',
        'participant_profilePic',
        'group_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'participant_username','username');
    }

    public function groups(){
        return $this->belongsTo(Groups::class, 'group_id','id');
    }
}
