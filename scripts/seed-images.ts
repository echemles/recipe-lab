/**
 * Seed script to enrich recipes in MongoDB with Unsplash images.
 * Usage: tsx scripts/seed-images.ts [options]
 */

import { getAllRecipes, updateRecipeWithImages } from '../src/data/recipeStore';
import { searchPhotos } from '../src/lib/unsplash';
import type { UnsplashApiError } from '../src/lib/unsplash';
import { toRecipeImage } from '../src/types/recipe-image';
import { env } from '../src/lib/env';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CliOptions {
  utmSource: string;
  perPage: number;
  dryRun: boolean;
  skipExisting: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseArgs(): CliOptions {
  const args = process.argv.slice(2);
  const options: Partial<CliOptions> = {};

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
  };
}

/**
 * Generate 3 varied queries per recipe for hero/ingredient/context diversity.
 */
function generateQueries(recipe: import('../src/types/recipe').Recipe): string[] {
  const queries: string[] = [];
  
  // Query 1: Hero shot - main dish/title
  queries.push(recipe.title.replace(/\s*\(.*?\)\s*/g, '').trim());
  
  // Query 2: Main ingredient (if available)
  if (recipe.ingredients.length > 0) {
    const mainIngredient = recipe.ingredients[0].name;
    queries.push(mainIngredient);
  }
  
  // Query 3: Context/style from tags or description
  if (recipe.tags && recipe.tags.length > 0) {
    const contextTag = recipe.tags.find(t => 
      !['test', 'simple', 'quick'].includes(t.toLowerCase())
    ) || recipe.tags[0];
    queries.push(`${contextTag} food`);
  } else {
    // Fallback to ingredient combination
    if (recipe.ingredients.length >= 2) {
      queries.push(`${recipe.ingredients[0].name} ${recipe.ingredients[1].name}`);
    } else {
      queries.push('delicious food');
    }
  }
  
  return queries.slice(0, 3);
}

/**
 * Sleep for ms.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff.
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3,
  baseDelay = 500
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === retries - 1) throw err;
      const apiErr = err as any;
      const isRetryable =
        apiErr?.type === 'UnsplashApiError' &&
        (apiErr.status === 429 || (apiErr.status >= 500 && apiErr.status < 600));
      if (!isRetryable) throw err;
      const delay = baseDelay * 2 ** i;
      console.warn(`  ⚠️  Retry ${i + 1}/${retries} after ${delay}ms...`);
      await sleep(delay);
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Fire-and-forget download tracking.
 */
async function triggerDownload(downloadLocation: string): Promise<void> {
  try {
    await fetch(downloadLocation, {
      method: 'GET',
      headers: { Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}` },
    });
  } catch {
    // Silently ignore tracking failures
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const opts = parseArgs();

  console.log(`� Loading recipes from database...`);
  const recipes = await getAllRecipes();
  console.log(`� Found ${recipes.length} recipes to process\n`);

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    console.log(`[${i + 1}/${recipes.length}] ${recipe.title}`);

    if (opts.skipExisting && recipe.images && recipe.images.length > 0) {
      console.log('  ⏩ Skipping: images already present\n');
      continue;
    }

    const queries = generateQueries(recipe);
    const images: import('../src/types/recipe-image').RecipeImage[] = [];
    const usedIds = new Set<string>();

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
      const updated = await updateRecipeWithImages(recipe.id, images);
      if (updated) {
        console.log(`  � Saved ${images.length} images to database`);
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
}

main().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});
