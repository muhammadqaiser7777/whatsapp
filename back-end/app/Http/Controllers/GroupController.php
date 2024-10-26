<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Groups;
use App\Models\GroupParticipants;
use App\Models\GroupMessage; // Assuming you have a GroupMessage model
use App\Models\User;

class GroupController extends Controller
{
    /**
     * Create a new group.
     *
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function createGroup(Request $request)
{
    $user = Auth::user();

    $request->validate([
        'group_name' => 'required|string|max:255',
        'participants' => 'required|array',
        'participants.*' => 'string',
        'group_dp' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
    ], [
        'group_dp.mimes' => 'The group display picture must be a file of type: jpeg, png, jpg, gif.',
        'group_dp.max' => 'The group display picture must not be larger than 5MB.',
    ]);

    // Insert the authenticated user at the beginning of the participants array
    $participants = $request->input('participants');
    array_unshift($participants, $user->username);

    // Validate if all participants exist
    $existingUsernames = User::pluck('username')->toArray();
    $nonExistentUsers = array_diff($participants, $existingUsernames);

    if (!empty($nonExistentUsers)) {
        return response()->json([
            'error' => implode(', ', $nonExistentUsers) . ' does not exist.',
        ], 400);
    }

    // Check for duplicate participants
    $duplicateParticipants = array_diff_assoc($participants, array_unique($participants));
    if (!empty($duplicateParticipants)) {
        return response()->json([
            'error' => implode(', ', array_unique($duplicateParticipants)) . ' can\'t be added more than once.',
        ], 400);
    }

    // Handle the image upload if present
    if ($request->hasFile('group_dp')) {
        $image = $request->file('group_dp');
        $imageName = $image->getClientOriginalName(); // Get the original name of the image
        $imagePath = 'group-dps/' . $imageName;
        $image->storeAs('group-dps', $imageName, 'public');
        $groupDp = $imageName; // Set group_dp to the uploaded image's name
    } else {
        // Use default image if no group_dp is provided
        $imagePath = 'group-dps/group-icon.png'; // Default image path
        $groupDp = 'group-icon.png'; // Default group display picture
    }

    // Add the base URL to the image path
    $fullImagePath = 'http://127.0.0.1:8000/' . $imagePath;

    // Create the group with the selected image or default values
    $group = Groups::create([
        'group_name' => $request->input('group_name'),
        'group_dp' => $groupDp,
        'path' => $fullImagePath, // Store the full image URL
    ]);

    // Prepare an array to track added participants to avoid duplicates
    $addedParticipants = [$user->username];

    // Add the authenticated user as a participant
    GroupParticipants::create([
        'participant_username' => $user->username,
        'participant_fullName' => $user->fullName ?? 'Unknown', // Ensure `full_name` is not null
        'participant_profilePic' => $user->profilePic ?? 'default-pic.png', // Ensure `profile_pic` is not null
        'group_id' => $group->id,
    ]);

    // Add other participants
    foreach ($participants as $participantUsername) {
        if (in_array($participantUsername, $addedParticipants)) {
            continue; // Skip adding if already added
        }

        $participantUser = User::where('username', $participantUsername)->first();
        GroupParticipants::create([
            'participant_username' => $participantUsername,
            'participant_fullName' => $participantUser->fullName ?? 'Unknown', // Default to 'Unknown' if null
            'participant_profilePic' => $participantUser->profilePic ?? 'default-pic.png', // Default if null
            'group_id' => $group->id,
        ]);

        // Track the added participant
        $addedParticipants[] = $participantUsername;
    }

    return response()->json([
        'success' => true,
        'group' => $group,
    ], 201);
}



    /**
     * List all groups where the authenticated user is a participant along with the last message in each group.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function GroupsList()
    {
        $user = Auth::user();
    
        // Get all groups where the authenticated user is a participant
        $groups = Groups::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_username', $user->username);
        })
        ->with(['lastMessage' => function($query) {
            $query->select('group_messages.group_id', 'sender_id', 'sender_fullName', 'message_type', 'message', 'caption', 'media_path', 'fileName', 'group_messages.created_at', 'group_messages.updated_at')
                  ->latest(); // Get the last message of the group
        }])
        ->get();
    
        return response()->json([
            'success' => true,
            'groups' => $groups->map(function($group) {
                return [
                    'id' => $group->id, // Include the group ID
                    'group_name' => $group->group_name,
                    'group_dp' => $group->group_dp,
                    'path' => $group->path,
                    'last_message' => $group->lastMessage ? [
                        'sender_id' => $group->lastMessage->sender_id,
                        'sender_fullName' => $group->lastMessage->sender_fullName,
                        'message_type' => $group->lastMessage->message_type,
                        'message' => $group->lastMessage->message,
                        'caption' => $group->lastMessage->caption,
                        'media_path' => $group->lastMessage->media_path,
                        'file_name' => $group->lastMessage->fileName,
                        'created_at' => $group->lastMessage->created_at,
                        'updated_at' => $group->lastMessage->updated_at,
                    ] : null
                ];
            }),
        ]);
    }
    

}
