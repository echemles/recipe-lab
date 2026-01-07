import { Page } from '@playwright/test';
import { RecipeFormPage } from './recipe-form.page';

export class RecipeEditPage extends RecipeFormPage {
  constructor(page: Page) {
    super(page);
  }

  async deleteRecipe() {
    this.page.once('dialog', (dialog) => dialog.accept());
    await this.page.getByTestId('delete-button').click();
  }
}
