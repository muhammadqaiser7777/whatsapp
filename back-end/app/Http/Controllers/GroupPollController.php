<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Groups;
use App\Models\GroupMessagePollOptions;
use App\Models\GroupMessages;
use App\Models\GroupMessagePollVotes;
use App\Models\GroupParticipants;

class GroupPollController extends Controller
{
    // Create a poll for a group
    public function createGroupPoll(Request $request, $groupId)
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        // Check if the group exists
        $group = Groups::find($groupId);
    
        if (!$group) {
            return response()->json(['error' => 'Group does not exist'], 404);
        }
    
        // Check if the authenticated user is a participant in the group
        $isParticipant = GroupParticipants::where('group_id', $groupId)
            ->where('participant_username', $user->username)
            ->exists();
    
        if (!$isParticipant) {
            return response()->json(['error' => 'You are not a participant of this group'], 403);
        }
    
        // Validate the poll creation request
        $validator = Validator::make($request->all(), [
            'question' => 'required|string|max:255',
            'options' => 'required|array|min:2', // At least two options are required
            'options.*' => 'required|string|max:255',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        // Check for duplicate options
        $options = $request->input('options');
        $uniqueOptions = array_unique($options);
        
        if (count($options) != count($uniqueOptions)) {
            // Find the duplicate options
            $duplicates = array_diff_assoc($options, $uniqueOptions);
            $duplicateOption = reset($duplicates); // Get the first duplicate found
            return response()->json(['error' => "Option '{$duplicateOption}' cannot be added more than once."], 400);
        }
    
        // Create the poll message
        $groupMessage = new GroupMessages([
            'group_id' => $group->id,
            'sender_id' => $user->username,
            'sender_fullName' => $user->fullName,
            'sender_profilePic' => $user->profilePic,
            'message_type' => 'poll',
            'question' => $request->input('question'),
            'msg_status' => 'Original',
        ]);
        $groupMessage->save();
    
        // Insert the poll options and prepare options data
        $optionsData = [];
        foreach ($uniqueOptions as $option) {
            $pollOption = GroupMessagePollOptions::create([
                'group_msg_id' => $groupMessage->id,
                'option' => $option,
            ]);
            $optionsData[] = [
                'option_id' => $pollOption->id, // Make sure to retrieve the generated ID
                'option_name' => $pollOption->option,
                'number_of_votes' => 0, // Initialize to 0, as no votes are cast yet
                'voters' => [], // No voters at creation
            ];
        }

        $totalVotes = 0; // No votes yet
    $uniqueVotes = 0; // No unique votes yet
    
        // Construct the response to match getMessages
        return response()->json([
            'msg_id' => $groupMessage->id,
            'message_type' => 'poll',
            'sender_fullName' => $groupMessage->sender_fullName,
            'sender_profilePic' => $groupMessage->sender_profilePic,
            'question' => $groupMessage->question,
            'options' => $optionsData, // Include the options with their IDs
            'total_votes' => $totalVotes,
            'unique_votes' => $uniqueVotes,
        ], 201);
    }
    

    // Send a vote for a group poll
    public function sendGroupVote(Request $request, $group_msg_id)
{
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Check if the group message exists
    $groupMessage = GroupMessages::where('id', $group_msg_id)->first();

    if (!$groupMessage) {
        return response()->json(['error' => 'Group message not found'], 404);
    }

    // Ensure the user is a participant of the group
    $isParticipant = GroupParticipants::where('group_id', $groupMessage->group_id)
        ->where('participant_username', $user->username)
        ->exists();

    if (!$isParticipant) {
        return response()->json(['error' => 'You are not a participant of this group'], 403);
    }

    // Get the option from the request
    $option = $request->input('option');

    // Check if the option exists in the `group_message_poll_options` table for the given group message
    $pollOption = GroupMessagePollOptions::where('id', $option)
        ->where('group_msg_id', $group_msg_id)
        ->first();

    if (!$pollOption) {
        return response()->json(['error' => 'Option does not exist'], 404);
    }

    // Check if the user has already voted for this option
    $existingVote = GroupMessagePollVotes::where('option_id', $pollOption->id)
        ->where('grp_messageId', $group_msg_id)
        ->where('sender_id', $user->id) // Ensure this matches the type (integer)
        ->first();

    if ($existingVote) {
        return response()->json(['error' => 'You have already voted for this option'], 400);
    }

    // Save the vote in the `group_message_poll_votes` table
    $vote = new GroupMessagePollVotes([
        'option_id'        => $pollOption->id,
        'grp_messageId'    => $group_msg_id,
        'sender_id'        => $user->id, // Ensure this matches the type (integer)
        'sender_fullName'  => $user->fullName,
        'sender_profilePic' => $user->profilePic,
        'vote'             => true,
    ]);
    $vote->save();

    // Fetch total votes for each option
    $options = GroupMessagePollOptions::where('group_msg_id', $group_msg_id)->get();

    // Fetch total votes for the poll
    $totalVotes = GroupMessagePollVotes::where('grp_messageId', $groupMessage->id)->count();
    
    $optionsData = $options->map(function ($option) {
        $votes = $option->grpVotes()->get();

        return [
            'option_id' => $option->id,
            'option_name' => $option->option,
            'number_of_votes' => $votes->count(),
            'voters' => $votes->map(function ($vote) {
                    return [
                        'sender_id' => $vote->sender_id,
                        'sender_profilePic' => $vote->sender_profilePic,
                        'sender_fullName' => $vote->sender_fullName,
                    ];
                })->values()->all(),
        ];
    });

    // Return the required response structure
    return response()->json([
        'group_message' => [
            'group_msg_id' => $groupMessage->id,
            'sender_id' => $groupMessage->sender_id, 
            'sender_fullName' => $groupMessage->sender_fullName,
            'sender_profilePic' => $groupMessage->sender_profilePic,
            'message_type' => $groupMessage->message_type,
            'question' => $groupMessage->question,
            'total_votes' => $totalVotes,
        ],
        'options' => $optionsData,
    ], 201);
}

public function removeGroupVote(Request $request, $msg_id)
{
    $user = Auth::user();

    // Check if the user is authenticated
    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Validate the incoming request
    $request->validate([
        'option_id' => 'required|integer',
    ]);

    // Check if the user has voted on this message
    $vote = GroupMessagePollVotes::where('grp_messageId', $msg_id)
        ->where('sender_id', $user->id) // Change username to ID for comparison
        ->where('option_id', $request->option_id)
        ->first();

    // Check if the vote belongs to the authenticated user
    if (!$vote) {
        return response()->json(['error' => 'Vote not found or you do not have permission to remove this vote'], 403);
    }

    // Remove the vote
    $vote->delete();

    return response()->json(['message' => 'Vote removed successfully'], 200);
}

public function getVotesByOption(Request $request, $group_msg_id, $option)
{
    // Authenticate the user
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Check if the group message exists
    $groupMessage = GroupMessages::find($group_msg_id);

    if (!$groupMessage) {
        return response()->json(['error' => 'Group message not found'], 404);
    }

    // Check if the option exists in the poll options for the given message ID
    $pollOption = GroupMessagePollOptions::where('option', $option)
        ->where('group_msg_id', $group_msg_id)
        ->first();

    if (!$pollOption) {
        return response()->json(['error' => 'Option does not exist'], 404);
    }

    // Fetch all votes for the specified group_msg_id and the specific option
    $votes = $pollOption->votes()->get();

    // Prepare the response data
    $voterList = $votes->isEmpty() ? [] : $votes->map(function ($vote) {
        return [
            'sender_id' => $vote->sender_id,
            'sender_fullName' => $vote->sender_fullName,
            'sender_profilePic' => $vote->sender_profilePic,
        ];
    });

    // Return the list of voters and the number of votes for the option
    return response()->json([
        'option_id' => $pollOption->id,
        'option_name' => $pollOption->option,
        'number_of_votes' => $votes->count(),
        'voters' => $voterList,
    ], 200);
}


}
