import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Book } from '../../models/book.model';
import { Observable, switchMap, map, startWith, catchError, of, combineLatest } from 'rxjs';

interface PageState {
  loading: boolean;
  books: Book[];
  title: string;
  total: number;
  currentPage: number;
  totalPages: number;
}

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 pt-36 pb-10 min-h-screen flex flex-col">
      
      <ng-container *ngIf="state$ | async as state">
        
        <div class="flex justify-between items-end mb-8">
          <h2 class="text-3xl font-bold text-gray-800 capitalize">{{ state.title }}</h2>
          <span *ngIf="!state.loading && state.total > 0" class="text-gray-500 text-sm font-medium">
            Found {{ state.total }} books
          </span>
        </div>
        
        <div *ngIf="state.loading" class="text-center py-20 flex-1">
          <div class="text-xl text-gray-600 font-semibold animate-pulse">Loading books...</div>
          <p class="text-sm text-gray-400 mt-2">Fetching data from your database</p>
        </div>

        <div *ngIf="!state.loading && state.books.length === 0" class="text-center py-20 flex-1">
          <div class="text-6xl mb-4">🔍</div>
          <div class="text-xl text-gray-800 font-semibold">No books found!</div>
          <p class="text-gray-500 mt-2">Try adjusting your search or picking a different genre.</p>
        </div>

        <div *ngIf="!state.loading && state.books.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10 flex-1 content-start">
          <div *ngFor="let book of state.books" [routerLink]="['/book', book.id]" class="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer flex flex-col overflow-hidden">
            <img [src]="book.coverUrl" [alt]="book.title" class="w-full h-64 object-cover border-b border-gray-100">
            <div class="p-4 flex-1 flex flex-col bg-white">
              <h3 class="font-bold text-gray-900 leading-tight line-clamp-2" [title]="book.title">{{ book.title }}</h3>
              <p class="text-gray-500 text-sm mt-1">{{ book.author }}</p>
              <p class="text-indigo-600 text-xs font-semibold mt-auto pt-3">{{ book.publishYear }}</p>
            </div>
          </div>
        </div>

        <div *ngIf="!state.loading && state.totalPages > 1" class="flex justify-center items-center gap-4 mt-auto border-t pt-8">
          <button 
            [disabled]="state.currentPage === 1"
            (click)="changePage(state.currentPage - 1)"
            [ngClass]="state.currentPage === 1 ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'hover:bg-indigo-50 text-indigo-700 border-indigo-200'"
            class="px-5 py-2 rounded-lg font-semibold transition-colors border">
            ← Previous
          </button>
          
          <span class="text-gray-600 font-medium">
            Page {{ state.currentPage }} of {{ state.totalPages }}
          </span>

          <button 
            [disabled]="state.currentPage === state.totalPages"
            (click)="changePage(state.currentPage + 1)"
            [ngClass]="state.currentPage === state.totalPages ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : 'hover:bg-indigo-50 text-indigo-700 border-indigo-200'"
            class="px-5 py-2 rounded-lg font-semibold transition-colors border">
            Next →
          </button>
        </div>

      </ng-container>
    </div>
  `
})
export class BookListComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);

  // Combine URL parameters (genre, query) AND query parameters (?page=X)
  state$: Observable<PageState> = combineLatest([
    this.route.paramMap,
    this.route.queryParamMap
  ]).pipe(
    switchMap(([params, queryParams]) => {
      const genre = params.get('genre');
      const query = params.get('query');
      const page = Number(queryParams.get('page')) || 1; // Default to page 1
      
      let apiCall$: Observable<any>;
      let currentTitle = '';

      if (genre) {
        currentTitle = `${genre.replace('_', ' ')} Books`;
        apiCall$ = this.api.getBooksByGenre(genre, page);
      } else if (query) {
        currentTitle = `Search Results for "${query}"`;
        apiCall$ = this.api.searchBooks(query, page);
      } else {
        currentTitle = 'Popular Books';
        apiCall$ = this.api.getBooksByGenre('popular', page);
      }

      return apiCall$.pipe(
        map(res => ({ 
          loading: false, 
          books: res.items, 
          title: currentTitle,
          total: res.total,
          currentPage: res.page,
          totalPages: Math.ceil(res.total / res.size) // Calculate total pages
        })), 
        startWith({ 
          loading: true, books: [], title: currentTitle, 
          total: 0, currentPage: page, totalPages: 1 
        }),          
        catchError(err => {
          console.error('[BookList] Error:', err);
          return of({ 
            loading: false, books: [], title: currentTitle, 
            total: 0, currentPage: page, totalPages: 1 
          });       
        })
      );
    })
  );

  // Safely updates the URL with the new page number, triggering the observable above
  changePage(newPage: number) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: newPage },
      queryParamsHandling: 'merge' // Keeps genre/search params intact
    });
    
    // Scroll smoothly to the top of the page on navigate
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}