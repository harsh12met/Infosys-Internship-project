import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { ToastComponent } from '../toast/toast.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ToastComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  showLoginPanel = false;
  showFeaturesDropdown = false;
  showSolutionsDropdown = false;
  showResourcesDropdown = false;
  showBackToTop = false;
  email = '';
  password = '';
  isLoggingIn = false;

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  getCurrentUser() {
    return this.authService.getCurrentUser();
  }

  logout() {
    this.authService.logout();
    this.toastService.show('Logged out successfully', 'success');
    this.router.navigate(['/']);
  }

  goToBoard() {
    this.router.navigate(['/board']);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show back to top button after scrolling 300px
    this.showBackToTop = window.pageYOffset > 300;
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleLoginPanel() {
    this.showLoginPanel = !this.showLoginPanel;
  }

  closeLoginPanel() {
    this.showLoginPanel = false;
  }

  toggleFeaturesDropdown() {
    this.showFeaturesDropdown = !this.showFeaturesDropdown;
    this.showSolutionsDropdown = false;
    this.showResourcesDropdown = false;
  }

  toggleSolutionsDropdown() {
    this.showSolutionsDropdown = !this.showSolutionsDropdown;
    this.showFeaturesDropdown = false;
    this.showResourcesDropdown = false;
  }

  toggleResourcesDropdown() {
    this.showResourcesDropdown = !this.showResourcesDropdown;
    this.showFeaturesDropdown = false;
    this.showSolutionsDropdown = false;
  }

  closeAllDropdowns() {
    this.showFeaturesDropdown = false;
    this.showSolutionsDropdown = false;
    this.showResourcesDropdown = false;
  }

  login() {
    if (!this.email || !this.password) {
      this.toastService.show('Please enter email and password', 'error');
      return;
    }

    this.isLoggingIn = true;

    this.authService
      .login({ email: this.email, password: this.password })
      .subscribe({
        next: (response) => {
          if (response.success) {
            // Store user data in localStorage
            localStorage.setItem('kanban_user', JSON.stringify(response.user));

            console.log('✅ Login successful, user stored:', response.user);

            this.toastService.show(
              `Welcome back, ${response.user?.name}! 🎉`,
              'success'
            );
            this.closeLoginPanel();

            // Navigate to board after short delay
            setTimeout(() => {
              this.router.navigate(['/board']);
            }, 500);
          }
        },
        error: (error) => {
          this.isLoggingIn = false;
          const errorMessage =
            error.error?.message || 'Login failed. Please try again.';
          console.error('❌ Login error:', error);
          this.toastService.show(errorMessage, 'error');
        },
        complete: () => {
          this.isLoggingIn = false;
        },
      });
  }
}
