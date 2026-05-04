import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  resolve?: (value: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private state = new BehaviorSubject<ConfirmState>({
    isOpen: false, title: '', message: '', confirmText: '', cancelText: ''
  });
  
  state$ = this.state.asObservable();

  // Returns a promise that resolves to true (confirmed) or false (cancelled)
  confirm(title: string, message: string, confirmText = 'Confirm', cancelText = 'Cancel'): Promise<boolean> {
    return new Promise((resolve) => {
      this.state.next({
        isOpen: true,
        title,
        message,
        confirmText,
        cancelText,
        resolve
      });
    });
  }

  close(result: boolean, resolve?: (value: boolean) => void) {
    this.state.next({
      isOpen: false, title: '', message: '', confirmText: '', cancelText: ''
    });
    if (resolve) {
      resolve(result);
    }
  }
}