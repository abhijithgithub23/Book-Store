import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-3xl mx-auto px-4 pt-32 pb-12">
      <div class="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
        <h2 class="text-3xl font-extrabold text-gray-900 mb-6">
          {{ isEditMode ? 'Edit Book' : 'Add New Book' }}
        </h2>

        <form (ngSubmit)="onSubmit()" #bookForm="ngForm" class="space-y-6">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <!-- Book ID (Disabled) -->
            <div *ngIf="isEditMode" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Book ID (Auto-Generated)</label>
              <input type="text" [(ngModel)]="book.id" name="id" disabled
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 border text-gray-500 cursor-not-allowed">
            </div>

            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="book.title" name="title" required #title="ngModel"
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': title.invalid && (title.dirty || title.touched)}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
              <div *ngIf="title.invalid && (title.dirty || title.touched)" class="text-red-500 text-xs mt-1">
                Title is required.
              </div>
            </div>

            <!-- Author Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Author Name <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="book.author" name="author" required #author="ngModel"
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': author.invalid && (author.dirty || author.touched)}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
              <div *ngIf="author.invalid && (author.dirty || author.touched)" class="text-red-500 text-xs mt-1">
                Author Name is required.
              </div>
            </div>

            <!-- Genre -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Genre <span class="text-red-500">*</span></label>
              <select [(ngModel)]="book.genre" name="genre" required #genre="ngModel" 
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': genre.invalid && (genre.dirty || genre.touched)}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
                <option value="fiction">Fiction</option>
                <option value="fantasy">Fantasy</option>
                <option value="romance">Romance</option>
                <option value="science_fiction">Science Fiction</option>
                <option value="thriller">Thriller</option>
                <option value="mystery">Mystery</option>
                <option value="popular">Popular (General)</option>
              </select>
              <div *ngIf="genre.invalid && (genre.dirty || genre.touched)" class="text-red-500 text-xs mt-1">
                Genre is required.
              </div>
            </div>

            <!-- Publish Year -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Publish Year <span class="text-red-500">*</span></label>
              <input type="number" [(ngModel)]="book.publishYear" name="publishYear" required pattern="^[0-9]{4}$" #publishYear="ngModel"
                [ngClass]="{'border-red-500 focus:border-red-500 focus:ring-red-500': publishYear.invalid && (publishYear.dirty || publishYear.touched)}"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"
                placeholder="YYYY">
              <div *ngIf="publishYear.invalid && (publishYear.dirty || publishYear.touched)" class="text-red-500 text-xs mt-1">
                <span *ngIf="publishYear.errors?.['required']">Publish Year is required.</span>
                <span *ngIf="publishYear.errors?.['pattern']">Must be a valid 4-digit year.</span>
              </div>
            </div>

            <!-- Cover Image URL -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Cover Image URL</label>
              <input type="url" [(ngModel)]="book.coverUrl" name="coverUrl"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Book Description</label>
            <textarea [(ngModel)]="book.description" name="description" rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"></textarea>
          </div>

          <!-- Author Bio -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Author Biography</label>
            <textarea [(ngModel)]="book.authorBio" name="authorBio" rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"></textarea>
          </div>

          <!-- Subjects -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Subjects (Comma separated)</label>
            <input type="text" [(ngModel)]="book.subjects" name="subjects"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"
              placeholder="e.g. horror, mystery, thriller">
            <p class="text-xs text-gray-400 mt-1 italic">Type words separated by commas.</p>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button type="button" (click)="goBack()" class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!bookForm.valid || isLoading" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
              <span *ngIf="isLoading" class="animate-spin mr-2">⏳</span>
              {{ isEditMode ? 'Update Book' : 'Save Book' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `
})
export class BookFormComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);

  isEditMode = false;
  isLoading = false;

  // ALL fields restored here
  book: any = {
    id: '', title: '', genre: 'fiction', publishYear: '', coverUrl: '',
    description: '', author: '', authorBio: '', subjects: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.api.getBookDetails(id).subscribe(data => {
        let formattedSubjects = '';
        if (Array.isArray(data.subjects)) {
          // Fixes the visual display if it loads corrupted data
          const isCorrupted = data.subjects.some((s: string) => s === ',');
          formattedSubjects = isCorrupted ? data.subjects.join('') : data.subjects.join(', ');
        } else {
          formattedSubjects = data.subjects || '';
        }
        
        this.book = { ...data, subjects: formattedSubjects };
      });
    }
  }

  onSubmit() {
    if (!this.book.title || !this.book.author || !this.book.genre || !this.book.publishYear) {
      return; 
    }

    this.isLoading = true;
    const payload = { ...this.book };

    // Transforms the string from the text box into a pure Array of words
    if (typeof payload.subjects === 'string') {
      payload.subjects = payload.subjects
        .split(',')                   
        .map((s: string) => s.trim()) 
        .filter((s: string) => s.length > 0); 
    }

    const request$ = this.isEditMode 
      ? this.api.updateBook(this.book.id, payload)
      : this.api.addBook(payload);

    request$.subscribe({
      next: (res: any) => {
        this.toastService.show(this.isEditMode ? 'Book updated successfully!' : 'Book added successfully!', 'success');
        this.router.navigate(['/book', this.isEditMode ? this.book.id : res.id]);
      },
      error: (err: any) => {
        console.error(err);
        this.toastService.show(err.error?.detail || 'An error occurred while saving the book.', 'error');
        this.isLoading = false;
      }
    });
  }

  goBack() { 
    this.router.navigate(['/']); 
  }
}