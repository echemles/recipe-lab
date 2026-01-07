import { Page, expect } from '@playwright/test';
import { RecipeEditPage } from './recipe-edit.page';

export class RecipeDetailPage {
  constructor(private readonly page: Page) {}

  async waitForLoad() {
    await this.page.getByTestId('app-shell').waitFor();
    await this.page.getByRole('heading', { level: 1 }).waitFor();
  }

  async expectTitle(title: string) {
    await expect(this.page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  }

  async openEdit() {
    await this.page.getByTestId('edit-recipe-link').click();
    const editPage = new RecipeEditPage(this.page);
    await editPage.waitForLoad();
    return editPage;
  }
}
