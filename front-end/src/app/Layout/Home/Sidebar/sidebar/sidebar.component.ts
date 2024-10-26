import { Component, OnInit, Type } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import { GroupListComponent } from '../Group/group-list/group-list.component';
import { BroadcastListComponent } from '../broadcast/broadcast-list/broadcast-list.component';
import { ConversationListComponent } from '../conversation/conversation-list/conversation-list.component';
import { ContactsListComponent } from '../contacts-container/contacts-list/contacts-list.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule,ConversationListComponent, BroadcastListComponent, GroupListComponent, SearchComponent,ContactsListComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit{
  activeComponent: string = 'conversation';
  currentComponent: Type<any> = ConversationListComponent;

  ngOnInit(): void {
    this.setActiveComponent(); // Load initial component
  }

  setActiveComponent(): void {
    switch (this.activeComponent) {
      case 'conversation':
        this.currentComponent = ConversationListComponent;
        break;
      case 'group':
        this.currentComponent = GroupListComponent;
        break;
      case 'broadcast':
        this.currentComponent = BroadcastListComponent;
        break;
      default:
        this.currentComponent = ConversationListComponent;
        break;
    }

}

setActive(component: string): void {
  if (['conversation', 'group', 'broadcast'].includes(component)) {
    this.activeComponent = component;
    this.setActiveComponent();
  } else {
    this.activeComponent = 'home';
    this.setActiveComponent();
  }
}

isActive(component: string): boolean {
  return this.activeComponent === component;
}
}