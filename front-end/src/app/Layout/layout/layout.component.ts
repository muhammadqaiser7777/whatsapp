import { Component, OnInit, Type } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SelectedConversationService } from '../../Services/selected-conversation/selected-conversation.service';
import { SelectedStatusService } from '../../Services/selected-status/selected-status.service';
import { SelectedGroupService } from '../../Services/selected-group/selected-group.service';
import { take } from 'rxjs/operators';
import { HomeComponent } from '../Home/home/home.component';
import { StatusComponent } from '../Status/status/status.component';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {
  activeComponent: string = 'home';
  currentComponent: Type<any> = HomeComponent;

  constructor(
    private router: Router,
    private selectedConversationService: SelectedConversationService,
    private selectedStatusService: SelectedStatusService,
    private selectedGroupService: SelectedGroupService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.setActiveComponent(); // Load initial component
  }

  setActiveComponent(): void {
    switch (this.activeComponent) {
      case 'home':
        this.currentComponent = HomeComponent;
        break;
      case 'status':
        this.currentComponent = StatusComponent;
        break;
      case 'profile':
        this.currentComponent = ProfileComponent;
        break;
      default:
        this.currentComponent = HomeComponent;
        break;
    }
  }

  setActive(component: string): void {
    if (['home', 'status', 'profile'].includes(component)) {
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

  logout(): void {
    const token = localStorage.getItem('authToken');

    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

      this.http.post('http://127.0.0.1:8000/api/auth/logout', {}, { headers })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.clearUserData();
            this.redirectToLogin();
            this.selectedConversationService.clearSelectedConversation();
            this.selectedStatusService.clearSelectedStatus();
            this.selectedGroupService.clearSelectedGroup();
          },
          error: (err) => {
            console.error('Logout failed', err);
            this.clearUserData();
            this.redirectToLogin();
          }
        });
    } else {
      this.clearUserData();
      this.redirectToLogin();
    }
  }

  private clearUserData(): void {
    localStorage.clear();
  }

  private redirectToLogin(): void {
    this.router.navigate(['/login']);
  }

}
