import type { Page, Locator } from '@playwright/test';
import { config } from '../config';

export class CheckoutPaymentPage {
  readonly page: Page;
  readonly cardNumberInput: Locator;
  readonly expiryInput: Locator;
  readonly cvcInput: Locator;
  readonly cardholderNameInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cardNumberInput = page.getByTestId('payment-card-number');
    this.expiryInput = page.getByTestId('payment-expiry');
    this.cvcInput = page.getByTestId('payment-cvc');
    this.cardholderNameInput = page.getByTestId('payment-name');
    this.submitButton = page.getByTestId('payment-submit');
  }

  async payWithTestCard(cardholderName: string): Promise<void> {
    await this.cardNumberInput.fill(config.testCard.number);
    await this.expiryInput.fill(config.testCard.expiry);
    await this.cvcInput.fill(config.testCard.cvc);
    await this.cardholderNameInput.fill(cardholderName);
    await this.submitButton.click();
  }
}
