<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Broadcasts extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'owner'
    ];

    public function participants()
    {
        return $this->hasMany(BroadcastsParticipants::class, 'broadcast_id');
    }

    public function ownerUser()
    {
        return $this->belongsTo(User::class, 'owner', 'username');
    }
}

