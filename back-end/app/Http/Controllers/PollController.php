<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\MessagePollOptions;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\MessagePollVotes;

class PollController extends Controller
{
    public function createPoll(Request $request, $receiverUsername)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $receiver = User::where('username', $receiverUsername)->first();

        if (!$receiver) {
            return response()->json(['error' => 'Receiver does not exist'], 404);
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
            $duplicates = array_diff_assoc($options, $uniqueOptions);
            $duplicateOption = reset($duplicates);
            return response()->json(['error' => "Option '{$duplicateOption}' cannot be added more than once."], 400);
        }

        // Check if a conversation exists
        $conversation = Conversation::where(function ($query) use ($user, $receiverUsername) {
            $query->where('user1_id', $user->username)
                  ->where('user2_id', $receiverUsername);
        })->orWhere(function ($query) use ($user, $receiverUsername) {
            $query->where('user1_id', $receiverUsername)
                  ->where('user2_id', $user->username);
        })->first();

        if (!$conversation) {
            $conversation = Conversation::create([
                'user1_id' => $user->username,
                'user2_id' => $receiverUsername,
            ]);
        }

        // Create the poll message
        $message = new Message([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->username,
            'receiver_id' => $receiverUsername,
            'message_type' => 'poll',
            'question' => $request->input('question'),
            'msg_status' => 'Original',
        ]);
        $message->save();

        // Insert poll options
        $optionsData = [];
        foreach ($uniqueOptions as $option) {
            $pollOption = MessagePollOptions::create([
                'msg_id' => $message->id,
                'option' => $option,
            ]);

            $optionsData[] = [
                'option_id' => $pollOption->id,
                'option_name' => $pollOption->option,
                'number_of_votes' => 0,
                'voters' => [],
            ];
        }

        return response()->json([
            'msg_id' => $message->id,
            'message_type' => 'poll',
            'question' => $message->question,
            'sender_id' => $message->sender_id,
            'options' => $optionsData,
            'total_votes' => 0,
            'unique_votes' => 0,
        ], 201);
    }

    public function sendVote(Request $request, $messageId)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $message = Message::where('id', $messageId)
            ->where(function ($query) use ($user) {
                $query->where('sender_id', $user->username)
                      ->orWhere('receiver_id', $user->username);
            })
            ->first();

        if (!$message) {
            return response()->json(['error' => 'You are not allowed to vote on this message'], 403);
        }

        $option = $request->input('option');
        $pollOption = MessagePollOptions::where('id', $option)
            ->where('msg_id', $messageId)
            ->first();

        if (!$pollOption) {
            return response()->json(['error' => 'Option does not exist'], 404);
        }

        $existingVote = MessagePollVotes::where('option_id', $pollOption->id)
            ->where('messageId', $messageId)
            ->where('sender_id', $user->username)
            ->first();

        if ($existingVote) {
            return response()->json(['error' => 'You have already voted for this option'], 400);
        }

        $vote = new MessagePollVotes([
            'option_id'        => $pollOption->id,
            'messageId'        => $messageId,
            'sender_id'        => $user->username,
            'sender_fullName'  => $user->fullName,
            'sender_profilePic' => $user->profilePic,
            'vote'             => true,
        ]);

        $vote->save();

        $options = MessagePollOptions::where('msg_id', $messageId)->get();
        $totalVotes = MessagePollVotes::where('messageId', $messageId)->count();

        $optionsData = $options->map(function ($option) {
            $votes = $option->votes()->get();

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
                })->all(),
            ];
        });

        return response()->json([
            'message' => [
                'msg_id' => $message->id,
                'message_type' => $message->message_type,
                'question' => $message->question,
                'total_votes' => $totalVotes,
                'sender_id' => $message->sender_id,
            ],
            'options' => $optionsData,
        ], 201);
    }

    public function removeVote(Request $request, $msg_id)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $request->validate([
            'option_id' => 'required|integer',
        ]);

        $vote = MessagePollVotes::where('messageId', $msg_id)
            ->where('sender_id', $user->username)
            ->where('option_id', $request->input('option_id'))
            ->first();

        if (!$vote) {
            return response()->json(['error' => 'Vote not found or you do not have permission to remove this vote'], 403);
        }

        $vote->delete();

        $options = MessagePollOptions::where('msg_id', $msg_id)->get();
        $totalVotes = MessagePollVotes::where('messageId', $msg_id)->count();

        $optionsData = $options->map(function ($option) {
            $votes = $option->votes()->get();

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
                })->all(),
            ];
        });

        return response()->json([
            'message' => [
                'msg_id' => $msg_id,
                'total_votes' => $totalVotes,
            ],
            'options' => $optionsData,
        ], 200);
    }


public function getVotesByOption(Request $request, $msg_id, $option)
{
    // Authenticate the user
    $user = Auth::user();

    if (!$user) {
        return response()->json(['error' => 'Unauthorized'], 401);
    }

    // Check if the message exists
    $message = Message::find($msg_id);

    if (!$message) {
        return response()->json(['error' => 'Message not found'], 404);
    }

    // Check if the option exists using the option string instead of option ID
    $pollOption = MessagePollOptions::where('option', $option)
        ->where('msg_id', $msg_id) // Use group_msg_id as msg_id
        ->first();

    if (!$pollOption) {
        return response()->json(['error' => 'Option does not exist'], 404);
    }

    // Fetch all votes for the specified option
    $votes = $pollOption->votes()->get();

    // Prepare the response data
    $voterList = $votes->map(function ($vote) {
        return [
            'sender_id' => $vote->sender_id,
            'sender_fullName' => $vote->sender_fullName,
            'sender_profilePic' => $vote->sender_profilePic,
        ];
    });

    // Return the list of voters and the number of votes for the option
    return response()->json([
        'sender_id' => $message->sender_id,
        'option_id' => $pollOption->id,
        'option_name' => $pollOption->option,
        'number_of_votes' => $votes->count(),
        'voters' => $voterList,
    ], 200);
}



}