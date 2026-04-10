import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Book } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems = new BehaviorSubject<Book[]>([]);
  cart$ = this.cartItems.asObservable(); // Components subscribe to this

  addToCart(book: Book) {
    const currentItems = this.cartItems.getValue();
    this.cartItems.next([...currentItems, book]);
    alert(`${book.title} added to cart!`);
  }
}