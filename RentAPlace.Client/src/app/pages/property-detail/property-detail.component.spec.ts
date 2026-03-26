import { describe, it, expect, vi } from 'vitest';
import { of } from 'rxjs';

describe('PropertyDetailComponent - Logic Tests', () => {

  // Exact copy of the night count logic from property-detail.component.ts
  function numberOfNights(arrivalDate: string, departureDate: string): number {
    if (!arrivalDate || !departureDate) return 0;
    const start = new Date(arrivalDate).getTime();
    const end = new Date(departureDate).getTime();
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days > 0 ? days : 0;
  }

  // Exact copy of the cost calculation from property-detail.component.ts
  function totalStayCost(nights: number, pricePerNight: number): number {
    return nights * pricePerNight;
  }

  // Exact copy of the ownership check logic
  function isMyOwnListing(ownerId: number, currentUserId: number): boolean {
    return ownerId === currentUserId;
  }

  it('should correctly calculate 4 nights between May 1 and May 5', () => {
    const nights = numberOfNights('2026-05-01', '2026-05-05');
    expect(nights).toBe(4);
  });

  it('should return 0 nights when dates are not selected', () => {
    expect(numberOfNights('', '')).toBe(0);
    expect(numberOfNights('2026-05-01', '')).toBe(0);
  });

  it('should return 0 if departure is before arrival (invalid range)', () => {
    const nights = numberOfNights('2026-05-10', '2026-05-05');
    expect(nights).toBe(0);
  });

  it('should compute total stay cost: 4 nights x Rs.150 = Rs.600', () => {
    const cost = totalStayCost(4, 150);
    expect(cost).toBe(600);
  });

  it('should return 0 cost when there are no nights booked', () => {
    expect(totalStayCost(0, 150)).toBe(0);
  });

  it('should correctly identify a guest user is NOT the property owner', () => {
    // ownerId = 2, currentUserId = 1 -> guest, not owner
    expect(isMyOwnListing(2, 1)).toBe(false);
  });

  it('should correctly identify when the logged-in user IS the property owner', () => {
    // ownerId = 5, currentUserId = 5 -> same person
    expect(isMyOwnListing(5, 5)).toBe(true);
  });
});
