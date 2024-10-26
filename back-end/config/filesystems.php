<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Filesystem Disk
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default filesystem disk that should be used
    | by the framework. The "local" disk, as well as a variety of cloud
    | based disks are available to your application for file storage.
    |
    */

    'default' => env('FILESYSTEM_DISK', 'public'), // Set 'public' as the default disk for public file storage.

    /*
    |--------------------------------------------------------------------------
    | Filesystem Disks
    |--------------------------------------------------------------------------
    |
    | Below you may configure as many filesystem disks as you need, and you
    | may even configure multiple disks of the same driver. Defaults for
    | the supported storage drivers are provided for reference.
    |
    | Supported drivers: "local", "ftp", "sftp", "s3"
    |
    */

    'disks' => [

        // Local storage (private)
        'local' => [
            'driver' => 'local',
            'root' => storage_path('app'),
            'throw' => false, // Don't throw exceptions for local disk issues.
        ],

        // Public storage (for publicly accessible files)
       'public' => [
        'driver' => 'local',
        'root' => public_path(),
        'url' => env('APP_URL').'/public',
        'visibility' => 'public',
    ],

        // Temporary storage (for temporary files, e.g., during uploads)
        'temporary' => [
            'driver' => 'local',
            'root' => storage_path('app/tmp'), // Temporary file storage path.
            'visibility' => 'private',        // Keep these files private.
            'throw' => false,                 // Don't throw exceptions for temporary storage issues.
        ],

        // Amazon S3 storage (cloud storage)
        's3' => [
            'driver' => 's3',
            'key' => env('AWS_ACCESS_KEY_ID'),
            'secret' => env('AWS_SECRET_ACCESS_KEY'),
            'region' => env('AWS_DEFAULT_REGION'),
            'bucket' => env('AWS_BUCKET'),
            'url' => env('AWS_URL'),
            'endpoint' => env('AWS_ENDPOINT'),
            'use_path_style_endpoint' => env('AWS_USE_PATH_STYLE_ENDPOINT', false),
            'throw' => false, // Don't throw exceptions for S3 storage issues.
        ],

        // Add additional cloud or remote storage configurations here if needed.
    ],

    /*
    |--------------------------------------------------------------------------
    | Symbolic Links
    |--------------------------------------------------------------------------
    |
    | This is where you configure the symbolic links created by the
    | `storage:link` Artisan command. These links allow you to access
    | files stored in the storage directory from the public directory.
    |
    */

    'links' => [
        public_path('storage') => storage_path('app/public'), // Link storage/app/public to public/storage for public access.
    ],

];
