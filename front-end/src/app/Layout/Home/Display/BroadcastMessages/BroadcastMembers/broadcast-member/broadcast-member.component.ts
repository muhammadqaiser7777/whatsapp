import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-broadcast-member',
  standalone: true,
  imports: [],
  templateUrl: './broadcast-member.component.html',
  styleUrl: './broadcast-member.component.css'
})
export class BroadcastMemberComponent {
  @Input() username!: string; // Username input
  @Input() fullName!: string; // Full name input
  @Input() profilePic!: string;
}
