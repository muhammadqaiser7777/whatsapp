<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Broadcasts;
use App\Models\BroadcastsParticipants;
use App\Models\User;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Support\Facades\Validator;


class BroadcastController extends Controller
{
    /**
     * Create a new broadcast.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createBroadcast(Request $request)
{
    $user = Auth::user();

    $request->validate([
        'broadcast_name' => 'required|string|max:255',
        'participants' => 'required|array',
        'participants.*' => 'string',
    ]);

    $participants = $request->input('participants');

    // Validate if all participants exist
    $existingUsernames = User::pluck('username')->toArray();
    $nonExistentUsers = array_diff($participants, $existingUsernames);

    if (!empty($nonExistentUsers)) {
        return response()->json([
            'error' => implode(', ', $nonExistentUsers) . ' does not exist.',
        ], 400);
    }

    // Check if the authenticated user's username is in the participants list
    if (in_array($user->username, $participants)) {
        return response()->json([
            'error' => 'You cannot add yourself to the participant list.',
        ], 400);
    }

    // Check for duplicate participants
    $duplicateParticipants = array_diff_assoc($participants, array_unique($participants));
    if (!empty($duplicateParticipants)) {
        return response()->json([
            'error' => implode(', ', array_unique($duplicateParticipants)) . ' can\'t be added more than once.',
        ], 400);
    }

    // Create the broadcast
    $broadcast = Broadcasts::create([
        'name' => $request->input('broadcast_name'),
        'owner' => $user->username,
    ]);

    // Add participants
    foreach ($participants as $participantUsername) {
        $participantUser = User::where('username', $participantUsername)->first();
        BroadcastsParticipants::create([
            'participants_username' => $participantUser->username,
            'participants_fullName' => $participantUser->fullName ?? 'Unknown', // Default to 'Unknown' if null
            'participants_profilePic' => $participantUser->profilePic ?? 'default-pic.png', // Default if null
            'broadcast_id' => $broadcast->id,
        ]);
    }

    return response()->json([
        'success' => true,
        'broadcast' => $broadcast,
    ], 201);
}


    /**
     * List all broadcasts where the authenticated user is the owner.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function listOwnedBroadcasts()
    {
        $user = Auth::user();

        // Get all broadcasts where the authenticated user is the owner
        $broadcasts = Broadcasts::where('owner', $user->username)->get();

        return response()->json([
            'success' => true,
            'broadcasts' => $broadcasts,
        ]);
    }

    /**
     * Show participants of a specific broadcast by broadcast ID.
     *
     * @param int $broadcastId
     * @return \Illuminate\Http\JsonResponse
     */
    public function showBroadcastParticipants($broadcastId)
{
    $user = Auth::user();

    // Check if the broadcast exists and if the user is the owner
    $broadcast = Broadcasts::where('id', $broadcastId)->where('owner', $user->username)->first();

    if (!$broadcast) {
        return response()->json([
            'error' => 'Broadcast not found or you are not the owner.',
        ], 404);
    }

    // Get participants of the broadcast
    $participants = BroadcastsParticipants::where('broadcast_id', $broadcastId)->get();

    return response()->json([
        'success' => true,
        'broadcast_name' => $broadcast->name,
        'participants' => $participants->map(function ($participant) {
            return [
                'username' => $participant->participants_username,
                'full_name' => $participant->participants_fullName,
                'profile_pic' => $participant->participants_profilePic,
            ];
        }),
    ]);
}

public function sendBroadcastMessage(Request $request, $broadcastId)
{
    $user = Auth::user(); // Get the authenticated user

    // Fetch the broadcast and its participants
    $broadcast = Broadcasts::with('participants.user')->find($broadcastId);

    if (!$broadcast) {
        return response()->json(['error' => 'Broadcast not found.'], 404);
    }

    // Check if the authenticated user is the owner of the broadcast
    if ($broadcast->owner !== $user->username) {
        return response()->json(['error' => 'You are not authorized to send messages in this broadcast.'], 403);
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
        'message_type' => 'required|string|in:text,image,video,audio,pdf,word,ppt,excel',
        'message' => 'required_if:message_type,text|string|nullable',
        'media' => [
            'required_if:message_type,image,video,audio,pdf,word,ppt,excel',
            'file',
            'max:204800', // 200MB max size
            function ($attribute, $value, $fail) use ($request, $extensions) {
                $messageType = $request->message_type;
                if ($messageType !== 'text' && !$value) {
                    $fail('The media field is required for non-text messages.');
                }
                if ($value) {
                    $allowedExtensions = $extensions[$messageType] ?? '';
                    $extension = $value->getClientOriginalExtension();
                    if (!in_array($extension, explode(',', $allowedExtensions))) {
                        $fail("Invalid file type for {$messageType}. Allowed types: {$allowedExtensions}.");
                    }
                }
            },
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

    // Handle media file if provided, this will only happen if there is a media file
    $mediaPath = null;
    $filename = null;
    if ($request->hasFile('media')) {
        $file = $request->file('media');
        $directory = $this->getDirectoryBasedOnType($request->message_type);
        
        // Save files directly in the public directory
        $publicPath = public_path($directory);

        // Ensure the directory exists
        if (!file_exists($publicPath)) {
            try {
                mkdir($publicPath, 0755, true);
            } catch (\Exception $e) {
                return response()->json(['error' => 'Failed to create directory.'], 500);
            }
        }

        // Retain the original file name
        $filename = $file->getClientOriginalName();
        $file->move($publicPath, $filename);
        $mediaPath = asset("$directory/$filename");
    }

    // Loop through each participant and send the message individually
    foreach ($broadcast->participants as $participant) {
        if ($participant->participants_username != $user->username) { // Avoid sending to the sender

            // Create or retrieve the conversation between the authenticated user and the participant
            $conversation = Conversation::where(function ($query) use ($user, $participant) {
                $query->where('user1_id', $user->username)
                      ->where('user2_id', $participant->participants_username);
            })->orWhere(function ($query) use ($user, $participant) {
                $query->where('user1_id', $participant->participants_username)
                      ->where('user2_id', $user->username);
            })->first();

            if (!$conversation) {
                $conversation = Conversation::create([
                    'user1_id' => $user->username,
                    'user2_id' => $participant->participants_username,
                ]);
            }

            // Prepare message data
            $messageData = [
                'conversation_id' => $conversation->id,
                'sender_id' => $user->username,
                'receiver_id' => $participant->participants_username,
                'message' => $request->message,
                'question' => null,
                'message_type' => $request->message_type,
                'caption' => $request->caption,
                'msg_status' => 'Original',
            ];

            // Attach media path if it exists
            if ($mediaPath) {
                $messageData['media_path'] = $mediaPath; // Use the same media path for all messages
                $messageData['fileName'] = $filename; // Retain the original filename
            }

            // Create the message for each participant
            Message::create($messageData);
        }
    }

    return response()->json(['success' => 'Message sent to all participants'], 201);
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