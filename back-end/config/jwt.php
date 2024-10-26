<?php

return [
    /*
    |--------------------------------------------------------------------------
    | JWT Secret Key
    |--------------------------------------------------------------------------
    |
    | This key is used to sign your JWT tokens. You should set this to a
    | random, secure string. You can generate a key using the command
    | `php artisan jwt:secret`.
    |
    */
    'secret' => env('JWT_SECRET'),

    /*
    |--------------------------------------------------------------------------
    | TTL (Time To Live)
    |--------------------------------------------------------------------------
    |
    | The TTL (Time To Live) of the JWT tokens in minutes.
    |
    */
    'ttl' => env('JWT_TTL', ), // Default is 60 minutes

    /*
    |--------------------------------------------------------------------------
    | Refresh TTL
    |--------------------------------------------------------------------------
    |
    | The TTL (Time To Live) of the refresh tokens in minutes.
    |
    */
    'refresh_ttl' => env('JWT_REFRESH_TTL', 20160), // Default is 2 weeks

    /*
    |--------------------------------------------------------------------------
    | Algorithms
    |--------------------------------------------------------------------------
    |
    | The algorithms to use for signing JWT tokens.
    |
    */
    'algo' => env('JWT_ALGO', 'HS256'),

    /*
    |--------------------------------------------------------------------------
    | User Model
    |--------------------------------------------------------------------------
    |
    | The model that will be used for user authentication.
    |
    */
    'user' => [
        'model' => App\Models\User::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Blacklist Enabled
    |--------------------------------------------------------------------------
    |
    | Enable or disable token blacklisting. If enabled, the package will
    | maintain a blacklist of invalidated tokens.
    |
    */
    'blacklist_enabled' => env('JWT_BLACKLIST_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Blacklist Grace Period
    |--------------------------------------------------------------------------
    |
    | The grace period in minutes to allow tokens to be used after they have
    | been blacklisted. This is to allow tokens to be used if they were
    | recently blacklisted.
    |
    */
    'blacklist_grace_period' => env('JWT_BLACKLIST_GRACE_PERIOD', 10),

    /*
    |--------------------------------------------------------------------------
    | Cache Enabled
    |--------------------------------------------------------------------------
    |
    | Enable or disable caching of tokens.
    |
    */
    'cache_enabled' => env('JWT_CACHE_ENABLED', true),

    /*
    |--------------------------------------------------------------------------
    | Cache Store
    |--------------------------------------------------------------------------
    |
    | The cache store to use for caching tokens.
    |
    */
    'cache' => [
        'store' => env('JWT_CACHE_STORE', 'file'),
        'prefix' => env('JWT_CACHE_PREFIX', 'jwt'),
    ],
];
