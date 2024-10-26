<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use PHPOpenSourceSaver\JWTAuth\Facades\JWTAuth;
use Carbon\Carbon;
use App\Events\UserLoggedIn;

class AuthController extends Controller
{
    // Register a User
    public function signup(Request $request)
    {
        // Validate request data
        $validator = Validator::make($request->all(), [
            'fullName' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username',
            'password' => 'required|string|min:8',
            'gender' => 'required|string|in:male,female'
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Hash the password
        $hashedPassword = Hash::make($request->password);

        // Generate avatar URL based on gender
        $avatarUrl = $request->gender === 'male' ? 
            "https://avatar.iran.liara.run/public/boy?username={$request->username}" : 
            "https://avatar.iran.liara.run/public/girl?username={$request->username}";

        // Create new user
        $newUser = new User([
            'fullName' => $request->fullName,
            'username' => $request->username,
            'password' => $hashedPassword,
            'gender' => $request->gender,
            'profilePic' => $avatarUrl,
        ]);

        // Save the user to the database
        if ($newUser->save()) {
            return response()->json([
                '_id' => $newUser->id,
                'fullName' => $newUser->fullName,
                'username' => $newUser->username,
                'profilePic' => $newUser->profilePic
            ], 201);
        } else {
            return response()->json(['error' => 'Invalid user data'], 400);
        }
    }

    // Get a JWT via given credentials
    public function login(Request $request)
    {
        $credentials = $request->only(['username', 'password']);

        if (!$token = JWTAuth::attempt($credentials)) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Retrieve the authenticated user
        $user = JWTAuth::user();

        // Update user status to online and set last seen time
        $user->is_online = true;
        $user->last_seen = Carbon::now();
        $user->save();

        // Fire the UserLoggedIn event
    event(new UserLoggedIn($user));

        return response()->json([
            'message' => 'Login Successful',
            'id' => $user->id,
            'username' => $user->username,
            'fullName' => $user->fullName,
            'profilePic' => $user->profilePic,
            'token' => $this->respondWithToken($token)
        ], 200);
    }

    // Log the user out (Invalidate the token)
    public function logout(Request $request)
    {
        $authorizationHeader = $request->header('Authorization');

        if (!$authorizationHeader) {
            return response()->json(['error' => 'Authorization header not provided'], 401);
        }

        $token = str_replace('Bearer ', '', $authorizationHeader);

        if (empty($token)) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        try {
            if (JWTAuth::setToken($token)->check()) {
                $user = JWTAuth::parseToken()->authenticate();

                if ($user) {
                    JWTAuth::invalidate($token);

                    // Update user status to offline and set last seen time
                    $user->is_online = false;
                    $user->last_seen = Carbon::now();
                    $user->save();
                }

                return response()->json(['message' => 'Logout Successful'], 200);
            } else {
                return response()->json(['error' => 'Token is already invalid'], 401);
            }
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
    }

    // Refresh the JWT token
    public function refresh(Request $request)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json(['error' => 'Token not provided'], 401);
        }

        try {
            $newToken = JWTAuth::refresh($token);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }

        return $this->respondWithToken($newToken);
    }

    // Return a JSON response with the token information
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => JWTAuth::factory()->getTTL() * 10080
        ]);
    }

}
