import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SidebarComponent } from '../Sidebar/sidebar/sidebar.component';
import { DisplayComponent } from '../Display/display/display.component';
import { SelectedBroadcastService } from '../../../Services/selected-broadcast/selected-broadcast.service';
import { SelectedConversationService } from '../../../Services/selected-conversation/selected-conversation.service';
import { SelectedGroupService } from '../../../Services/selected-group/selected-group.service';
import { Subscription, combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SidebarComponent, DisplayComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  isMobileView: boolean = false; // Track if in mobile view
  isAnyServiceSelected: boolean = false; // Track if any service is selected
  private subscriptions: Subscription[] = [];

  constructor(
    private selectedBroadcastService: SelectedBroadcastService,
    private selectedConversationService: SelectedConversationService,
    private selectedGroupService: SelectedGroupService
  ) {}

  ngOnInit(): void {
    // Subscribe to changes in all three services
    const servicesSub = combineLatest([
      this.selectedBroadcastService.selectedBroadcast$,
      this.selectedConversationService.selectedConversation$,
      this.selectedGroupService.selectedGroup$,
    ])
      .pipe(startWith([null, null, null])) // Start with null to ensure initial state
      .subscribe(([broadcast, conversation, group]) => {
        this.updateView(broadcast, conversation, group);
      });

    this.subscriptions.push(servicesSub);
    this.checkMobileView(); // Check initial screen width
  }

  private updateView(broadcast: any, conversation: any, group: any) {
    // Determine whether to show sidebar or display based on service values
    this.isAnyServiceSelected = !!(broadcast || conversation || group); // Set to true if any service has a value
  }

  private checkMobileView() {
    this.isMobileView = window.innerWidth <= 750; // Check if screen width is 750px or less
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobileView(); // Update on window resize
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
