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
            <div *ngIf="isEditMode" class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700">Book ID</label>
              <input type="text" [(ngModel)]="book.id" name="id" disabled
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 p-2 border text-gray-500 cursor-not-allowed">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Title <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="book.title" name="title" required #title="ngModel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Author Name <span class="text-red-500">*</span></label>
              <input type="text" [(ngModel)]="book.author" name="author" required #author="ngModel"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Genre <span class="text-red-500">*</span></label>
              <select [(ngModel)]="book.genre" name="genre" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border">
                <option value="fiction">Fiction</option>
                <option value="fantasy">Fantasy</option>
                <option value="romance">Romance</option>
                <option value="science_fiction">Science Fiction</option>
                <option value="thriller">Thriller</option>
                <option value="popular">Popular</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Publish Year <span class="text-red-500">*</span></label>
              <input type="number" [(ngModel)]="book.publishYear" name="publishYear" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border">
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700">Description</label>
            <textarea [(ngModel)]="book.description" name="description" rows="4"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border"></textarea>
          </div>

          <!-- SUBJECTS INPUT BOX -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Subjects (Comma separated)</label>
            <input type="text" [(ngModel)]="book.subjects" name="subjects"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-50 p-2 border"
              placeholder="Horror, Mystery, Crime">
            <p class="text-xs text-gray-400 mt-1 italic">Type words separated by commas.</p>
          </div>

          <div class="flex justify-end gap-4 pt-4">
            <button type="button" (click)="goBack()" class="px-6 py-2 border border-gray-300 rounded-md">Cancel</button>
            <button type="submit" [disabled]="!bookForm.valid || isLoading" 
              class="px-6 py-2 bg-indigo-600 text-white rounded-md font-bold">
              {{ isEditMode ? 'Update' : 'Save' }}
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
  book: any = { title: '', genre: 'fiction', publishYear: '', subjects: '' };

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.api.getBookDetails(id).subscribe(data => {
        let formattedSubjects = '';
        if (Array.isArray(data.subjects)) {
          // Detect the corrupted array format and stitch it to look normal in UI
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
    this.isLoading = true;
    const payload = { ...this.book };

    // Create a strict array to send down to the service
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
        alert('Success!');
        this.router.navigate(['/book', this.isEditMode ? this.book.id : res.id]);
      },
      error: (err) => {
        console.error(err);
        this.isLoading = false;
      }
    });
  }

  goBack() { this.router.navigate(['/']); }
}