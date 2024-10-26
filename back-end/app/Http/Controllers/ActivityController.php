<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class ActivityController extends Controller
{
    /**
     * Fetch user online status and last seen timestamp by username.
     *
     * @param  string  $username
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserStatus($username)
    {
        $authUser = Auth::user(); // Get the authenticated user
    
        // Check if the requested username is the same as the authenticated user's username
        if ($username === $authUser->username) {
            return response()->json([
                'is_online' => true, // Since it's the authenticated user, it's always considered online
                'last_seen' => 'Now', // Indicate that the user is currently online
                'message' => 'Checking status of yourself will always return true.',
            ]);
        }
    
        // Find the user by username
        $user = User::where('username', $username)->first();
    
        // If the user is found, return the status and last seen timestamp
        if ($user) {
            return response()->json([
                'is_online' => $user->is_online,
                'last_seen' => $user->is_online 
                    ? 'Now' 
                    : ($user->last_seen ? $user->last_seen->toIso8601String() : 'Unknown'), // Handle null case
            ]);
        }
    
        // If the user is not found, return a 404 error
        return response()->json(['error' => 'User not found'], 404);
    }
}
