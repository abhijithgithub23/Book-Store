import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Book } from '../../models/book.model';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 pt-36 pb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-8 capitalize">{{ pageTitle }}</h2>
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="text-xl text-gray-600 font-semibold">Loading books...</div>
        <p class="text-sm text-gray-400 mt-2">Fetching data from Open Library</p>
      </div>

      <div *ngIf="!loading && books.length === 0" class="text-center py-10">
        <div class="text-xl text-red-600 font-semibold">No books found!</div>
        <p class="text-gray-500 mt-2">Check the browser console for any API mapping errors.</p>
      </div>

      <div *ngIf="!loading && books.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        <div *ngFor="let book of books" [routerLink]="['/book', book.id]" class="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer flex flex-col">
          <img [src]="book.coverUrl" [alt]="book.title" class="w-full h-64 object-cover rounded-t-lg">
          <div class="p-4 flex-1 flex flex-col">
            <h3 class="font-semibold text-lg line-clamp-2" [title]="book.title">{{ book.title }}</h3>
            <p class="text-gray-600 text-sm mt-1">{{ book.author }}</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BookListComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cdr = inject(ChangeDetectorRef); // Forces UI updates
  
  books: Book[] = [];
  pageTitle = 'Best Sellers';
  loading = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      // Reset state on navigation
      this.loading = true;
      this.books = []; 
      this.cdr.detectChanges(); // Tell UI to show the loading text immediately
      
      const genre = params.get('genre');
      const query = params.get('query');

      if (genre) {
        this.pageTitle = `${genre.replace('_', ' ')} Books`;
        this.fetchBooks(this.api.getBooksByGenre(genre));
      } else if (query) {
        this.pageTitle = `Search Results for "${query}"`;
        this.fetchBooks(this.api.searchBooks(query));
      } else {
        this.pageTitle = 'Popular Books';
        this.fetchBooks(this.api.getBooksByGenre('popular'));
      }
    });
  }

  // Centralized subscription handler
  private fetchBooks(apiObservable: any) {
    apiObservable.subscribe({
      next: (res: Book[]) => {
        console.log('[BookList] Data received:', res);
        this.books = res;
        this.loading = false;
        this.cdr.detectChanges(); // CRITICAL: Force Angular to draw the book grid
      },
      error: (err: any) => {
        console.error('[BookList] Subscription Error:', err);
        this.books = [];
        this.loading = false;
        this.cdr.detectChanges(); // CRITICAL: Force Angular to remove loading text
      }
    });
  }
}