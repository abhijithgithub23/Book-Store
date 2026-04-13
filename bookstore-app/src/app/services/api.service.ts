import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<any>(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=40`)
      .pipe(
        map(response => {
          console.log('[ApiService] Genre Raw Response:', response);
          if (!response || !Array.isArray(response.works)) return [];
          
          return response.works.map((work: any) => ({
            id: work.key ? work.key.replace('/works/', '') : '',
            title: work.title || 'Unknown Title',
            author: (work.authors && work.authors.length > 0) ? work.authors[0].name : 'Unknown Author',
            coverUrl: work.cover_id ? `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'
          }));
        }),
        catchError(error => {
          console.error('[ApiService] API Error (Genres):', error);
          return of([]); 
        })
      );
  }

  searchBooks(query: string): Observable<Book[]> {
    const formattedQuery = query.split(' ').join('+');
    return this.http.get<any>(`https://openlibrary.org/search.json?q=${formattedQuery}&limit=20`)
      .pipe(
        map(response => {
          console.log('[ApiService] Search Raw Response:', response);
          if (!response || !Array.isArray(response.docs)) return [];

          return response.docs.map((doc: any) => ({
            id: doc.key ? doc.key.replace('/works/', '') : '',
            title: doc.title || 'Unknown Title',
            author: (doc.author_name && doc.author_name.length > 0) ? doc.author_name[0] : 'Unknown Author',
            coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : 'https://placehold.co/150x200?text=No+Cover'
          }));
        }),
        catchError(error => {
          console.error('[ApiService] API Error (Search):', error);
          return of([]);
        })
      );
  }

  getBookDetails(id: string): Observable<BookDetails> {
    return this.http.get<any>(`https://openlibrary.org/works/${id}.json`)
      .pipe(
        map(data => {
           console.log('[ApiService] Details Raw Response:', data);
           
           // Extract year from first_publish_date OR fallback to created date string
           let year = data.first_publish_date || 'Unknown';
           if (year === 'Unknown' && data.created && data.created.value) {
             year = data.created.value.substring(0, 4); // grabs '2020' from '2020-08-16...'
           }

           return {
            id: id,
            title: data.title || 'Unknown Title',
            author: 'Author name not provided in this endpoint', 
            coverUrl: (data.covers && data.covers.length > 0) ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : 'https://placehold.co/300x400?text=No+Cover',
            description: typeof data.description === 'string' ? data.description : (data.description?.value || 'No detailed description available for this edition.'),
            publishYear: year,
            subjects: data.subjects ? data.subjects.slice(0, 10) : [] // Grab up to 10 subjects
          };
        }),
        catchError(error => {
          console.error('[ApiService] API Error (Details):', error);
          throw error;
        })
      );
  }
}