import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { StatusSenderComponent } from '../status-sender/status-sender.component';
import { CommonModule } from '@angular/common';
import { SelectedStatusService } from '../../../Services/selected-status/selected-status.service';
import { StatusUpdateService } from '../../../Services/UpdateStatus/update-status.service';
@Component({
  selector: 'app-status-sidebar',
  standalone: true,
  imports: [StatusSenderComponent, CommonModule],
  templateUrl: './status-sidebar.component.html',
  styleUrls: ['./status-sidebar.component.css']
})
export class StatusSidebarComponent implements OnInit {
  statusList: any[] = [];
  isLoading = true;
  isError = false;
  showUpdateStatus: boolean = false;

  constructor(
    private http: HttpClient,
    private selectedStatusService: SelectedStatusService, // Inject the service
    private statusUpdateService: StatusUpdateService
  ) {}

  ngOnInit() {
    this.getStatusList();
  }

  getStatusList() {
    const token = localStorage.getItem('authToken');

    if (!token) {
      console.error('No auth token found');
      this.isError = true;
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<any[]>('http://127.0.0.1:8000/api/auth/get-list', { headers })
      .subscribe(
        (data) => {
          this.statusList = data; // Set the status list on success
          this.isLoading = false; // Disable the loading spinner
        },
        (error) => {
          console.error('Error fetching status list:', error); // Log any errors
          this.isError = true;
          this.isLoading = false; // Stop loading spinner
        }
      );
  }

  // Method to handle the post click event
  onPostClick(): void {
    // Clear the selected status in the service
    this.selectedStatusService.clearSelectedStatus();
    this.statusUpdateService.setShowUpdateStatus(true);
  }
}
