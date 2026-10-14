import type { Page, Locator } from '@playwright/test';

export class CheckoutReviewPage {
  readonly page: Page;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly delivery: Locator;
  readonly total: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.subtotal = page.getByTestId('review-subtotal');
    this.tax = page.getByTestId('review-tax');
    this.delivery = page.getByTestId('review-delivery');
    this.total = page.getByTestId('review-total');
    this.confirmButton = page.getByTestId('checkout-finish');
  }

  itemRow(slug: string): Locator {
    return this.page.getByTestId(`review-item-${slug}`);
  }

  async confirm(): Promise<void> {
    await this.confirmButton.click();
  }
}
