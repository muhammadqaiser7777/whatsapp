<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GroupMessages;
use App\Models\GroupMessagesReactions;
use App\Models\User;
use App\Models\GroupParticipants;
use Illuminate\Support\Facades\Auth;

class GroupMessageReactionsController extends Controller
{
    /**
     * Send a reaction to a group message.
     */
    public function sendReaction(Request $request, $group_msg_id)
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

        // Fetch the group message details
        $message = GroupMessages::find($group_msg_id);

        if (!$message) {
            return response()->json(['error' => 'Group message not found.'], 404);
        }

        // Check if the authenticated user is a participant of the group
        $isParticipant = GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $senderId)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant of this group.'], 403);
        }

        // Check if the message status is 'Deleted'
        if ($message->msg_status === 'Deleted') {
            return response()->json(['error' => 'Cannot react to deleted messages.'], 400);
        }

        // Find existing reaction from the user for the given group message
        $reaction = GroupMessagesReactions::where('msg_id', $group_msg_id)
            ->where('sender_id', $senderId)
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
            $reaction = GroupMessagesReactions::create([
                'reaction' => $request->input('reaction'),
                'msg_id' => $group_msg_id,
                'sender_id' => $senderId,
                'senderFullName' => $senderFullName,
                'senderProfilePic' => $senderProfilePic,
            ]);
        }

        // Return the response with the reaction details
        return response()->json([
            'msg_id' => $reaction->msg_id,
            'sender_id' => $reaction->sender_id,
            'senderFullName' => $reaction->senderFullName,
            'senderProfilePic' => $reaction->senderProfilePic,
            'reaction' => $reaction->reaction
        ]);
    }

    /**
     * Get reactions for a specific group message.
     */
    public function getReaction($group_msg_id)
    {
        // Check if the message exists
        $user = Auth::user();
        $message = GroupMessages::find($group_msg_id);
        $senderId = $user->username;

        if (!$message) {
            return response()->json(['error' => 'Group message not found.'], 404);
        }

        // Check if the authenticated user is a participant of the group
        $isParticipant = GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $senderId)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant of this group.'], 403);
        }

        // Fetch all reactions related to the specific group message
        $reactions = GroupMessagesReactions::where('msg_id', $group_msg_id)
            ->get(['msg_id', 'sender_id', 'reaction', 'senderFullName', 'senderProfilePic']);

        // Check if there are no reactions
        if ($reactions->isEmpty()) {
            return response()->json(['message' => 'No Reactions'], 200);
        }

        // Return the reactions
        return response()->json($reactions);
    }

    /**
     * Remove a reaction from a group message.
     */
    public function removeReaction($group_msg_id)
    {
        // Find the authenticated user
        $user = Auth::user();

        // Validate that the user is authenticated
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        // Get the senderId (username) from the authenticated user
        $senderId = $user->username;

        // Fetch the group message
        $message = GroupMessages::find($group_msg_id);

        if (!$message) {
            return response()->json(['error' => 'Group message not found.'], 404);
        }

        // Check if the authenticated user is a participant of the group
        $isParticipant = GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $senderId)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant of this group.'], 403);
        }

        // Find the reaction using msg_id and senderId
        $reaction = GroupMessagesReactions::where('msg_id', $group_msg_id)
            ->where('sender_id', $senderId)
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
