<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\Message;
use App\Models\Conversation;
use App\Models\Reaction;
use App\Models\MessagePollOptions;
use App\Models\MessagePollVotes;

class MessageController extends Controller
{
    /**
     * Send a message to a receiver.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $receiverUsername
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request, $receiverUsername)
    {
        $user = Auth::user(); // Get the authenticated user
    
        // Define allowed extensions for each message type
        $extensions = [
            'image' => 'jpeg,png,jpg,gif',
            'video' => 'mp4,mov,avi,wmv',
            'audio' => 'mp3,wav',
            'pdf' => 'pdf',
            'word' => 'doc,docx',
            'ppt' => 'ppt,pptx',
            'excel' => 'xls,xlsx'
        ];
    
        // Validate request data
        $validator = Validator::make($request->all(), [
            'message_type' => 'required|string|in:text,image,video,audio,pdf,word,ppt,excel,poll',
            'message' => [
                'required_if:message_type,text',
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if (request()->input('message_type') === 'text' && empty($value)) {
                        $fail('The message field cannot be empty for text messages.');
                    }
                    if (request()->input('message_type') !== 'text' && !empty($value)) {
                        $fail('The message field is only allowed for text messages. Remove the message for non-text types.');
                    }
                },
            ],
            'question' => [
                'required_if:message_type,poll',
                'nullable',
                'string',
                function($attribute, $value, $fail){
                    if (request()->input('message_type') === 'poll' && empty($value)){
                        $fail('The question field cannot be empty for poll messages.');
                    }
                    if (request()->input('message_type') !== 'poll' && !empty($value)){
                        $fail('The question field is only allowed for poll messages.');
                    }
                },
            ],
            'media' => [
                'required_if:message_type,image,video,audio,pdf,word,ppt,excel', 
                function ($attribute, $value, $fail) use ($request, $extensions) {
                    $messageType = $request->message_type;
                    if ($messageType !== 'text' && !$value) {
                        $fail('The media field is required for non-text messages.');
                    }
    
                    if ($messageType === 'text' && $value) {
                        $fail('The media field should not be provided for text messages.');
                    }
    
                    if ($value) {
                        $allowedExtensions = $extensions[$messageType] ?? '';
                        $extension = $value->getClientOriginalExtension();
    
                        if (!in_array($extension, explode(',', $allowedExtensions))) {
                            $fail("Invalid file type for {$messageType}. Allowed types: {$allowedExtensions}.");
                        }
                    }
                },
                'max:204800', // 200MB max size
            ],
            'caption' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->message_type === 'audio' && !empty($value)) {
                        $fail('Caption should not be provided for audio messages.');
                    }
                },
            ],
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }
    
        if ($user->username == $receiverUsername) {
            return response()->json(['error' => 'You cannot send a message to yourself.'], 400);
        }
    
        // Check if message_type is poll and redirect to PollController
        if ($request->message_type === 'poll') {
            return app(PollController::class)->createPoll($request, $receiverUsername);
        }
    
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
    
        $messageData = [
            'conversation_id' => $conversation->id,
            'sender_id' => $user->username,
            'receiver_id' => $receiverUsername,
            'message' => $request->message,
            'question' => $request->question,
            'message_type' => $request->message_type,
            'caption' => $request->caption,
            'fileName' => null,
            'msg_status' => 'Original',
        ];
    
        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $directory = $this->getDirectoryBasedOnType($request->message_type);
    
            // Save files directly in the public directory
            $publicPath = public_path($directory);
    
            // Ensure the directory exists
            if (!file_exists($publicPath)) {
                try {
                    mkdir($publicPath, 0755, true);
                    Log::info("Directory created: $publicPath");
                } catch (\Exception $e) {
                    Log::error("Failed to create directory: $publicPath", ['exception' => $e]);
                    return response()->json(['error' => 'Failed to create directory.'], 500);
                }
            }
    
            // Retain the original file name
            $filename = $file->getClientOriginalName();
            $file->move($publicPath, $filename);
    
            $messageData['media_path'] = asset("$directory/$filename");
            $messageData['fileName'] = $filename;
        }
    
        $message = Message::create($messageData);
    
        // Check if the message type is 'poll' to customize the response
        if ($request->message_type === 'poll') {
            // Fetch total votes for each option
            $options = MessagePollOptions::where('msg_id', $message->id)->get();
    
            // Fetch total votes for the poll
            $totalVotes = MessagePollVotes::where('messageId', $message->id)->count();
    
            // Fetch unique votes for each option
            $optionsData = $options->map(function ($option) {
                // Get all votes for this option
                $votes = $option->votes()->get();
    
                // Get unique voter IDs
                $uniqueVoterIds = $votes->pluck('sender_id')->unique();
    
                return [
                    'option_id' => $option->id,
                    'option_name' => $option->option,
                    'number_of_votes' => $votes->count(),
                    'unique_votes' => $uniqueVoterIds->count(), // Count unique voters
                    'voters' => $votes->map(function ($vote) {
                        return [
                            'sender_id' => $vote->sender_id,
                            'sender_fullName' => $vote->sender_fullName,
                            'sender_profilePic' => $vote->sender_profilePic,
                        ];
                    }),
                ];
            });
    
            return response()->json([
                'message' => [
                    'msg_id' => $message->id,
                    'message_type' => $message->message_type,
                    'question' => $message->question,
                    'total_votes' => $totalVotes,
                ],
                'options' => $optionsData,
            ], 201);
        }
    
        // For non-poll messages, return the standard response
        return response()->json($message, 201);
    }
    


    public function getMessages($receiverUsername)
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }
    
        if ($receiverUsername === $user->username) {
            return response()->json(['error' => 'Can’t get messages with yourself'], 401);
        }
    
        // Fetch all messages between the authenticated user and the receiver
        $messages = Message::where(function ($query) use ($user, $receiverUsername) {
            $query->where('sender_id', $user->username)
                  ->where('receiver_id', $receiverUsername);
        })->orWhere(function ($query) use ($user, $receiverUsername) {
            $query->where('sender_id', $receiverUsername)
                  ->where('receiver_id', $user->username);
        })->get();
    
        // Check if messages are empty and return an empty array
        if ($messages->isEmpty()) {
            return response()->json([], 200); // Return an empty array instead of an error
        }
    
        // Process each message and add poll details if message_type is 'poll'
        $messagesData = $messages->map(function ($message) {
            if ($message->message_type === 'poll') {
                // Fetch poll options and vote details
                $options = MessagePollOptions::where('msg_id', $message->id)->get();
    
                // Fetch all votes for the poll
                $votes = MessagePollVotes::where('messageId', $message->id)->get();
    
                // Count total votes (including duplicates)
                $totalVotes = $votes->count();
    
                // Unique voter IDs to avoid double counting
                $uniqueVoterIds = $votes->unique('sender_id')->pluck('sender_id');
    
                // Count unique voters
                $uniqueVoteCount = $uniqueVoterIds->count();
    
                $optionsData = $options->map(function ($option) use ($votes) {
                    // Get all votes related to this option
                    $optionVotes = $votes->where('option_id', $option->id);
    
                    return [
                        'option_id' => $option->id,
                        'option_name' => $option->option,
                        'number_of_votes' => $optionVotes->count(),
                        'voters' => $optionVotes->map(function ($vote) {
                            return [
                                'sender_id' => $vote->sender_id,
                                'sender_fullName' => $vote->sender_fullName,
                                'sender_profilePic' => $vote->sender_profilePic,
                            ];
                        }),
                    ];
                });
    
                return [
                    'msg_id' => $message->id,
                    'sender_id' => $message->sender_id,
                    'message_type' => $message->message_type,
                    'question' => $message->question,
                    'options' => $optionsData,
                    'total_votes' => $totalVotes,       // Total votes (including duplicates)
                    'unique_votes' => $uniqueVoteCount, // Unique voters count
                ];
            }
    
            // For non-poll messages, return the message data as is
            return $message;
        });
    
        return response()->json($messagesData, 200);
    }
    



    protected function getDirectoryBasedOnType($messageType)
    {
        $directories = [
            'image' => 'images',
            'video' => 'videos',
            'audio' => 'audios',
            'pdf' => 'documents',
            'word' => 'documents',
            'ppt' => 'documents',
            'excel' => 'documents',
        ];

        return $directories[$messageType] ?? 'media'; 
    }

    public function editMessage(Request $request, $messageId)
    {
        $user = Auth::user();
    
        // Validate the incoming request
        $validator = Validator::make($request->all(), [
            'editTo' => 'required|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()->first()], 400);
        }
    
        // Find the message or return an error if not found
        $message = Message::find($messageId);
    
        if (!$message) {
            return response()->json(['error' => 'Message not found.'], 404);
        }
    
        // Check if the authenticated user is the sender of the message
        if ($message->sender_id !== $user->username) {
            return response()->json(['error' => 'Action not allowed: You are not the sender of this message.'], 403);
        }
    
        // Ensure the message has not been deleted
        if ($message->msg_status === 'Deleted') {
            return response()->json(['error' => 'Cannot edit a message that has been deleted.'], 400);
        }
    
        // Only allow editing of text messages
        if ($message->message_type !== 'text') {
            return response()->json(['error' => 'Only text messages can be edited.'], 403);
        }
    
        // Update the message and status
        $message->message = $request->input('editTo'); // Use input() for safety
        $message->msg_status = 'Edited';
        $message->updated_at = now(); // Ensure updated_at is set to the current time
        $message->save();
    
        // Return the updated message as the response
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 200);
    }
    

    public function deleteMessage($messageId)
    {
        $user = Auth::user();

        $message = Message::find($messageId);

        if (!$message) {
            return response()->json(['error' => 'Message not found.'], 404);
        }

        if ($message->sender_id !== $user->username) {
            return response()->json(['error' => 'Action not allowed.'], 403);
        }

        // Check if the message has already been deleted
        if ($message->msg_status === 'Deleted') {
            return response()->json(['error' => 'Message already deleted.'], 400);
        }


        Reaction::where('msg_id', $messageId)->delete();

        $message->message = '🚫This message was deleted';
        $message->message_type = 'text';
        $message->media_path = null;
        $message->msg_status = 'Deleted';
        $message->fileName = null;
        $message->caption=null;
        $message->save();

        return response()->json($message);
    }
}
