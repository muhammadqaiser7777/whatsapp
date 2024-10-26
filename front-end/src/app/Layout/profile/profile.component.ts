import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';


interface ApiResponse {
  message?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  providers: [],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  fullName: string = '';
  profilePicFile: File | null = null;
  profilePicUrl: string = '';
  username: string = '';

  constructor(private http: HttpClient , private router: Router) {}

  ngOnInit(): void {
    this.getUserData();
  }

  getUserData(): void {
    const fullName = localStorage.getItem('fullName');
    const profilePic = localStorage.getItem('profilePic');
    const username = localStorage.getItem('username');

    if (fullName) this.fullName = fullName;
    if (username) this.username = username;

    if (profilePic) {
      this.profilePicUrl = profilePic.startsWith('http') ? profilePic : `http://127.0.0.1:8000/${profilePic}`;
    }

  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.profilePicFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.profilePicUrl = e.target.result;
      };
      reader.readAsDataURL(this.profilePicFile);
    }
  }

  onSubmit() {
    const token = localStorage.getItem('authToken') || '';
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    const apiUrlProfile = 'http://127.0.0.1:8000/api/auth/edit-profile';
    const apiUrlName = 'http://127.0.0.1:8000/api/auth/edit-name';

    const requests = [];

    if (this.profilePicFile) {
      const formData = new FormData();
      formData.append('profilePic', this.profilePicFile);
      requests.push(this.http.post(apiUrlProfile, formData, { headers }));
    }

    if (this.fullName) {
      requests.push(this.http.post(apiUrlName, { fullName: this.fullName }, { headers }));
    }

    if (requests.length > 0) {
      forkJoin(requests).subscribe(
        (responses) => {

          window.alert('Update Successful!'); // Show popup alert
          this.router.navigate(['/']);

          localStorage.setItem('fullName', this.fullName);
          if (this.profilePicFile) {
            const fileName = this.profilePicFile.name;
            localStorage.setItem('profilePic', `profiles/${fileName}`);
          }

          // Show success toast

        },
        (error) => {
          console.error('Error updating profile:', error);
          if (error.error) {

          }
        }
      );
    }
  }
}