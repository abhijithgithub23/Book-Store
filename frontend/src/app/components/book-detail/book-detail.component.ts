import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { BookDetails } from '../../models/book.model';
import { Observable, switchMap, map, startWith, catchError, of, filter } from 'rxjs';

interface DetailPageState {
  loading: boolean;
  book: BookDetails | null;
}

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 pt-36 pb-10">
      <ng-container *ngIf="state$ | async as state">

        <div *ngIf="state.loading" class="text-center py-10">
          <div class="text-xl text-gray-600 font-semibold animate-pulse">Loading book details...</div>
        </div>

        <div *ngIf="!state.loading && !state.book" class="text-center py-10">
          <div class="text-xl text-red-600 font-semibold mb-4">Could not load book details!</div>
          <a routerLink="/" class="text-indigo-600 hover:text-indigo-800 underline font-medium">← Back to Home</a>
        </div>
        
        <div *ngIf="!state.loading && state.book as book" class="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
          <div class="md:w-1/3 shrink-0">
            <img [src]="book.coverUrl" [alt]="book.title" class="w-full rounded-lg shadow-md object-cover border border-gray-100">
          </div>
          
          <div class="md:w-2/3 flex flex-col">
            
            <!-- Admin Controls Banner -->
            <div *ngIf="(user$ | async)?.is_admin" class="flex gap-3 mb-6 bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm items-center">
              <span class="text-sm font-extrabold text-red-800 mr-auto uppercase tracking-wide">⚙️ Admin Access</span>
              <a [routerLink]="['/edit-book', book.id]" class="bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">Edit</a>
              <button (click)="deleteBook(book.id)" class="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm cursor-pointer">Delete</button>
            </div>

            <h1 class="text-4xl font-extrabold text-gray-900 mb-1 leading-tight">{{ book.title }}</h1>
            <p class="text-xl text-gray-600 mb-4 font-medium">by <span class="text-indigo-600">{{ book.author }}</span></p>
            
            <div class="flex flex-wrap items-center gap-4 mb-6">
              <p *ngIf="book.publishYear" class="text-md text-gray-600">
                First Published: <span class="font-semibold text-gray-800">{{ book.publishYear }}</span>
              </p>
              <span *ngIf="book.genre" class="px-4 py-1 bg-gray-100 text-gray-700 text-sm rounded-full capitalize font-semibold tracking-wide">
                {{ book.genre }}
              </span>
            </div>
            
            <div *ngIf="book.subjects && book.subjects.length > 0" class="mb-6 flex flex-wrap gap-2">
              <span *ngFor="let subject of book.subjects" class="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100">
                {{ subject }}
              </span>
            </div>
            
            <div *ngIf="book.description" class="prose max-w-none text-gray-700 mb-8">
              <h3 class="text-2xl font-bold mb-4 border-b border-gray-200 pb-2 text-gray-800">About this book</h3>
              <p class="leading-relaxed text-gray-700 whitespace-pre-line">{{ book.description }}</p>
            </div>

            <div *ngIf="book.authorBio" class="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
              <h3 class="text-xl font-bold mb-3 text-gray-800">About {{ book.author }}</h3>
              <p class="leading-relaxed text-sm text-gray-600 whitespace-pre-line">{{ book.authorBio }}</p>
            </div>
            
            <div class="mt-auto pt-6 border-t border-gray-200 flex items-center justify-between">
              <ng-container *ngIf="cart$ | async as cartItems">
                <button 
                  (click)="addToCart(book)" 
                  [disabled]="isInCart(book.id, cartItems)"
                  [ngClass]="isInCart(book.id, cartItems) ? 'bg-green-600 cursor-default opacity-90' : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer'"
                  class="w-full md:w-auto text-white font-bold py-3 px-8 rounded-lg shadow transition-colors text-lg flex items-center justify-center gap-2">
                  {{ isInCart(book.id, cartItems) ? '✓ Added To Cart' : 'Add to Cart' }}
                </button>
              </ng-container>
              <a routerLink="/" class="text-gray-500 hover:text-gray-900 ml-4 hidden md:block font-medium transition-colors">← Keep Shopping</a>
            </div>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class BookDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  
  cart$ = this.cartService.cart$;
  user$ = this.authService.currentUser$; 

  state$: Observable<DetailPageState> = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => !!id),
    switchMap(id => this.api.getBookDetails(id).pipe(
      map(book => ({ loading: false, book: book })), 
      startWith({ loading: true, book: null }),      
      catchError(err => {
        console.error('[BookDetail] Error:', err);
        return of({ loading: false, book: null });  
      })
    ))
  );

  isInCart(bookId: string, cartItems: any[] | null): boolean {
    if (!cartItems) return false;
    // CRITICAL FIX: Checking item.book.id instead of item.id
    return cartItems.some(item => item.book && item.book.id === bookId);
  }

  addToCart(book: any) {
    this.cartService.addToCart(book.id).subscribe({
      next: () => {
        // We removed the alert here because the UI button visually updating to "✓ Added To Cart" is a much better user experience!
      },
      error: (err) => {
        console.error('Failed to add to cart:', err);
        alert(err.error?.detail || 'Failed to add item to cart.');
      }
    });
  }

  deleteBook(id: string) {
    if (confirm('Are you sure you want to permanently delete this book from the database? This action cannot be undone.')) {
      this.api.deleteBook(id).subscribe({
        next: () => {
          alert('Book deleted successfully!');
          this.router.navigate(['/']);
        },
        error: (err: any) => { 
          console.error(err);
          alert('Failed to delete book.');
        }
      });
    }
  }
}