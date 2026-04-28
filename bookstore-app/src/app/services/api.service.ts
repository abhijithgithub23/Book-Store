import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8000'; // Your FastAPI Backend

  // Helper to map database snake_case to frontend camelCase
  private mapBook(dbBook: any): BookDetails {
    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author_name,
      coverUrl: dbBook.cover_url,
      description: dbBook.description,
      publishYear: dbBook.publish_year,
      subjects: dbBook.subjects || []
    };
  }

  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books?genre=${genre}`).pipe(
      map(books => books.map(book => this.mapBook(book)))
    );
  }

  searchBooks(query: string): Observable<Book[]> {
    return this.http.get<any[]>(`${this.apiUrl}/books?q=${query}`).pipe(
      map(books => books.map(book => this.mapBook(book)))
    );
  }

  getBookDetails(id: string): Observable<BookDetails> {
    return this.http.get<any>(`${this.apiUrl}/books/${id}`).pipe(
      map(book => this.mapBook(book))
    );
  }
}