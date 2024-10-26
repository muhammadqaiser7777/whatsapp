import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SelectedConversationService } from '../../../../../Services/selected-conversation/selected-conversation.service';
import { SelectedBroadcastService } from '../../../../../Services/selected-broadcast/selected-broadcast.service';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ConversationComponent implements OnInit {
  @Input() conversation: any; 
  @Input() messageType?: string;

  isSelected: boolean = false;

  constructor(
    private selectedConversationService: SelectedConversationService,
    private selectedBroadcastService: SelectedBroadcastService,
    private selectedGroupService: SelectedGroupService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.selectedConversationService.selectedConversation$.subscribe(selectedConversation => {
      this.isSelected = this.conversation === selectedConversation;
    });
  }

  get authUser(): string {
    return localStorage.getItem('username') || '';
  }

  onConversationClick() {
    this.selectedConversationService.setSelectedConversation(this.conversation);
    this.selectedBroadcastService.clearSelection();
    this.selectedGroupService.clearSelectedGroup();
  }

  get contactFullName(): string {
    return this.conversation.user1.username === this.authUser
      ? this.conversation.user2.fullName
      : this.conversation.user1.fullName;
  }

  get contactProfilePic(): string {
    const profilePic = this.conversation.user1.username === this.authUser
      ? this.conversation.user2.profilePic
      : this.conversation.user1.profilePic;

    // Determine the profilePic source
    return profilePic.startsWith('http') 
      ? profilePic 
      : `http://127.0.0.1:8000/${profilePic}`;
  }

  getDisplayMessage(): SafeHtml {
    const message = this.conversation.last_message || '';
    const maxLength = 15;

    if (!this.messageType) {
      return message.length > maxLength ? message.slice(0, maxLength) + ' . . .' : message;
    }

    let svg: string;
    switch (this.messageType) {
      case 'image':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-image-fill" viewBox="0 0 16 16"><path d="M.002 3a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-12a2 2 0 0 1-2-2zm1 9v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062zm5-6.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0"/></svg> Photo';
        break;
      case 'video':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-camera-video-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M0 5a2 2 0 0 1 2-2h7.5a2 2 0 0 1 1.983 1.738l3.11-1.382A1 1 0 0 1 16 4.269v7.462a1 1 0 0 1-1.406.913l-3.111-1.382A2 2 0 0 1 9.5 13H2a2 2 0 0 1-2-2z"/></svg> Video';
        break;
      case 'audio':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-music-note-beamed" viewBox="0 0 16 16"><path d="M6 13c0 1.105-1.12 2-2.5 2S1 14.105 1 13s1.12-2 2.5-2 2.5.896 2.5 2m9-2c0 1.105-1.12 2-2.5 2s-2.5-.895-2.5-2 1.12-2 2.5-2 2.5.895 2.5 2"/><path fill-rule="evenodd" d="M14 11V2h1v9zM6 3v10H5V3z"/><path d="M5 2.905a1 1 0 0 1 .9-.995l8-.8a1 1 0 0 1 1.1.995V3L5 4z"/></svg> Audio';
        break;
      case 'word':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/></svg> Document';
        break;
      case 'pdf':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/></svg> Document';
        break;
      case 'ppt':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/></svg> Document';
        break;
      case 'excel':
        svg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-fill" viewBox="0 0 16 16"><path d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"/></svg> Document';
        break;
      case 'poll': 
        svg = '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#e8eaed"><path d="M160-160v-320h160v320H160Zm240 0v-640h160v640H400Zm240 0v-440h160v440H640Z"/></svg> Poll';
        break;
      default:
        svg = message.length > maxLength ? message.slice(0, maxLength) + ' . . .' : message;
    }
    return this.sanitizer.bypassSecurityTrustHtml(svg);
  }

  getDisplayDate(): string | null {
    const lastMessageTime = new Date(this.conversation.last_message_time);
    if (!this.conversation.last_message_time || isNaN(lastMessageTime.getTime())) {
      return null;
    }

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = lastMessageTime.toDateString() === today.toDateString();
    const isYesterday = lastMessageTime.toDateString() === yesterday.toDateString();
    const isThisYear = lastMessageTime.getFullYear() === today.getFullYear();

    if (isToday) {
      return null;
    } else if (isYesterday) {
      return `Yesterday ${lastMessageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isThisYear) {
      return lastMessageTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } else {
      return `${lastMessageTime.getDate()} ${lastMessageTime.toLocaleString(undefined, { month: 'short' })} ${lastMessageTime.getFullYear()}`;
    }
  }

  getDisplayTime(): string | null {
    const lastMessageTime = new Date(this.conversation.last_message_time);
    if (!this.conversation.last_message_time || isNaN(lastMessageTime.getTime())) {
      return null;
    }

    const today = new Date();
    if (lastMessageTime.toDateString() === today.toDateString()) {
      return lastMessageTime.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } else {
      return null;
    }
  }
}
