import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 pt-36 pb-10 min-h-screen">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Your Reading Cart</h1>

      <!-- Empty Cart State -->
      <div *ngIf="(cart$ | async)?.length === 0" class="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
        <div class="text-6xl mb-4">🛒</div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p class="text-gray-500 mb-6">Looks like you haven't added any books yet.</p>
        <a routerLink="/" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-colors inline-block">
          Start Browsing
        </a>
      </div>

      <!-- Filled Cart State -->
      <div *ngIf="(cart$ | async) as cartItems">
        <div *ngIf="cartItems.length > 0" class="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <ul class="divide-y divide-gray-200">
            <!-- LOOP: Notice we use item.book.xxx to access the nested book data -->
            <li *ngFor="let item of cartItems" class="p-6 flex flex-col sm:flex-row items-center gap-6 hover:bg-gray-50 transition-colors">
              
              <!-- Check both coverUrl (frontend mapped) and cover_url (raw backend) just in case -->
              <img [src]="item.book?.coverUrl || item.book?.cover_url" [alt]="item.book?.title" class="w-20 h-28 object-cover rounded shadow">
              
              <div class="flex-1 text-center sm:text-left">
                <h3 class="text-xl font-bold text-gray-900">
                  <a [routerLink]="['/book', item.book?.id]" class="hover:text-indigo-600 transition-colors">{{ item.book?.title }}</a>
                </h3>
                <p class="text-gray-600 mt-1">{{ item.book?.author || item.book?.author_name }}</p>
              </div>
              
              <!-- Pass item.book.id to the backend to remove it -->
              <button (click)="removeItem(item.book?.id)" class="text-red-500 hover:text-red-700 font-semibold px-4 py-2 border border-red-200 hover:bg-red-50 rounded transition-colors flex items-center gap-2 cursor-pointer">
                <span>✖</span> Remove
              </button>
            </li>
          </ul>
          
          <div class="bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center border-t border-gray-200">
            <span class="text-lg font-semibold text-gray-700 mb-4 sm:mb-0">
              Total Books: <span class="font-bold text-indigo-600">{{ cartItems.length }}</span>
            </span>
            <button class="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-10 rounded-lg shadow transition-colors cursor-pointer">
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CartComponent {
  private cartService = inject(CartService);
  cart$ = this.cartService.cart$;

  removeItem(bookId: string) {
    if (!bookId) return;
    
    // We MUST subscribe for the delete request to actually fire to the backend!
    this.cartService.removeFromCart(bookId).subscribe({
      next: () => {
        // The service will automatically fetch the new cart list and update the UI
        console.log('Successfully removed from cart');
      },
      error: (err) => {
        console.error('Failed to remove item:', err);
        alert('Failed to remove item from cart.');
      }
    });
  }
}