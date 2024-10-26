import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { format, isToday, isYesterday } from 'date-fns';

@Component({
  selector: 'app-message-head',
  standalone: true,
  imports: [],
  templateUrl: './message-head.component.html',
  styleUrl: './message-head.component.css'
})
export class MessageHeadComponent implements OnInit, OnDestroy {

    otherUserFullName: string = '';
    otherUserProfilePic: string = '';
    userStatus: string = ''; // To store the formatted user status
    private subscription: Subscription = new Subscription();
    private authUser: string = '';
  
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
            // Directly get the other user details from the service
            const otherUserDetails = this.selectedConversationService.getUserDetails(this.authUser);
            if (otherUserDetails) {
              this.otherUserFullName = otherUserDetails.fullName;
  
              // Determine the profilePic source
              const profilePic = otherUserDetails.profilePic;
              this.otherUserProfilePic = profilePic.startsWith('http') 
                ? profilePic 
                : `http://127.0.0.1:8000/${profilePic}`;
  
              // Directly use the other user's ID for fetching status
              const otherUserID = otherUserDetails.username;
              this.fetchUserStatus(otherUserID);
            } else {
              console.warn("No other user details found.");
            }
          }
        })
      );
    }
  
    ngOnDestroy() {
      this.subscription.unsubscribe();
    }
  
    fetchUserStatus(receiverID: string) {
      const apiUrl = `http://127.0.0.1:8000/api/auth/users/${receiverID}`;
      const token = localStorage.getItem('authToken') || '';
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      this.http.get<any>(apiUrl, { headers }).pipe(
        catchError(error => {
          console.error('Error fetching user status:', error);
          return of({ is_online: false, last_seen: 'Unknown' });
        })
      ).subscribe(response => {
        if (response) {
          this.userStatus = this.formatUserStatus(response);
        } else {
          this.userStatus = 'Unknown';
        }
      });
    }
  
    formatUserStatus(status: any): string {
      const { is_online, last_seen } = status;

      // If the user is online, always show 'Online' regardless of last_seen
      if (is_online) {
        return 'Online';
      }

      // If last_seen is 'Unknown', display 'Unknown'
      if (last_seen === 'Unknown') {
        return 'Last Seen: Unknown';
      }

      const lastSeenDate = new Date(last_seen);

      // Handle cases for formatting the last seen date
      if (isToday(lastSeenDate)) {
        return `Last Seen: ${format(lastSeenDate, 'hh:mm a')}`;
      }

      if (isYesterday(lastSeenDate)) {
        return `Last Seen: Yesterday ${format(lastSeenDate, 'hh:mm a')}`;
      }

      return `Last Seen: ${format(lastSeenDate, 'dd/MM/yyyy hh:mm a')}`;
    }
}
