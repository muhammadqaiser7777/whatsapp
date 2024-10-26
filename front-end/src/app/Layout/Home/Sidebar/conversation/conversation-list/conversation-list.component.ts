import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ConversationComponent } from '../conversation/conversation.component';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-conversations-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.css'],
  imports: [ConversationComponent, CommonModule],
})
export class ConversationListComponent implements OnInit, OnDestroy {
  conversations: any[] = [];
  isLoading = true;
  isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchConversations();
  }

  ngOnDestroy(): void {}

  private fetchConversations(): void {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('No auth token found');
      this.isError = true;
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.isLoading = true;
    this.isError = false; // Reset error before making the request

    this.http.get<any>('http://127.0.0.1:8000/api/auth/conversations', { headers }).subscribe(
      data => {
        const conversationsArray = Array.isArray(data) ? data : Object.values(data);

        // Check if conversationsArray is indeed an array
        if (Array.isArray(conversationsArray)) {
          this.conversations = conversationsArray
            .map(conversation => ({
              ...conversation,
              messageType: conversation.last_message_type || 'text', // Ensure this property exists
              last_message_time: conversation.last_message_time || null // Ensure this property exists
            }))
            .sort((a, b) => {
              // Get timestamps for sorting
              const aTime = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
              const bTime = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;

              return bTime - aTime; // Sort in descending order (latest first)
            });
        } else {
          console.error('Expected an array but got:', conversationsArray);
          this.isError = true; // Set error flag if the response is not as expected
        }

        this.isLoading = false; // Set loading to false when the request completes
      },
      error => {
        console.error('Error fetching conversations', error);
        this.isError = true; // Set error flag on failure
        this.isLoading = false; // Set loading to false when the request fails
      }
    );
  }
}
