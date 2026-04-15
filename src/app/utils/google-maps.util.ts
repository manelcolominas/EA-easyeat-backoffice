export interface GoogleLocationData {
  city?: string;
  address?: string;
  googlePlaceId?: string;
  coordinates?: [number, number] | number[];
}

const GOOGLE_MAPS_BASE = 'https://www.google.com/maps';
const GOOGLE_MAPS_EMBED_BASE = 'https://www.google.com/maps/embed/v1/place';

export function isValidCoordinates(coordinates?: [number, number] | number[] | null): coordinates is [number, number] {
  if (!coordinates || coordinates.length < 2) {
    return false;
  }

  const [longitude, latitude] = coordinates;
  if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
    return false;
  }

  return longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90;
}

export function hasAnyLocationData(location?: GoogleLocationData | null): boolean {
  if (!location) {
    return false;
  }

  return Boolean(
    isValidCoordinates(location.coordinates) ||
    location.googlePlaceId?.trim() ||
    location.address?.trim() ||
    location.city?.trim()
  );
}

export function buildLocationQuery(location?: GoogleLocationData | null): string {
  if (!location) {
    return '';
  }

  if (location.googlePlaceId?.trim()) {
    return `place_id:${location.googlePlaceId.trim()}`;
  }

  if (isValidCoordinates(location.coordinates)) {
    const [longitude, latitude] = location.coordinates;
    return `${latitude},${longitude}`;
  }

  const text = [location.address?.trim(), location.city?.trim()].filter(Boolean).join(', ');
  return text;
}

export function buildGoogleMapsOpenUrl(location?: GoogleLocationData | null): string {
  const query = buildLocationQuery(location);
  if (!query) {
    return '';
  }

  const params = new URLSearchParams({ api: '1', query });
  return `${GOOGLE_MAPS_BASE}/search/?${params.toString()}`;
}

export function buildGoogleMapsDirectionsUrl(location?: GoogleLocationData | null): string {
  const destination = buildLocationQuery(location);
  if (!destination) {
    return '';
  }

  const params = new URLSearchParams({ api: '1', destination });
  return `${GOOGLE_MAPS_BASE}/dir/?${params.toString()}`;
}

export function buildGoogleMapsEmbedUrl(location?: GoogleLocationData | null, embedApiKey?: string): string {
  if (!location) {
    return '';
  }

  if (embedApiKey?.trim()) {
    const query = buildLocationQuery(location);
    if (!query) {
      return '';
    }

    const params = new URLSearchParams({
      key: embedApiKey.trim(),
      q: query,
    });

    return `${GOOGLE_MAPS_EMBED_BASE}?${params.toString()}`;
  }

  if (isValidCoordinates(location.coordinates)) {
    const [longitude, latitude] = location.coordinates;
    const params = new URLSearchParams({ q: `${latitude},${longitude}`, z: '15', output: 'embed' });
    return `${GOOGLE_MAPS_BASE}?${params.toString()}`;
  }

  const fallbackQuery = [location.address?.trim(), location.city?.trim()].filter(Boolean).join(', ');
  if (!fallbackQuery) {
    return '';
  }

  const params = new URLSearchParams({ q: fallbackQuery, output: 'embed' });
  return `${GOOGLE_MAPS_BASE}?${params.toString()}`;
}