import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<any>(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=20`)
      .pipe(
        map(response => response.works.map((work: any) => ({
          id: work.key.replace('/works/', ''),
          title: work.title,
          author: work.authors?.[0]?.name || 'Unknown Author',
          coverUrl: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'
        })))
      );
  }

  searchBooks(query: string): Observable<Book[]> {
    const formattedQuery = query.split(' ').join('+');
    return this.http.get<any>(`https://openlibrary.org/search.json?q=${formattedQuery}&limit=20`)
      .pipe(
        map(response => response.docs.map((doc: any) => ({
          id: doc.key.replace('/works/', ''),
          title: doc.title,
          author: doc.author_name?.[0] || 'Unknown Author',
          coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'
        })))
      );
  }

  getBookDetails(id: string): Observable<BookDetails> {
    return this.http.get<any>(`https://openlibrary.org/works/${id}.json`)
      .pipe(
        map(data => ({
          id: id,
          title: data.title,
          author: 'See API for full author details', // Requires a secondary API call to /authors/ in OpenLibrary
          coverUrl: data.covers?.[0] ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : 'https://placehold.co/300x400?text=No+Cover',
          description: typeof data.description === 'string' ? data.description : (data.description?.value || 'No description available.'),
          publishYear: data.first_publish_date || 'Unknown'
        }))
      );
  }
}