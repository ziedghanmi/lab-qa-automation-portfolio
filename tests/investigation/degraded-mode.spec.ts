import { test, expect } from '../../src/fixtures/test';
import { CatalogPage } from '../../src/pages/CatalogPage';

// Cas 5, volet "mode dégradé" (`?bugs=true`).
//
// Démarche : connecté en jean_dupont, on a parcouru catalogue / panier /
// commande en mode normal puis en mode bug, et comparé le DOM (sélecteurs
// data-testid) et les requêtes réseau entre les deux. Deux anomalies
// reproductibles et stables ont été isolées (voir README "Investigation —
// mode dégradé" pour le détail de la démarche) :
//
//  1. Les images des produits de catégorie "Livres" pointent vers une
//     ressource introuvable (404 sur missing-product-image.png).
//  2. Le bouton "Ajouter au panier" de certains produits (book-playwright,
//     book-clean-code) reste invisible et non cliquable (classes
//     `invisible pointer-events-none`), rendant ces produits impossibles à
//     acheter alors qu'ils sont affichés comme disponibles.
//
// Ces deux tests sont volontairement déclarés avec `test.fail()` : ils
// documentent un défaut actuel du site et échouent tant qu'il est présent,
// sans faire échouer la suite globale (Playwright les reporte comme
// "expected failure"). Le jour où le bug est corrigé, ces tests passeront
// à leur tour — et Playwright le signalera comme un échec inattendu,
// ce qui alerte qu'il faut retirer `test.fail()`.
test.describe('Investigation — mode dégradé (?bugs=true)', () => {
  test(
    'bug connu : image manquante pour un produit de catégorie Livres',
    { tag: '@known-bug' },
    async ({ authenticatedPage }) => {
      test.fail(true, 'Anomalie documentée — voir README, section Investigation.');

      const catalogPage = new CatalogPage(authenticatedPage);
      await catalogPage.goto('?bugs=true');

      const naturalWidth = await catalogPage
        .imageOf('book-clean-code')
        .evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth, "l'image du produit devrait se charger correctement").toBeGreaterThan(0);
    },
  );

  test(
    'bug connu : bouton "Ajouter au panier" inopérant pour certains produits',
    { tag: '@known-bug' },
    async ({ authenticatedPage }) => {
      test.fail(true, 'Anomalie documentée — voir README, section Investigation.');

      const catalogPage = new CatalogPage(authenticatedPage);
      await catalogPage.goto('?bugs=true');

      await expect(
        catalogPage.addToCartButton('book-clean-code'),
        'le bouton devrait être visible et cliquable, comme en mode normal',
      ).toBeVisible({ timeout: 3_000 });
    },
  );

  // Garde-fou : le mode dégradé ne doit pas casser l'ensemble du catalogue,
  // seulement les produits affectés ci-dessus. Ce test reste un test normal
  // (sans test.fail()) : s'il échoue, c'est une vraie régression de la suite.
  test('un produit non affecté reste achetable en mode dégradé', async ({ authenticatedPage }) => {
    const catalogPage = new CatalogPage(authenticatedPage);
    await catalogPage.goto('?bugs=true');

    await catalogPage.addProductToCart('book-tdd');
    await expect(catalogPage.cartIcon).toHaveText('1');
  });
});
