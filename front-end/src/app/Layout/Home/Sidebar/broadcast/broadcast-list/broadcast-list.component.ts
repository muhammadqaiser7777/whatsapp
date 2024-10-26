import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { BroadcastComponent } from '../broadcast/broadcast.component';
import { CommonModule } from '@angular/common';

interface BroadcastResponse {
    success: boolean;
    broadcasts: Broadcast[];
}

interface Broadcast {
    id: number;
    name: string;
    owner: string;
    created_at: string;
    updated_at: string;
}

@Component({
  selector: 'app-broadcast-list',
  standalone: true,
  imports: [BroadcastComponent, CommonModule],
  templateUrl: './broadcast-list.component.html',
  styleUrls: ['./broadcast-list.component.css']
})
export class BroadcastListComponent implements OnInit {
  
  broadcastList: Broadcast[] = [];
  isLoading = true;
  isError = false;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getBroadcastList();
  }

  getBroadcastList() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('No auth token found');
      this.isError = true;
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    this.http.get<BroadcastResponse>('http://127.0.0.1:8000/api/auth/broadcast-list', { headers })
      .subscribe(
        (data) => {
          if (data.success) {
            this.broadcastList = data.broadcasts; // Correctly access the broadcasts array
          } else {
            console.error('Failed to retrieve broadcasts');
            this.isError = true;
          }
          this.isLoading = false;
        },
        (error) => {
          console.error('Error fetching broadcast list:', error);
          this.isError = true;
          this.isLoading = false;
        }
      );
  }
}
