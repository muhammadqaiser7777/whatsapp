import { Component, Input,OnInit, OnChanges,OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';

interface Reaction {
  msg_id: string;
  sender_id: string;
  reaction: string;
  senderFullName: string;
  senderProfilePic: string;
}

interface Voter {
  sender_id: number;
  sender_fullName: string;
  sender_profilePic: string;
  hasVoted?: boolean;
}

interface Option {
  option_id: number;
  option_name: string;
  number_of_votes: number;
  unique_votes?: number;
  voters: Voter[];
}

@Component({
  selector: 'app-group-message',
  standalone: true,
  imports: [CommonModule, PickerComponent],
  templateUrl: './group-message.component.html',
  styleUrls: ['./group-message.component.css']
})
export class GroupMessageComponent implements OnChanges, OnInit, OnDestroy {

  @Input() message: {
    msg_id?: number;
    sender_id?: string;
    sender_fullName?: string,
    sender_profilePic?: string,
    group_id?: number;
    message?: string | null;
    message_type?: string;
    media_path?: string;
    fileName?: string;
    caption?: string | null;
    question?: string | null;
    options?: Option[];
    total_votes?: number;
    unique_votes?: number;
    msg_status?: string;
    created_at?: string;
    updated_at?: string;
    showDropdown?: boolean;
    showArrow?: boolean;
  } = {};

  
  @ViewChild('scrollControl') private scrollControl: ElementRef | undefined;

  authUserId: string;
  authUser: number = 0;
  isModalOpen = false;
  hovering: boolean = false;
  showEmojiPicker: boolean = false; // Track emoji picker visibility
  emojiList: string[] = [];
  reactions: Reaction[] = [];
    isReactionsModalOpen = false;

  constructor(private http: HttpClient,    private selectedGroupService: SelectedGroupService
  ) {
    this.authUserId = localStorage.getItem('username') || '';
    this.authUser = Number(localStorage.getItem('id') || 0);
  }

  ngOnInit() {
    // Check if messages exist
    if (this.message) {
      this.getReactions(this.message);
    }
    
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      this.authUserId = storedUsername.trim(); // Normalize username
    }
  
    // Ensure voters are initialized as arrays
    if (this.message.options) {
      this.message.options.forEach(option => {
        const hasVoted = this.isVoted(option);
      });
    }
  
    // Log sender_id for each reaction after they have been fetched
    if (this.reactions && this.reactions.length > 0) {
      this.reactions.forEach(reaction => {
        console.log('Sender ID:', reaction.sender_id, 'Reaction:', reaction.reaction);
      });
    }
  }
  

  openVoteModal() {
    this.isModalOpen = true; // Just open the modal without parameters
  }

  closeVoteModal() {
    this.isModalOpen = false; // Close the modal
  }

  ngOnChanges(): void {
    // Initialize the message properties if they don't exist
    if (!this.message.showArrow) {
      this.message.showArrow = false; // Default value
    }
    if (!this.message.showDropdown) {
      this.message.showDropdown = false; // Default value
    }
  this.scrollToBottom(); // Call the scrollToBottom function here
}

  OnDestroy(): void{
    this.selectedGroupService.clearSelectedGroup();
  }

  isSentMessage(): boolean {
    return this.message.sender_id === this.authUserId;
  }

  getVotePercentage(option: Option): number {
    const total_votes = this.message.total_votes;
    if (!total_votes || total_votes === 0) {
      return 0;
    }
    return (option.number_of_votes / total_votes) * 100;
  }

  scrollToBottom(): void {
    setTimeout(() => {
      if (this.scrollControl) {
        this.scrollControl.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }, 1000);
  }

  // Check if the current user has voted for this option
  isVoted(option: Option): boolean {
    const voters = option.voters; // This is an object, not an array
    const storedUsername = Number(localStorage.getItem('id'));
  
    // Check if voters is an object and the username is available
    if (voters && storedUsername) {
      // Convert object values to an array and check if any voter matches the username
      return Object.values(voters).some(voter => voter.sender_id === storedUsername);
    }
  
    return false; // Default to false if conditions aren't met
  }
  

  // Handle vote change based on checkbox state
  onVoteChange(option: Option, event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const voted = this.isVoted(option);

    if (checkbox.checked && !voted) {
      // If checkbox is checked and user hasn't voted, post the vote
      this.postVote(option.option_id);
    } else if (!checkbox.checked && voted) {
      // If checkbox is unchecked and user has voted, remove the vote
      this.removeVote(option.option_id);
    }
  }

  postVote(optionId: number): void {
    const msgId = this.message.msg_id; // Get the message ID

    if (msgId !== undefined) {
        const votePayload = { option: optionId };
        const token = localStorage.getItem('authToken') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const profilePic = localStorage.getItem('profilePic') || '';
        const Name = localStorage.getItem('fullName') || '';

        this.http.post(`http://127.0.0.1:8000/api/auth/send-group-vote/${msgId}`, votePayload, { headers })
            .subscribe(
                (response: any) => {                    
                    const option = this.message.options?.find(o => o.option_id === optionId);

                    if (option) {
                        option.number_of_votes++;
                        option.voters.push({ 
                            sender_id: this.authUser, 
                            sender_fullName: Name, // Replace with actual data
                            sender_profilePic: profilePic // Replace with actual data
                        });
                        this.message.total_votes = (this.message.total_votes || 0) + 1;
                        this.message.unique_votes = (this.message.unique_votes || 0) + 1; 
                    }
                },
                (error) => {
                    console.error('Error posting vote', error);
                }
            );
    }
  }

  removeVote(optionId: number): void {
    const msgId = this.message.msg_id;

    if (msgId !== undefined) {
        const votePayload = { option_id: optionId };
        const token = localStorage.getItem('authToken') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete(`http://127.0.0.1:8000/api/auth/remove-group-vote/${msgId}`, { headers, body: votePayload })
            .subscribe(
                (response: any) => {                    
                    const option = this.message.options?.find(o => o.option_id === optionId);

                    if (option && option.number_of_votes > 0) {
                        option.number_of_votes--;
                        option.voters = option.voters.filter(voter => voter.sender_id !== this.authUser);
                        this.message.total_votes = (this.message.total_votes || 0) - 1;

                        if (this.message.unique_votes && this.message.unique_votes > 0) {
                            this.message.unique_votes--;
                        }
                    }
                },
                (error) => {
                    console.error('Error removing vote', error);
                }
            );
    }
  }

  toggleDropdown(message: any): void {
    message.showDropdown = !message.showDropdown;
  }
  
  
  
  
  showArrow(message: any, show: boolean): void {
    message.showArrow = show; // Set the showArrow property
  }
  

  getVotersList(msgId: number, optionId: number): void {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get(`http://127.0.0.1:8000/api/auth/get-group-votes/${msgId}/${optionId}`, { headers })
        .subscribe(
            (response: any) => {
                // Assuming the response is in the format you provided earlier
                const voters = this.getVoterList(response.voters);
            },
            (error) => {
                console.error('Error fetching voters', error);
            }
        );
}

getVoterList(voters: { [key: number]: Voter }): Voter[] {
    return Object.values(voters);
}

  // Action for editing the message
  onEditMessage(message: any): void {
    message.showDropdown = false;
    
    // Prompt the user for the new message content
    const editTo = prompt('Edit your message:', message.message); // Default to the current message text

    if (editTo !== null && editTo.trim() !== '') { // Check if user entered something
        const msgId = message.msg_id; // Use the correct ID (ensure you're accessing the right property for the message ID)
        
        const token = localStorage.getItem('authToken') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const body = { editTo }; // Create the body of the request with the new message content

        // Make the PUT request to edit the message
        this.http.put(`http://127.0.0.1:8000/api/auth/edit-group-message/${msgId}`, body, { headers })
            .subscribe(
                (response: any) => {
                    message.message = editTo; // Update the local message content to reflect the change
                    message.msg_status = 'Edited';
                },
                (error) => {
                    console.error('Error editing message:', error);
                }
            );
    } else {
        console.log('Edit cancelled or empty input.'); // Log if the user cancels or enters empty input
    }
}


  onDeleteMessage(message: any): void {
    message.showDropdown = false;
    
    // Use the correct property name to get the message ID
    const msgId = message.msg_id; // Correctly access the message ID

    if (msgId !== undefined) {
        const token = localStorage.getItem('authToken') || '';
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

        this.http.delete(`http://127.0.0.1:8000/api/auth/delete-group-message/${msgId}`, { headers })
            .subscribe(
                (response: any) => {                    
                    // Update message properties
                    message.message = '🚫 This message was deleted'; // Change the message content
                    message.msg_status = 'Deleted'; // Optional: Update the message status
                    message.showDropdown = false; // Hide dropdown after deletion if necessary
                },
                (error) => {
                    console.error('Error deleting message:', error);
                }
            );
    } else {
        console.error('Message ID is undefined'); // Log if msgId is undefined
    }
}

onReact(emoji: string, message: any) {
  // Close the dropdown after selecting a reaction
  this.message.showDropdown = false;

  // Use the correct property name to get the message ID
  const msgId = message.msg_id; // Correctly access the message ID

  // Ensure the message ID is defined
  if (msgId !== undefined) {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Include the emoji in the request body
    const requestBody = { reaction: emoji };

    this.http.post(`http://127.0.0.1:8000/api/auth/send-group-reaction/${msgId}`, requestBody, { headers })
      .subscribe(
        (response: any) => {
          // Create a new reaction object using the Reaction interface
          const newReaction: Reaction = {
            msg_id: msgId,
            sender_id: response.sender_id, // Ensure this is a string
            reaction: emoji,
            senderFullName: response.senderFullName,
            senderProfilePic: response.senderProfilePic
          };

          // Find if the user has already reacted, and update the reaction if found
          const existingReactionIndex = this.reactions.findIndex(
            (r: Reaction) => r.sender_id === newReaction.sender_id
          );

          if (existingReactionIndex !== -1) {
            // If the user already reacted, update their reaction
            this.reactions[existingReactionIndex].reaction = newReaction.reaction;
          } else {
            // Append the new reaction to the existing reactions list
            this.reactions.push(newReaction);
          }
        },
        (error) => {
          console.error('Error reacting to message:', error);
        }
      );
  } else {
    console.error('Message ID is undefined'); // Log if msgId is undefined
  }
}

getReactions(message: any) {
  // Close the dropdown after selecting a reaction
  message.showDropdown = false;

  // Use the correct property name to get the message ID
  const msgId = message.msg_id; // Correctly access the message ID

  // Ensure the message ID is defined
  if (msgId !== undefined) {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>(`http://127.0.0.1:8000/api/auth/get-group-reaction/${msgId}`, { headers })
      .subscribe(
        (response: any[]) => {
          // Ensure that response is an array
          if (Array.isArray(response)) {
            // Combine the fetched reactions with the local reactions, avoiding duplicates
            this.reactions = response.concat(
              this.reactions.filter(localReaction => {
                // Filter out local reactions that are already present in the response
                return !response.some((apiReaction: any) => apiReaction.sender_id === localReaction.sender_id);
              })
            );

            // Log sender_id for each reaction after they have been fetched
            this.reactions.forEach(reaction => {
            });
          }
        },
        (error) => {
          console.error('Error getting reactions:', error);
        }
      );
  } else {
    console.error('Message ID is undefined'); // Log if msgId is undefined
  }
}



openReactionsModal() {
  this.isReactionsModalOpen = true;
}

closeReactionsModal() {
  this.isReactionsModalOpen = false;
}

removeReaction(reaction: Reaction, message: any) {
  const token = localStorage.getItem('authToken') || '';
  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  const msgId = message.msg_id;

  this.http.delete(`http://127.0.0.1:8000/api/auth/delete-group-reaction/${msgId}`, { headers })
    .subscribe(
      (response: any) => {
        // Remove the reaction from the list locally
        this.reactions = this.reactions.filter(r => r.sender_id !== reaction.sender_id); // Ensure correct comparison
      },
      (error) => {
        console.error('Error removing reaction:', error);
      }
    );
}

// Toggle emoji picker visibility
toggleEmojiPicker() {
  this.showEmojiPicker = !this.showEmojiPicker;
  this.message.showDropdown = false;
}

onClickOutside(event: MouseEvent) {
  const emojiPickerElement = document.querySelector('.emoji-mart'); // Adjust selector if necessary
  if (emojiPickerElement && !emojiPickerElement.contains(event.target as Node)) {
    // Click happened outside the emoji picker, close it
    this.showEmojiPicker = false;

    // Remove the event listener
    document.removeEventListener('click', this.onClickOutside.bind(this), true);
  }
  this.message.showDropdown = false;
}

ngOnDestroy() {
  // Ensure the event listener is removed if the component is destroyed
  document.removeEventListener('click', this.onClickOutside.bind(this), true);
}

onEmojiSelected(event: any) {
  const selectedEmoji = event.emoji.native; // Access the selected emoji

  // Perform the necessary action with the selected emoji (e.g., send it as a reaction)
  this.onReact(selectedEmoji,this.message);

  // Close the emoji picker after selecting an emoji
  this.showEmojiPicker = false;
}


}

