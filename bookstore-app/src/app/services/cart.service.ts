import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);
  private apiUrl = 'http://127.0.0.1:8000/cart';

  private cartItems = new BehaviorSubject<any[]>([]);
  cart$ = this.cartItems.asObservable();

  constructor() {
    // Automatically load the cart when a user logs in
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.fetchCartFromDB().subscribe();
      } else {
        this.cartItems.next([]); // Clear cart if logged out
      }
    });
  }

  private fetchCartFromDB() {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(dbItems => {
        // The backend returns { id, book: { ... } }, we just want the book array
        const books = dbItems.map(item => ({
          id: item.book.id,
          title: item.book.title,
          author: item.book.author_name,
          coverUrl: item.book.cover_url
        }));
        this.cartItems.next(books);
      })
    );
  }

  addToCart(book: any) {
    // 1. Check if logged in
    if (!this.authService.getToken()) {
      this.toastService.show('Please log in to add items to your cart', 'error');
      return;
    }

    const currentItems = this.cartItems.getValue();
    if (currentItems.find(item => item.id === book.id)) {
      this.toastService.show(`"${book.title}" is already in your cart!`, 'info');
      return;
    }

    // 2. Optimistic UI update (update screen instantly)
    this.cartItems.next([...currentItems, book]);

    // 3. Save to database
    this.http.post(`${this.apiUrl}/${book.id}`, {}).subscribe({
      next: () => this.toastService.show(`"${book.title}" added to cart!`, 'success'),
      error: () => {
        this.cartItems.next(currentItems); // Revert UI if DB fails
        this.toastService.show('Failed to add to cart', 'error');
      }
    });
  }

  removeFromCart(bookId: string) {
    const currentItems = this.cartItems.getValue();
    const updatedItems = currentItems.filter(item => item.id !== bookId);
    
    // Optimistic UI update
    this.cartItems.next(updatedItems);

    // Remove from database
    this.http.delete(`${this.apiUrl}/${bookId}`).subscribe({
      next: () => this.toastService.show('Book removed from cart', 'info'),
      error: () => {
        this.cartItems.next(currentItems); // Revert UI if DB fails
        this.toastService.show('Failed to remove item', 'error');
      }
    });
  }
}