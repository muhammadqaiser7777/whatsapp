import { Component } from '@angular/core';
import { BroadcastMembersComponent } from '../BroadcastMembers/broadcast-members/broadcast-members.component';
import { BroadcastHeadComponent } from '../broadcast-head/broadcast-head.component';
import { BroadcastInputComponent } from '../broadcast-input/broadcast-input.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-broadcast-messages',
  standalone: true,
  imports: [CommonModule,BroadcastInputComponent,BroadcastHeadComponent,BroadcastMembersComponent],
  templateUrl: './broadcast-messages.component.html',
  styleUrl: './broadcast-messages.component.css'
})
export class BroadcastMessagesComponent {

}
