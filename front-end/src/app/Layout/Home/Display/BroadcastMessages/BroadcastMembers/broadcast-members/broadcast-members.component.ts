import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectedBroadcastService } from '../../../../../../Services/selected-broadcast/selected-broadcast.service';
import { BroadcastMemberComponent } from '../broadcast-member/broadcast-member.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-broadcast-members',
  standalone: true,
  imports: [BroadcastMemberComponent, CommonModule],
  templateUrl: './broadcast-members.component.html',
  styleUrls: ['./broadcast-members.component.css']
})
export class BroadcastMembersComponent implements OnInit {
  broadcastId: string | null = null; // Store the broadcast ID
  participants: any[] = []; // Array to store participants

  constructor(
    private selectedBroadcastService: SelectedBroadcastService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Subscribe to the selected broadcast to get the broadcast ID
    this.selectedBroadcastService.selectedBroadcast$.subscribe(selectedBroadcast => {
      if (selectedBroadcast) {
        this.broadcastId = selectedBroadcast.id; // Extract broadcast ID
        this.fetchBroadcastDetails(); // Fetch broadcast details
      }
    });
  }

  fetchBroadcastDetails() {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiUrl = `http://127.0.0.1:8000/api/auth/broadcast/${this.broadcastId}`;

    this.http.get<any>(apiUrl, { headers }).subscribe({
      next: (response) => {
        if (response.success) {
          this.participants = response.participants; // Store participants from response
        }
      },
      error: (err) => {
        console.error('Error fetching broadcast details:', err);
      }
    });
  }
}
