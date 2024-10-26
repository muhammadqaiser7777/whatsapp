import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { StatusSidebarComponent } from '../status-sidebar/status-sidebar.component';
import { StatusDisplayComponent } from '../status-display/status-display.component';
import { CommonModule } from '@angular/common';
import { SelectedStatusService } from '../../../Services/selected-status/selected-status.service';
import { StatusUpdateService } from '../../../Services/UpdateStatus/update-status.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-status',
  standalone: true,
  imports: [StatusSidebarComponent, StatusDisplayComponent, CommonModule],
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})
export class StatusComponent implements OnInit, OnDestroy {
  selectedStatus: any = null;
  showUpdateStatus: boolean = false;
  isMobileView: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private selectedStatusService: SelectedStatusService,
    private statusUpdateService: StatusUpdateService
  ) {}

  ngOnInit(): void {
    // Subscribe to SelectedStatusService
    this.subscriptions.add(
      this.selectedStatusService.selectedStatus$.subscribe((status) => {
        this.selectedStatus = status;
      })
    );

    // Subscribe to StatusUpdateService
    this.subscriptions.add(
      this.statusUpdateService.showUpdateStatus$.subscribe((showUpdate) => {
        this.showUpdateStatus = showUpdate;
      })
    );

    // Check initial screen size
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    this.statusUpdateService.setShowUpdateStatus(false);
    this.selectedStatusService.clearSelectedStatus();
    // Unsubscribe to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  // Listen for window resize events
  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  // Check if the screen is less than or equal to 750px
  checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 750;
  }

  // Logic to determine whether to show Sidebar or Display on mobile
  shouldShowSidebar(): boolean {
    return this.isMobileView && this.showUpdateStatus === false && this.selectedStatus === null;
  }

  shouldShowDisplay(): boolean {
    return this.isMobileView && (this.showUpdateStatus || this.selectedStatus !== null);
  }
}
