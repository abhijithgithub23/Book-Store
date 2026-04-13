import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { BookDetails } from '../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-5xl mx-auto px-4 pt-36 pb-10">
      
      <div *ngIf="loading" class="text-center py-10">
        <div class="text-xl text-gray-600 font-semibold">Loading book details...</div>
      </div>

      <div *ngIf="!loading && !book" class="text-center py-10">
        <div class="text-xl text-red-600 font-semibold mb-4">Could not load book details!</div>
        <a routerLink="/" class="text-indigo-600 hover:text-indigo-800 underline">← Back to Home</a>
      </div>
      
      <div *ngIf="!loading && book" class="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div class="md:w-1/3 shrink-0">
          <img [src]="book.coverUrl" [alt]="book.title" class="w-full rounded-lg shadow-md object-cover">
        </div>
        
        <div class="md:w-2/3 flex flex-col">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>
          <p class="text-lg text-gray-500 mb-4">{{ book.author }}</p>
          <p class="text-md text-gray-600 mb-6">Published: <span class="font-semibold">{{ book.publishYear }}</span></p>
          
          <div *ngIf="book.subjects && book.subjects.length > 0" class="mb-6 flex flex-wrap gap-2">
            <span *ngFor="let subject of book.subjects" class="px-3 py-1 bg-indigo-50 text-indigo-700 text-sm rounded-full border border-indigo-100">
              {{ subject }}
            </span>
          </div>
          
          <div class="prose max-w-none text-gray-700 mb-8 flex-1">
            <h3 class="text-2xl font-semibold mb-2">About this book</h3>
            <p class="whitespace-pre-wrap leading-relaxed">{{ book.description }}</p>
          </div>
          
          <div class="mt-auto pt-6 border-t flex items-center justify-between">
             <button (click)="addToCart()" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors text-lg flex items-center justify-center gap-2">
              <span>🛒</span> Add to Cart
            </button>
            <a routerLink="/" class="text-gray-500 hover:text-gray-800 ml-4 hidden md:block transition-colors">← Keep Shopping</a>
          </div>
        </div>
      </div>

    </div>
  `
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cartService = inject(CartService);
  private cdr = inject(ChangeDetectorRef); // Added to force UI updates
  
  book: BookDetails | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      this.loading = true;
      this.cdr.detectChanges();

      this.api.getBookDetails(id).subscribe({
        next: (res) => {
          console.log('[BookDetail] Data received:', res);
          this.book = res;
          this.loading = false;
          this.cdr.detectChanges(); // Force Angular to draw the details
        },
        error: (err) => {
          console.error('[BookDetail] Error loading details:', err);
          this.book = null;
          this.loading = false;
          this.cdr.detectChanges(); // Force Angular to show the error message
        }
      });
    } else {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  addToCart() {
    if (this.book) {
      this.cartService.addToCart(this.book);
    }
  }
}