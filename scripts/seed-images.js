#!/usr/bin/env node

/**
 * Seed script to enrich recipes in MongoDB with Unsplash images.
 * Usage: node scripts/seed-images.js [options]
 */

require('dotenv').config({ path: '.env.local' });
const { writeFile, readFile } = require('fs/promises');
const { join } = require('path');

// ---------------------------------------------------------------------------
// Simple fetch wrapper for Node 18+
// ---------------------------------------------------------------------------

async function fetch(url, options = {}) {
  const nodeFetch = globalThis.fetch || require('node-fetch');
  return nodeFetch(url, options);
}

// ---------------------------------------------------------------------------
// Types (simplified for JS)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    switch (flag) {
      case '--utm-source':
        options.utmSource = args[++i];
        break;
      case '--per-page':
        options.perPage = Number(args[++i]);
        break;
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--skip-existing':
        options.skipExisting = true;
        break;
      case '--limit':
        options.limit = Number(args[++i]);
        break;
      case '--offset':
        options.offset = Number(args[++i]);
        break;
      default:
        if (flag.startsWith('--')) {
          throw new Error(`Unknown flag: ${flag}`);
        }
    }
  }

  return {
    utmSource: options.utmSource ?? 'recipe-lab',
    perPage: options.perPage ?? 10,
    dryRun: options.dryRun ?? false,
    skipExisting: options.skipExisting ?? false,
    limit: Number.isFinite(options.limit) ? Number(options.limit) : undefined,
    offset: Number.isFinite(options.offset) ? Number(options.offset) : 0,
  };
}

/**
 * Generate 2 varied queries per recipe for hero/ingredient diversity.
 */
function generateQueries(recipe) {
  const queries = [];
  
  // Query 1: Hero shot - main dish/title
  queries.push(recipe.title.replace(/\s*\(.*?\)\s*/g, '').trim());
  
  // Query 2: Main ingredient (if available)
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const mainIngredient = recipe.ingredients[0].name;
    queries.push(mainIngredient);
  } else {
    // Fallback to generic food query
    queries.push('delicious food');
  }
  
  return queries.slice(0, 2);
}

/**
 * Sleep for ms.
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff.
 */
