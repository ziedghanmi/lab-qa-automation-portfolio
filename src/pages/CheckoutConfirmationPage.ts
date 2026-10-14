import type { Page, Locator } from '@playwright/test';
import { parseEuroToCents } from '../utils/money';

export class CheckoutConfirmationPage {
  readonly page: Page;
  readonly container: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId('confirmation-container');
  }

  async waitForConfirmation(): Promise<void> {
    await this.page.waitForURL('**/checkout/confirmation', { timeout: 15_000 });
  }

  async getOrderNumber(): Promise<string> {
    const text = await this.container.innerText();
    const match = text.match(/ORD-\d+/);
    if (!match) {
      throw new Error(`Numéro de commande introuvable dans la confirmation : "${text}"`);
    }
    return match[0];
  }

  async getTotalPaidCents(): Promise<number> {
    const text = await this.container.innerText();
    return parseEuroToCents(text);
  }
}
