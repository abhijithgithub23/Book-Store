import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap, catchError, of } from 'rxjs';
import { AuthService } from './auth.service'; 

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService); 
  
  private apiUrl = 'http://localhost:8000';

  private cartSubject = new BehaviorSubject<any[]>([]);
  cart$ = this.cartSubject.asObservable();

  constructor() {
    // THE FIX: The Cart Service now actively listens to the Auth Service!
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User logged in (or page refreshed and session restored): Fetch their cart!
        this.getCart().subscribe({
          error: (err) => console.error('Failed to fetch cart on login', err)
        });
      } else {
        // User logged out: Instantly wipe the cart from memory!
        this.clearCart();
      }
    });
  }

  getCart() {
    return this.http.get<any[]>(`${this.apiUrl}/cart`, { withCredentials: true }).pipe(
      tap(items => {
        this.cartSubject.next(items);
      }),
      catchError(() => {
        // If the fetch fails (e.g., token expired), wipe the cart to be safe
        this.clearCart();
        return of([]);
      })
    );
  }

  addToCart(bookId: string) {
    return this.http.post(`${this.apiUrl}/cart/${bookId}`, {}, { withCredentials: true }).pipe(
      tap(() => {
        // Refresh the cart silently in the background
        this.getCart().subscribe();
      })
    );
  }

  removeFromCart(bookId: string) {
    return this.http.delete(`${this.apiUrl}/cart/${bookId}`, { withCredentials: true }).pipe(
      tap(() => {
        // Refresh the cart silently in the background
        this.getCart().subscribe();
      })
    );
  }

  clearCart() {
    // Instantly empties the array, triggering the UI to show the "Cart is empty" message
    this.cartSubject.next([]);
  }
}