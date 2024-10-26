import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../../Services/auth-services/auth.service'; // Ensure the path is correct

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const isLoggedIn = this.authService.isLoggedIn();
    const redirectIfLoggedIn = route.data['redirectIfLoggedIn']; // Access property with string index

    if (isLoggedIn && redirectIfLoggedIn) {
      // Redirect authenticated users away from login and signup pages
      this.router.navigate(['/']);
      return false;
    } else if (!isLoggedIn && !redirectIfLoggedIn) {
      // Redirect unauthenticated users to login page
      this.router.navigate(['/login']);
      return false;
    }

    return true; // Allow access
  }
}
