import { test, expect } from '../../src/fixtures/test';
import { accounts } from '../../src/fixtures/accounts';

// Cas 5, volet "compte lent" : tortue_du_web (role performance_glitch_user)
// introduit un délai d'environ 3 s à la connexion (annoncé sur la page
// d'accueil de Lab.qa, confirmé en mesurant la connexion réelle).
//
// Démarche : on documente ce délai avec une connexion réelle (pas d'injection
// de session ici, puisque c'est justement le comportement observé), avec une
// fourchette large pour ne pas rendre le test fragile si le délai varie
// légèrement d'une exécution à l'autre. Le reste de la suite n'utilise ce
// compte qu'au travers de `authenticatedPage` (cas 6), qui contourne l'UI de
// connexion : la lenteur de ce compte reste donc cantonnée à ce test.
test.describe('Investigation — compte lent (tortue_du_web)', () => {
  test('la connexion aboutit, avec un délai nettement supérieur à un compte standard', async ({
    page,
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login(accounts.tortueDuWeb.username, accounts.tortueDuWeb.password);

    const start = Date.now();
    await expect(page).toHaveURL(/#\/catalog/, { timeout: 10_000 });
    const elapsedMs = Date.now() - start;

    expect(elapsedMs, 'le délai observé doit rester cohérent avec les ~3 s annoncées').toBeGreaterThan(1500);
    expect(elapsedMs, 'le délai ne doit toutefois pas dériver indéfiniment').toBeLessThan(8000);

    const authState = await page.evaluate(() => window.localStorage.getItem('auth-storage'));
    expect(authState).toContain('performance_glitch_user');
  });
});
