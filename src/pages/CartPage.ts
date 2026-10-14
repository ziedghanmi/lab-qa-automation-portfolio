import type { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly checkoutButton: Locator;
  readonly subtotal: Locator;
  readonly tax: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    this.page = page;
    this.checkoutButton = page.getByTestId('cart-checkout-button');
    this.subtotal = page.getByTestId('cart-subtotal');
    this.tax = page.getByTestId('cart-tax');
    this.total = page.getByTestId('cart-total');
  }

  async goto(): Promise<void> {
    await this.page.goto('./#/cart');
  }

  itemRow(slug: string): Locator {
    return this.page.getByTestId(`cart-item-${slug}`);
  }

  async proceedToCheckout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
