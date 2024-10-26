import { Component, Input, OnChanges, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectedParticipantsService } from '../../../../../Services/selected-participants/selected-participants.service';
import { Router } from '@angular/router';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';

@Component({
  selector: 'app-group-broadcast-maker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './group-broadcast-maker.component.html',
  styleUrls: ['./group-broadcast-maker.component.css']
})
export class GroupBroadcastMakerComponent implements OnChanges {
 
  @Input() selectedIndex: number | null = null;
  @Input() isVisible: boolean = false;
  @Output() selectedIndexChange = new EventEmitter<number | null>();
  @Output() confirmed = new EventEmitter<void>(); // Event for confirmed action
  @Output() closed = new EventEmitter<void>(); // Event for close action
  @Output() closeModal = new EventEmitter<void>(); // Emit close event

  showModal: boolean = false;
  groupName: string = '';
  broadcastName: string = '';
  
  @ViewChild('fileInput', { static: false }) fileInput: ElementRef | undefined; // Reference the file input

  constructor(
    private http: HttpClient,
    private selectedParticipantsService: SelectedParticipantsService,
    private selectedGroupService: SelectedGroupService,
    private selectedBroadcastService: SelectedBroadcastService,
    private selectedConversationService: SelectedConversationService,
    private router: Router
  ) {}

  ngOnChanges() {
    this.showModal = this.isVisible; // Open modal when isVisible changes
  }

  close() {
    this.showModal = false; // Optionally control visibility
    this.groupName = ''; // Clear the group name
    this.broadcastName = ''; // Clear the broadcast name
    if (this.fileInput) {
        this.fileInput.nativeElement.value = ''; // Clear file input
    }
    this.closeModal.emit(); // Emit close event
    this.closed.emit(); // Emit closed event to parent component
  }

  createGroup() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    // Create FormData for group creation
    const formData = new FormData();
    formData.append('group_name', this.groupName);

    // Get participants from the service and append them to the FormData
    const participants = this.selectedParticipantsService.getParticipants();
    participants.forEach(participant => {
      formData.append('participants[]', participant);
    });

    // Append the group profile image if selected
    if (this.fileInput && this.fileInput.nativeElement.files.length > 0) {
      formData.append('group_dp', this.fileInput.nativeElement.files[0]); // Ensure correct file is appended
    }

    // Send POST request
    this.http.post<any>('http://127.0.0.1:8000/api/auth/create-group', formData, { headers })
      .subscribe(response => {
        if (response.success) {

          // Show confirmation dialog
          const userConfirmed = window.confirm('Group created successfully!');
          if (userConfirmed) {
            const createdGroup = response.group;
            this.selectedGroupService.setSelectedGroup({
              id: createdGroup.id,
              name: createdGroup.group_name,
              dp: createdGroup.path // Use the full image path
            });
            this.selectedConversationService.clearSelectedConversation();
            this.selectedBroadcastService.clearSelection();
            this.confirmed.emit(); // Emit confirmed event only if user confirms
          }
          this.close(); // Close the modal regardless of confirmation
        } else {
          console.error('Group creation failed:', response);
          this.close(); // Close the modal on failure as well
        }
      }, error => {
        console.error('Error creating group:', error);
        this.close(); // Close the modal on error as well
      });
  }

  createBroadcast() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
    // Create FormData for broadcast creation
    const formData = new FormData();
    formData.append('broadcast_name', this.broadcastName);
  
    // Get participants from the service and append them to the FormData
    const participants = this.selectedParticipantsService.getParticipants();
    participants.forEach(participant => {
      formData.append('participants[]', participant);
    });
  
    // Send POST request
    this.http.post<any>('http://127.0.0.1:8000/api/auth/create-broadcast', formData, { headers })
      .subscribe(response => {
        if (response.success) {
  
          // Show confirmation dialog
          const userConfirmed = window.confirm('Broadcast created successfully!');
          if (userConfirmed) {
            const createdBroadcast = response.broadcast; // Get the created broadcast from the response
            
            // Select the broadcast with both ID and name
            this.selectedBroadcastService.selectBroadcast({
              id: createdBroadcast.id,   // Assuming the ID is returned in the response
              name: createdBroadcast.name  // Assuming the name is returned in the response
            });
  
            this.selectedGroupService.clearSelectedGroup();
            this.selectedConversationService.clearSelectedConversation();
            this.confirmed.emit(); // Emit confirmed event only if user confirms
          }
          this.close(); // Close the modal regardless of confirmation
        } else {
          console.error('Broadcast creation failed:', response);
          this.close(); // Close the modal on failure as well
        }
      }, error => {
        console.error('Error creating Broadcast:', error);
        this.close(); // Close the modal on error as well
      });
  }
}
