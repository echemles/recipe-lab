import { execSync } from 'child_process';
import { config } from 'dotenv';

config({ path: '.env.local' });

export const SEED_RECIPES = {
  alpha: {
    title: 'Test Recipe Alpha',
  },
  beta: {
    title: 'Test Recipe Beta',
  },
};

export function resetTestDatabase(): void {
  execSync('NODE_ENV=test npx tsx scripts/test-db-setup.ts', {
    stdio: 'pipe',
    env: {
      ...process.env,
      PLAYWRIGHT_TEST: 'true',
      MONGODB_URI: process.env.MONGODB_URI,
      MONGODB_DB: process.env.MONGODB_DB,
      MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
      MONGODB_DB_TEST: process.env.MONGODB_DB_TEST,
    },
  });
}
