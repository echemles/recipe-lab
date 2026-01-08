import { NextRequest, NextResponse } from 'next/server';
import { searchPhotos, UnsplashApiError } from '@/lib/unsplash';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidQuery(query: unknown): query is string {
  return typeof query === 'string' && query.trim().length >= 2;
}

function clampPerPage(value: unknown): number {
  const num = Number(value);
  if (Number.isNaN(num) || num < 1) return 10;
  if (num > 30) return 30;
  return num;
}

// ---------------------------------------------------------------------------
// API Route (App Router)
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const perPageRaw = searchParams.get('perPage');

  // Validate input
  if (!isValidQuery(query)) {
    return NextResponse.json(
      { error: 'Invalid query: must be at least 2 characters' },
      { status: 400 }
    );
  }

  const perPage = clampPerPage(perPageRaw);

  try {
    const response = await searchPhotos({
      query,
      page: 1,
      perPage,
      orientation: undefined, // allow any orientation
    });

    // Transform to UI-lean payload
    const results = response.results.map((photo) => ({
      id: photo.id,
      alt: photo.alt_description ?? '',
      urls: photo.urls,
      user: photo.user,
      links: photo.links,
    }));

    // Short cache TTL for search results
    const cacheHeaders = {
      'Cache-Control': 'public, max-age=60, s-maxage=60',
      'CDN-Cache-Control': 'public, max-age=60',
      'Vercel-CDN-Cache-Control': 'public, max-age=60',
    };

    return NextResponse.json(
      { total: response.total, total_pages: response.total_pages, results },
      { headers: cacheHeaders }
    );
  } catch (err) {
    console.error('Unsplash search error:', err);

    if (err instanceof Error && (err as unknown as UnsplashApiError).type === 'UnsplashApiError') {
      const apiError = err as unknown as UnsplashApiError;
      // Forward Unsplash API errors with status
      return NextResponse.json(
        { error: apiError.message, details: apiError.details },
        { status: apiError.status }
      );
    }

    // Generic fallback
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------------------------
// Optional: Static method export for Pages Router compatibility
// ---------------------------------------------------------------------------

/*
// If you were using Pages Router, the file would be:
// src/pages/api/unsplash/search.ts
// and you would export a default handler instead:

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { query, perPage } = req.query;

  // Validation and clamping as above...
  // Call searchPhotos and return JSON with res.status() and res.json()
}
*/
