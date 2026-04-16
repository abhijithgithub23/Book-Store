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
          <a routerLink="/" class="text-2xl font-bold text-indigo-600 tracking-tight">BookStore</a>
          
          <div class="flex-1 max-w-lg mx-8 relative group">
            <input 
              #searchInput 
              (keyup.enter)="onSearch(searchInput)"
              type="text" 
              placeholder="Search books, authors..." 
              class="w-full pl-5 pr-12 py-2.5 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
            >
            <button 
              (click)="onSearch(searchInput)"
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors cursor-pointer p-1"
              title="Search"
            >
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
            <div class="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center cursor-pointer hover:bg-indigo-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
                <path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clip-rule="evenodd" />
              </svg>
            </div>
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
  cartService = inject(CartService);
  cart$ = this.cartService.cart$;

  genres = ['fiction', 'fantasy', 'romance', 'science_fiction', 'thriller', 'mystery'];

  onSearch(inputElement: HTMLInputElement) {
    const term = inputElement.value;
    
    if (term.trim()) {
      this.router.navigate(['/search', term]);
      inputElement.value = ''; 
    }
  }
}