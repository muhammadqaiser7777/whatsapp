import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ContactComponent } from '../contact/contact.component';
import { GroupBroadcastMakerComponent } from '../group-broadcast-maker/group-broadcast-maker.component';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { SelectedParticipantsService } from '../../../../../Services/selected-participants/selected-participants.service';

@Component({
  selector: 'app-contacts-list',
  standalone: true,
  templateUrl: './contacts-list.component.html',
  styleUrls: ['./contacts-list.component.css'],
  imports: [ContactComponent, CommonModule, GroupBroadcastMakerComponent]
})
export class ContactsListComponent implements OnInit {
  
  contacts: any[] = []; // Array to hold contacts
  isOffCanvasVisible: boolean = false; // Flag to control off-canvas visibility
  public areElementsVisible: boolean = false;
  selectedElement: number | null = null;
  isButtonDisabled: boolean = false;
  minimumParticipants: boolean = false; // Property to track minimum participants status
  isGroupBroadcastMakerVisible: boolean = false;

  constructor(
    private http: HttpClient,
    private selectedConversationService: SelectedConversationService,
    private selectedParticipantsService: SelectedParticipantsService
  ) {}

  ngOnInit(): void {
    this.fetchContacts().subscribe(
      (data: any[]) => {
        this.contacts = this.sortContactsAlphabetically(data); // Sort fetched data alphabetically
      },
      (error) => {
        console.error('Error fetching contacts', error);
      }
    );
  }

  create() {
    this.areElementsVisible = true;  // Show the elements
    this.isButtonDisabled = true;    // Disable the button
    this.selectedConversationService.stopListening();
    this.selectedParticipantsService.startListening();
  }

  // Function to hide elements and reset the selection
  cancel() {
    this.areElementsVisible = false; // Hide the elements
    this.selectedElement = null;     // Clear selection
    this.isButtonDisabled = false;   // Enable the button again
    this.isGroupBroadcastMakerVisible = false;
    this.selectedConversationService.startListening();
    this.selectedParticipantsService.stopListening();
  }

  // Method to show GroupBroadcastMakerComponent
  name() {
    if (this.minimumParticipants) {
        this.isGroupBroadcastMakerVisible = true; // This will open the modal
    }
}


  // Function to handle the click event and select one <li> element at a time
  selectElement(index: number) {
    this.selectedElement = index;  // Set the selected <li> index
    this.areElementsVisible = true; // Show the elements (optional, if this behavior is needed)
    this.isButtonDisabled = true;   // Disable the button after selection
    this.selectedConversationService.stopListening();
    this.selectedParticipantsService.startListening();
  }

  // Function to check if an <li> element is selected
  isSelected(index: number): boolean {
    return this.selectedElement === index; // Return true if the <li> at the index is selected
  }

  fetchContacts(): Observable<any[]> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<any[]>('http://127.0.0.1:8000/api/auth/users', { headers });
  }

  sortContactsAlphabetically(contacts: any[]): any[] {
    return contacts.sort((a, b) => a.fullName.localeCompare(b.fullName));
  }



  onContactSelected() {
    this.toggleOffCanvas(); // Close the off-canvas menu
  }

  toggleOffCanvas() {
    this.isOffCanvasVisible = !this.isOffCanvasVisible;
  }

  // Method to handle minimum participants status from child component
  onMinimumParticipantsChanged(isMinimum: boolean) {
    this.minimumParticipants = isMinimum; // Update the minimumParticipants variable in the parent
  }

  // Listen for confirmed event from GroupBroadcastMakerComponent
  onConfirmed() {
    this.toggleOffCanvas(); // Call toggleOffCanvas when confirmed
    this.cancel(); // Call cancel to hide elements and reset selection
  }

  // Listen for closed event from GroupBroadcastMakerComponent
  onClosed() {
    this.isGroupBroadcastMakerVisible = false; // Hide the modal when closed
}
}
