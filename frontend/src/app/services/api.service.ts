import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, shareReplay, tap } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000';
  
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

  private mapToDbBook(book: any) {
    return {
      id: book.id,
      title: book.title,
      genre: book.genre,
      publish_year: book.publishYear,
      cover_url: book.coverUrl,
      description: book.description,
      author_name: book.author,
      author_bio: book.authorBio,
      // <--- FIXED: Ensure it stays an array, do not split it again!
      subjects: Array.isArray(book.subjects) ? book.subjects : [] 
    };
  }

  getBooksByGenre(genre: string, page: number = 1): Observable<any> {
    const cacheKey = `genre-${genre}-page-${page}`;
    if (!this.listCache.has(cacheKey)) {
      const request$ = this.http.get<any>(`${this.apiUrl}/books?genre=${genre}&page=${page}`).pipe(
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
    if (!this.detailsCache.has(cacheKey)) {
      const request$ = this.http.get<any>(`${this.apiUrl}/books/${id}`).pipe(
        map(book => this.mapBook(book)),
        shareReplay(1)
      );
      this.detailsCache.set(cacheKey, request$);
    }
    return this.detailsCache.get(cacheKey)!;
  }

  // --- ADMIN ACTIONS ---
  addBook(book: any) {
    return this.http.post(`${this.apiUrl}/books`, this.mapToDbBook(book), { withCredentials: true }).pipe(
      tap(() => this.clearCache())
    );
  }

  updateBook(id: string, book: any) {
    return this.http.put(`${this.apiUrl}/books/${id}`, this.mapToDbBook(book), { withCredentials: true }).pipe(
      tap(() => this.clearCache())
    );
  }

  deleteBook(id: string) {
    return this.http.delete(`${this.apiUrl}/books/${id}`, { withCredentials: true }).pipe(
      tap(() => this.clearCache())
    );
  }

  private clearCache() {
    this.listCache.clear();
    this.detailsCache.clear();
  }
}