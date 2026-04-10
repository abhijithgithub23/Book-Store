import { Component, inject, OnInit } from '@angular/core';
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
      
      <div *ngIf="loading" class="text-center text-xl text-gray-600">Loading books...</div>

      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
  
  books: Book[] = [];
  pageTitle = 'Best Sellers';
  loading = false;

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.loading = true;
      const genre = params.get('genre');
      const query = params.get('query');

      if (genre) {
        this.pageTitle = `${genre.replace('_', ' ')} Books`;
        this.api.getBooksByGenre(genre).subscribe(res => { this.books = res; this.loading = false; });
      } else if (query) {
        this.pageTitle = `Search Results for "${query}"`;
        this.api.searchBooks(query).subscribe(res => { this.books = res; this.loading = false; });
      } else {
        // Default Home Page - Using 'popular' or 'bestseller' subject as a fallback
        this.pageTitle = 'Popular Books';
        this.api.getBooksByGenre('popular').subscribe(res => { this.books = res; this.loading = false; });
      }
    });
  }
}