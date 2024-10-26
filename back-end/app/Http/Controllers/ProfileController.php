<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\GroupMessages;
use App\Models\GroupMessagesReactions;
use App\Models\GroupParticipants;
use App\Models\Reaction;
use App\Models\BroadcastsParticipants;
use App\Models\MessagePollVotes;
use App\Models\Status;
use App\Models\GroupMessagePollVotes;

class ProfileController extends Controller
{
    /**
     * Update the profile picture of the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Validate the image file
        $request->validate([
            'profilePic' => 'required|image|mimes:jpeg,png,jpg,gif|max:10240', // 10MB limit
        ]);

        $image = $request->file('profilePic');
        $originalFileName = $image->getClientOriginalName(); // Get the original file name
        $directory = 'profiles';

        // Save the image with the original name in the 'profiles' directory under 'public'
        $path = $image->storeAs($directory, $originalFileName, 'public'); 

        // Construct the full URL manually
        $url = asset('/' . $path);  // This will create the full URL like http://127.0.0.1:8000/storage/profiles/yourfile.png

        // Update the User model with the full path
        User::where('username', $user->username)
            ->update(['profilePic' => $url]);

        // Update other related models
        GroupMessages::where('sender_id', $user->username)
            ->update(['sender_profilePic' => $url]);

        GroupMessagesReactions::where('sender_id', $user->username)
            ->update(['senderProfilePic' => $url]);

        GroupParticipants::where('participant_username', $user->username)
            ->update(['participant_profilePic' => $url]);

        Reaction::where('senderId', $user->username)
            ->update(['senderProfilePic' => $url]);

        BroadcastsParticipants::where('participants_username', $user->username)
            ->update(['participants_profilePic' => $url]);

        Status::where('send_by', $user->username)
            ->update(['sender_profilePic' => $url]);

        MessagePollVotes::where('sender_id', $user->username)
            ->update(['sender_profilePic' => $url]);

        GroupMessagePollVotes::where('sender_id', $user->id)
            ->update(['sender_profilePic' => $url]);

        return response()->json([
            'message' => 'Profile Pic changed to ' . $url
        ]);
    }

    /**
     * Update the full name of the authenticated user.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateFullName(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        // Validate the fullName input
        $request->validate([
            'fullName' => 'required|string|max:255',
        ]);

        $fullName = $request->input('fullName');

        // Update User model
        User::where('username', $user->username)
            ->update(['fullName' => $fullName]);

        // Update GroupMessages model if applicable
        GroupMessages::where('sender_id', $user->username)
            ->update(['sender_fullName' => $fullName]);

        // Update GroupMessagesReactions model if applicable
        GroupMessagesReactions::where('sender_id', $user->username)
            ->update(['senderFullName' => $fullName]);

        // Update GroupParticipants model if applicable
        GroupParticipants::where('participant_username', $user->username)
            ->update(['participant_fullName' => $fullName]);

        // Update Reaction model if applicable
        Reaction::where('senderId', $user->username)
            ->update(['senderFullName' => $fullName]);

        //Update Status model if applicable
        Status::where('send_by', $user->username)
            ->update(['sender_fullName' => $fullName]);

        // Update Broadcast Participant model if applicable
        BroadcastsParticipants::where('participants_username', $user->username)
            ->update(['participants_fullName' => $fullName]);

        // Update Message Poll Votes model if applicable
        MessagePollVotes::where('sender_id', $user->username)
            ->update(['sender_fullName' => $fullName]);

        // Update Group Message Poll Votes model if applicable
        GroupMessagePollVotes::where('sender_id', $user->id)
            ->update(['sender_fullName' => $fullName]);

        return response()->json([
            'message' => 'Full Name updated to ' . $fullName
        ]);
    }
}
