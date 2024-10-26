import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiService } from '../Services/api-service/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule,RouterModule,CommonModule]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loginError: string | null = null;

  constructor(
    private apiService: ApiService, private router: Router
  ) {
    this.loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  ngOnInit(): void {
    // Clear the error message when the user starts editing the fields
    this.loginForm.get('username')?.valueChanges.subscribe(() => {
      this.loginError = null;
    });
    this.loginForm.get('password')?.valueChanges.subscribe(() => {
      this.loginError = null;
    });
  }

  onLogin() {
    if (this.loginForm.valid) {
      const formData = this.loginForm.value;
      this.apiService.login(formData).subscribe(
        response => {
          // Assuming the token is in response.token
          localStorage.setItem('id',response.id);
          localStorage.setItem('authToken', response.token.original.access_token);
          localStorage.setItem('username',response.username);
          localStorage.setItem('fullName',response.fullName);
          localStorage.setItem('profilePic',response.profilePic);
          this.loginForm.reset(); // Clear the form
          this.router.navigate(['/']); // Redirect to the home page upon successful login
        },
        error => {
          console.error('Login failed', error);
          // Handle login error
          if (error.status === 401) {
            this.loginError = 'Incorrect username or password.';
          } else {
            this.loginError = 'An unexpected error occurred. Please try again later.';
          }
        }
      );
    }
  }
}
