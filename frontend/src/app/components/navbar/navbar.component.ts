import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ConfirmService } from '../../services/confirm.service'; // <-- IMPORTED
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="bg-white shadow-md fixed w-full z-50 top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <a routerLink="/" class="text-2xl font-bold text-indigo-600 tracking-tight">BookStore</a>
          
          <div class="flex-1 max-w-lg mx-8 relative group hidden sm:block">
            <input 
              #searchInput 
              (keyup.enter)="onSearch(searchInput)"
              type="text" 
              placeholder="Search books, authors..." 
              class="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            >
            <button (click)="onSearch(searchInput)" class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none cursor-pointer p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-6">
            
            <div routerLink="/cart" class="relative cursor-pointer hover:scale-110 transition-transform">
              <span class="text-2xl">🛒</span>
              <span *ngIf="(cart$ | async)?.length as count" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-sm">
                {{count}}
              </span>
            </div>

            <ng-container *ngIf="user$ | async as user; else loggedOut">
              <div class="flex items-center gap-4">
                
                <a *ngIf="user.is_admin" routerLink="/add-book" class="hidden sm:flex bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-md text-sm font-bold hover:bg-indigo-200 transition-colors items-center gap-1 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add Book
                </a>

                <div class="hidden md:block text-sm font-medium text-gray-700 border-l pl-4 border-gray-200">
                  Hi, {{ user.full_name ? user.full_name.split(' ')[0] : 'User' }}
                </div>
                <button (click)="logout()" class="text-sm font-semibold text-red-500 hover:text-red-700 transition-colors cursor-pointer">
                  Logout
                </button>
              </div>
            </ng-container>

            <ng-template #loggedOut>
              <div class="flex items-center gap-3">
                <a routerLink="/login" class="text-sm font-semibold text-gray-700 hover:text-indigo-600 transition-colors">Log in</a>
                <a routerLink="/signup" class="text-sm font-semibold bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">Sign up</a>
              </div>
            </ng-template>

          </div>
        </div>
      </div>

      <div class="bg-gray-800 text-white">
        <div class="max-w-7xl mx-auto px-4 flex space-x-8 overflow-x-auto py-3 text-sm">
          <a *ngFor="let genre of genres" [routerLink]="['/genre', genre]" class="hover:text-indigo-400 cursor-pointer whitespace-nowrap uppercase tracking-wider font-semibold transition-colors">
            {{genre.replace('_', ' ')}}
          </a>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private confirmService = inject(ConfirmService); // <-- INJECTED
  cartService = inject(CartService);
  
  cart$ = this.cartService.cart$;
  user$ = this.authService.currentUser$; 

  genres = ['fiction', 'fantasy', 'romance', 'science_fiction', 'thriller', 'mystery'];

  onSearch(inputElement: HTMLInputElement) {
    const term = inputElement.value;
    if (term.trim()) {
      this.router.navigate(['/search', term]);
      inputElement.value = ''; 
    }
  }

  // UPDATED: Now uses the custom Confirm Modal
  async logout() {
    const confirmed = await this.confirmService.confirm(
      'Log Out', 
      'Are you sure you want to log out of your account?', 
      'Log Out', 
      'Cancel'
    );
    
    if (confirmed) {
      this.authService.logout();
    }
  }
}