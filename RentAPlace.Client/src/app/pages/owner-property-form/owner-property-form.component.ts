import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../services/property.service';
import { Category, PropertyImage } from '../../models/models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-owner-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-page">
      <div class="v-container">
        <header class="page-header">
          <h1>{{ isEdit ? '✏️ Edit Property' : '🏠 Add New Property' }}</h1>
          <p class="subtitle">Complete the details below to list your boutique stay.</p>
        </header>

        <form (ngSubmit)="onSubmit()" class="creamy-form">
          <div class="form-grid">
            <div class="form-group full">
              <label>Stay Title</label>
              <input type="text" [(ngModel)]="propertyForm.title" name="title" placeholder="e.g., The Cozy Creek Villa" required>
            </div>

            <div class="form-group full">
              <label>Description</label>
              <textarea [(ngModel)]="propertyForm.description" name="description" rows="4" placeholder="Tell us about the property's charm..."></textarea>
            </div>

            <div class="form-group">
              <label>Street Address</label>
              <input type="text" [(ngModel)]="propertyForm.address" name="address" placeholder="123 Harmony St" required>
            </div>

            <div class="form-group">
              <label>City Location</label>
              <input type="text" [(ngModel)]="propertyForm.city" name="city" placeholder="City" required>
            </div>

            <div class="form-group">
              <label>Country / Region</label>
              <input type="text" [(ngModel)]="propertyForm.country" name="country" placeholder="Country" required>
            </div>

            <div class="form-group">
              <label>Nightly Rate (₹)</label>
              <input type="number" [(ngModel)]="propertyForm.pricePerNight" name="price" placeholder="0" required>
            </div>

            <div class="form-group full">
              <label>What kind of place is this?</label>
              <select [(ngModel)]="propertyForm.propertyType" name="type" required>
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
            </div>
          </div>

          <!-- Feature Selection (Humanized into Checkboxes) -->
          <div class="form-group full amenity-picker">
            <label>Amenities & Features</label>
            <div class="features-grid">
              <label *ngFor="let am of availableFeatures" class="feature-item">
                <input type="checkbox" [checked]="selectedAmenities.includes(am)" (change)="toggleAmenity(am)">
                <span>{{ am }}</span>
              </label>
            </div>
          </div>

          <!-- Image Upload with Limit Info -->
          <div class="form-group full upload-box" *ngIf="isEdit">
            <label>Gallery Photos (Supports Photos & Screenshots)</label>
            
            <!-- Existing Gallery Editor -->
            <div class="gallery-editor" *ngIf="existingImages.length > 0">
              <div class="gallery-item" *ngFor="let img of existingImages">
                <img [src]="getFullUrl(img.imageUrl)">
                <button type="button" class="del-overlay" (click)="deleteExistingImage(img.id)">✕</button>
              </div>
            </div>

            <div class="upload-controls">
              <div class="custom-upload-btn">
                <input type="file" (change)="onFileSelected($event)" accept="image/*" multiple #fileInput hidden>
                <button type="button" class="upload-trigger" (click)="fileInput.click()">
                  📸 Select Photos / Screenshots
                </button>
              </div>
              <span class="limit-info">Limit: 6 total</span>
            </div>
            
            <!-- Upload Queue / Feedback List -->
            <div class="upload-queue" *ngIf="uploadQueue.length > 0">
              <div class="queue-header">Upload Progress ({{ uploadQueue.length }} files)</div>
              <div class="queue-item" *ngFor="let item of uploadQueue">
                <span class="file-name">{{ item.name }}</span>
                <span class="file-status" [class]="item.status">
                  <ng-container [ngSwitch]="item.status">
                    <span *ngSwitchCase="'waiting'">⌛ Waiting...</span>
                    <span *ngSwitchCase="'uploading'">⏳ Uploading...</span>
                    <span *ngSwitchCase="'success'">✅ Done</span>
                    <span *ngSwitchCase="'error'">❌ Failed</span>
                  </ng-container>
                </span>
              </div>
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-strip">{{ errorMessage }}</div>

          <div class="form-footer">
            <button type="button" class="cancel-link" (click)="goBack()">Discard Changes</button>
            <button type="submit" class="submit-btn" [disabled]="isSaving">
              {{ isSaving ? 'Saving...' : (isEdit ? 'Update Listing' : 'Publish Property') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-page { padding: 4rem 1rem; background: #fdfaf5; min-height: 100vh; }
    .v-container { max-width: 850px; margin: 0 auto; }
    .page-header { margin-bottom: 3rem; text-align: center; }
    .page-header h1 { font-size: 2.2rem; color: #444; font-weight: 300; margin-bottom: 0.5rem; }
    .subtitle { color: #888; font-size: 1rem; }

    .creamy-form {
      background: #fff;
      border: 1px solid #e2e8f0;
      border-radius: 20px; padding: 3rem;
      box-shadow: 0 10px 40px rgba(0,0,0,0.03);
    }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; }
    .form-group.full { grid-column: 1 / -1; }
    .form-group label { display: block; color: #666; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.9rem; }
    
    .form-group input, .form-group select, .form-group textarea {
      width: 100%; padding: 0.8rem 1rem;
      background: #fdfaf5;
      border: 1px solid #e2e8f0;
      border-radius: 10px; color: #444; font-size: 1rem;
      outline: none; box-sizing: border-box;
      transition: all 0.2s;
    }
    .form-group textarea { resize: vertical; font-family: inherit; }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #d4a373; background: #fff; }
    
    .amenity-picker { padding-top: 1rem; border-top: 1px solid #f1f1f1; margin-top: 1rem; }
    .features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; background: #fdfaf5; padding: 1.5rem; border-radius: 12px; }
    .feature-item { display: flex; align-items: center; gap: 0.75rem; color: #666; font-size: 0.9rem; cursor: pointer; }
    .feature-item input { width: auto; accent-color: #d4a373; }

    .upload-box { padding-top: 2rem; border-top: 1px solid #f1f1f1; margin-top: 1rem; }
    .custom-upload-btn { display: flex; align-items: center; }
    .upload-trigger { background: #d4a373; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 0.9rem; }
    .upload-trigger:hover { background: #bc8a5f; }
    .limit-info { font-size: 0.75rem; color: #999; font-weight: 500; }

    /* Gallery Editor UI */
    .gallery-editor { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .gallery-item { position: relative; width: 100px; height: 80px; }
    .gallery-item img { width: 100%; height: 100%; object-fit: cover; border-radius: 8px; border: 1px solid #e2e8f0; }
    .del-overlay {
      position: absolute; top: -5px; right: -5px; 
      background: #bc4749; color: #fff; border: none; 
      width: 22px; height: 22px; border-radius: 50%;
      cursor: pointer; font-size: 0.7rem; font-weight: bold;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    .del-overlay:hover { transform: scale(1.1); background: #9b2226; }

    .upload-queue { margin-top: 1.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
    .queue-header { background: #fdfaf5; padding: 0.6rem 1rem; font-size: 0.8rem; font-weight: 700; color: #888; border-bottom: 1px solid #e2e8f0; }
    .queue-item { display: flex; justify-content: space-between; padding: 0.75rem 1rem; border-bottom: 1px solid #f1f1f1; font-size: 0.85rem; }
    .queue-item:last-child { border-bottom: none; }
    .file-name { color: #444; max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .file-status.uploading { color: #1e40af; font-weight: 600; }
    .file-status.success { color: #166534; font-weight: 600; }
    .file-status.error { color: #991b1b; font-weight: 600; }
  

    .error-strip { color: #bc4749; padding: 0.8rem; background: #f8d7da; border-radius: 10px; margin-bottom: 2rem; font-size: 0.9rem; }
    
    .form-footer { display: flex; gap: 2rem; justify-content: flex-end; align-items: center; margin-top: 2.5rem; }
    .cancel-link { background: transparent; border: none; color: #d4a373; font-weight: 600; cursor: pointer; font-size: 0.95rem; }
    .cancel-link:hover { text-decoration: underline; }
    
    .submit-btn {
      padding: 0.9rem 2.5rem;
      background: #d4a373;
      color: #fff; border: none; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.2s;
    }
    .submit-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 15px rgba(212, 163, 115, 0.3); }
    .submit-btn:disabled { opacity: 0.5; transform: none; box-shadow: none; cursor: not-allowed; }
  `]
})
export class OwnerPropertyFormComponent implements OnInit {
  isEdit = false;
  propertyId = 0;
  categories: Category[] = [];
  availableFeatures = ['Pool', 'Beach-facing', 'Garden', 'Gym', 'Spa', 'WiFi', 'Fireplace'];
  selectedAmenities: string[] = [];
  existingImages: PropertyImage[] = [];
  
  isSaving = false;
  errorMessage = '';
  uploadQueue: { name: string, status: 'waiting' | 'uploading' | 'success' | 'error' }[] = [];
  
  propertyForm: any = {
    title: '', 
    description: '', 
    address: '', 
    city: '', 
    country: '',
    pricePerNight: 0, 
    propertyType: 'Apartment', 
    categoryId: null
  };

  constructor(
    private pService: PropertyService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.pService.getCategories().subscribe(catList => this.categories = catList);

    const targetId = this.route.snapshot.paramMap.get('id');
    
    if (targetId && targetId !== 'new') {
      this.isEdit = true;
      this.propertyId = Number(targetId);
      
      this.pService.getById(this.propertyId).subscribe(details => {
        this.propertyForm = {
          title: details.title, 
          description: details.description,
          address: details.address, 
          city: details.city, 
          country: details.country,
          pricePerNight: details.pricePerNight, 
          propertyType: details.propertyType,
          categoryId: details.categoryId
        };
        this.selectedAmenities = details.features;
        this.existingImages = details.images;
      });
    }
  }

  getFullUrl(path: string): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${environment.serverUrl}${path}`;
  }

  deleteExistingImage(imgId: number) {
    if (!confirm('Remove this photo from your listing?')) return;
    
    this.pService.removeImage(imgId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(i => i.id !== imgId);
      },
      error: (err) => {
        this.errorMessage = "Failed to remove the image.";
      }
    });
  }

  toggleAmenity(amenityName: string) {
    const amenityIndex = this.selectedAmenities.indexOf(amenityName);
    if (amenityIndex > -1) {
      this.selectedAmenities.splice(amenityIndex, 1);
    } else {
      this.selectedAmenities.push(amenityName);
    }
  }

  onFileSelected(fileEvent: any) {
    const files = fileEvent.target.files as FileList;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      const queueObj = { name: f.name, status: 'waiting' as any };
      this.uploadQueue.push(queueObj);
      this.handleSingleUpload(f, queueObj);
    }
    
    fileEvent.target.value = '';
  }

  private handleSingleUpload(file: File, queueItem: any) {
    queueItem.status = 'uploading';
    
    this.pService.uploadImage(this.propertyId, file).subscribe({
      next: (newImg) => {
        queueItem.status = 'success';
        this.existingImages.push(newImg);
      },
      error: (err) => {
        queueItem.status = 'error';
      }
    });
  }

  onSubmit() {
    this.isSaving = true;
    this.errorMessage = '';
    
    const finalData = { ...this.propertyForm, features: this.selectedAmenities };

    if (this.isEdit) {
      this.pService.update(this.propertyId, finalData).subscribe({
        next: () => {
          this.finishAndRedirect();
        },
        error: (err) => { 
          this.isSaving = false; 
          this.errorMessage = err.error?.message || 'Failed to save changes.'; 
        }
      });
    } else {
      this.pService.create(finalData).subscribe({
        next: () => {
          this.finishAndRedirect();
        },
        error: (err) => { 
          this.isSaving = false; 
          this.errorMessage = err.error?.message || 'Failed to create listing.'; 
        }
      });
    }
  }

  private finishAndRedirect() {
    this.isSaving = false;
    this.router.navigate(['/owner/dashboard']);
  }

  goBack() {
    this.router.navigate(['/owner/dashboard']);
  }
}
