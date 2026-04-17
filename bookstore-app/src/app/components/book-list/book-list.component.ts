import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Book } from '../../models/book.model';
import { Observable, switchMap, map, startWith, catchError, of } from 'rxjs';

interface PageState {
  loading: boolean;
  books: Book[];
}

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-7xl mx-auto px-4 pt-36 pb-10">
      <h2 class="text-3xl font-bold text-gray-800 mb-8 capitalize">{{ pageTitle }}</h2>
      
      <ng-container *ngIf="state$ | async as state">
        
        <div *ngIf="state.loading" class="text-center py-10">
          <div class="text-xl text-gray-600 font-semibold">Loading books...</div>
          <p class="text-sm text-gray-400 mt-2">Fetching data from Open Library</p>
        </div>

        <div *ngIf="!state.loading && state.books.length === 0" class="text-center py-10">
          <div class="text-xl text-red-600 font-semibold">No books found!</div>
          <p class="text-gray-500 mt-2">Try searching for something else.</p>
        </div>

        <div *ngIf="!state.loading && state.books.length > 0" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div *ngFor="let book of state.books" [routerLink]="['/book', book.id]" class="bg-white rounded-lg shadow hover:shadow-xl transition-shadow cursor-pointer flex flex-col">
            <img [src]="book.coverUrl" [alt]="book.title" class="w-full h-64 object-cover rounded-t-lg">
            <div class="p-4 flex-1 flex flex-col">
              <h3 class="font-semibold text-lg line-clamp-2" [title]="book.title">{{ book.title }}</h3>
              <p class="text-gray-600 text-sm mt-1">{{ book.author }}</p>
            </div>
          </div>
        </div>

      </ng-container>
    </div>
  `
})
export class BookListComponent {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  
  pageTitle = '';

  state$: Observable<PageState> = this.route.paramMap.pipe(
    switchMap(params => {
      const genre = params.get('genre');
      const query = params.get('query');
      let apiCall$: Observable<Book[]>;

      if (genre) {
        this.pageTitle = `${genre.replace('_', ' ')} Books`;
        apiCall$ = this.api.getBooksByGenre(genre);
      } else if (query) {
        this.pageTitle = `Search Results for "${query}"`;
        apiCall$ = this.api.searchBooks(query);
      } else {
        this.pageTitle = 'Popular Books';
        apiCall$ = this.api.getBooksByGenre('popular');
      }

      return apiCall$.pipe(
        map(books => ({ loading: false, books: books })), 
        startWith({ loading: true, books: [] }),          
        catchError(err => {
          console.error('[BookList] Error:', err);
          return of({ loading: false, books: [] });       
        })
      );
    })
  );
}