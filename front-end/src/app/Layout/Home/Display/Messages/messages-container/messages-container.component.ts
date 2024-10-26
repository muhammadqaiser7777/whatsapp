import { Component } from '@angular/core';
import { MessageHeadComponent } from '../message-head/message-head.component';
import { MessagesComponent } from '../messages/messages.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-messages-container',
  standalone: true,
  imports: [CommonModule,MessageHeadComponent,MessagesComponent],
  templateUrl: './messages-container.component.html',
  styleUrl: './messages-container.component.css'
})
export class MessagesContainerComponent {

}
