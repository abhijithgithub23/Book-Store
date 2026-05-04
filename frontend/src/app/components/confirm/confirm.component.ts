import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- FIX: Replaced 'bg-black bg-opacity-50' with 'bg-gray-900/50' and added a fallback inline style -->
    <div *ngIf="(state$ | async)?.isOpen" 
         class="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm transition-opacity"
         style="background-color: rgba(0, 0, 0, 0.4);">
         
      <div *ngIf="(state$ | async) as state" class="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4 animate-scale-in">
        
        <h3 class="text-xl font-bold text-gray-900 mb-2">{{ state.title }}</h3>
        <p class="text-gray-600 mb-6 leading-relaxed">{{ state.message }}</p>
        
        <div class="flex justify-end gap-3">
          <button 
            (click)="close(false, state.resolve)" 
            class="px-4 py-2 text-gray-700 font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none cursor-pointer">
            {{ state.cancelText }}
          </button>
          <button 
            (click)="close(true, state.resolve)" 
            class="px-4 py-2 bg-red-600 text-white font-bold hover:bg-red-700 rounded-lg shadow-sm transition-colors focus:outline-none cursor-pointer">
            {{ state.confirmText }}
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95) translateY(10px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-scale-in {
      animation: scaleIn 0.2s ease-out forwards;
    }
  `]
})
export class ConfirmComponent {
  private confirmService = inject(ConfirmService);
  state$ = this.confirmService.state$;

  close(result: boolean, resolve?: (value: boolean) => void) {
    this.confirmService.close(result, resolve);
  }
}