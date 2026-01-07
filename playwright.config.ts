import { defineConfig, devices } from '@playwright/test';

const TEST_PORT = process.env.PLAYWRIGHT_TEST_PORT ?? '3100';
const TEST_BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Run CRUD tests serially for DB isolation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Force single worker for DB isolation
  reporter: 'html',
  use: {
    baseURL: TEST_BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `cross-env NODE_ENV=test PLAYWRIGHT_TEST=true PORT=${TEST_PORT} npm run dev`,
    url: TEST_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  globalSetup: './tests/global-setup.ts',
  globalTeardown: './tests/global-teardown.ts',
});
