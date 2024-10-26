<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Models\Status;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class StatusController extends Controller
{
    public function uploadStatus(Request $request)
    {
        $user = Auth::user(); // Get the authenticated user

        // Define allowed extensions for each status type
        $extensions = [
            'image' => 'jpeg,png,jpg,gif',
            'video' => 'mp4,mov,avi,wmv',
            'audio' => 'mp3,wav',
        ];

        // Validate request data
        $validator = Validator::make($request->all(), [
            'status_type' => 'required|string|in:text,image,video,audio',
            'text_status' => [
                'required_if:status_type,text',
                'nullable',
                'string',
                function ($attribute, $value, $fail) {
                    if (request()->input('status_type') === 'text' && empty($value)) {
                        $fail('The text status field cannot be empty for text status.');
                    }
                    if (request()->input('status_type') !== 'text' && !empty($value)) {
                        $fail('The text status field is only allowed for text statuses. Remove the text for non-text types.');
                    }
                },
            ],
            'media' => [
                'required_if:status_type,image,video,audio', 
                function ($attribute, $value, $fail) use ($request, $extensions) {
                    $statusType = $request->status_type;
                    if ($statusType !== 'text' && !$value) {
                        $fail('The media field is required for non-text statuses.');
                    }

                    if ($statusType === 'text' && $value) {
                        $fail('The media field should not be provided for text statuses.');
                    }

                    if ($value) {
                        $allowedExtensions = $extensions[$statusType] ?? '';
                        $extension = $value->getClientOriginalExtension();

                        if (!in_array($extension, explode(',', $allowedExtensions))) {
                            $fail("Invalid file type for {$statusType}. Allowed types: {$allowedExtensions}.");
                        }
                    }
                },
                'max:204800', // 200MB max size
            ],
            'status_caption' => [
                'nullable',
                'string',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->status_type === 'audio' && !empty($value)) {
                        $fail('Caption should not be provided for audio statuses.');
                    }
                },
            ],
        ]);

        if ($validator->fails()) {
            return response()->json(['error' => $validator->errors()], 400);
        }

        // Fetch the fullName and profilePic of the authenticated user
        $user = User::where('username', $user->username)->first();
        
        // Prepare status data
        $statusData = [
            'send_by' => $user->username,
            'sender_fullName' => $user->fullName,  // Store fullName
            'sender_profilePic' => $user->profilePic,  // Store profilePic
            'text_status' => $request->text_status,
            'status_type' => $request->status_type,
            'status_caption' => $request->status_caption,
        ];

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $directory = $this->getDirectoryBasedOnType($request->status_type);

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

            $statusData['media_path'] = asset("$directory/$filename");
        }

        // Save the status
        $status = Status::create($statusData);

        return response()->json($status, 201);
    }

    // Helper function to get directory based on type
    protected function getDirectoryBasedOnType($type)
    {
        $directories = [
            'image' => 'statuses/images',
            'video' => 'statuses/videos',
            'audio' => 'statuses/audios',
        ];

        return $directories[$type] ?? 'statuses/others';
    }

    public function getSenderList()
    {
        $authUser = Auth::user(); // Get the authenticated user

        // Query to get the list of users and their most recent status' created_at timestamp
        $usersWithStatuses = Status::select('send_by', 'sender_fullName', 'sender_profilePic', DB::raw('MAX(created_at) as recent_status'))
            ->groupBy('send_by', 'sender_fullName', 'sender_profilePic')
            ->orderBy('recent_status', 'desc') // Order by most recent
            ->get();

        // Prepare the result with username, fullName, profilePic, and the recent status timestamp
        $result = $usersWithStatuses->map(function($status) use ($authUser) {
            return [
                'username' => $status->send_by,
                'fullName' => $status->send_by === $authUser->username ? 'You' : $status->sender_fullName,
                'profilePic' => $status->sender_profilePic,
                'recent_status' => $status->recent_status,
            ];
        });

        // Separate the authenticated user from others
        $authUserResult = $result->firstWhere('username', $authUser->username);
        $otherUsersResult = $result->filter(function($item) use ($authUser) {
            return $item['username'] !== $authUser->username;
        });

        // Sort other users by the most recent status timestamp
        $sortedOtherUsers = $otherUsersResult->sortByDesc('recent_status');

        // Merge the authenticated user result with sorted other users
        $finalResult = $authUserResult ? collect([$authUserResult])->merge($sortedOtherUsers) : $sortedOtherUsers;

        return response()->json($finalResult, 200);
    }

    /**
     * Fetch all statuses of a specific user.
     *
     * @param  string  $senderId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getUserStatuses($senderId)
    {
        $authUser = Auth::user(); // Get the authenticated user

        // Validate senderId
        if (empty($senderId)) {
            return response()->json(['error' => 'Sender ID is required.'], 400);
        }

        // Fetch statuses of the specified user
        $statuses = Status::where('send_by', $senderId)
            ->orderBy('created_at', 'desc') // Order by most recent
            ->get();

        if ($statuses->isEmpty()) {
            return response()->json(['message' => 'No statuses found for this user.'], 404);
        }

        // Prepare the result with replaced fullName if the senderId matches the authenticated user
        $result = $statuses->map(function($status) use ($authUser, $senderId) {
            return [
                'send_by' => $status->send_by,
                'fullName' => $status->send_by === $authUser->username ? 'You' : $status->sender_fullName,
                'profilePic' => $status->sender_profilePic,
                'text_status' => $status->text_status,
                'status_type' => $status->status_type,
                'media_path' => $status->media_path,
                'status_caption' => $status->status_caption,
                'created_at' => $status->created_at->toDateTimeString(),
            ];
        });

        return response()->json($result, 200);
    }
}
