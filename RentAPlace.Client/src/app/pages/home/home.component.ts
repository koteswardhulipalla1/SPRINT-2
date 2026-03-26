import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, Category } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="home-v2">
      <!-- Minimal Hero -->
      <section class="minimal-hero">
        <div class="v-container">
          <h1>Find your next <span class="highlight">stay</span></h1>
          <p class="subtitle">Curated properties for exceptional experiences</p>
          
          <div class="clean-search">
            <input type="text" [(ngModel)]="searchCity" placeholder="Where to? (City)">
            <select [(ngModel)]="searchType" class="s-input">
              <option value="">Any Type</option>
              <option value="Apartment">Modern Apartment</option>
              <option value="Villa">Private Villa</option>
              <option value="Flat">Studio / Flat</option>
              <option value="House">Cozy House</option>
              <option value="Beach House">Beach House</option>
              <option value="Mountain Retreat">Mountain Retreat</option>
              <option value="City Apartment">City Loft</option>
              <option value="Countryside Villa">Countryside Villa</option>
              <option value="Luxury Estate">Luxury Estate</option>
            </select>
            <button class="prime-btn" (click)="onSearch()">Explorate</button>
          </div>
        </div>
      </section>

      <!-- Simple Listings -->
      <section class="v-container section">
        <div class="section-header">
          <h2>Featured Collection</h2>
          <a routerLink="/properties" class="text-link">View all properties</a>
        </div>
        
        <div class="clean-grid">
          <div *ngFor="let prop of topRated" class="clean-card" [routerLink]="['/properties', prop.id]">
            <div class="card-img-wrap">
              <img [src]="prop.images.length ? getFullUrl(prop.images[0].imageUrl) : 'https://placehold.co/400x300/fdfaf5/d4a373?text=Property'" [alt]="prop.title">
              <span class="price-tag">₹{{ prop.pricePerNight }}</span>
            </div>
            <div class="card-meta">
              <h3>{{ prop.title }}</h3>
              <p>📍 {{ prop.city }}, {{ prop.country }}</p>
              <div class="rating-strip">⭐ {{ prop.rating.toFixed(1) }}</div>
            </div>
          </div>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .v-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .minimal-hero { padding: 8rem 0 6rem; text-align: center; background: #fdfaf5; }
    .minimal-hero h1 { font-size: 3.5rem; font-weight: 300; letter-spacing: -1px; color: #444; margin-bottom: 1rem; }
    .highlight { color: #d4a373; font-weight: 600; }
    .subtitle { color: #888; font-size: 1.1rem; margin-bottom: 3rem; }
    
    .clean-search {
      display: inline-flex; align-items: center; border: 1px solid #e2e8f0;
      border-radius: 50px; padding: 5px 5px 5px 25px; background: #fff;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }
    .clean-search input { background: transparent; border: none; color: #444; outline: none; width: 200px; font-size: 0.95rem; }
    .clean-search select { background: transparent; border: none; color: #888; outline: none; padding-right: 20px; font-size: 0.9rem; cursor: pointer; }
    .prime-btn { 
      background: #d4a373; color: #fff; border: none; padding: 12px 30px; 
      border-radius: 50px; font-weight: 600; cursor: pointer; transition: 0.2s;
    }
    .prime-btn:hover { opacity: 0.9; transform: scale(1.02); }

    .section { margin: 6rem auto; }
    .section-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .section-header h2 { font-size: 1.75rem; color: #444; font-weight: 500; }
    .text-link { color: #d4a373; text-decoration: none; font-size: 0.9rem; font-weight: 500; border-bottom: 1px solid transparent; }
    .text-link:hover { border-bottom-color: #d4a373; }

    .clean-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 2rem; }
    .clean-card { cursor: pointer; transition: 0.3s; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f1f1f1; }
    .clean-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 4/3; }
    .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .price-tag { 
      position: absolute; bottom: 12px; left: 12px; background: #fff; color: #444;
      padding: 4px 10px; border-radius: 6px; font-weight: 700; font-size: 0.9rem; border: 1px solid #fdfaf5;
    }
    .card-meta { padding: 1rem; }
    .card-meta h3 { font-size: 1.1rem; color: #444; margin-bottom: 0.3rem; }
    .card-meta p { color: #888; font-size: 0.9rem; margin: 0; }
    .rating-strip { font-size: 0.85rem; color: #d4a373; margin-top: 0.5rem; }

  `]
})
export class HomeComponent implements OnInit {
  topRated: Property[] = [];
  categories: Category[] = [];
  searchCity = '';
  searchCheckIn = '';
  searchCheckOut = '';
  searchType = '';

  constructor(private propertyService: PropertyService) {}


  ngOnInit() {
    this.propertyService.getTopRated(6).subscribe(propList => {
      this.topRated = propList;
    });

    this.propertyService.getCategories().subscribe(catList => {
      this.categories = catList;
    });
  }

  getCategoryIcon(catName: string): string {
    const iconMap: Record<string, string> = {
      'Beach House': '🏖️',
      'Mountain Retreat': '🏔️',
      'City Apartment': '🏙️',
      'Countryside Villa': '🌿',
      'Luxury Estate': '💎'
    };
    return iconMap[catName] || '🏠';
  }

  onSearch() {
    const queryParams = new URLSearchParams();
    
    if (this.searchCity.trim()) {
      queryParams.set('city', this.searchCity.trim());
    }
    
    if (this.searchCheckIn) {
      queryParams.set('checkIn', this.searchCheckIn);
    }
    
    if (this.searchCheckOut) {
      queryParams.set('checkOut', this.searchCheckOut);
    }
    
    if (this.searchType) {
      queryParams.set('type', this.searchType);
    }

    const finalUrl = `/properties?${queryParams.toString()}`;
    window.location.href = finalUrl;
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.serverUrl}${path}`;
  }
}
