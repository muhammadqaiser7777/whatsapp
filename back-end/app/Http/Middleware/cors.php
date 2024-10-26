<?php

namespace App\Http\Middleware;

use Closure;

class Cors
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);

        // Check if request is an OPTIONS request
        if ($request->getMethod() === 'OPTIONS') {
            $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:2000');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            return $response;
        }

        // Handle non-OPTIONS requests
        $response->headers->set('Access-Control-Allow-Origin', 'http://localhost:2000');
        $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        return $response;
    }
}
