<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Groups extends Model
{
    use HasFactory;
    protected $fillable = [
        'group_name',
        'group_dp',
        'path'
    ];

    // Define the relationship to GroupParticipants
    public function participants()
    {
        return $this->hasMany(GroupParticipants::class, 'group_id');
    }

    public function lastMessage()
    {
        return $this->hasOne(GroupMessages::class, 'group_id')->latestOfMany();
    }
}
