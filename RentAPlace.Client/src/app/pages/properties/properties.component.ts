import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Property, Category } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="prop-v2">
      <div class="v-container">
        <!-- Minimal Filter Strip -->
        <div class="filter-strip">
          <input type="text" [(ngModel)]="searchFilters.city" placeholder="City" class="s-input">
          <select [(ngModel)]="searchFilters.propertyType" class="s-input">
            <option value="">All Styles</option>
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
          <input type="number" [(ngModel)]="searchFilters.minPrice" placeholder="Min ₹" class="s-input small">
          <input type="number" [(ngModel)]="searchFilters.maxPrice" placeholder="Max ₹" class="s-input small">
          <select [(ngModel)]="sortOption" (change)="runSearch()" class="s-input">
            <option value="rating_desc">Top Rated</option>
            <option value="title_asc">Title A-Z</option>
            <option value="price_asc">Price: Low-High</option>
            <option value="price_desc">Price: High-Low</option>
          </select>
          <button class="prime-btn" (click)="runSearch()">Search</button>
        </div>

        <div class="feature-pills">
          <span *ngFor="let am of availableFeatures" 
                class="pill" 
                [class.active]="selectedAmenities.includes(am)"
                (click)="toggleAmenity(am); runSearch()">{{ am }}</span>
        </div>

        <!-- Dynamic Grid -->
        <div class="clean-grid" *ngIf="properties.length">
          <div *ngFor="let prop of properties" class="clean-card" [routerLink]="['/properties', prop.id]">
            <div class="card-img-wrap">
              <img [src]="prop.images.length ? getFullUrl(prop.images[0].imageUrl) : 'https://placehold.co/400x300/fdfaf5/d4a373?text=Property'" [alt]="prop.title">
              <div class="card-meta-float">
                <span class="type-badge">{{ prop.propertyType }}</span>
                <span class="rate-badge">⭐ {{ prop.rating.toFixed(1) }}</span>
              </div>
            </div>
            <div class="card-details">
              <h3>{{ prop.title }}</h3>
              <div class="card-sub">📍 {{ prop.city }}, {{ prop.country }}</div>
              <div class="card-price">₹{{ prop.pricePerNight }} <small>/ night</small></div>
            </div>
          </div>
        </div>

        <div *ngIf="!properties.length" class="empty-state">
          <p>No matches found. Try clearing your filters.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .prop-v2 { padding: 3rem 0; background: #fdfaf5; }
    .v-container { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; }
    .filter-strip {
      display: flex; gap: 0.75rem; background: #fff; padding: 0.75rem;
      border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;
      align-items: center; flex-wrap: wrap; box-shadow: 0 4px 6px rgba(0,0,0,0.02);
    }
    .s-input {
      background: #fdfaf5; border: 1px solid #e2e8f0; color: #444;
      padding: 0.6rem 1rem; border-radius: 8px; outline: none; font-size: 0.9rem;
    }
    .s-input.small { width: 100px; }
    .prime-btn {
      background: #d4a373; color: #fff; border: none; padding: 0.6rem 1.5rem;
      border-radius: 8px; font-weight: 600; cursor: pointer;
    }
    .feature-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 3rem; }
    .pill {
      background: #fff; color: #888; padding: 4px 12px; border-radius: 20px;
      font-size: 0.8rem; cursor: pointer; transition: 0.2s; border: 1px solid #e2e8f0;
    }
    .pill:hover { background: #fdfaf5; }
    .pill.active { background: #faedcd; color: #d4a373; border-color: #d4a373; }

    .clean-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 2rem; }
    .clean-card { cursor: pointer; transition: 0.3s; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #f1f1f1; }
    .clean-card:hover { transform: translateY(-5px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
    .card-img-wrap { position: relative; overflow: hidden; aspect-ratio: 16/10; }
    .card-img-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .card-meta-float { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; }
    .type-badge { background: rgba(255,255,255,0.8); color: #444; padding: 2px 8px; border-radius: 4px; font-size: 0.7rem; font-weight: 600; backdrop-filter: blur(4px); }
    .rate-badge { background: #fff; color: #d4a373; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700; border: 1px solid #fdfaf5; }
    
    .card-details { padding: 1rem; }
    .card-details h3 { font-size: 1.1rem; color: #444; margin-bottom: 0.2rem; }
    .card-sub { color: #888; font-size: 0.85rem; margin-bottom: 0.5rem; }
    .card-price { font-weight: 700; color: #444; font-size: 1.1rem; }
    .card-price small { font-weight: 400; color: #888; font-size: 0.8rem; }
    .empty-state { text-align: center; padding: 5rem; color: #888; }
  `]
})
  // PropertiesComponent - Handles the list view and advanced filtering
  export class PropertiesComponent implements OnInit {
    // State variables for properties and view settings
    properties: Property[] = [];
    categories: Category[] = [];
    currentView = 'grid'; // Defaulting to grid view
    sortOption = 'rating_desc';
    
    // Filtering states
    selectedAmenities: string[] = [];
    availableFeatures = ['Pool', 'Beach-facing', 'Garden', 'Gym', 'Spa', 'WiFi', 'Fireplace'];
    searchFilters: any = { 
      city: '', 
      propertyType: '', 
      checkIn: '', 
      checkOut: '', 
      minPrice: null, 
      maxPrice: null 
    };
  
    constructor(private pService: PropertyService, private route: ActivatedRoute) {}
  
    ngOnInit() {
      // Check for incoming search params from the homepage search bar
      this.route.queryParams.subscribe(urlParams => {
        if (urlParams['city']) this.searchFilters.city = urlParams['city'];
        if (urlParams['type']) this.searchFilters.propertyType = urlParams['type'];
        if (urlParams['checkIn']) this.searchFilters.checkIn = urlParams['checkIn'];
        if (urlParams['checkOut']) this.searchFilters.checkOut = urlParams['checkOut'];
        
        // Initial search run
        this.runSearch();
      });
    }
  
    // Simple toggle logic for the amenity pills
    toggleAmenity(featureName: string) {
      const idx = this.selectedAmenities.indexOf(featureName);
      if (idx !== -1) {
        this.selectedAmenities.splice(idx, 1);
      } else {
        this.selectedAmenities.push(featureName);
      }
    }
  
    // Main search function that calls the backend API
    runSearch() {
      console.log("Applying filters and fetching properties...");
  
      // Parse the sort option (e.g., 'price_asc' -> 'price', false)
      const sortParts = this.sortOption.split('_');
      const sortField = sortParts[0];
      const isDescending = sortParts[1] === 'desc';
  
      // Construct the search payload for the service
      const searchCriteria: any = { 
        sortBy: sortField, 
        sortDescending: isDescending 
      };
  
      // Add optional filters only if they have values
      if (this.searchFilters.city) searchCriteria.city = this.searchFilters.city;
      if (this.searchFilters.propertyType) searchCriteria.propertyType = this.searchFilters.propertyType;
      if (this.searchFilters.minPrice) searchCriteria.minPrice = this.searchFilters.minPrice;
      if (this.searchFilters.maxPrice) searchCriteria.maxPrice = this.searchFilters.maxPrice;
      
      // Feature list
      if (this.selectedAmenities.length > 0) {
        searchCriteria.features = this.selectedAmenities;
      }
  
      // Call the service and update our local list
      this.pService.search(searchCriteria).subscribe(results => {
        this.properties = results;
      });
    }

    // Helper for absolute image URL
    getFullUrl(path: string): string {
      if (!path) return '';
      if (path.startsWith('http')) return path;
      return `${environment.serverUrl}${path}`;
    }
  }
