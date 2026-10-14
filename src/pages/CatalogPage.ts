import type { Page, Locator } from '@playwright/test';
import { expect } from '@playwright/test';
import { config } from '../config';

export type SortOption = 'default' | 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc';

export class CatalogPage {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly cartIcon: Locator;
  readonly sortSelect: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByTestId('logout-button');
    this.cartIcon = page.getByTestId('cart-icon');
    this.sortSelect = page.getByTestId('sort-select');
  }

  async goto(queryString = ''): Promise<void> {
    await this.page.goto(`./#/catalog${queryString}`);
  }

  productCard(slug: string): Locator {
    return this.page.getByTestId(`product-card-${slug}`);
  }

  addToCartButton(slug: string): Locator {
    return this.page.getByTestId(`add-to-cart-${slug}`);
  }

  priceOf(slug: string): Locator {
    return this.page.getByTestId(`product-price-${slug}`);
  }

  imageOf(slug: string): Locator {
    return this.page.getByTestId(`product-image-${slug}`);
  }

  async addProductToCart(slug: string): Promise<void> {
    await this.addToCartButton(slug).click();
  }

  async sortBy(option: SortOption): Promise<void> {
    await this.sortSelect.selectOption(option);
  }

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /** Change de page de pagination et attend que le changement soit effectif. */
  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByTestId(`pagination-page-${pageNumber}`).click();
    await expect(this.page.getByTestId('pagination-current')).toHaveText(String(pageNumber));
  }

  /**
   * Parcourt toutes les pages du catalogue et retourne les prix affichés,
   * dans l'ordre d'affichage. Utilisé pour vérifier un tri sur l'ensemble
   * du catalogue et pas seulement sur la page courante.
   */
  async collectPricesAcrossAllPages(): Promise<string[]> {
    const priceTexts: string[] = [];
    for (let pageNumber = 1; pageNumber <= config.catalog.totalPages; pageNumber += 1) {
      if (pageNumber > 1) {
        await this.goToPage(pageNumber);
      }
      const texts = await this.page.locator('[data-testid^="product-price-"]').allInnerTexts();
      priceTexts.push(...texts);
    }
    return priceTexts;
  }
}
