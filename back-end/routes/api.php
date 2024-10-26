<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\ReactionController;
use App\Http\Controllers\ActivityController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\GroupMessageController;
use App\Http\Controllers\GroupMessageReactionsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BroadcastController;
use App\Http\Controllers\StatusController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\GroupPollController;


Route::group([
    'middleware' => 'api',
    'prefix' => 'auth'
], function ($router) {

                                            // Auth Routes
    // User Routes
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:api');

    // Edit Profile Pictures
    Route::post('/edit-profile', [ProfileController::class, 'updateProfile'])->middleware('auth:api');
    // Edit Name
    Route::post('/edit-name', [ProfileController::class, 'updateFullName'])->middleware('auth:api');


   
                                            // 1-1 Routes
    // Message Routes
    Route::post('/send-message/{receiverID}', [MessageController::class, 'sendMessage'])->middleware('auth:api');
    Route::get('/get-messages/{receiverID}', [MessageController::class, 'getMessages'])->middleware('auth:api');
    Route::put('/edit-message/{messageID}', [MessageController::class, 'editMessage'])->middleware('auth:api');
    Route::delete('/delete-message/{messageID}', [MessageController::class, 'deleteMessage'])->middleware('auth:api');

    // Conversation Routes
    Route::get('/conversations', [ConversationController::class, 'getAllConversations'])->middleware('auth:api');
    Route::get('/get-conversation/{conversationId}', [ConversationController::class, 'fetchConversation'])->middleware('auth:api');
    Route::get('/users', [ConversationController::class, 'getAllUsers'])->middleware('auth:api');

    // Reaction Routes
    Route::post('/send-reaction/{msg_id}', [ReactionController::class, 'sendReaction'])->middleware('auth:api');
    Route::get('/get-reaction/{msg_id}', [ReactionController::class, 'getReaction'])->middleware('auth:api');
    Route::delete('/delete-reaction/{msg_id}', [ReactionController::class, 'removeReaction'])->middleware('auth:api');

                                            // Poll Routes
    // Send 1-1 Poll Vote
    Route::post('/send-vote/{msg_id}', [PollController::class, 'sendVote'])->middleware('auth:api');
    // Get 1-1 Votes List
    Route::get('/get-votes/{msg_id}/{optionId}', [PollController::class, 'getVotesByOption'])->middleware('auth:api');
    // Remove 1-1 Vote
    Route::delete('/remove-vote/{msg_id}', [PollController::class, 'removeVote'])->middleware('auth:api');

    // Send Group Poll Vote
    Route::post('/send-group-vote/{msg_id}', [GroupPollController::class, 'sendGroupVote'])->middleware('auth:api');
    // Get Group Votes List
    Route::get('/get-group-votes/{group_msg_id}/{option_id}', [GroupPollController::class, 'getVotesByOption'])->middleware('auth:api');
    // Remove 1-1 Group Vote
    Route::delete('/remove-group-vote/{msg_id}', [GroupPollController::class, 'removeGroupVote'])->middleware('auth:api');


                                            // User Activity Routes
    // Online / Last-Seen Route
    Route::get('/users/{username}', [ActivityController::class, 'getUserStatus'])->middleware('auth:api');


                                            // GroupRoutes
    // Create Group
    Route::post('/create-group', [GroupController::class, 'createGroup'])->middleware('auth:api');
    // Show Group List
    Route::get('/group-list', [GroupController::class, 'GroupsList'])->middleware('auth:api');


    // Group Message Routes
    Route::post('/send-group-message/{groupID}', [GroupMessageController::class, 'sendMessage'])->middleware('auth:api');
    Route::get('/get-group-messages/{groupID}', [GroupMessageController::class, 'getMessages'])->middleware('auth:api');
    Route::put('/edit-group-message/{messageID}', [GroupMessageController::class, 'editMessage'])->middleware('auth:api');
    Route::delete('/delete-group-message/{messageID}', [GroupMessageController::class, 'deleteMessage'])->middleware('auth:api');

    // Group Message Reactions Routes
    Route::post('/send-group-reaction/{group_msg_id}', [GroupMessageReactionsController::class, 'sendReaction'])->middleware('auth:api');
    Route::get('/get-group-reaction/{group_msg_id}', [GroupMessageReactionsController::class, 'getReaction'])->middleware('auth:api');
    Route::delete('/delete-group-reaction/{group_msg_id}', [GroupMessageReactionsController::class, 'removeReaction'])->middleware('auth:api');
    

                                           // Broadcast Routes
    // Create Broadcast
    Route::post('/create-broadcast', [BroadcastController::class, 'createBroadcast'])->middleware('auth:api');
    // Show Broadcast-List
    Route::get('/broadcast-list', [BroadcastController::class, 'listOwnedBroadcasts'])->middleware('auth:api');
    // Show Broadcast
    Route::get('/broadcast/{broadcastId}', [BroadcastController::class, 'showBroadcastParticipants'])->middleware('auth:api');
    // Send Broadcast Message
    Route::post('/broadcast-message/{broadcastId}', [BroadcastController::class, 'sendBroadcastMessage'])->middleware('auth:api');


                                            //Status Routes
    // Send Status
    Route::post('/send-status', [StatusController::class, 'uploadStatus'])->middleware('auth:api');
    // Get Sender List
    Route::get('/get-list', [StatusController::class, 'getSenderList'])->middleware('auth:api');
    // Get Statuses of a specific User
    Route::get('/get-status/{senderId}', [StatusController::class, 'getUserStatuses'])->middleware('auth:api');

});
