import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessagesContainerComponent } from '../Messages/messages-container/messages-container.component';
import { GroupMessagesContainerComponent } from '../GroupMessages/group-messages-container/group-messages-container.component';
import { BroadcastMessagesComponent } from '../BroadcastMessages/broadcast-messages/broadcast-messages.component';

import { SelectedConversationService } from '../../../../Services/selected-conversation/selected-conversation.service';
import { SelectedGroupService } from '../../../../Services/selected-group/selected-group.service';
import { SelectedBroadcastService } from '../../../../Services/selected-broadcast/selected-broadcast.service';
import { Subscription, of } from 'rxjs';
import { map, startWith } from 'rxjs/operators'; 

@Component({
  selector: 'app-display',
  standalone: true,
  imports: [CommonModule, MessagesContainerComponent, GroupMessagesContainerComponent, BroadcastMessagesComponent],
  templateUrl: './display.component.html',
  styleUrls: ['./display.component.css']
})
export class DisplayComponent implements OnInit, OnDestroy {
  activeView: 'conversation' | 'group' | 'broadcast' | 'default' = 'default';
  private subscriptions: Subscription[] = [];

  constructor(
    private selectedConversationService: SelectedConversationService,
    private selectedGroupService: SelectedGroupService,
    private selectedBroadcastService: SelectedBroadcastService,
  ) {}

  ngOnInit(): void {
    // Subscribe to selected conversation
    const conversationSub = this.selectedConversationService.selectedConversation$
  .pipe(
    startWith(null) // Start with null to ensure initial state
  )
  .subscribe(conversation => {
    this.updateActiveView(conversation, 'conversation');
  });

    
    // Subscribe to selected group
    const groupSub = this.selectedGroupService.getSelectedGroup()
      .pipe(startWith(null)) // Start with null to ensure initial state
      .subscribe(group => {
        this.updateActiveView(group, 'group');
      });

    // Subscribe to selected broadcast
    const broadcastSub = this.selectedBroadcastService.getSelectedBroadcast()
      .pipe(startWith(null)) // Start with null to ensure initial state
      .subscribe(broadcast => {
        this.updateActiveView(broadcast, 'broadcast');
      });

    // Store subscriptions for cleanup
    this.subscriptions.push(conversationSub, groupSub, broadcastSub);
  }

  private updateActiveView(value: any, view: 'conversation' | 'group' | 'broadcast') {
    if (value) {
      this.activeView = view; // Update active view if value exists
    } else if (this.activeView === view) {
      // Check if currently active view is the one being checked and reset if it's null
      this.activeView = 'default';
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  back() {
    this.selectedBroadcastService.clearSelection();
    this.selectedConversationService.clearSelectedConversation();
    this.selectedGroupService.clearSelectedGroup();
  }
}
