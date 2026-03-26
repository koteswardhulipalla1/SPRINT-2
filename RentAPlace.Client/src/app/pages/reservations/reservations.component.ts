import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReservationService } from '../../services/reservation.service';
import { AuthService } from '../../services/auth.service';
import { Reservation } from '../../models/models';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="res-page">
      <div class="container">
        <h1>📋 My Reservations</h1>
        <div *ngFor="let r of reservations" class="res-card">
          <div class="res-icon">{{ r.status === 'Confirmed' ? '✅' : r.status === 'Cancelled' ? '❌' : '⏳' }}</div>
          <div class="res-info">
            <h3><a [routerLink]="['/properties', r.propertyId]">{{ r.propertyTitle }}</a></h3>
            <p>📍 {{ r.propertyCity }} | 📅 {{ r.checkInDate | date:'mediumDate' }} → {{ r.checkOutDate | date:'mediumDate' }}</p>
          </div>
          <div class="res-meta">
            <span class="price">₹{{ r.totalPrice }}</span>
            <span [class]="'status ' + r.status.toLowerCase()">{{ r.status }}</span>
            <button *ngIf="r.status !== 'Cancelled' && canCancel(r)" 
                    class="btn-cancel" 
                    (click)="cancel(r)">Cancel</button>
          </div>
        </div>
        <div *ngIf="!reservations.length" class="empty"><p>No reservations yet. <a routerLink="/properties">Browse properties</a></p></div>
      </div>
    </div>
  `,
  styles: [`
    .res-page { padding: 2rem; max-width: 900px; margin: 0 auto; }
    h1 { color: #fff; margin-bottom: 2rem; }
    .res-card { display: flex; align-items: center; gap: 1.5rem; background: rgba(30,41,59,0.6); border: 1px solid rgba(99,102,241,0.15); border-radius: 16px; padding: 1.5rem; margin-bottom: 1rem; }
    .res-icon { font-size: 2.5rem; }
    .res-info { flex: 1; }
    .res-info h3 { color: #fff; margin-bottom: 0.3rem; }
    .res-info h3 a { color: #818cf8; text-decoration: none; }
    .res-info p { color: #94a3b8; font-size: 0.85rem; }
    .res-meta { text-align: right; }
    .price { display: block; color: #a78bfa; font-size: 1.3rem; font-weight: 700; }
    .status { display: inline-block; padding: 3px 10px; border-radius: 6px; font-size: 0.8rem; font-weight: 600; }
    .status.pending { background: rgba(251,191,36,0.15); color: #fbbf24; }
    .status.confirmed { background: rgba(52,211,153,0.15); color: #34d399; }
    .status.cancelled { background: rgba(248,113,113,0.15); color: #f87171; }
    .btn-cancel { 
      display: block; margin-top: 0.5rem; padding: 0.4rem 0.8rem; 
      background: rgba(248,113,113,0.1); color: #f87171;
      border: 1px solid rgba(248,113,113,0.3); border-radius: 6px;
      font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
    }
    .btn-cancel:hover { background: rgba(248,113,113,0.2); }
    .empty { text-align: center; padding: 4rem; color: #94a3b8; }
    .empty a { color: #818cf8; }
  `]
})
export class ReservationsComponent implements OnInit {
  reservations: Reservation[] = [];
  constructor(private reservationService: ReservationService) {}
  ngOnInit() { this.reservationService.getMyReservations().subscribe(data => this.reservations = data); }

  canCancel(r: Reservation): boolean {
    const checkIn = new Date(r.checkInDate).getTime();
    const nowPlus48 = new Date().getTime() + (48 * 60 * 60 * 1000);
    return checkIn > nowPlus48;
  }

  cancel(r: Reservation) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      this.reservationService.cancel(r.id).subscribe({
        next: () => {
          r.status = 'Cancelled';
        },
        error: (err) => {
          alert(err.error?.message || 'Failed to cancel reservation');
        }
      });
    }
  }
}
