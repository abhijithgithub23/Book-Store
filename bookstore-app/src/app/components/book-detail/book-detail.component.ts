import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';
import { BookDetails } from '../../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="max-w-5xl mx-auto px-4 pt-36 pb-10">
      <div *ngIf="loading" class="text-center text-xl">Loading details...</div>
      
      <div *ngIf="book" class="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div class="md:w-1/3 shrink-0">
          <img [src]="book.coverUrl" [alt]="book.title" class="w-full rounded-lg shadow-md">
        </div>
        
        <div class="md:w-2/3 flex flex-col">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">{{ book.title }}</h1>
          <p class="text-xl text-gray-600 mb-4">First published: {{ book.publishYear }}</p>
          
          <div class="prose max-w-none text-gray-700 mb-8 flex-1">
            <h3 class="text-2xl font-semibold mb-2">Description</h3>
            <p class="whitespace-pre-wrap">{{ book.description }}</p>
          </div>
          
          <button (click)="addToCart()" class="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors text-lg">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `
})
export class BookDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  private cartService = inject(CartService);
  
  book: BookDetails | null = null;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getBookDetails(id).subscribe(res => {
        this.book = res;
        this.loading = false;
      });
    }
  }

  addToCart() {
    if (this.book) this.cartService.addToCart(this.book);
  }
}