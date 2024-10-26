import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { MessageComponent } from '../message/message.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

interface PollOption {
  option_id: number;
  option_name: string;
  number_of_votes: number;
  voters: any[]; // You can further define the type of voters if needed
}

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [MessageComponent, CommonModule, MessageInputComponent],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})


export class MessagesComponent implements OnInit, OnDestroy {
  otherUserUsername: string = '';
  private authUser: string = '';
  private subscription: Subscription = new Subscription();
  messages: any[] = []; // Store the fetched messages

  @ViewChild(MessageInputComponent) messageInputComponent!: MessageInputComponent;

  constructor(
    private selectedConversationService: SelectedConversationService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get the auth user's username
    this.authUser = localStorage.getItem('username') || '';

    // Subscribe to selected conversation changes
    this.subscription.add(
      this.selectedConversationService.selectedConversation$.subscribe(selectedConversation => {
        if (selectedConversation) {
          const otherUserDetails = this.selectedConversationService.getUserDetails(this.authUser);
          if (otherUserDetails) {
            this.otherUserUsername = otherUserDetails.username;
            this.fetchMessages(this.otherUserUsername);
          } else {
            console.warn('No other user details found.');
          }
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  // Function to fetch messages from API
  fetchMessages(receiverID: string) {
    const apiUrl = `http://127.0.0.1:8000/api/auth/get-messages/${receiverID}`;
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get<any[]>(apiUrl, { headers }).subscribe({
      next: (response) => {
        if (response && Array.isArray(response) && response.length > 0) {
          this.messages = response; // Store the fetched messages if the array is not empty
        } else {
          console.warn('Received empty messages array. No messages to display.');
          // Optionally, you could display a message or handle this scenario differently
          this.messages = []; // Ensure `messages` is an empty array
        }
      },
      error: (error) => {
        console.error('Error fetching messages:', error);
        // Optionally, handle the error here (e.g., show an error message to the user)
      }
    });
  }
  

  appendMessage(newMessage: any) {
    if (newMessage.msg_type === 'poll') {
      // Construct the poll message to match the expected structure
      const formattedPollMessage = {
        msg_id: newMessage.msg_id, // Use the ID from the newMessage
        msg_type: 'poll',
        question: newMessage.question,
        options: newMessage.options.map((option: PollOption) => ({
          option_id: option.option_id, // Use the option ID from the newMessage
          option_name: option.option_name, // Use the option name from the newMessage
          number_of_votes: option.number_of_votes || 0, // Default to 0 if not present
          voters: option.voters || [] // Default to an empty array if not present
        })),
        total_votes: newMessage.total_votes || 0, // Default to 0 if not present
        unique_votes: newMessage.unique_votes || 0 // Default to 0 if not present
      };
  
      this.messages.push(formattedPollMessage); // Append the formatted poll message
  
      // Log the appended poll message
    } else {
      this.messages.push(newMessage); // For non-poll messages
    }
  }
}
