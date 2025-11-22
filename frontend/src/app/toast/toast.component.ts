import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast toast-{{ toast.type }}"
        [class.toast-enter]="true"
      >
        <div class="toast-content">
          <div class="toast-icon">
            <span [ngSwitch]="toast.type">
              <span *ngSwitchCase="'success'">✅</span>
              <span *ngSwitchCase="'error'">❌</span>
              <span *ngSwitchCase="'warning'">⚠️</span>
              <span *ngSwitchCase="'info'">ℹ️</span>
            </span>
          </div>
          <div class="toast-message">{{ toast.message }}</div>
          <button
            class="toast-close"
            (click)="closeToast(toast.id)"
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./toast.component.css'],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription.add(
      this.toastService.toasts$.subscribe((toasts) => {
        this.toasts = toasts;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  closeToast(id: number): void {
    this.toastService.removeToast(id);
  }
}
