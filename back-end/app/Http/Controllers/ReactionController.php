<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Reaction;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Message;

class ReactionController extends Controller
{
    /**
     * Send a reaction to a message.
     */
    public function sendReaction(Request $request, $msg_id)
{
    // Find the authenticated user
    $user = Auth::user();

    // Validate that the user is authenticated
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Get the senderId (username) from the authenticated user
    $senderId = $user->username;

    // Fetch user details from the User model
    $userDetails = User::where('username', $senderId)
        ->select('fullName', 'profilePic')
        ->first();

    // Check if user details were found
    if (!$userDetails) {
        return response()->json(['error' => 'User details not found'], 404);
    }

    // Ensure the user details are not empty
    $senderFullName = $userDetails->fullName;
    $senderProfilePic = $userDetails->profilePic;

    if (empty($senderFullName)) {
        return response()->json(['error' => 'Full name is missing'], 400);
    }

    if (empty($senderProfilePic)) {
        return response()->json(['error' => 'Profile picture is missing'], 400);
    }

    // Fetch the message details
    $message = Message::find($msg_id);

    if (!$message) {
        return response()->json(['error' => 'Message not found.'], 404);
    }

    // Check if the authenticated user is either the sender or receiver of the message
    if ($message->sender_id !== $senderId && $message->receiver_id !== $senderId) {
        return response()->json(['error' => 'Action not allowed: You are neither the sender nor the receiver of this message.'], 403);
    }

    // Check if the message status is 'Deleted'
    if ($message->msg_status === 'Deleted') {
        return response()->json(['error' => 'Cannot react to deleted messages.'], 400);
    }

    // Find existing reaction from the user for the given message
    $reaction = Reaction::where('msg_id', $msg_id)
        ->where('senderId', $senderId)
        ->first();

    if ($reaction) {
        // Update existing reaction
        $reaction->update([
            'reaction' => $request->input('reaction'),
            'senderFullName' => $senderFullName,
            'senderProfilePic' => $senderProfilePic,
        ]);
    } else {
        // Create a new reaction
        $reaction = Reaction::create([
            'reaction' => $request->input('reaction'),
            'msg_id' => $msg_id,
            'senderId' => $senderId,
            'senderFullName' => $senderFullName,
            'senderProfilePic' => $senderProfilePic,
        ]);
    }

    // Return the response with the reaction details
    return response()->json([
        'msg_id' => $reaction->msg_id,
        'senderId' => $reaction->senderId,
        'senderFullName' => $reaction->senderFullName,
        'senderProfilePic' => $reaction->senderProfilePic,
        'reaction' => $reaction->reaction
    ]);
}


    /**
     * Get reactions for a specific message.
     */
    public function getReaction($msg_id)
{
    // Check if the message exists
    $user = Auth::user();
    $message = Message::find($msg_id);
    $senderId = $user->username;


    if (!$message) {
        return response()->json(['error' => 'Message not found.'], 404);
    }

    if ($message->sender_id !== $senderId && $message->receiver_id !== $senderId) {
        return response()->json(['error' => 'Action not allowed: You are neither the sender nor the receiver of this message.'], 403);
    }

    // Fetch all reactions related to the specific message
    $reactions = Reaction::where('msg_id', $msg_id)
        ->get(['msg_id', 'senderId', 'reaction', 'senderFullName', 'senderProfilePic']);

    // Check if there are no reactions
    if ($reactions->isEmpty()) {
        return response()->json(['message' => 'No Reactions'], 200);
    }

    // Return the reactions
    return response()->json($reactions);
}

     /**
     * Remove a reaction from a message.
     */
    public function removeReaction($msg_id)
    {
        // Find the authenticated user
        $user = Auth::user();

        // Validate that the user is authenticated
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the senderId (username) from the authenticated user
        $senderId = $user->username;

        // Find the reaction using msg_id and senderId
        $reaction = Reaction::where('msg_id', $msg_id)
            ->where('senderId', $senderId)
            ->first();

        // Check if the reaction exists
        if (!$reaction) {
            return response()->json(['error' => 'No past reactions on this message to remove'], 404);
        }

        // Remove the reaction
        $reaction->delete();

        // Return a success response
        return response()->json(['message' => 'Reaction removed successfully']);
    }
}
