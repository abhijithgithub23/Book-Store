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
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.getCart().subscribe({
          error: (err) => console.error('Failed to fetch cart on login', err)
        });
      } else {
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
        this.clearCart();
        return of([]);
      })
    );
  }

  addToCart(bookId: string) {
    return this.http.post(`${this.apiUrl}/cart/${bookId}`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.getCart().subscribe();
      })
    );
  }

  removeFromCart(bookId: string) {
    return this.http.delete(`${this.apiUrl}/cart/${bookId}`, { withCredentials: true }).pipe(
      tap(() => {
        this.getCart().subscribe();
      })
    );
  }

  clearCart() {
    this.cartSubject.next([]);
  }
}