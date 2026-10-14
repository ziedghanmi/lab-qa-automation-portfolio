import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CatalogPage } from '../pages/CatalogPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutInfoPage } from '../pages/CheckoutInfoPage';
import { CheckoutReviewPage } from '../pages/CheckoutReviewPage';
import { CheckoutPaymentPage } from '../pages/CheckoutPaymentPage';
import { CheckoutConfirmationPage } from '../pages/CheckoutConfirmationPage';
import { accounts, type Account } from './accounts';

type PageObjectFixtures = {
  loginPage: LoginPage;
  catalogPage: CatalogPage;
  cartPage: CartPage;
  checkoutInfoPage: CheckoutInfoPage;
  checkoutReviewPage: CheckoutReviewPage;
  checkoutPaymentPage: CheckoutPaymentPage;
  checkoutConfirmationPage: CheckoutConfirmationPage;
};

type AuthFixtures = {
  account: Account;

  authenticatedPage: Page;
};

export const test = base.extend<PageObjectFixtures & AuthFixtures>({
  account: [accounts.jeanDupont, { option: true }],

  authenticatedPage: async ({ page, account }, use) => {
    const authState = JSON.stringify({
      state: {
        username: account.username,
        role: account.expectedRole,
        isAuthenticated: true,
      },
      version: 0,
    });
    await page.addInitScript((state) => {
      window.localStorage.setItem('auth-storage', state);
    }, authState);
    await page.goto('./#/catalog');
    await use(page);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  catalogPage: async ({ page }, use) => {
    await use(new CatalogPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutInfoPage: async ({ page }, use) => {
    await use(new CheckoutInfoPage(page));
  },
  checkoutReviewPage: async ({ page }, use) => {
    await use(new CheckoutReviewPage(page));
  },
  checkoutPaymentPage: async ({ page }, use) => {
    await use(new CheckoutPaymentPage(page));
  },
  checkoutConfirmationPage: async ({ page }, use) => {
    await use(new CheckoutConfirmationPage(page));
  },
});

export { expect };
