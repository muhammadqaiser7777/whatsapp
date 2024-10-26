import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { GroupComponent } from '../group/group.component';
import { CommonModule } from '@angular/common';

// Interface for the last message in the group
interface LastMessage {
  sender_id: string;
  sender_fullName: string;
  message_type: string;
  message: string;
  caption: string | null;
  media_path: string | null;
  file_name: string | null;
  created_at: string;
  updated_at: string;
}

// Interface for each group
interface Group {
  group_name: string;
  group_dp: string;
  path: string;
  last_message: LastMessage;
}

// Interface for the main API response
interface GroupResponse {
  success: boolean;
  groups: Group[];
}


@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule,GroupComponent],
  templateUrl: './group-list.component.html',
  styleUrl: './group-list.component.css'
})
export class GroupListComponent {

  groupList: Group[] = [];
  isLoading = true;
  isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getGroupList();
  }

  getGroupList() {
    const token = localStorage.getItem('authToken');
  
    if (!token) {
      console.error('No auth token found');
      this.isError = true;
      this.isLoading = false;
      return;
    }
  
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<GroupResponse>('http://127.0.0.1:8000/api/auth/group-list', { headers })
      .subscribe(
        (data) => {
          if (data.success) {
            // Assign and sort groups based on last_message.created_at
            this.groupList = data.groups.map(group => ({
              ...group,
              last_message: group.last_message || { sender_fullName: 'No messages yet', message: '', created_at: null }
            })).sort((a, b) => {
              // Check if last_message is present and has a created_at timestamp
              const aTime = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
              const bTime = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
              return bTime - aTime; // Sort in descending order (latest first)
            });
          } else {
            console.error('Failed to retrieve groups');
            this.isError = true;
          }
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching group list:', error);
          this.isError = true;
          this.isLoading = false;
        }
      );
  }
  
  

}