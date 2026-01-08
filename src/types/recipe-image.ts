/**
 * Recipe Image model (Unsplash-backed)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RecipeImage {
  provider: 'unsplash';
  photoId: string;
  urlSmall: string;
  urlRegular: string;
  urlFull: string;
  alt: string;
  creditName: string;
  creditUsername: string;
  creditUrl: string;
  sourceUrl: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build attribution URLs for an Unsplash photo.
 * @param photo - Unsplash photo object from API
 * @param utmSource - Your app name for UTM tracking (e.g., "recipe-lab")
 */
export function buildUnsplashAttribution(
  photo: {
    id: string;
    user: { name: string; username: string };
    links: { html: string };
  },
  utmSource: string
) {
  const base = `https://unsplash.com`;
  const utm = `?utm_source=${utmSource}&utm_medium=referral&utm_campaign=api-credit`;

  const creditUrl = `${base}/@${photo.user.username}${utm}`;
  const sourceUrl = `${photo.links.html}${utm}`;

  return {
    creditUrl,
    sourceUrl,
  };
}

/**
 * Convert Unsplash API response to RecipeImage.
 * @param photo - Unsplash photo object
 * @param utmSource - Your app name for UTM tracking
 */
export function toRecipeImage(
  photo: {
    id: string;
    alt_description: string | null;
    urls: { small: string; regular: string; full: string };
    user: { name: string; username: string };
    links: { html: string };
  },
  utmSource: string
): RecipeImage {
  const { creditUrl, sourceUrl } = buildUnsplashAttribution(photo, utmSource);

  return {
    provider: 'unsplash',
    photoId: photo.id,
    urlSmall: photo.urls.small,
    urlRegular: photo.urls.regular,
    urlFull: photo.urls.full,
    alt: photo.alt_description ?? '',
    creditName: photo.user.name,
    creditUsername: photo.user.username,
    creditUrl,
    sourceUrl,
  };
}

// ---------------------------------------------------------------------------
// Example JSON
// ---------------------------------------------------------------------------

/**
 * Example RecipeImage objects
 */
export const exampleRecipeImages: RecipeImage[] = [
  {
    provider: 'unsplash',
    photoId: 'abc123def',
    urlSmall: 'https://images.unsplash.com/photo-abc123def?w=400',
    urlRegular: 'https://images.unsplash.com/photo-abc123def?w=1080',
    urlFull: 'https://images.unsplash.com/photo-abc123def',
    alt: 'A vibrant bowl of fresh salad',
    creditName: 'Jane Doe',
    creditUsername: 'janedoe',
    creditUrl: 'https://unsplash.com/@janedoe?utm_source=recipe-lab&utm_medium=referral&utm_campaign=api-credit',
    sourceUrl: 'https://unsplash.com/photos/abc123def?utm_source=recipe-lab&utm_medium=referral&utm_campaign=api-credit',
  },
  {
    provider: 'unsplash',
    photoId: 'xyz789uvw',
    urlSmall: 'https://images.unsplash.com/photo-xyz789uvw?w=400',
    urlRegular: 'https://images.unsplash.com/photo-xyz789uvw?w=1080',
    urlFull: 'https://images.unsplash.com/photo-xyz789uvw',
    alt: 'Freshly baked sourdough loaf',
    creditName: 'John Smith',
    creditUsername: 'johnsmith',
    creditUrl: 'https://unsplash.com/@johnsmith?utm_source=recipe-lab&utm_medium=referral&utm_campaign=api-credit',
    sourceUrl: 'https://unsplash.com/photos/xyz789uvw?utm_source=recipe-lab&utm_medium=referral&utm_campaign=api-credit',
  },
];

/**
 * Example: How to embed into a Recipe model
 */
export interface RecipeWithImages {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  prepTimeMinutes?: number;
  cookTimeMinutes?: number;
  servings?: number;
  tags?: string[];
  images?: RecipeImage[]; // 1–3 images per recipe
  createdAt: string;
  updatedAt: string;
}

// Placeholder for Ingredient if not already imported elsewhere
export interface Ingredient {
  quantity: number;
  unit: string;
  name: string;
  note?: string;
}
