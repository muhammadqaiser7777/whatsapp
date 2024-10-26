<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Status extends Model
{
    use HasFactory;

    protected $table = 'status';

    protected $fillable = [
        'send_by',
        'sender_fullName',
        'sender_profilePic',
        'text_status',
        'status_type',
        'media_path',
        'status_caption'
    ];

    public function sendBy()
    {
        return $this->belongsTo(User::class, 'send_by','username');
    }
}
