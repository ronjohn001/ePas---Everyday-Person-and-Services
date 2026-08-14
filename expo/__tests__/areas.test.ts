import { describe, expect, it } from '@jest/globals';

import {
  SERVICE_AREA_NAMES,
  areaDistanceKm,
  formatDistance,
  nearestAreaDistanceKm,
} from '@/constants/areas';

/** The six supported Freetown areas and the distance helpers behind search ranking. */

describe('service areas', () => {
  it('exposes exactly the six supported areas', () => {
    expect(SERVICE_AREA_NAMES).toEqual(['Lumley', 'Model', 'Brookfields', 'Kissy', 'Waterloo', 'Hastings']);
  });

  it('returns 0 for the same area (case-insensitive) and null for unknown areas', () => {
    expect(areaDistanceKm('Lumley', 'lumley')).toBe(0);
    expect(areaDistanceKm('Lumley', 'Nowhere')).toBeNull();
    expect(areaDistanceKm(undefined, 'Kissy')).toBeNull();
  });

  it('estimates cross-town distances on a sane scale (Lumley ↔ Waterloo ≈ 27 km)', () => {
    const d = areaDistanceKm('Lumley', 'Waterloo');
    expect(d).not.toBeNull();
    expect(d!).toBeGreaterThan(15);
    expect(d!).toBeLessThan(35);
  });

  it("nearestAreaDistanceKm picks the closest of a trader's service areas", () => {
    const d = nearestAreaDistanceKm('Brookfields', ['Waterloo', 'Model']);
    expect(d).toBe(areaDistanceKm('Brookfields', 'Model'));
  });

  it('returns null when no areas are comparable', () => {
    expect(nearestAreaDistanceKm('Lumley', [])).toBeNull();
    expect(nearestAreaDistanceKm(undefined, ['Kissy'])).toBeNull();
  });

  it('formatDistance renders friendly labels', () => {
    expect(formatDistance(0)).toBe('Nearby');
    expect(formatDistance(6.24)).toBe('6.2 km away');
  });
});
