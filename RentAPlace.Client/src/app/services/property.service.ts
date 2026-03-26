import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property, CreateProperty, UpdateProperty, PropertySearch, Category } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PropertyService {
  private apiUrl = `${environment.apiUrl}/properties`;
  private categoriesUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Property[]> {
    return this.http.get<Property[]>(this.apiUrl);
  }

  getById(id: number): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  getTopRated(count: number = 10): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/top-rated?count=${count}`);
  }

  getTopRatedByCategory(categoryId: number, count: number = 5): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/top-rated/category/${categoryId}?count=${count}`);
  }

  search(criteria: PropertySearch): Observable<Property[]> {
    return this.http.post<Property[]>(`${this.apiUrl}/search`, criteria);
  }

  getMyProperties(): Observable<Property[]> {
    return this.http.get<Property[]>(`${this.apiUrl}/owner`);
  }

  create(data: CreateProperty): Observable<Property> {
    return this.http.post<Property>(this.apiUrl, data);
  }

  update(id: number, data: UpdateProperty): Observable<Property> {
    return this.http.put<Property>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  uploadImage(propertyId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${propertyId}/images`, formData);
  }

  removeImage(imgId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/images/${imgId}`);
  }

  rate(propId: number, userVal: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${propId}/rate`, { userValue: userVal });
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesUrl);
  }
}
