import { Component, OnInit } from '@angular/core';
import { SelectedGroupService } from '../../../../../Services/selected-group/selected-group.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-group-messages-head',
  standalone: true,
  imports: [],
  templateUrl: './group-messages-head.component.html',
  styleUrl: './group-messages-head.component.css'
})
export class GroupMessagesHeadComponent implements OnInit {
  groupName: string = '';
  groupDp: string = '';
  private subscription: Subscription = new Subscription();

  constructor(private selectedGroupService: SelectedGroupService) {}

  ngOnInit() {
    // Subscribe to the selected group observable
    this.subscription = this.selectedGroupService.getSelectedGroup().subscribe(group => {
      if (group) {
        this.groupName = group.name;
        this.groupDp = group.dp.startsWith('http')
          ? group.dp
          : `http://127.0.0.1:8000/${group.dp}`; // Adjust path for dp if necessary
      }
    });
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
