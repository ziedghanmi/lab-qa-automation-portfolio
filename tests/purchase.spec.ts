import { test, expect } from '../src/fixtures/test';
import { parseEuroToCents, vatIncludedInCents } from '../src/utils/money';
import { buildCustomer } from '../src/utils/customer';
import { config } from '../src/config';

// Deux produits sans variante de taille, pour garder le scénario simple et
// déterministe : un sac à dos (page 1 du catalogue) et un livre (page 3).
const FIRST_ITEM = 'sauce-backpack';
const SECOND_ITEM = 'book-clean-code';
const SECOND_ITEM_PAGE = 3;
const DELIVERY_METHOD = 'standard';

test.describe('Parcours d\'achat complet (cas 3)', () => {
  test('achat de deux produits jusqu\'à la confirmation, montants cohérents à chaque étape', async ({
    authenticatedPage,
    catalogPage,
    cartPage,
    checkoutInfoPage,
    checkoutReviewPage,
    checkoutPaymentPage,
    checkoutConfirmationPage,
  }) => {
    // `authenticatedPage` place la session en localStorage et navigue vers le
    // catalogue ; les Page Objects ci-dessus opèrent sur cette même page.
    void authenticatedPage;

    // --- Catalogue : on relève les prix affichés avant ajout, pour calculer
    //     le total attendu indépendamment de ce que l'appli affichera ensuite.
    const firstUnitPriceCents = parseEuroToCents(await catalogPage.priceOf(FIRST_ITEM).innerText());
    await catalogPage.addProductToCart(FIRST_ITEM);

    await catalogPage.goToPage(SECOND_ITEM_PAGE);
    const secondUnitPriceCents = parseEuroToCents(await catalogPage.priceOf(SECOND_ITEM).innerText());
    await catalogPage.addProductToCart(SECOND_ITEM);

    const expectedSubtotalCents = firstUnitPriceCents + secondUnitPriceCents;
    const expectedTaxCents = vatIncludedInCents(expectedSubtotalCents);

    // --- Panier : sous-total et TVA doivent déjà être cohérents avant même
    //     de choisir un mode de livraison.
    await cartPage.goto();
    await expect(cartPage.itemRow(FIRST_ITEM)).toBeVisible();
    await expect(cartPage.itemRow(SECOND_ITEM)).toBeVisible();
    expect(parseEuroToCents(await cartPage.subtotal.innerText())).toBe(expectedSubtotalCents);
    expect(parseEuroToCents(await cartPage.tax.innerText())).toBe(expectedTaxCents);

    // --- Livraison
    await cartPage.proceedToCheckout();
    const customer = buildCustomer();
    await checkoutInfoPage.fillShippingInfo(customer);
    await checkoutInfoPage.chooseDelivery(DELIVERY_METHOD);
    await checkoutInfoPage.continueToReview();

    const expectedShippingCents = config.shippingCentsByMethod[DELIVERY_METHOD];
    const expectedTotalCents = expectedSubtotalCents + expectedShippingCents;

    // --- Récapitulatif : prix produits, sous-total, TVA, livraison, total.
    await expect(checkoutReviewPage.itemRow(FIRST_ITEM)).toBeVisible();
    await expect(checkoutReviewPage.itemRow(SECOND_ITEM)).toBeVisible();
    expect(parseEuroToCents(await checkoutReviewPage.subtotal.innerText())).toBe(expectedSubtotalCents);
    expect(parseEuroToCents(await checkoutReviewPage.tax.innerText())).toBe(expectedTaxCents);
    expect(parseEuroToCents(await checkoutReviewPage.delivery.innerText())).toBe(expectedShippingCents);
    expect(parseEuroToCents(await checkoutReviewPage.total.innerText())).toBe(expectedTotalCents);

    // --- Paiement avec la carte de test
    await checkoutReviewPage.confirm();
    await checkoutPaymentPage.payWithTestCard(`${customer.firstName} ${customer.lastName}`);

    // --- Confirmation : numéro de commande et montant final identique au récapitulatif.
    await checkoutConfirmationPage.waitForConfirmation();
    const orderNumber = await checkoutConfirmationPage.getOrderNumber();
    expect(orderNumber).toMatch(/^ORD-\d+$/);
    expect(await checkoutConfirmationPage.getTotalPaidCents()).toBe(expectedTotalCents);
  });
});
