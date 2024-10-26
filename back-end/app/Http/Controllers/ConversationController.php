<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;
use App\Models\User;


class ConversationController extends Controller
{
    /**
     * Get all conversations for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */


     public function getAllUsers()
    {
        // Check if the user is authenticated
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }

        // Get the currently authenticated user
        $currentUser = Auth::user();

        // Retrieve all users except the current user
        $users = User::where('username', '!=', $currentUser->username)
            ->select('username', 'fullName', 'profilePic') // Select only necessary fields
            ->get();

        // Return the list of users as a JSON response
        return response()->json($users);
    }

    
    public function getAllConversations()
    {
        if (!Auth::check()) {
            return response()->json(['error' => 'Unauthenticated'], 401);
        }
    
        $user = Auth::user();
        
        $conversations = Conversation::where(function ($query) use ($user) {
            $query->where('user1_id', $user->username)
                  ->orWhere('user2_id', $user->username);
        })
        ->with(['user1', 'user2'])
        ->get()
        ->map(function ($conversation) use ($user) {
            $latestMessage = Message::where(function ($query) use ($conversation, $user) {
                $query->where('sender_id', $user->username)
                      ->whereIn('receiver_id', [$conversation->user1_id, $conversation->user2_id]);
            })->orWhere(function ($query) use ($conversation, $user) {
                $query->where('receiver_id', $user->username)
                      ->whereIn('sender_id', [$conversation->user1_id, $conversation->user2_id]);
            })->latest()->first();
    
            $otherUser = $conversation->user1_id == $user->username ? $conversation->user2 : $conversation->user1;
            return [
                'conversation_id' => $conversation->id,
                'user1' => [
                    'username' => $conversation->user1->username,
                    'fullName' => $conversation->user1->fullName,
                    'profilePic' => $conversation->user1->profilePic,
                ],
                'user2' => [
                    'username' => $conversation->user2->username,
                    'fullName' => $conversation->user2->fullName,
                    'profilePic' => $conversation->user2->profilePic,
                ],
                'last_message' => optional($latestMessage)->message ?? null,
                'last_message_time' => optional($latestMessage)->updated_at ?? null,
                'last_message_type' => optional($latestMessage)->message_type ?? null,
            ];
        })->sortByDesc('last_message_time'); // Sort by the latest message time in descending order
    
        return response()->json($conversations);
    }
    


    /**
     * Get all messages between the authenticated user and a receiver.
     *
     * @param  string  $receiverUsername
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetchConversation($conversationId)
{
    $user = Auth::user();
    
    // Check if the conversation exists
    $conversationExists = Conversation::where('id', $conversationId)->exists();

    if (!$conversationExists) {
        return response()->json(['error' => 'Conversation not found.'], 404);
    }
    
    // Update received_status to 'Read' for the authenticated user's received messages
    Message::where('conversation_id', $conversationId)
           ->where('receiver_id', $user->username)
           ->where('received_status', '!=', 'Read')
           ->update(['received_status' => 'Read']);

    // Retrieve messages where the conversation_id matches and the authenticated user is either the sender or receiver
    $messages = Message::where('conversation_id', $conversationId)
                        ->where(function($query) use ($user) {
                            $query->where('sender_id', $user->username)
                                  ->orWhere('receiver_id', $user->username);
                        })
                        ->latest()
                        ->get();

    // If no messages found where the user is a participant
    if ($messages->isEmpty()) {
        return response()->json(['error' => 'You are not part of this conversation.'], 403);
    }


    return response()->json($messages);
}


}
