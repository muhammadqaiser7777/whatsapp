import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { format, isToday, isYesterday } from 'date-fns';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';  // Import DomSanitizer

@Component({
  selector: 'app-group',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group.component.html',
  styleUrls: ['./group.component.css']
})
export class GroupComponent {
  @Input() groupList: any[] = [];
  selectedGroup: any = null;

  constructor(
    private selectedGroupService: SelectedGroupService,
    private selectedBroadcastService: SelectedBroadcastService,
    private selectedConversationService: SelectedConversationService,
    private sanitizer: DomSanitizer  // Inject DomSanitizer
  ) {}

  // When a group is selected, save it in the selectedGroup and send it to the service
  onSelectGroup(group: any): void {
    this.selectedGroup = group;

    // Pass selected group details to the SelectedGroupService
    this.selectedGroupService.setSelectedGroup({
      id: group.id,
      name: group.group_name,
      dp: group.path
    });

    // Notify services if necessary
    this.selectedBroadcastService.clearSelection();
    this.selectedConversationService.clearSelectedConversation();
  }

  formatTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) {
      return ''; // Return an empty string or some default message when no timestamp is available
    }
  
    const date = new Date(timestamp);
  
    if (isNaN(date.getTime())) {
      return ''; // If the timestamp is invalid, return an empty string or error message
    }
  
    if (isToday(date)) {
      return format(date, 'hh:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'hh:mm a')}`;
    } else {
      return format(date, 'hh:mm a dd:MM:yyyy');
    }
  }

  getLastMessage(group: any): { svg: SafeHtml; message: string } {
    let message = '';
    let svg = '';

    switch (group.last_message.message_type) {
      case 'text':
        message = group.last_message.message;
        svg = '';  // No SVG for text messages
        break;
      case 'image':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image-fill" viewBox="0 0 16 16"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/>';
        break;
      case 'video':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2z"/>';
        break;
      case 'audio':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-music-note-beamed" viewBox="0 0 16 16"><path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2"/><path fill-rule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z"/><path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z"/>';
        break;
      case 'excel':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/></svg>';
        message = 'Document';
        break;
      case 'poll':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e8eaed"><path d="M160-160v-320h160v320H160Zm240 0v-640h160v640H400Zm240 0v-440h160v440H640Z"/></svg>';
        message = 'Poll';
        break;
      // Add other cases as needed
      default:
        message = group.last_message.message; // Fallback for unknown types
        svg = ''; // No SVG for unknown types
    }

    return { svg: this.sanitizer.bypassSecurityTrustHtml(svg), message };
}

  
}
