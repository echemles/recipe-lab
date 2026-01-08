/**
 * Minimal Unsplash API wrapper using native fetch.
 * Server-side only.
 */

import { env } from './env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnsplashUser {
  name: string;
  username: string;
}

export interface UnsplashUrls {
  raw: string;
  full: string;
  regular: string;
  small: string;
  thumb: string;
}

export interface UnsplashLinks {
  html: string;
  download_location: string;
}

export interface UnsplashPhoto {
  id: string;
  alt_description: string | null;
  urls: UnsplashUrls;
  user: UnsplashUser;
  links: UnsplashLinks;
}

export interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

export interface UnsplashApiError {
  type: 'UnsplashApiError';
  status: number;
  message: string;
  details?: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createApiUrl(endpoint: string, params: Record<string, string | number>): string {
  const url = new URL(`https://api.unsplash.com${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, String(value));
  });
  return url.toString();
}

function createHeaders(): Record<string, string> {
  return {
    Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
    'Accept-Version': 'v1',
  };
}

function handleApiError(res: Response, data: unknown): never {
  const error: UnsplashApiError = {
    type: 'UnsplashApiError',
    status: res.status,
    message: `Unsplash API error: ${res.status} ${res.statusText}`,
    details: data,
  };
  throw error;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface SearchPhotosParams {
  query: string;
  page?: number;
  perPage?: number;
  orientation?: 'landscape' | 'portrait' | 'squarish';
}

/**
 * Search photos on Unsplash.
 * @throws {UnsplashApiError} on non-2xx responses
 */
export async function searchPhotos({
  query,
  page = 1,
  perPage = 10,
  orientation,
}: SearchPhotosParams): Promise<UnsplashSearchResponse> {
  const params: Record<string, string | number> = {
    query,
    page,
    per_page: perPage,
  };
  if (orientation) params.orientation = orientation;

  const url = createApiUrl('/search/photos', params);
  const headers = createHeaders();

  const res = await fetch(url, { headers });

  if (!res.ok) {
    let data: unknown;
    try {
      data = await res.json();
    } catch {
      data = null;
    }
    handleApiError(res, data);
  }

  const data: UnsplashSearchResponse = await res.json();
  return data;
}
