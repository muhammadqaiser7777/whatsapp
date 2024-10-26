import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedStatusService } from '../../../Services/selected-status/selected-status.service';
import { Subscription } from 'rxjs';
import { StatusUpdateService } from '../../../Services/UpdateStatus/update-status.service';

@Component({
  selector: 'app-status-sender',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-sender.component.html',
  styleUrls: ['./status-sender.component.css']
})
export class StatusSenderComponent implements OnInit, OnDestroy {
  @Input() statusList: any[] = [];
  
  private subscription: Subscription = new Subscription();

  constructor(
    private selectedStatusService: SelectedStatusService,
    private statusUpdateService: StatusUpdateService
  ) {}

  // Holds the selected status
  selectedStatus: any = null;

  ngOnInit(): void {
    // Subscribe to the selected status changes
    this.subscription = this.selectedStatusService.selectedStatus$.subscribe(
      (status) => {
        this.selectedStatus = status; // Update selectedStatus when it changes
      }
    );
  }

  ngOnDestroy(): void {
    // Unsubscribe to avoid memory leaks
    this.subscription.unsubscribe();
  }

  // Select the clicked status and pass it to the service
  selectStatus(status: any): void {
    if (this.selectedStatus === status) {
      // If the same status is clicked again, clear the selection
      this.selectedStatus = null;
      this.selectedStatusService.clearSelectedStatus(); // Clear in the service
      this.statusUpdateService.setShowUpdateStatus(false);
    } else {
      // Otherwise, set the selected status
      this.selectedStatus = status;
      this.selectedStatusService.setSelectedStatus(status);
      this.statusUpdateService.setShowUpdateStatus(false);
    }
  }

  // Helper function to adjust the time for PST (UTC+5)
  private convertToPST(date: Date): Date {
    const pstOffset = 5 * 60; // Offset in minutes (5 hours)
    return new Date(date.getTime() + pstOffset * 60 * 1000);
  }

  // Format the recent_status timestamp based on the provided rules
  getDisplayDate(recentStatusTime: string): string | null {
    let statusTime = new Date(recentStatusTime);
    if (!recentStatusTime || isNaN(statusTime.getTime())) {
      return null;
    }

    // Adjust the status time to PST
    statusTime = this.convertToPST(statusTime);

    const today = this.convertToPST(new Date());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = statusTime.toDateString() === today.toDateString();
    const isYesterday = statusTime.toDateString() === yesterday.toDateString();

    if (isToday) {
      return statusTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } else if (isYesterday) {
      return `Yesterday ${statusTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    } else {
      return `${statusTime.getDate().toString().padStart(2, '0')}/${(statusTime.getMonth() + 1).toString().padStart(2, '0')}/${statusTime.getFullYear()} ${statusTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
  }
}
