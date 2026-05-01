import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';

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
            
            <!-- Only show Book ID when editing. Make it disabled so it can't be changed -->
            <div *ngIf="isEditMode" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Book ID (Auto-Generated)</label>
              <input type="text" [(ngModel)]="book.id" name="id" disabled
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 border text-gray-500 cursor-not-allowed">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Title</label>
              <input type="text" [(ngModel)]="book.title" name="title" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Author Name</label>
              <input type="text" [(ngModel)]="book.author" name="author" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Genre</label>
              <select [(ngModel)]="book.genre" name="genre" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
                <option value="fiction">Fiction</option>
                <option value="fantasy">Fantasy</option>
                <option value="romance">Romance</option>
                <option value="science_fiction">Science Fiction</option>
                <option value="thriller">Thriller</option>
                <option value="mystery">Mystery</option>
                <option value="popular">Popular (General)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Publish Year</label>
              <input type="text" [(ngModel)]="book.publishYear" name="publishYear" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Cover Image URL</label>
              <input type="url" [(ngModel)]="book.coverUrl" name="coverUrl"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Book Description</label>
            <textarea [(ngModel)]="book.description" name="description" rows="4" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Author Biography</label>
            <textarea [(ngModel)]="book.authorBio" name="authorBio" rows="3" required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Subjects (Comma separated)</label>
            <input type="text" [(ngModel)]="book.subjects" name="subjects"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-50 p-2 border"
              placeholder="Magic, Dragons, Epic">
          </div>

          <div class="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button type="button" (click)="goBack()" class="px-6 py-2 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" [disabled]="!bookForm.valid || isLoading" class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center">
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

  isEditMode = false;
  isLoading = false;

  book: any = {
    id: '', title: '', genre: 'fiction', publishYear: '', coverUrl: '',
    description: '', author: '', authorBio: '', subjects: ''
  };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.api.getBookDetails(id).subscribe(data => {
        this.book = { ...data, subjects: data.subjects ? data.subjects.join(', ') : '' };
      });
    }
  }

  onSubmit() {
    this.isLoading = true;
    const request$ = this.isEditMode 
      ? this.api.updateBook(this.book.id, this.book)
      : this.api.addBook(this.book);

    request$.subscribe({
      next: (response: any) => {
        alert(this.isEditMode ? 'Book updated successfully!' : 'Book added successfully!');
        // Redirect to the auto-generated ID if it's a new book
        const redirectId = this.isEditMode ? this.book.id : response.id;
        this.router.navigate(['/book', redirectId]);
      },
      error: (err: any) => {
        console.error(err);
        alert(err.error?.detail || 'An error occurred while saving the book.');
        this.isLoading = false;
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }
}