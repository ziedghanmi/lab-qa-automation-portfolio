import type { Page, Locator } from '@playwright/test';
import type { Customer } from '../utils/customer';
import type { DeliveryMethod } from '../config';

export class CheckoutInfoPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.getByTestId('checkout-first-name');
    this.lastNameInput = page.getByTestId('checkout-last-name');
    this.emailInput = page.getByTestId('checkout-email');
    this.postalCodeInput = page.getByTestId('checkout-postal-code');
    this.continueButton = page.getByTestId('checkout-continue');
  }

  async fillShippingInfo(customer: Customer): Promise<void> {
    await this.firstNameInput.fill(customer.firstName);
    await this.lastNameInput.fill(customer.lastName);
    await this.emailInput.fill(customer.email);
    await this.postalCodeInput.fill(customer.postalCode);
  }

  async chooseDelivery(method: DeliveryMethod): Promise<void> {
    await this.page.getByTestId(`delivery-${method}`).click();
  }

  async continueToReview(): Promise<void> {
    await this.continueButton.click();
  }
}
