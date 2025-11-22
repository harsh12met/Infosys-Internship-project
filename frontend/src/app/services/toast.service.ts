import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private nextId = 1;

  constructor() {}

  // Show success notification
  success(message: string, duration: number = 3000): void {
    this.addToast(message, 'success', duration);
  }

  // Show error notification
  error(message: string, duration: number = 4000): void {
    this.addToast(message, 'error', duration);
  }

  // Show warning notification
  warning(message: string, duration: number = 3500): void {
    this.addToast(message, 'warning', duration);
  }

  // Show info notification
  info(message: string, duration: number = 3000): void {
    this.addToast(message, 'info', duration);
  }

  // Generic show method
  show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration?: number
  ): void {
    const defaultDuration = type === 'error' ? 4000 : 3000;
    this.addToast(message, type, duration || defaultDuration);
  }

  // Add toast to the list
  private addToast(
    message: string,
    type: Toast['type'],
    duration: number
  ): void {
    const toast: Toast = {
      id: this.nextId++,
      message,
      type,
      duration,
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    // Auto remove toast after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  // Remove specific toast
  removeToast(id: number): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter((toast) => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  // Clear all toasts
  clearAll(): void {
    this.toastsSubject.next([]);
  }
}
