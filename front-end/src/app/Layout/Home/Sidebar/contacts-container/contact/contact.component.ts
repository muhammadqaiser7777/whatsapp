import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { SelectedParticipantsService } from '../../../../../Services/selected-participants/selected-participants.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnDestroy {
  @Input() contact: any; // Input property to receive contact data
  @Output() contactClicked = new EventEmitter<void>(); // Event emitter to notify parent component
  @Output() minimumParticipantsChanged = new EventEmitter<boolean>(); // Event emitter for minimumParticipants status

  profilePic: string = ''; // Store profile picture URL
  selectedUsername: string | null = null; // Property to track selected username
  private participantsSubscription: Subscription; // Subscription to listen for participants listening state

  constructor(
    private selectedConversationService: SelectedConversationService,
    private selectedParticipantsService: SelectedParticipantsService
  ) {
    // Subscribe to the listening state of participants
    this.participantsSubscription = this.selectedParticipantsService.isListeningSubject.subscribe(isListening => {
      // If not listening, reset selectedUsername
      if (!isListening) {
        this.selectedUsername = null;
      }
    });
  }

  ngOnInit() {
    this.setProfilePic(); // Set profilePic on initialization
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.participantsSubscription.unsubscribe();
  }

  setProfilePic() {
    if (this.contact && this.contact.profilePic) {
      this.profilePic = this.contact.profilePic.startsWith('http') 
        ? this.contact.profilePic 
        : `http://127.0.0.1:8000/${this.contact.profilePic}`;
    }
  }

  onContactClick() {
    // Check if the service is currently listening
    if (!this.selectedConversationService.isListening()) {
      // Check if the contact is already selected
      if (this.selectedUsername === this.contact.username) {
        // If already selected, remove the contact
        this.selectedParticipantsService.removeParticipant(this.contact.username);
        this.selectedUsername = null; // Unselect the contact
      } else {
        // If not selected, add the contact
        this.selectedParticipantsService.addParticipant(this.contact.username);
        this.selectedUsername = this.contact.username; // Track selected username
      }

      // Call the checkParticipantsCount() method to update minimumParticipants
      this.checkParticipantsCount();

      return; // Abort the action if not listening
    }

    // Create the conversation object based on the contact data
    const conversation = {
      user1: {
        username: this.contact.username,
        fullName: this.contact.fullName,
        profilePic: this.profilePic // Use the updated profilePic URL
      },
      user2: null // Initialize as null; this will be set in a different context or method
    };

    // Set the selected conversation in the service
    this.selectedConversationService.setSelectedConversation(conversation);

    // Emit event to notify parent component only if the service is listening
    this.contactClicked.emit();
  }

  checkParticipantsCount() {
    const minimumParticipants = this.selectedParticipantsService.hasMinimumParticipants();
    this.minimumParticipantsChanged.emit(minimumParticipants); // Emit the value to the parent
  }

  isSelected(): boolean {
    return this.selectedUsername === this.contact.username; // Check if this contact is selected
  }
}
