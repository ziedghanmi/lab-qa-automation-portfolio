import { test, expect } from '../src/fixtures/test';
import { CatalogPage, type SortOption } from '../src/pages/CatalogPage';
import { parseEuroToCents } from '../src/utils/money';

interface SortDirection {
  option: SortOption;
  label: string;
  isOrdered: (previousCents: number, currentCents: number) => boolean;
}

// Cas 4 : les deux sens de tri partagent exactement la même logique de
// vérification (collecte sur tout le catalogue + comparaison deux à deux) ;
// seul le comparateur change, ce qui évite toute duplication entre les deux cas.
const SORT_DIRECTIONS: SortDirection[] = [
  {
    option: 'price-asc',
    label: 'croissant (du moins cher au plus cher)',
    isOrdered: (previous, current) => previous <= current,
  },
  {
    option: 'price-desc',
    label: 'décroissant (du plus cher au moins cher)',
    isOrdered: (previous, current) => previous >= current,
  },
];

async function assertCatalogSortedByPrice(catalogPage: CatalogPage, direction: SortDirection) {
  await catalogPage.sortBy(direction.option);
  const priceTexts = await catalogPage.collectPricesAcrossAllPages();
  const pricesCents = priceTexts.map(parseEuroToCents);

  expect(pricesCents.length).toBeGreaterThan(0);
  for (let i = 1; i < pricesCents.length; i += 1) {
    expect(
      direction.isOrdered(pricesCents[i - 1], pricesCents[i]),
      `Le produit en position ${i} (${pricesCents[i] / 100} €) n'est pas correctement ordonné ` +
        `par rapport au précédent (${pricesCents[i - 1] / 100} €) pour un tri ${direction.label}.`,
    ).toBe(true);
  }
}

test.describe('Tri des produits par prix (cas 4)', () => {
  for (const direction of SORT_DIRECTIONS) {
    test(`tri par prix ${direction.label}`, async ({ authenticatedPage }) => {
      const catalogPage = new CatalogPage(authenticatedPage);
      await assertCatalogSortedByPrice(catalogPage, direction);
    });
  }
});
