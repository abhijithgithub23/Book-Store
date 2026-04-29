import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000';

  // 1. Create maps to store our cached Observables
  private listCache = new Map<string, Observable<any>>();
  private detailsCache = new Map<string, Observable<BookDetails>>();

  private mapBook(dbBook: any): BookDetails {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author_name,
      coverUrl: dbBook.cover_url,
      description: dbBook.description,
      publishYear: dbBook.publish_year,
      subjects: dbBook.subjects || [],
      genre: dbBook.genre,
      authorBio: dbBook.author_bio
    };
  }

  getBooksByGenre(genre: string, page: number = 1): Observable<any> {
    const cacheKey = `genre-${genre}-page-${page}`;
    
    // 2. If we haven't made this specific request yet, make it and cache it
    if (!this.listCache.has(cacheKey)) {
      const request$ = this.http.get<any>(`${this.apiUrl}/books?genre=${genre}&page=${page}`).pipe(
        map(response => ({
          ...response,
          items: response.items.map((book: any) => this.mapBook(book))
        })),
        shareReplay(1) // 3. MAGIC: Cache the most recent emission from this stream
      );
      this.listCache.set(cacheKey, request$);
    }
    
    // 4. Return the cached Observable
    return this.listCache.get(cacheKey)!;
  }

  searchBooks(query: string, page: number = 1): Observable<any> {
    const cacheKey = `search-${query}-page-${page}`;
    
    if (!this.listCache.has(cacheKey)) {
      const request$ = this.http.get<any>(`${this.apiUrl}/books?q=${query}&page=${page}`).pipe(
        map(response => ({
          ...response,
          items: response.items.map((book: any) => this.mapBook(book))
        })),
        shareReplay(1) 
      );
      this.listCache.set(cacheKey, request$);
    }
    
    return this.listCache.get(cacheKey)!;
  }

  getBookDetails(id: string): Observable<BookDetails> {
    const cacheKey = `detail-${id}`;
    
    // We can also cache individual book details so they load instantly the second time!
    if (!this.detailsCache.has(cacheKey)) {
      const request$ = this.http.get<any>(`${this.apiUrl}/books/${id}`).pipe(
        map(book => this.mapBook(book)),
        shareReplay(1)
      );
      this.detailsCache.set(cacheKey, request$);
    }
    
    return this.detailsCache.get(cacheKey)!;
  }
}