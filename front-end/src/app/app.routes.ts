import { Routes } from '@angular/router';
import  {LayoutComponent} from './Layout/layout/layout.component';
import { SignupComponent } from './signup/signup.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './guards/auth-guard/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard] // Protect the HomeComponent with AuthGuard
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [AuthGuard], // Redirect logged-in users away from signup
    data: { redirectIfLoggedIn: true }
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [AuthGuard], // Redirect logged-in users away from login
    data: { redirectIfLoggedIn: true }
  },
  {
    path: '**',
    redirectTo: '/' // Redirect unknown routes to home
  }
];

export default routes;
