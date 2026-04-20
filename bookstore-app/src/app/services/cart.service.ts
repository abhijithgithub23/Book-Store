import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]); // REMEMBERS LATEST VALUE ,  auto updates ui
  cart$ = this.cartItems.asObservable();
  
  private toastService = inject(ToastService);
  addToCart(book: any) {
    const currentItems = this.cartItems.getValue();
    
    const exists = currentItems.find(item => item.id === book.id);
    if (exists) {
      this.toastService.show(`"${book.title}" is already in your cart!`, 'info');
      return;
    }

    this.cartItems.next([...currentItems, book]);
    this.toastService.show(`"${book.title}" added to cart!`, 'success');
  }

  removeFromCart(bookId: string) {
    const currentItems = this.cartItems.getValue();
    const updatedItems = currentItems.filter(item => item.id !== bookId);
    this.cartItems.next(updatedItems);
    this.toastService.show('Book removed from cart', 'info');
  }
}