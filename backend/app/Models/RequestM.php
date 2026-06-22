<?php

namespace App\Models;

use Database\Factories\RequestMFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestM extends Model
{
    /** @use HasFactory<RequestMFactory> */
    use HasFactory;
    protected $table = 'requests';
    
    protected $fillable = [
        'user_id',
        'title',
        'description',
        'date',
        'status',
        'document_path',
        'signature_path',
        'signed_at',
    ];

    protected $casts = [
        'date' => 'date',
        'signed_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
