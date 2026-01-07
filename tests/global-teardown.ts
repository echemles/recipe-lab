import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Cleaning up test database...');
  
  try {
    // Clean up test database after all tests
    execSync('NODE_ENV=test npx tsx scripts/test-db-setup.ts', {
      stdio: 'inherit',
      env: {
        ...process.env,
        PLAYWRIGHT_TEST: 'true',
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_DB: process.env.MONGODB_DB,
        MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
        MONGODB_DB_TEST: process.env.MONGODB_DB_TEST
      }
    });
    
    console.log('✅ Test database cleanup completed');
  } catch (error) {
    console.error('❌ Test database cleanup failed:', error);
    // Don't throw error for cleanup failures
  }
}

export default globalTeardown;
