import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { BookDetails } from '../../models/book.model';
import { Observable, switchMap, map, startWith, catchError, of, filter } from 'rxjs';

// 1. Define our specific state for this page
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
          <div class="text-xl text-gray-600 font-semibold">Loading book details...</div>
        </div>

        <div *ngIf="!state.loading && !state.book" class="text-center py-10">
          <div class="text-xl text-red-600 font-semibold mb-4">Could not load book details!</div>
          <a routerLink="/" class="text-indigo-600 hover:text-indigo-800 underline">← Back to Home</a>
        </div>
        
        <div *ngIf="!state.loading && state.book as book" class="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
          <div class="md:w-1/3 shrink-0">
            <img [src]="book.coverUrl" [alt]="book.title" class="w-full rounded-lg shadow-md object-cover">
          </div>
          
          <div class="md:w-2/3 flex flex-col">
            <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>
            
            <p *ngIf="book.publishYear" class="text-md text-gray-600 mb-6">
              First Published: <span class="font-semibold">{{ book.publishYear }}</span>
            </p>
            
            <div *ngIf="book.subjects && book.subjects.length > 0" class="mb-6 flex flex-wrap gap-2">
              <span *ngFor="let subject of book.subjects" class="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100">
                {{ subject }}
              </span>
            </div>
            
            <div *ngIf="book.description" class="prose max-w-none text-gray-700 mb-8 flex-1">
              <h3 class="text-2xl font-semibold mb-4 border-b pb-2">About this book</h3>
              <div [innerHTML]="book.description" class="leading-relaxed text-gray-700"></div>
            </div>
            
            <div class="mt-auto pt-6 border-t flex items-center justify-between">
               <button (click)="addToCart(book)" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors text-lg flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Add to Cart
              </button>
              <a routerLink="/" class="text-gray-500 hover:text-gray-800 ml-4 hidden md:block transition-colors">← Keep Shopping</a>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class BookDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cartService = inject(CartService);
  
  // 3. Single stream of truth for the entire component
  state$: Observable<DetailPageState> = this.route.paramMap.pipe(
    map(params => params.get('id')),
    filter((id): id is string => !!id), // Ensure the ID exists before making the call
    switchMap(id => this.api.getBookDetails(id).pipe(
      map(book => ({ loading: false, book: book })), // Data arrived successfully
      startWith({ loading: true, book: null }),      // Instant loading state
      catchError(err => {
        console.error('[BookDetail] Error:', err);
        return of({ loading: false, book: null });   // API failed, show error state
      })
    ))
  );

  // We now accept the book directly from the HTML template
  addToCart(book: BookDetails) {
    this.cartService.addToCart(book);
  }
}