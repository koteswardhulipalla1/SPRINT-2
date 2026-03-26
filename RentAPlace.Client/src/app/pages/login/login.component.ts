import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your RentAPlace account</p>
        </div>
        <form (ngSubmit)="onLogin()" class="auth-form">
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="Enter your email" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="Enter your password" required>
          </div>
          <div *ngIf="error" class="error-msg">{{ error }}</div>
          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <p class="auth-switch">Don't have an account? <a routerLink="/register">Sign up</a></p>
        <div class="demo-accounts">
          <p class="demo-title">Demo Accounts (Password: Password123!)</p>
          <div class="demo-row">
            <button class="demo-btn" (click)="fillDemo('owner@rentaplace.com')">👤 Owner</button>
            <button class="demo-btn" (click)="fillDemo('renter@rentaplace.com')">🏠 Renter</button>
          </div>
        </div>
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
    .demo-accounts { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid #eee; }
    .demo-title { text-align: center; color: #999; font-size: 0.8rem; margin-bottom: 0.75rem; }
    .demo-row { display: flex; gap: 0.75rem; }
    .demo-btn {
      flex: 1; padding: 0.5rem;
      background: #faedcd;
      border: 1px solid #e2e8f0;
      color: #d4a373;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.85rem;
      transition: all 0.2s;
    }
    .demo-btn:hover { background: #fdfaf5; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  fillDemo(email: string) {
    this.email = email;
    this.password = 'Password123!';
  }

  onLogin() {
    this.loading = true;
    this.error = '';
    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (res) => {
        this.loading = false;
        this.router.navigate([res.role === 'Owner' ? '/owner/dashboard' : '/']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
