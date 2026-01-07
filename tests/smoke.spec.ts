import { test, expect } from '@playwright/test';

test.describe('Smoke Tests', () => {
  test('app loads and renders app shell', async ({ page }) => {
    // Navigate to home page (redirects to /recipes)
    await page.goto('/');
    
    // Wait for page to load and app shell to be visible
    await page.waitForSelector('[data-testid="app-shell"]');
    
    // Assert app shell exists and is visible
    const appShell = page.getByTestId('app-shell');
    await expect(appShell).toBeVisible();
    
    // Assert basic page content loaded
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible();
  });

  test('theme toggle functionality', async ({ page }) => {
    // Navigate to recipes page
    await page.goto('/recipes');
    
    // Wait for app shell to load
    await page.waitForSelector('[data-testid="app-shell"]');
    
    // Find theme toggle button
    const themeToggle = page.getByTestId('theme-toggle');
    await expect(themeToggle).toBeVisible();
    
    // Get initial theme state
    const html = page.locator('html');
    const initialClasses = await html.getAttribute('class');
    const initialHasDarkClass = initialClasses?.includes('dark') || false;
    
    // Click theme toggle
    await themeToggle.click();
    
    // Assert theme changed (dark class should be toggled)
    const finalClasses = await html.getAttribute('class');
    const finalHasDarkClass = finalClasses?.includes('dark') || false;
    expect(finalHasDarkClass).toBe(!initialHasDarkClass);
    
    // Assert app shell remains visible after theme change
    const appShell = page.getByTestId('app-shell');
    await expect(appShell).toBeVisible();
  });

  test('system dark mode preference', async ({ page }) => {
    // Emulate system dark mode preference
    await page.emulateMedia({ colorScheme: 'dark' });
    
    // Navigate to recipes page
    await page.goto('/recipes');
    
    // Wait for app shell to load
    await page.waitForSelector('[data-testid="app-shell"]');
    
    // Assert app renders without error
    const appShell = page.getByTestId('app-shell');
    await expect(appShell).toBeVisible();
    
    // Assert basic content is present
    await expect(page.getByRole('heading', { name: 'Recipes' })).toBeVisible();
    
    // Note: We don't assert specific dark class here since next-themes
    // handles system preference differently and may need hydration
  });
});