async function retryWithBackoff(fn, retries = 3, baseDelay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const isRetryable = err?.type === 'UnsplashApiError' &&
        (err.status === 429 || (err.status >= 500 && err.status < 600));
      if (!isRetryable) throw err;
      const delay = baseDelay * 2 ** i;
      console.warn(`  ⚠️  Retry ${i + 1}/${retries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Search photos on Unsplash.
 */
async function searchPhotos({ query, page = 1, perPage = 10, orientation }) {
  const params = new URLSearchParams({
    query,
    page: page.toString(),
    per_page: perPage.toString(),
  });
  if (orientation) params.append('orientation', orientation);

  const url = `https://api.unsplash.com/search/photos?${params}`;
  const headers = {
    Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`,
    'Accept-Version': 'v1',
  };

  const res = await fetch(url, { headers });

  if (!res.ok) {
    let data = null;
    try {
      data = await res.json();
    } catch {}
    const error = new Error(`Unsplash API error: ${res.status} ${res.statusText}`);
    error.type = 'UnsplashApiError';
    error.status = res.status;
    error.details = data;
    throw error;
  }

  return res.json();
}

/**
 * Convert Unsplash photo to RecipeImage format.
 */
function toRecipeImage(photo, utmSource) {
  const base = `https://unsplash.com`;
  const utm = `?utm_source=${utmSource}&utm_medium=referral&utm_campaign=api-credit`;

  const creditUrl = `${base}/@${photo.user.username}${utm}`;
  const sourceUrl = `${photo.links.html}${utm}`;

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

/**
 * Fire-and-forget download tracking.
 */
async function triggerDownload(downloadLocation) {
  try {
    await fetch(downloadLocation, {
      method: 'GET',
      headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
    });
  } catch {
    // Silently ignore tracking failures
  }
}

/**
 * MongoDB connection and operations
 */
class RecipeStore {
  constructor() {
    this.MongoClient = require('mongodb').MongoClient;
    this.ObjectId = require('mongodb').ObjectId;
  }

  async connect() {
    const uri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB || 'recipe_lab';
    this.client = new this.MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db(dbName);
    this.collection = this.db.collection('recipes');
  }

  async getAllRecipes() {
    const docs = await this.collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(doc => ({
      ...doc,
      id: doc._id.toHexString(),
    }));
  }

  async updateRecipeWithImages(id, images) {
    let objectId;
    try {
      // Handle both string IDs and ObjectId instances
      objectId = this.ObjectId.isValid(id) ? new this.ObjectId(id) : null;
      if (!objectId) {
        console.error(`Invalid ObjectId: ${id}`);
        return null;
      }
    } catch (err) {
      console.error(`Error creating ObjectId from ${id}:`, err);
      return null;
    }

    const now = new Date().toISOString();

    const result = await this.collection.findOneAndUpdate(
      { _id: objectId },
      { 
        $set: { 
          images: images.slice(0, 3), // Cap at 3 images
          updatedAt: now 
        } 
      },
      { returnDocument: 'after' }
    );

    return result ? {
      ...result,
      id: result._id.toHexString()
    } : null;
  }

  async close() {
    if (this.client) {
      await this.client.close();
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();
  const store = new RecipeStore();

  try {
    await store.connect();
    console.log(`🔎 Loading recipes from database...`);
    const recipes = await store.getAllRecipes();
    console.log(`📚 Found ${recipes.length} recipes to process\n`);

    const startIndex = Math.max(0, opts.offset || 0);
    const endIndex =
      opts.limit && opts.limit > 0
        ? Math.min(recipes.length, startIndex + opts.limit)
        : recipes.length;
    const targetRecipes = recipes.slice(startIndex, endIndex);

    if (opts.limit) {
      console.log(
        `📦 Processing subset ${startIndex + 1}–${endIndex} of ${recipes.length} recipes\n`
      );
    }

    for (let i = 0; i < targetRecipes.length; i++) {
      const recipe = targetRecipes[i];
      const absoluteIndex = startIndex + i + 1;
      console.log(`[${absoluteIndex}/${recipes.length}] ${recipe.title}`);

      if (opts.skipExisting && recipe.images && recipe.images.length > 0) {
        console.log('  ⏩ Skipping: images already present\n');
        continue;
      }

      const queries = generateQueries(recipe);
      const images = [];
      const usedIds = new Set();

      for (const query of queries) {
        console.log(`  🔍 Query: "${query}"`);
        
        try {
          const response = await retryWithBackoff(() =>
            searchPhotos({ query, page: 1, perPage: opts.perPage })
          );
          
          const top = response.results.find((photo) => !usedIds.has(photo.id));
          if (!top) {
            console.log('  ⚠️  No unique result; skipping this query');
            await sleep(250 + Math.random() * 250);
            continue;
          }
          
          usedIds.add(top.id);
          const img = toRecipeImage(top, opts.utmSource);
          images.push(img);
          console.log(`  ✅ Selected: ${top.id} – ${top.alt_description ?? '(no alt)'}`);
          
          // Fire-and-forget download tracking
          void triggerDownload(top.links.download_location);
          
          // Rate limit: 250-500ms
          await sleep(250 + Math.random() * 250);
        } catch (err) {
          console.error(`  ❌ Error searching for "${query}":`, err);
        }
      }

      if (!opts.dryRun && images.length > 0) {
        const updated = await store.updateRecipeWithImages(recipe.id, images);
        if (updated) {
          console.log(`  💾 Saved ${images.length} images to database`);
        } else {
          console.log(`  ❌ Failed to save images to database`);
        }
      } else if (opts.dryRun) {
        console.log(`  📷 ${images.length} images would be saved (dry run)`);
      }
      
      console.log(`  📷 ${images.length} images selected\n`);
    }

    if (!opts.dryRun) {
      console.log('✅ All recipes processed and saved to database');
    } else {
      console.log('🏁 Dry run complete – no database changes made');
    }
  } finally {
    await store.close();
  }
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
