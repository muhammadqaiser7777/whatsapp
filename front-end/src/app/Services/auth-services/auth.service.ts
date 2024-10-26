import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'authToken'; // Key for storing the token in localStorage

  constructor(private router: Router, @Inject(PLATFORM_ID) private platformId: Object) {}

  // Check if the user is logged in
  isLoggedIn(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem(this.tokenKey);
    }
    return false; // Not in a browser environment
  }

  // Log in the user by saving the token
  login(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.tokenKey, token);
    }
    this.redirectAfterLogin();
  }

  // Log out the user by removing the token
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.tokenKey);
    }
    this.router.navigate(['/login']); // Redirect to login page after logging out
  }

  // Redirect to home page if logged in, or login page if not logged in
  redirectAfterLogin(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/']); // Redirect to home page
    } else {
      this.router.navigate(['/login']); // Redirect to login page
    }
  }
}
