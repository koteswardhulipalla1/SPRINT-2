import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { ReservationService } from '../../services/reservation.service';
import { Property, Reservation, Category } from '../../models/models';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="dashboard">
      <div class="container">
        <div class="dash-header">
          <h1>👤 Owner Dashboard</h1>
          <a routerLink="/owner/property/new" class="btn-add">+ Add Property</a>
        </div>

        <!-- Tabs -->
        <div class="tabs">
          <button [class.active]="activeTab === 'properties'" (click)="activeTab = 'properties'">🏠 My Properties ({{ properties.length }})</button>
          <button [class.active]="activeTab === 'reservations'" (click)="activeTab = 'reservations'; loadReservations()">📋 Reservations ({{ reservations.length }})</button>
        </div>

        <!-- Properties Tab -->
        <div *ngIf="activeTab === 'properties'">
          <div class="table-wrap">
            <table class="data-table" *ngIf="properties.length">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Price/Night</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of properties">
                  <td><a [routerLink]="['/properties', p.id]">{{ p.title }}</a></td>
                  <td><span class="badge">{{ p.propertyType }}</span></td>
                  <td>{{ p.city }}</td>
                  <td class="price">₹{{ p.pricePerNight }}</td>
                  <td>⭐ {{ p.rating.toFixed(1) }}</td>
                  <td><span [class]="'status ' + (p.isAvailable ? 'active' : 'inactive')">{{ p.isAvailable ? 'Available' : 'Unavailable' }}</span></td>
                  <td class="actions">
                    <a [routerLink]="['/owner/property', p.id]" class="act-btn edit">✏️</a>
                    <button class="act-btn delete" (click)="deleteProperty(p.id)">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="!properties.length" class="empty">
            <p>No properties yet. <a routerLink="/owner/property/new">Add your first property</a></p>
          </div>
        </div>

        <!-- Reservations Tab -->
        <div *ngIf="activeTab === 'reservations'">
          <div class="table-wrap">
            <table class="data-table" *ngIf="reservations.length">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Guest</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let r of reservations">
                  <td>{{ r.propertyTitle }}</td>
                  <td>{{ r.userName }}</td>
                  <td>{{ r.checkInDate | date:'mediumDate' }}</td>
                  <td>{{ r.checkOutDate | date:'mediumDate' }}</td>
                  <td class="price">₹{{ r.totalPrice }}</td>
                  <td><span [class]="'status ' + r.status.toLowerCase()">{{ r.status }}</span></td>
                  <td class="actions" *ngIf="r.status === 'Pending'">
                    <button class="act-btn confirm" (click)="updateReservation(r.id, 'Confirmed')">✅</button>
                    <button class="act-btn cancel" (click)="updateReservation(r.id, 'Cancelled')">❌</button>
                  </td>
                  <td *ngIf="r.status !== 'Pending'">-</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div *ngIf="!reservations.length" class="empty"><p>No reservations yet.</p></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { padding: 2rem; max-width: 1280px; margin: 0 auto; }
    .dash-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .dash-header h1 { color: #fff; font-size: 1.8rem; }
    .btn-add {
      padding: 0.7rem 1.5rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: #fff; text-decoration: none; border-radius: 10px;
      font-weight: 600; transition: all 0.2s;
    }
    .btn-add:hover { transform: translateY(-1px); box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4); }
    .tabs { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; }
    .tabs button {
      padding: 0.7rem 1.5rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.15);
      color: #94a3b8; border-radius: 10px;
      cursor: pointer; font-size: 0.9rem; font-weight: 600;
      transition: all 0.2s;
    }
    .tabs button.active { background: rgba(99, 102, 241, 0.15); color: #818cf8; border-color: #6366f1; }
    .table-wrap { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      background: rgba(30, 41, 59, 0.6);
      border-radius: 16px;
      overflow: hidden;
    }
    .data-table th {
      text-align: left; padding: 1rem;
      background: rgba(15, 23, 42, 0.6);
      color: #94a3b8; font-weight: 600; font-size: 0.85rem;
      border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    }
    .data-table td {
      padding: 0.85rem 1rem;
      color: #e2e8f0; font-size: 0.9rem;
      border-bottom: 1px solid rgba(99, 102, 241, 0.05);
    }
    .data-table td a { color: #818cf8; text-decoration: none; font-weight: 500; }
    .badge {
      background: rgba(99, 102, 241, 0.15); color: #818cf8;
      padding: 2px 8px; border-radius: 5px; font-size: 0.8rem;
    }
    .price { color: #a78bfa; font-weight: 600; }
    .status {
      padding: 3px 10px; border-radius: 6px;
      font-size: 0.8rem; font-weight: 600;
    }
    .status.active, .status.confirmed { background: rgba(52, 211, 153, 0.15); color: #34d399; }
    .status.inactive, .status.cancelled { background: rgba(248, 113, 113, 0.15); color: #f87171; }
    .status.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
    .actions { display: flex; gap: 0.4rem; }
    .act-btn {
      padding: 0.3rem 0.5rem;
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 6px; cursor: pointer;
      text-decoration: none; font-size: 0.9rem;
      transition: all 0.2s;
    }
    .act-btn:hover { background: rgba(99, 102, 241, 0.1); }
    .empty { text-align: center; padding: 3rem; color: #94a3b8; }
    .empty a { color: #818cf8; text-decoration: none; }
  `]
})
export class OwnerDashboardComponent implements OnInit {
  properties: Property[] = [];
  reservations: Reservation[] = [];
  activeTab = 'properties';

  constructor(
    private propertyService: PropertyService,
    private reservationService: ReservationService
  ) {}

  ngOnInit() {
    this.propertyService.getMyProperties().subscribe(data => this.properties = data);
    this.loadReservations();
  }

  loadReservations() {
    this.reservationService.getOwnerReservations().subscribe(data => this.reservations = data);
  }

  deleteProperty(id: number) {
    if (confirm('Are you sure you want to delete this property?')) {
      this.propertyService.delete(id).subscribe(() => {
        this.properties = this.properties.filter(p => p.id !== id);
      });
    }
  }

  updateReservation(id: number, status: string) {
    this.reservationService.updateStatus(id, status).subscribe(() => {
      this.loadReservations();
    });
  }
}
