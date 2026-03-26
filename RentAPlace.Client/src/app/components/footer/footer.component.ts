import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="simple-footer">
      <div class="footer-content">
        <p>&copy; 2026 🏠 RentA<span class="accent">Place</span>. All rights reserved.</p>
        <div class="footer-links">
          <span>📧 koteswardhulipalla&#64;gmail.com</span>
          <span class="dot">·</span>
          <span>📞 9676073798</span>
          <span class="dot">·</span>
          <span>📍 Tenali, AP, India</span>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .simple-footer {
      background: #fdfaf5;
      padding: 2rem;
      border-top: 1px solid #eee;
      color: #888;
      font-size: 0.9rem;
    }
    .footer-content {
      max-width: 1100px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .accent { color: #d4a373; }
    .footer-links { display: flex; align-items: center; gap: 0.5rem; color: #999; }
    .dot { font-weight: bold; }
  `]
})
export class FooterComponent { }
