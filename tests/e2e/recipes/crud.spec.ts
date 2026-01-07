import { test, expect } from '@playwright/test';
import { RecipesListPage } from '../pages/recipes-list.page';
import { resetTestDatabase, SEED_RECIPES } from '../fixtures/db';

test.describe('Recipe CRUD', () => {
  test.beforeEach(async ({ page }) => {
    // Arrange: always start with a clean database and the recipes list page
    resetTestDatabase();
    await page.goto('/recipes');
  });

  test('creates a recipe via the add form', async ({ page }) => {
    const listPage = new RecipesListPage(page);
    await listPage.waitForLoad();

    // Arrange
    const recipeTitle = `E2E Created Recipe ${Date.now()}`;
    const formPage = await listPage.clickCreateRecipe();
    await formPage.fillRequiredFields({
      title: recipeTitle,
      description: 'Created during automated tests',
      ingredient: { quantity: '2', unit: 'cups', name: 'flour' },
      step: 'Combine ingredients and bake',
    });

    // Act
    await formPage.submit();
    await page.waitForURL('/recipes');
    await listPage.waitForLoad();

    // Assert
    await listPage.expectRecipeVisible(recipeTitle);
    const detailPage = await listPage.openRecipe(recipeTitle);
    await detailPage.waitForLoad();
    await detailPage.expectTitle(recipeTitle);
    await expect(page.getByText('Created during automated tests')).toBeVisible();
  });

  test('edits an existing recipe title', async ({ page }) => {
    const listPage = new RecipesListPage(page);
    await listPage.waitForLoad();

    // Arrange
    const detailPage = await listPage.openRecipe(SEED_RECIPES.alpha.title);
    await detailPage.waitForLoad();
    const editPage = await detailPage.openEdit();
    const updatedTitle = `${SEED_RECIPES.alpha.title} Updated`;
    await editPage.fillRequiredFields({ title: updatedTitle });

    // Act
    await editPage.submit();
    await detailPage.waitForLoad();

    // Assert
    await detailPage.expectTitle(updatedTitle);
    await listPage.goto();
    await listPage.expectRecipeVisible(updatedTitle);
    await listPage.expectRecipeNotVisible(SEED_RECIPES.alpha.title);
  });

  test('deletes an existing recipe', async ({ page }) => {
    const listPage = new RecipesListPage(page);
    await listPage.waitForLoad();

    // Arrange
    const detailPage = await listPage.openRecipe(SEED_RECIPES.beta.title);
    await detailPage.waitForLoad();
    const editPage = await detailPage.openEdit();

    // Act
    await editPage.deleteRecipe();
    await page.waitForURL('/recipes');

    // Assert
    await listPage.waitForLoad();
    await listPage.expectRecipeNotVisible(SEED_RECIPES.beta.title);
  });

  test('shows validation when required fields are missing', async ({ page }) => {
    const listPage = new RecipesListPage(page);
    await listPage.waitForLoad();

    // Arrange
    const formPage = await listPage.clickCreateRecipe();

    // Act
    await formPage.submit();

    // Assert
    await formPage.expectValidationError();
  });
});
