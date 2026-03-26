import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Create Account</h1>
          <p>Join RentAPlace today</p>
        </div>
        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="fullName" name="fullName" placeholder="Enter your full name" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Create a password" required>
          </div>
          <div class="form-group">
            <label>Phone (optional)</label>
            <input type="tel" [(ngModel)]="phone" name="phone" placeholder="Enter phone number">
          </div>
          <div class="form-group">
            <label>Account Type</label>
            <div class="role-toggle">
              <button type="button" [class.active]="role === 'Renter'" (click)="role = 'Renter'">🏠 Renter</button>
              <button type="button" [class.active]="role === 'Owner'" (click)="role = 'Owner'">👤 Owner</button>
            </div>
          </div>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        <p class="auth-switch">Already have an account? <a routerLink="/login">Sign in</a></p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem; background: #fdfaf5; }
    .auth-card {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      padding: 2.5rem;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.03);
    }
    .auth-header { text-align: center; margin-bottom: 2rem; }
    .auth-header h1 { color: #444; font-size: 1.8rem; margin-bottom: 0.5rem; }
    .auth-header p { color: #888; }
    .form-group { margin-bottom: 1.25rem; }
    .form-group label { display: block; color: #666; margin-bottom: 0.4rem; font-weight: 500; font-size: 0.9rem; }
    .form-group input {
      width: 100%; padding: 0.75rem 1rem;
      background: #fdfaf5;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      color: #444; font-size: 1rem; outline: none;
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus { border-color: #d4a373; }
    .role-toggle { display: flex; gap: 0.5rem; }
    .role-toggle button {
      flex: 1; padding: 0.7rem;
      background: #fdfaf5;
      border: 1px solid #e2e8f0;
      color: #888; border-radius: 10px;
      cursor: pointer; font-size: 0.95rem;
      transition: all 0.2s;
    }
    .role-toggle button.active {
      background: #faedcd;
      border-color: #d4a373;
      color: #d4a373;
    }
    .error-msg { color: #bc4749; font-size: 0.85rem; margin-bottom: 1rem; padding: 0.5rem; background: #f8d7da; border-radius: 8px; }
    .btn-submit {
      width: 100%; padding: 0.85rem;
      background: #d4a373;
      color: #fff; border: none; border-radius: 10px;
      font-size: 1rem; font-weight: 600; cursor: pointer;
      transition: all 0.2s;
    }
    .btn-submit:hover { opacity: 0.9; transform: translateY(-1px); }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .auth-switch { text-align: center; margin-top: 1.5rem; color: #888; font-size: 0.9rem; }
    .auth-switch a { color: #d4a373; text-decoration: none; font-weight: 600; }
  `]
})
export class RegisterComponent {
  fullName = '';
  email = '';
  password = '';
  phone = '';
  role = 'Renter';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    if (this.phone && !/^\d{10}$/.test(this.phone)) {
      this.error = 'Please enter a valid 10-digit phone number';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.register({
      fullName: this.fullName,
      email: this.email,
      password: this.password,
      role: this.role,
      phone: this.phone || undefined
    }).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([res.role === 'Owner' ? '/owner/dashboard' : '/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }
}
