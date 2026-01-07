import { Page, expect } from '@playwright/test';

export type RecipeFormInput = {
  title?: string;
  description?: string;
  ingredient?: {
    quantity: string;
    unit: string;
    name: string;
  };
  step?: string;
};

export class RecipeFormPage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForLoad() {
    await this.page.getByTestId('recipe-form').waitFor();
  }

  async fillRequiredFields(input: RecipeFormInput) {
    if (input.title) {
      await this.page.getByTestId('title-input').fill(input.title);
    }

    if (input.description) {
      await this.page.locator('#description').fill(input.description);
    }

    if (input.ingredient) {
      await this.page.locator('input[placeholder="Qty"]').fill(input.ingredient.quantity);
      await this.page.locator('input[placeholder="Unit"]').fill(input.ingredient.unit);
      await this.page.locator('input[placeholder="Ingredient name (e.g. fresh basil)"]').fill(
        input.ingredient.name
      );
    }

    if (input.step) {
      await this.page.locator('input[placeholder*="Step"]').fill(input.step);
    }
  }

  async submit() {
    await this.page.getByTestId('save-button').click();
  }

  async expectValidationError() {
    await expect(this.page).toHaveURL(/\/recipes\/add/);
  }
}
