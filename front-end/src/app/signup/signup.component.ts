import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../Services/api-service/api.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [RouterModule, ReactiveFormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  usernameError: string | null = null;

  constructor(private apiService: ApiService, private router: Router) {
    this.signupForm = new FormGroup({
      fullName: new FormControl('', [Validators.required]),
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required])
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Subscribe to the value changes of the username field
    this.signupForm.get('username')?.valueChanges.subscribe(() => {
      this.usernameError = null;
    });
  }

  passwordMatchValidator: ValidatorFn = (form: AbstractControl): { [key: string]: boolean } | null => {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password && confirmPassword && password.value !== confirmPassword.value
      ? { 'mismatch': true }
      : null;
  };

  onSignup() {
    if (this.signupForm.valid) {
      const formData = this.signupForm.value;

      this.apiService.signup(formData).subscribe(
        (response) => {
          window.alert('Signup successful! Redirect to Login'); // Show popup alert
          this.signupForm.reset(); // Clear the form
          this.router.navigate(['/']); // Redirect to the home page
        },
        (error) => {
          console.error('Signup failed', error);
          if (error.status === 400 || error.status === 422) {
            if (error.error.errors && error.error.errors.username) {
              this.usernameError = error.error.errors.username[0];
            } else {
              this.usernameError = 'Username Already Exists.';
            }
          } else {
            this.usernameError = 'An unexpected error occurred.';
          }
        }
      );
    }
  }
}
