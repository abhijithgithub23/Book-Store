import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { Book, BookDetails } from '../models/book.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  getBooksByGenre(genre: string): Observable<Book[]> {
    return this.http.get<any>(`https://openlibrary.org/subjects/${genre.toLowerCase()}.json?limit=20`)
      .pipe(
        map(response => {
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
           // 1. Handle missing publish year gracefully
           let year = data.first_publish_date || '';
           if (!year && data.created && data.created.value) {
             year = data.created.value.substring(0, 4);
           }

           // 2. Safely extract description (might be a string, an object, or missing entirely)
           let rawDesc = '';
           if (data.description) {
             rawDesc = typeof data.description === 'string' ? data.description : data.description.value;
           }

           // 3. Convert Markdown to HTML
           let htmlDesc = '';
           if (rawDesc) {
              htmlDesc = rawDesc
                .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold mt-6 mb-2 text-gray-800">$1</h3>') // h3 tags
                .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-6 mb-2 text-gray-800">$1</h2>') // h2 tags
                .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-6 mb-2 text-gray-800">$1</h1>') // h1 tags
                .replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>') // Bold + Italic
                .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>') // Bold
                .replace(/\*(.*?)\*/gim, '<em>$1</em>') // Italic
                .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" class="text-indigo-600 underline hover:text-indigo-800" target="_blank">$1</a>') // Links
                .replace(/\r\n/g, '<br>') // Line breaks
                .replace(/\n/g, '<br>'); // Line breaks
           }

           return {
            id: id,
            title: data.title || 'Unknown Title',
            author: '', 
            coverUrl: (data.covers && data.covers.length > 0) ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : 'https://placehold.co/300x400?text=No+Cover',
            description: htmlDesc,
            publishYear: year,
            subjects: data.subjects ? data.subjects.slice(0, 10) : [] // Max 10 subjects
          };
        }),
        catchError(error => {
          console.error('[ApiService] API Error (Details):', error);
          throw error;
        })
      );
  }
}