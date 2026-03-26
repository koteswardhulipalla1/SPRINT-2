import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { ReservationService } from '../../services/reservation.service';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { Property } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="prop-detail-v2" *ngIf="property">
      <div class="v-container">
        <!-- Minimal Gallery -->
        <div class="clean-gallery">
          <img [src]="getFullUrl(selectedImg) || 'https://placehold.co/800x500/fdfaf5/d4a373?text=Property'" class="hero-img">
          <div class="mini-thumbs" *ngIf="property.images.length > 1">
            <img *ngFor="let img of property.images" [src]="getFullUrl(img.imageUrl)" (click)="selectedImg = img.imageUrl" [class.active]="selectedImg === img.imageUrl">
          </div>
        </div>

        <div class="split-layout">
          <div class="primary-info">
            <header>
              <div class="h-top">
                <span class="type-text">{{ property.propertyType }}</span>
                <span class="dot">·</span>
                <span class="rate-text">⭐ {{ property.rating.toFixed(1) }}</span>
              </div>
              <h1>{{ property.title }}</h1>
              <p class="loc-text">📍 {{ property.address }}, {{ property.city }}</p>
            </header>

            <div class="desc-box">
              <h3>Description</h3>
              <p>{{ property.description }}</p>
            </div>

            <div class="amenities-box">
              <h3>Amenities</h3>
              <div class="pill-grid">
                <span *ngFor="let f of property.features" class="feature-pill">
                   {{ f }}
                </span>
              </div>
            </div>

            <!-- Guest Reviews / Rating Section -->
            <div class="reviews-section" *ngIf="property">
              <h3>Guest Reviews</h3>
              <div class="rating-overview">
                <span class="big-score">{{ property.rating.toFixed(1) }}</span>
                <span class="count-text">on {{ property.ratingCount }} total reviews</span>
              </div>

              <!-- Only allow rating if they are NOT the owner -->
              <div class="rate-prompt" *ngIf="auth.isLoggedIn && !isMyOwnListing">
                <p>Enjoyed your stay? Leave a rating:</p>
                <div class="star-picker">
                  <span *ngFor="let s of [1,2,3,4,5]" 
                        (click)="userRating = s" 
                        [class.filled]="userRating >= s">★</span>
                </div>
                <button (click)="submitRating()" class="rate-btn" [disabled]="!userRating || ratingLoading">
                  {{ ratingLoading ? '...' : 'Submit Rating' }}
                </button>
                <div *ngIf="ratingSuccess" class="success-msg">✅ Thank you for your feedback!</div>
              </div>
            </div>

            <!-- Light Message Box - Hide if it's the owner's own property -->
            <div class="chat-prompt" *ngIf="auth.isLoggedIn && !isMyOwnListing">
              <h3>Direct inquiry</h3>
              <div class="chat-input">
                <input [(ngModel)]="chatInput" placeholder="Ask the owner something...">
                <button (click)="sendMessage()">Send</button>
              </div>
              <div *ngIf="isMsgSent" class="success-msg">Message sent!</div>
            </div>

            <div class="owner-notice" *ngIf="isMyOwnListing">
              <p>💡 You are the owner of this listing. Use the dashboard to manage it.</p>
            </div>
          </div>

          <!-- Checkout Card - Hide if it's the owner's listing -->
          <div class="check-card" *ngIf="!isMyOwnListing">
            <div class="card-head">
              <span class="price-big">₹{{ property.pricePerNight }}</span>
              <span class="unit">/ night</span>
            </div>

            <div class="check-fields" *ngIf="auth.isLoggedIn">
              <div class="f-group">
                <label>Arrival</label>
                <input type="date" [(ngModel)]="arrivalDate">
              </div>
              <div class="f-group">
                <label>Departure</label>
                <input type="date" [(ngModel)]="departureDate">
              </div>

              <div class="t-price" *ngIf="totalStayCost > 0">
                <span>Estimated Total</span>
                <strong>₹{{ totalStayCost }}</strong>
              </div>

              <button class="action-btn" (click)="reserve()" [disabled]="!arrivalDate || !departureDate || isBooking">
                {{ isBooking ? 'Booking...' : 'Reserve Property' }}
              </button>

              <!-- Feedback Messages -->
              <div *ngIf="bookingError" class="error-msg">{{ bookingError }}</div>
              <div *ngIf="bookingSuccess" class="success-msg">✅ Reservation successful!</div>
            </div>

            <div *ngIf="!auth.isLoggedIn" class="guest-msg">
              <button routerLink="/login" class="guest-btn">Sign in to book</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prop-detail-v2 { padding: 3rem 0; background: #fdfaf5; }
    .v-container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
    .clean-gallery { margin-bottom: 3rem; }
    .hero-img { width: 100%; height: 500px; object-fit: cover; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.05); border: 4px solid #fff; }
    .mini-thumbs { display: flex; gap: 0.75rem; margin-top: 1rem; }
    .mini-thumbs img { width: 80px; height: 60px; object-fit: cover; border-radius: 8px; cursor: pointer; opacity: 0.5; transition: 0.2s; border: 1px solid #e2e8f0; }
    .mini-thumbs img.active { opacity: 1; border: 2px solid #d4a373; }

    .split-layout { display: grid; grid-template-columns: 1fr 340px; gap: 4rem; }
    header { margin-bottom: 2.5rem; }
    .h-top { display: flex; align-items: center; gap: 0.75rem; color: #888; font-size: 0.9rem; margin-bottom: 0.5rem; font-weight: 600; }
    .rate-text { color: #d4a373; }
    header h1 { font-size: 2.5rem; color: #444; margin-bottom: 0.5rem; }
    .loc-text { color: #777; font-size: 1rem; }

    .desc-box, .amenities-box, .chat-prompt { margin-bottom: 3rem; }
    h3 { font-size: 1.25rem; color: #444; margin-bottom: 1rem; font-weight: 500; }
    p { color: #777; line-height: 1.8; }

    .pill-grid { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .feature-pill { background: #fff; border: 1px solid #e2e8f0; color: #666; padding: 8px 16px; border-radius: 10px; font-size: 0.9rem; }

    .chat-prompt { background: #fff; padding: 1.5rem; border-radius: 12px; border: 1px solid #e2e8f0; }
    .chat-input { display: flex; gap: 0.5rem; margin-top: 1rem; }
    .chat-input input { flex: 1; background: #fdfaf5; border: 1px solid #e2e8f0; color: #444; padding: 0.8rem 1rem; border-radius: 8px; outline: none; }
    .chat-input button { background: #d4a373; color: #fff; border: none; padding: 0 1.5rem; border-radius: 8px; font-weight: 600; cursor: pointer; }

    .check-card { background: #fff; border: 1px solid #e2e8f0; padding: 2rem; border-radius: 16px; position: sticky; top: 100px; height: fit-content; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
    .card-head { margin-bottom: 1.5rem; }
    .price-big { font-size: 1.8rem; font-weight: 800; color: #444; }
    .unit { color: #888; }

    .f-group { margin-bottom: 1rem; }
    .f-group label { display: block; font-size: 0.75rem; color: #888; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 0.4rem; font-weight: 700; }
    .f-group input { width: 100%; background: #fdfaf5; border: 1px solid #e2e8f0; color: #444; padding: 0.75rem; border-radius: 8px; outline: none; }
    
    .t-price { display: flex; justify-content: space-between; padding: 1.5rem 0; border-top: 1px solid #eee; margin-top: 1rem; }
    .t-price span { color: #888; }
    .t-price strong { color: #444; font-size: 1.2rem; }

    .action-btn { width: 100%; background: #d4a373; color: #fff; border: none; padding: 1rem; border-radius: 10px; font-weight: 700; font-size: 1rem; cursor: pointer; transition: 0.2s; }
    .action-btn:hover { opacity: 0.9; transform: translateY(-2px); }
    .action-btn:disabled { opacity: 0.4; transform: none; }

    .guest-msg { text-align: center; }
    .guest-btn { background: #faedcd; color: #d4a373; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; width: 100%; font-weight: 600; }
    .success-msg { color: #2d6a4f; background: #d8f3dc; padding: 0.75rem; border-radius: 8px; margin-top: 1rem; font-size: 0.85rem; }
    .error-msg { color: #bc4749; background: #f8d7da; padding: 0.75rem; border-radius: 8px; margin-top: 1rem; font-size: 0.85rem; }

    .reviews-section { margin-bottom: 3rem; padding: 1.5rem; border-left: 3px solid #d4a373; background: #fff; }
    .rating-overview { display: flex; align-items: baseline; gap: 0.75rem; margin-bottom: 1.5rem; }
    .big-score { font-size: 2.5rem; font-weight: 700; color: #444; }
    .count-text { color: #888; font-size: 0.9rem; }
    .rate-prompt p { margin-bottom: 0.5rem; font-weight: 600; }
    .star-picker { display: flex; gap: 0.25rem; font-size: 1.5rem; color: #e2e8f0; cursor: pointer; margin-bottom: 1rem; }
    .star-picker span { transition: 0.2s; }
    .star-picker span:hover { transform: scale(1.2); }
    .star-picker span.filled { color: #d4a373; }
    .rate-btn { background: #fdfaf5; border: 1px solid #d4a373; color: #d4a373; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; cursor: pointer; }
    .rate-btn:hover { background: #faedcd; }
    .rate-btn:disabled { opacity: 0.5; border-color: #eee; color: #888; cursor: not-allowed; }
  `]
})
export class PropertyDetailComponent implements OnInit {
  property: Property | null = null;
  selectedImg = '';
  
  arrivalDate = '';
  departureDate = '';
  
  isBooking = false;
  bookingError = '';
  bookingSuccess = false;
  
  chatInput = '';
  isMsgSent = false;

  userRating = 0;
  ratingLoading = false;
  ratingSuccess = false;

  constructor(
    private route: ActivatedRoute,
    private pService: PropertyService,
    private rService: ReservationService,
    private mService: MessageService,
    public auth: AuthService
  ) {}

  get isMyOwnListing(): boolean {
    if (!this.property || !this.auth.currentUser) return false;
    return this.property.ownerId === this.auth.currentUser.userId;
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.serverUrl}${path}`;
  }

  get numberOfNights(): number {
    if (!this.arrivalDate || !this.departureDate) return 0;
    const start = new Date(this.arrivalDate).getTime();
    const end = new Date(this.departureDate).getTime();
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }

  get totalStayCost(): number {
    if (!this.property) return 0;
    return this.numberOfNights * this.property.pricePerNight;
  }

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const numericId = Number(idParam);
    
    this.pService.getById(numericId).subscribe({
      next: (data) => {
        this.property = data;
        if (data.images && data.images.length > 0) {
          this.selectedImg = data.images[0].imageUrl;
        }
      },
      error: (err) => console.error("Could not load property", err)
    });
  }

  reserve() {
    if (!this.property || !this.auth.isLoggedIn) return;
    
    this.isBooking = true;
    this.bookingError = '';
    
    const payload = {
      propertyId: this.property.id,
      checkInDate: this.arrivalDate,
      checkOutDate: this.departureDate
    };

    this.rService.create(payload).subscribe({
      next: () => {
        this.isBooking = false;
        this.bookingSuccess = true;
      },
      error: (err) => {
        this.isBooking = false;
        this.bookingError = err.error?.message || "Booking failed.";
      }
    });
  }

  submitRating() {
    if (!this.property || this.userRating === 0) return;
    
    this.ratingLoading = true;
    this.ratingSuccess = false;

    this.pService.rate(this.property.id, this.userRating).subscribe({
      next: () => {
        this.ratingLoading = false;
        this.ratingSuccess = true;
        if (this.property) {
          this.property.ratingCount++;
        }
      },
      error: (err) => {
        this.ratingLoading = false;
      }
    });
  }

  sendMessage() {
    if (!this.property || !this.chatInput.trim()) return;
    
    const msg = {
      receiverId: this.property.ownerId,
      propertyId: this.property.id,
      content: this.chatInput
    };

    this.mService.send(msg).subscribe({
      next: () => {
        this.isMsgSent = true;
        this.chatInput = '';
        setTimeout(() => this.isMsgSent = false, 3000);
      }
    });
  }
}
