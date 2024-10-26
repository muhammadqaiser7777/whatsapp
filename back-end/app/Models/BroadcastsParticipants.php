<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BroadcastsParticipants extends Model
{
    use HasFactory;

    protected $fillable = [
        'participants_username',
        'participants_fullName',
        'participants_profilePic',
        'broadcast_id'
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'participants_username', 'username');
    }

    public function broadcast()
    {
        return $this->belongsTo(Broadcasts::class, 'broadcast_id');
    }
}
