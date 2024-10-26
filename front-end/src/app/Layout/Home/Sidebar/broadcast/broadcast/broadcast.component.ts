import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';

@Component({
  selector: 'app-broadcast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './broadcast.component.html',
  styleUrls: ['./broadcast.component.css'] // Corrected 'styleUrl' to 'styleUrls'
})
export class BroadcastComponent implements OnInit, OnDestroy {
  @Input() broadcastList: any[] = [];
  
  // Keep track of the selected broadcast
  selectedBroadcast: any = null;

  constructor(
    private selectedBroadcastService: SelectedBroadcastService,
    private selectedConversationService: SelectedConversationService,
    private selectedGroupService: SelectedGroupService,
  ) {}

  ngOnInit(): void {
    // Subscribe to the selected broadcast observable if needed
    this.selectedBroadcastService.selectedBroadcast$.subscribe(broadcast => {
      this.selectedBroadcast = broadcast;
    });
  }

  ngOnDestroy(): void {}

  // Method to handle broadcast selection
  onSelectBroadcast(broadcast: { id: string; name: string }): void {
    this.selectedBroadcast = broadcast; // Set the selected broadcast locally
    // Update the service with both ID and name
    this.selectedBroadcastService.selectBroadcast(broadcast); 
    this.selectedConversationService.clearSelectedConversation();
    this.selectedGroupService.clearSelectedGroup();
  }
}
