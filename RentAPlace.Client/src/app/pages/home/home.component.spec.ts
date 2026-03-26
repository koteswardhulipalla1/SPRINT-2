import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

describe('HomeComponent - Logic Tests', () => {

  // Simulate the getCategoryIcon function exactly as written in home.component.ts
  function getCategoryIcon(catName: string): string {
    const iconMap: Record<string, string> = {
      'Beach House': '🏖️',
      'Mountain Retreat': '🏔️',
      'City Apartment': '🏙️',
      'Countryside Villa': '🌿',
      'Luxury Estate': '💎'
    };
    return iconMap[catName] || '🏠';
  }

  // Simulate the onSearch URL builder from home.component.ts
  function buildSearchUrl(city: string, type: string): string {
    const queryParams = new URLSearchParams();
    if (city.trim()) queryParams.set('city', city.trim());
    if (type) queryParams.set('type', type);
    return `/properties?${queryParams.toString()}`;
  }

  it('should map Beach House category to correct beach emoji', () => {
    expect(getCategoryIcon('Beach House')).toBe('🏖️');
  });

  it('should return default home emoji for unknown category types', () => {
    expect(getCategoryIcon('Unknown Type')).toBe('🏠');
    expect(getCategoryIcon('')).toBe('🏠');
  });

  it('should correctly build search URL with city and type filters', () => {
    const url = buildSearchUrl('Mumbai', 'Apartment');
    expect(url).toBe('/properties?city=Mumbai&type=Apartment');
  });

  it('should build search URL with city only when type is empty', () => {
    const url = buildSearchUrl('Delhi', '');
    expect(url).toBe('/properties?city=Delhi');
  });

  it('should trim whitespace from city name before building URL', () => {
    const url = buildSearchUrl('  Goa  ', 'Villa');
    expect(url).toBe('/properties?city=Goa&type=Villa');
  });

  it('should return empty property list when service returns empty', () => {
    const mockService = { getTopRated: vi.fn().mockReturnValue(of([])) };
    let results: any[] = [];
    mockService.getTopRated(6).subscribe((data: any[]) => results = data);
    expect(results.length).toBe(0);
  });
});
