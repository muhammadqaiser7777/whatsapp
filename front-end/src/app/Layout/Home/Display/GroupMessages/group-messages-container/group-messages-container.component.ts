import { Component } from '@angular/core';
import { GroupMessagesHeadComponent } from '../group-messages-head/group-messages-head.component';
import { GroupMessagesComponent } from '../group-messages/group-messages.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-group-messages-container',
  standalone: true,
  imports: [CommonModule,GroupMessagesHeadComponent,GroupMessagesComponent],
  templateUrl: './group-messages-container.component.html',
  styleUrl: './group-messages-container.component.css'
})
export class GroupMessagesContainerComponent {

}
