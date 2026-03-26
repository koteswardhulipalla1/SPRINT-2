import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/" class="nav-brand">
          <span class="brand-icon">🏠</span>
          <span class="brand-text">RentA<span class="accent">Place</span></span>
        </a>
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a>
          <a routerLink="/properties" routerLinkActive="active">Properties</a>
          <ng-container *ngIf="auth.isLoggedIn">
            <a routerLink="/reservations" routerLinkActive="active">My Bookings</a>
            <a routerLink="/messages" routerLinkActive="active">Messages</a>
            <a *ngIf="auth.isOwner" routerLink="/owner/dashboard" routerLinkActive="active">Dashboard</a>
          </ng-container>
        </div>
        <div class="nav-auth">
          <ng-container *ngIf="!auth.isLoggedIn">
            <a routerLink="/login" class="btn btn-outline">Login</a>
            <a routerLink="/register" class="btn btn-primary">Sign Up</a>
          </ng-container>
          <ng-container *ngIf="auth.isLoggedIn">
            <span class="user-name">👋 {{ auth.currentUser?.fullName }}</span>
            <span class="user-role-badge">{{ auth.currentUser?.role }}</span>
            <button class="btn btn-outline" (click)="logout()">Logout</button>
          </ng-container>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #fdfaf5;
      border-bottom: 1px solid #eee;
      padding: 0 2rem;
      position: sticky; top: 0; z-index: 1000;
    }
    .nav-container {
      max-width: 1100px; margin: 0 auto;
      display: flex; align-items: center; justify-content: space-between; height: 60px;
    }
    .nav-brand {
      display: flex; align-items: center; gap: 8px; text-decoration: none; font-weight: 700; color: #444;
    }
    .brand-icon { font-size: 1.4rem; }
    .accent { color: #d4a373; }
    .nav-links { display: flex; gap: 1rem; }
    .nav-links a {
      color: #777; text-decoration: none; font-size: 0.9rem; font-weight: 500;
      transition: 0.2s;
    }
    .nav-links a:hover, .nav-links a.active { color: #d4a373; }
    .nav-auth { display: flex; align-items: center; gap: 1.5rem; }
    .user-name { color: #666; font-size: 0.85rem; }
    .user-role-badge { background: #faedcd; color: #d4a373; font-size: 0.65rem; padding: 2px 7px; border-radius: 4px; font-weight: 700; }
    .btn { font-size: 0.85rem; font-weight: 600; text-decoration: none; cursor: pointer; border: none; background: transparent; transition: 0.2s; }
    .btn-primary { background: #d4a373; color: #fff; padding: 6px 16px; border-radius: 6px; }
    .btn-primary:hover { opacity: 0.9; }
    .btn-outline { color: #888; }
    .btn-outline:hover { color: #444; }
  `]
})
  // NavbarComponent - The top navigation bar for the whole site
  export class NavbarComponent {
    // We inject the auth service to check current user status
    constructor(public auth: AuthService) {}
  
    // Clean up the session and kick the user back to the home page
    logout() {
      console.log("User is logging out from the session...");
      
      // Call the service to clear localStorage/state
      this.auth.logout();
  
      // Full page refresh to ensure everything is cleared out properly
      const homeUrl = '/';
      window.location.href = homeUrl;
    }
  }
