import { test, expect } from '../src/fixtures/test';
import { accounts, validAccounts } from '../src/fixtures/accounts';

test.describe('Authentification', () => {
  // Cas 1 (jean_dupont) rejoué sur plusieurs comptes valides sans dupliquer
  // le test (cas 6), y compris le compte lent tortue_du_web (cas 5).
  for (const account of validAccounts) {
    test(`connexion puis déconnexion réussies — ${account.username}`, async ({
      page,
      loginPage,
      catalogPage,
    }) => {
      await loginPage.goto();
      await loginPage.login(account.username, account.password);

      await expect(page).toHaveURL(/#\/catalog/, { timeout: 10_000 });
      await expect(catalogPage.logoutButton).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => window.localStorage.getItem('auth-storage')))
        .toContain('"isAuthenticated":true');

      await catalogPage.logout();

      await expect(page).toHaveURL(/#\/login/);
      await expect
        .poll(() => page.evaluate(() => window.localStorage.getItem('auth-storage')))
        .toContain('"isAuthenticated":false');
    });
  }

  // Cas 2 : le compte verrouillé doit échouer avec un message explicite,

  test('connexion refusée pour un compte verrouillé (compte_banni)', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(accounts.compteBanni.username, accounts.compteBanni.password);

    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText(/verrouill/i);
    await expect(page).toHaveURL(/#\/login/);

    const authState = await page.evaluate(() => window.localStorage.getItem('auth-storage'));
    expect(authState).toBeNull();
  });
});
