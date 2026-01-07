import { FullConfig } from '@playwright/test';
import { execSync } from 'child_process';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up test database...');
  
  try {
    // Run the database setup script with all environment variables
    execSync('npx tsx scripts/test-db-setup.ts', {
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PLAYWRIGHT_TEST: 'true',
        MONGODB_URI: process.env.MONGODB_URI,
        MONGODB_DB: process.env.MONGODB_DB,
        MONGODB_URI_TEST: process.env.MONGODB_URI_TEST,
        MONGODB_DB_TEST: process.env.MONGODB_DB_TEST
      }
    });
    
    console.log('✅ Test database setup completed');
  } catch (error) {
    console.error('❌ Test database setup failed:', error);
    throw error;
  }
}

export default globalSetup;
