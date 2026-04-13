import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = new BehaviorSubject<any[]>([]);
  cart$ = this.cartItems.asObservable();

  addToCart(book: any) {
    const currentItems = this.cartItems.getValue();
    
    // Check if the book is already in the cart
    const exists = currentItems.find(item => item.id === book.id);
    if (exists) {
      alert(`"${book.title}" is already in your cart!`);
      return;
    }

    this.cartItems.next([...currentItems, book]);
    alert(`"${book.title}" added to cart!`);
  }

  removeFromCart(bookId: string) {
    const currentItems = this.cartItems.getValue();
    const updatedItems = currentItems.filter(item => item.id !== bookId);
    this.cartItems.next(updatedItems);
  }
}