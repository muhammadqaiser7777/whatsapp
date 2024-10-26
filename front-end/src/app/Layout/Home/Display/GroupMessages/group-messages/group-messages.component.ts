import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { GroupMessageInputComponent } from '../group-message-input/group-message-input.component';
import { GroupMessageComponent } from '../group-message/group-message.component';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';
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
  selector: 'app-group-messages',
  standalone: true,
  imports: [GroupMessageInputComponent, GroupMessageComponent, CommonModule],
  templateUrl: './group-messages.component.html',
  styleUrl: './group-messages.component.css'
})
export class GroupMessagesComponent implements OnInit, OnDestroy {

  otherUserUsername: string = '';
  private authUser: string = '';
  private subscription: Subscription = new Subscription();
  messages: any[] = []; // Store the fetched messages

  @ViewChild(GroupMessageInputComponent) groupMessageInputComponent!: GroupMessageInputComponent;

  constructor(
    private selectedGroupService: SelectedGroupService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Get the auth user's username
    this.authUser = localStorage.getItem('username') || '';

    // Subscribe to selected group changes
    this.subscription.add(
      this.selectedGroupService.getSelectedGroup().subscribe(selectedGroup => {
        if (selectedGroup) {
          // Fetch messages for the selected group using groupId
          this.fetchMessages(selectedGroup.id); // Passing group ID as receiverID
        }
      })
    );
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // Unsubscribe to prevent memory leaks
  }

  // Function to fetch messages from API using groupId
  fetchMessages(groupId: number) { // Change the type to number
    const apiUrl = `http://127.0.0.1:8000/api/auth/get-group-messages/${groupId}`; // groupId is now number
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    this.http.get<any[]>(apiUrl, { headers }).subscribe({
      next: (response) => {
        if (response && Array.isArray(response) && response.length > 0) {
          this.messages = response;
        } else {
          console.warn('Received empty messages array. No messages to display.');
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
    if (newMessage.message_type === 'poll') {
        // Construct the poll message to match the expected structure
        const formattedPollMessage = {
            msg_id: newMessage.msg_id, // Map `id` to `msg_id`
            message_type: 'poll',
            sender_id:  localStorage.getItem('username'),
            sender_fullName: newMessage.sender_fullName,
            sender_profilePic: newMessage.sender_profilePic,
            question: newMessage.question,
            options: newMessage.options.map((option: PollOption) => ({
                option_id: option.option_id,
                option_name: option.option_name,
                number_of_votes: option.number_of_votes || 0,
                voters: option.voters.map((voter: any) => ({
                    sender_id: voter.sender_id,
                    sender_fullName: voter.sender_fullName,
                    sender_profilePic: voter.sender_profilePic,
                    hasVoted: voter.hasVoted || false
                }))
            })),
            total_votes: newMessage.total_votes || 0,
            unique_votes: newMessage.unique_votes || 0
        };

        this.messages.push(formattedPollMessage);
    } else {
        // For non-poll messages
        const formattedMessage = {
            msg_id: newMessage.id, // Assuming you have an `id` property in your newMessage
            message_type: newMessage.message_type,
            sender_id: newMessage.sender_id,
            sender_fullName: newMessage.sender_fullName,
            sender_profilePic: newMessage.sender_profilePic,
            media_path: newMessage.media_path || null,
            caption: newMessage.caption || null,
            message: newMessage.message || null,
            updated_at: newMessage.updated_at || null,
        };
        this.messages.push(formattedMessage);
    }
}

  
}