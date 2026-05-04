import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ToastComponent } from './components/toast/toast.component'; 
import { AuthService } from './services/auth.service'; 
import { ConfirmComponent } from './components/confirm/confirm.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, ToastComponent, ConfirmComponent], 
  template: `
    <app-navbar></app-navbar>
    <main class="min-h-screen">
      <router-outlet></router-outlet>
    </main>
    <app-confirm></app-confirm>
    <app-toast></app-toast> 
  `
})
export class AppComponent {
  title = 'Book-Store';
  private authService = inject(AuthService);
}   