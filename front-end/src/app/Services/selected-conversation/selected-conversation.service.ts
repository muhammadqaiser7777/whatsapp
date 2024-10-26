import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SelectedConversationService {
  private selectedConversationSubject = new BehaviorSubject<any>(null);
  selectedConversation$ = this.selectedConversationSubject.asObservable();
  
  private listening: boolean = true; // Default state is listening

  constructor() {}

  /**
   * Sets the selected conversation.
   * @param conversation - The conversation object to be selected.
   */
  setSelectedConversation(conversation: any) {
    this.selectedConversationSubject.next(conversation);
  }

  /**
   * Gets the currently selected conversation.
   * @returns The currently selected conversation.
   */
  getSelectedConversation() {
    return this.selectedConversationSubject.getValue();
  }

  /**
   * Clears the currently selected conversation.
   */
  clearSelectedConversation() {
    this.selectedConversationSubject.next(null);
  }

  /**
   * Starts listening to conversations.
   */
  startListening() {
    this.listening = true;
  }

  /**
   * Stops listening to conversations.
   */
  stopListening() {
    this.listening = false;
  }

  /**
   * Checks if currently listening to conversations.
   * @returns A boolean indicating the listening state.
   */
  isListening(): boolean {
    return this.listening;
  }

  /**
   * Gets details of users based on provided input and conversation ID.
   * @param user1 - The username or user object of one user.
   * @param user2 - The username or user object of the other user (optional).
   * @param conversationId - The ID of the conversation (required if user2 is provided).
   * @returns An object containing the details of the users, or null if no valid conversation is found.
   */
  getUserDetails(user1: any, user2?: any, conversationId?: string) {
    const selectedConversation = this.getSelectedConversation();

    if (!selectedConversation) {
      console.warn('No selected conversation found');
      return null;
    }

    if (user2) {
      if (!conversationId) {
        console.warn('Conversation ID is required when providing details for two users');
        return null;
      }

      // Assuming your conversation object has an id property
      if (selectedConversation.id !== conversationId) {
        console.warn('Conversation ID does not match the selected conversation');
        return null;
      }

      // Two users provided
      const details = {
        user1: selectedConversation.user1.username === user1.username ? selectedConversation.user1 : selectedConversation.user2,
        user2: selectedConversation.user1.username === user2.username ? selectedConversation.user1 : selectedConversation.user2,
      };

      return {
        user1Details: {
          username: details.user1?.username || '',
          fullName: details.user1?.fullName || '',
          profilePic: details.user1?.profilePic || '',
        },
        user2Details: {
          username: details.user2?.username || '',
          fullName: details.user2?.fullName || '',
          profilePic: details.user2?.profilePic || '',
        },
      };
    } else {
      // Single user provided
      const otherUser = selectedConversation.user1.username === user1
        ? selectedConversation.user2
        : selectedConversation.user1;

      return {
        username: otherUser?.username || '',
        fullName: otherUser?.fullName || '',
        profilePic: otherUser?.profilePic || '',
      };
    }
  }
}
