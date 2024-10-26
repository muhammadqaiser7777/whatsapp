<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use App\Models\GroupMessages;
use App\Models\GroupParticipants;
use App\Models\GroupMessagesReactions;
use App\Models\GroupMessagePollOptions;
use App\Models\GroupMessagePollVotes;


class GroupMessageController extends Controller
{
    /**
     * Send a message to a group.
     *
     * @param \Illuminate\Http\Request $request
     * @param int $groupId
     * @return \Illuminate\Http\JsonResponse
     */
    public function sendMessage(Request $request, $groupId)
{
    $user = Auth::user(); // Get the authenticated user

    // Check if the user is a participant in the group
    if (!GroupParticipants::where('group_id', $groupId)
        ->where('participant_username', $user->username)
        ->exists()) {
        return response()->json(['error' => 'You are not a participant of this group.'], 403);
    }

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
            function($attribute, $value, $fail) {
                if (request()->input('message_type') === 'poll' && empty($value)) {
                    $fail('The question field cannot be empty for poll messages.');
                }
                if (request()->input('message_type') !== 'poll' && !empty($value)) {
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

    // Check if message_type is poll and redirect to PollController
    if ($request->message_type === 'poll') {
        // Redirect to the PollController's createPoll method
        return app(GroupPollController::class)->createGroupPoll($request, $groupId);
    }

    // Retrieve the sender's profile picture and full name
    $senderProfile = GroupParticipants::where('group_id', $groupId)
        ->where('participant_username', $user->username)
        ->first(['participant_profilePic', 'participant_fullName']);

    $profilePic = $senderProfile ? $senderProfile->participant_profilePic : null;
    $sender_fullName = $senderProfile ? $senderProfile->participant_fullName : null;

    $messageData = [
        'group_id' => $groupId,
        'sender_id' => $user->username,
        'message' => $request->message,
        'question' => $request->question,
        'message_type' => $request->message_type,
        'caption' => $request->caption,
        'fileName' => null,
        'msg_status' => 'Original',
        'sender_profilePic' => $profilePic,
        'sender_fullName' => $sender_fullName,
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

    $message = GroupMessages::create($messageData);

    // Check if the message type is 'poll' to customize the response
    if ($request->message_type === 'poll') {
        // Fetch total votes for each option
        $options = GroupMessagePollOptions::where('group_msg_id', $message->id)->get();

        // Fetch total votes for the poll
        $totalVotes = GroupMessagePollVotes::where('grp_messageId', $message->id)->count();

        // Fetch unique votes for the poll
        $uniqueVoteCount = GroupMessagePollVotes::where('grp_messageId', $message->id)
            ->distinct('sender_id') // Count distinct sender IDs
            ->count('sender_id');

        $optionsData = $options->map(function ($option) {
            // Get all votes for this option
            $votes = $option->votes()->get();

            $uniqueVoterIds = $votes->pluck('sender_id')->unique();

            return [
                'option_id' => $option->id,
                'option_name' => $option->option,
                'number_of_votes' => $votes->count(),
                'unique_votes' => $uniqueVoterIds->count(),
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
                'sender_id' => $message->sender_id, 
                'message_type' => $message->message_type,
                'question' => $message->question,
                'total_votes' => $totalVotes,
            ],
            'options' => $optionsData,
        ], 201);
    }

    return response()->json($message, 201);
}

    

public function getMessages($groupId)
{
    $user = Auth::user();

    // Check if the user is a participant in the group
    if (!GroupParticipants::where('group_id', $groupId)
        ->where('participant_username', $user->username)
        ->exists()) {
        return response()->json(['error' => 'You are not a participant of this group.'], 403);
    }

    // Fetch all messages from the group
    $messages = GroupMessages::where('group_id', $groupId)->get();

    if ($messages->isEmpty()) {
        return response()->json(['error' => 'No messages found'], 404);
    }

    // Process each message and add poll details if message_type is 'poll'
    $messagesData = $messages->map(function ($message) {
        // Fetch sender's profile details
        $participant = GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $message->sender_id)
            ->first(['participant_username', 'participant_profilePic', 'participant_fullName']);

        if ($participant) {
            $message->sender_id = $participant->participant_username;
            $message->sender_profilePic = $participant->participant_profilePic;
            $message->sender_fullName = $participant->participant_fullName;
        }

        // Check if the message type is 'poll'
        if ($message->message_type === 'poll') {
            // Fetch poll options
            $options = GroupMessagePollOptions::where('group_msg_id', $message->id)->get();

            // Fetch total votes for the poll
            $totalVotes = GroupMessagePollVotes::where('grp_messageId', $message->id)->count();

            // Fetch unique votes for the poll
            $uniqueVoteCount = GroupMessagePollVotes::where('grp_messageId', $message->id)
                ->distinct('sender_id') // Count distinct sender IDs
                ->count('sender_id');

            $optionsData = $options->map(function ($option) {
                $votes = $option->grpVotes()->get();

                return [
                    'option_id' => $option->id,
                    'option_name' => $option->option,
                    'number_of_votes' => $votes->count(),
                    'voters' => $votes->map(function ($vote) {
                        return [
                            'sender_id' => $vote->sender_id,
                            'sender_fullName' => $vote->sender_fullName,
                            'sender_profilePic' => $vote->sender_profilePic,
                        ];
                    }),
                ];
            });

            return [
                'msg_id' => $message->id,  // Use 'msg_id' for poll messages
                'sender_id' => $message->sender_id, 
                'sender_fullName' => $message->sender_fullName,
            'sender_profilePic' => $message->sender_profilePic,
                'message_type' => $message->message_type,
                'question' => $message->question,
                'options' => $optionsData,
                'total_votes' => $totalVotes,         // Total votes including duplicates
                'unique_votes' => $uniqueVoteCount,   // Unique voters count
            ];
        }

        // For non-poll messages, rename 'id' to 'msg_id'
        return [
            'msg_id' => $message->id,  // Rename 'id' to 'msg_id'
            'sender_id' => $message->sender_id,
            'sender_fullName' => $message->sender_fullName,
            'sender_profilePic' => $message->sender_profilePic,
            'group_id' => $message->group_id,
            'message' => $message->message,
            'question' => $message->question,
            'message_type' => $message->message_type,
            'media_path' => $message->media_path,
            'caption' => $message->caption,
            'fileName' => $message->fileName,
            'msg_status' => $message->msg_status,
            'created_at' => $message->created_at,
            'updated_at' => $message->updated_at,
        ];
    });

    return response()->json($messagesData, 200);
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
        $message = GroupMessages::find($messageId);
    
        if (!$message) {
            return response()->json(['error' => 'Message not found.'], 404);
        }
    
        // Inline check if the user is a participant in the group
        if (!GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $user->username)
            ->exists()) {
            return response()->json(['error' => 'You are not a participant of this group.'], 403);
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
        $message->message = $request->input('editTo');
        $message->msg_status = 'Edited';
        $message->updated_at = now();
        $message->save();
    
        return response()->json([
            'success' => true,
            'message' => $message,
        ], 200);
    }

    public function deleteMessage($messageId)
    {
        $user = Auth::user();

        $message = GroupMessages::find($messageId);

        if (!$message) {
            return response()->json(['error' => 'Message not found.'], 404);
        }

        // Inline check if the user is a participant in the group
        if (!GroupParticipants::where('group_id', $message->group_id)
            ->where('participant_username', $user->username)
            ->exists()) {
            return response()->json(['error' => 'You are not a participant of this group.'], 403);
        }

        if ($message->sender_id !== $user->username) {
            return response()->json(['error' => 'Action not allowed.'], 403);
        }

        if ($message->msg_status === 'Deleted') {
            return response()->json(['error' => 'Message already deleted.'], 400);
        }

        GroupMessagesReactions::where('msg_id', $messageId)->delete();

        $message->message = '🚫This message was deleted';
        $message->message_type = 'text';
        $message->media_path = null;
        $message->msg_status = 'Deleted';
        $message->fileName = null;
        $message->caption = null;
        $message->save();

        return response()->json($message);
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
}
