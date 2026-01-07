import { Page, expect } from '@playwright/test';
import { RecipeFormPage } from './recipe-form.page';
import { RecipeDetailPage } from './recipe-detail.page';

export class RecipesListPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/recipes');
    await this.waitForLoad();
  }

  async waitForLoad() {
    await this.page.getByTestId('app-shell').waitFor();
    await this.page.getByTestId('recipes-list').waitFor();
  }

  async clickCreateRecipe() {
    await this.page.getByTestId('create-recipe-button').click();
    const formPage = new RecipeFormPage(this.page);
    await formPage.waitForLoad();
    return formPage;
  }

  private recipeLink(title: string) {
    return this.page.locator(
      `[data-testid="recipe-link"][data-recipe-title="${title}"]`
    );
  }

  async expectRecipeVisible(title: string) {
    await expect(this.recipeLink(title)).toBeVisible();
  }

  async expectRecipeNotVisible(title: string) {
    await expect(this.recipeLink(title)).toHaveCount(0);
  }

  async openRecipe(title: string) {
    await this.recipeLink(title).click();
    await this.page.waitForURL(/\/recipe\//);
    return new RecipeDetailPage(this.page);
  }
}
