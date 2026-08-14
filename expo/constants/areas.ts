/**
 * Known service areas (Freetown & surroundings) with approximate centre
 * coordinates, used to estimate the distance between a customer's area and a
 * trader's service areas.
 */
export interface ServiceArea {
  name: string;
  latitude: number;
  longitude: number;
}

export const SERVICE_AREAS: ServiceArea[] = [
  { name: 'Lumley', latitude: 8.4643, longitude: -13.2794 },
  { name: 'Model', latitude: 8.4824, longitude: -13.2413 },
  { name: 'Brookfields', latitude: 8.4779, longitude: -13.2624 },
  { name: 'Kissy', latitude: 8.4727, longitude: -13.2197 },
  { name: 'Waterloo', latitude: 8.3383, longitude: -13.0692 },
  { name: 'Hastings', latitude: 8.3803, longitude: -13.1363 },
];

export const SERVICE_AREA_NAMES: string[] = SERVICE_AREAS.map((a) => a.name);

function findArea(name: string): ServiceArea | undefined {
  const key = name.trim().toLowerCase();
  return SERVICE_AREAS.find((a) => a.name.toLowerCase() === key);
}

/** Great-circle distance in km between two named areas; null if either is unknown. */
export function areaDistanceKm(from?: string, to?: string): number | null {
  if (!from || !to) return null;
  const a = findArea(from);
  const b = findArea(to);
  if (!a || !b) return null;
  if (a.name === b.name) return 0;
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

/** Nearest distance in km from the customer's area to any of the trader's service areas. */
export function nearestAreaDistanceKm(customerArea: string | undefined, serviceAreas: string[]): number | null {
  let best: number | null = null;
  for (const area of serviceAreas) {
    const d = areaDistanceKm(customerArea, area);
    if (d !== null && (best === null || d < best)) best = d;
  }
  return best;
}

export function formatDistance(km: number): string {
  if (km < 1) return 'Nearby';
  return `${km.toFixed(1)} km away`;
}
