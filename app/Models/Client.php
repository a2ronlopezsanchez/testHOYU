<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Client extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_type',
        'status',
        'business_name',
        'trade_name',
        'first_name',
        'last_name',
        'middle_name',
        'rfc',
        'industry',
        'notes',
        'payment_terms',
        'preferred_payment_method',
        'cfdi_use',
        'preferred_communication_channels',
    ];

    protected $casts = [
        'preferred_communication_channels' => 'array',
    ];

    public function addresses(): HasMany
    {
        return $this->hasMany(ClientAddress::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(ClientContact::class);
    }

    public function fiscalAddress(): HasOne
    {
        return $this->hasOne(ClientAddress::class)->where('address_type', 'fiscal');
    }

    public function physicalAddress(): HasOne
    {
        return $this->hasOne(ClientAddress::class)->where('address_type', 'physical');
    }
}

