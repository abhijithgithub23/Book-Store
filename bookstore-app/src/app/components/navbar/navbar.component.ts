import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  template: `
    <nav class="bg-white shadow-md fixed w-full z-50 top-0">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16 items-center">
          <a routerLink="/" class="text-2xl font-bold text-indigo-600">BookStore</a>
          
          <div class="flex-1 max-w-lg mx-8">
            <input 
              #searchInput 
              (keyup.enter)="onSearch(searchInput.value)"
              type="text" 
              placeholder="Search books, authors..." 
              class="w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
          </div>

          <div class="flex items-center gap-6">
            <div routerLink="/cart" class="relative cursor-pointer hover:scale-110 transition-transform">
              <span class="text-2xl">🛒</span>
              <span *ngIf="(cart$ | async)?.length as count" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold shadow-sm">
                {{count}}
              </span>
            </div>
            <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center cursor-pointer">
              👤
            </div>
          </div>
        </div>
      </div>

      <div class="bg-gray-800 text-white">
        <div class="max-w-7xl mx-auto px-4 flex space-x-8 overflow-x-auto py-3 text-sm">
          <a *ngFor="let genre of genres" [routerLink]="['/genre', genre]" class="hover:text-indigo-400 cursor-pointer whitespace-nowrap uppercase tracking-wider font-semibold">
            {{genre.replace('_', ' ')}}
          </a>
        </div>
      </div>
    </nav>
  `
})
export class NavbarComponent {
  private router = inject(Router);
  cartService = inject(CartService);
  cart$ = this.cartService.cart$;

  genres = ['fiction', 'fantasy', 'romance', 'science_fiction', 'thriller', 'mystery'];

  onSearch(term: string) {
    if (term.trim()) {
      this.router.navigate(['/search', term]);
    }
  }
}