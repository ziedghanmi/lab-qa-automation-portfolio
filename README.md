# Lab.qa — Suite de tests E2E (Playwright / TypeScript)

Suite de tests end-to-end pour [Lab.qa](https://ssid-testing-agency.github.io/Lab.qa/), la boutique
fictive d'entraînement QA de SSID. Réalisée dans le cadre du test technique
« automatisation de tests Web ».

## Sommaire

- [Installation](#installation)
- [Lancer les tests](#lancer-les-tests)
- [Architecture du projet](#architecture-du-projet)
- [Choix techniques](#choix-techniques)
- [Cas couverts](#cas-couverts)
- [Cas 5 — Investigation](#cas-5--investigation)
- [Usage de l'IA](#usage-de-lia)
- [Ce qui n'est pas encore fait](#ce-qui-nest-pas-encore-fait)

## Installation

Prérequis : Node.js ≥ 18.

```bash
npm install
npx playwright install        # télécharge les navigateurs (chromium, firefox, webkit)
cp .env.example .env          # optionnel, les valeurs par défaut suffisent
```

## Lancer les tests

```bash
npm test                 # toute la suite, 3 navigateurs (chromium, firefox, webkit)
npm run test:chromium    # chromium uniquement — le plus rapide pour itérer
npm run test:ui          # mode interactif Playwright UI
npm run test:headed      # navigateur visible
npm run report           # rouvre le dernier rapport HTML
npm run typecheck        # vérifie les types sans exécuter les tests
```

Pour exclure les tests qui documentent des bugs connus (cas 5, voir plus bas) :

```bash
npx playwright test --grep-invert @known-bug
```

Sur chromium seul, la suite s'exécute en ~20 secondes.

## Architecture du projet

```
src/
  config.ts                     Config centralisée (URL de base, carte de test, frais de port…)
  fixtures/
    accounts.ts                 Registre des comptes de test (username, password, rôle attendu)
    test.ts                     Extension de `test` Playwright : fixtures Page Object + authentification
  pages/                        Page Object Model (un fichier par écran/étape)
    LoginPage.ts
    CatalogPage.ts
    CartPage.ts
    CheckoutInfoPage.ts
    CheckoutReviewPage.ts
    CheckoutPaymentPage.ts
    CheckoutConfirmationPage.ts
  utils/
    money.ts                    Parsing "103,97 €" → centimes (entiers, pas de flottants)
    customer.ts                 Génération de données client uniques par exécution
tests/
  auth.spec.ts                  Cas 1 (connexion/déconnexion) + Cas 2 (compte verrouillé)
  purchase.spec.ts              Cas 3 (parcours d'achat complet)
  sorting.spec.ts                Cas 4 (tri par prix, croissant/décroissant)
  investigation/
    slow-account.spec.ts        Cas 5, volet "compte lent"
    degraded-mode.spec.ts       Cas 5, volet "mode dégradé"
playwright.config.ts            Config Playwright (navigateurs, reporter, timeouts, baseURL)
```

Le cas 6 (architecture) n'a pas de fichier dédié : c'est la structure elle-même
(fixtures réutilisables, config centralisée, jeux de données factorisés) qui y répond,
décrite ci-dessous.

## Choix techniques

**Page Object Model, sélecteurs `data-testid`.** Lab.qa expose des `data-testid` sur
quasiment tous les éléments interactifs ; ce sont les sélecteurs les plus stables
disponibles (insensibles au texte, au style, à la structure DOM), donc utilisés
systématiquement via `page.getByTestId(...)`.

**Authentification factorisée, à deux vitesses.** La fixture `account` + `authenticatedPage`
(`src/fixtures/test.ts`) dépose directement l'état de session dans le `localStorage`
(`auth-storage`, la source de vérité que Lab.qa lit lui-même) avant le premier chargement
de page, puis navigue sur le catalogue. C'est fidèle à l'état qu'une vraie connexion
produirait, mais net plus rapide et surtout insensible au délai de 3 s du compte
`tortue_du_web`. Les cas qui testent la connexion *elle-même* (cas 1, cas 2, et
l'investigation du compte lent) passent volontairement par le vrai formulaire de
connexion (`loginPage.login(...)`) : c'est justement ce qu'ils vérifient.

**Config centralisée.** `src/config.ts` regroupe l'URL de base, la carte de test et les
frais de port par mode de livraison ; `playwright.config.ts` centralise navigateurs,
timeouts et reporters. Rien de tout cela n'est répété dans les tests.

**Rejeu multi-comptes / multi-jeux de données sans duplication (cas 6).**
- `tests/auth.spec.ts` boucle sur `validAccounts` (`jean_dupont`, `client_chaos`,
  `tortue_du_web`) et exécute le même test de connexion/déconnexion pour chacun — y
  compris le compte lent, comme demandé par le cas 5.
- `tests/sorting.spec.ts` boucle sur un tableau `SORT_DIRECTIONS` (asc/desc) et appelle
  la même fonction `assertCatalogSortedByPrice`, seul le comparateur change : aucune
  logique dupliquée entre les deux sens de tri (cas 4).

**Montants en centimes, jamais en flottants.** `parseEuroToCents` convertit chaque montant
affiché en entier (centimes) avant toute comparaison, pour éviter les pièges classiques
d'arithmétique flottante (`0.1 + 0.2 !== 0.3`).

**Données client générées, pas codées en dur.** `buildCustomer()` génère un client
différent à chaque exécution (nom, email, code postal), pour que le parcours d'achat
reste indépendant d'une exécution à l'autre.

**Pas de BDD/Gherkin.** Envisagé (cas 6 le suggère), mais pas retenu : la suite est
pensée pour une relecture technique (vous, à l'entretien), pas pour un public non
technique qui aurait besoin de scénarios en langage naturel. Les titres de test en
français déjà descriptifs (`"connexion refusée pour un compte verrouillé"`) jouent ce
rôle de documentation vivante sans la couche d'indirection supplémentaire qu'ajoute
Gherkin (fichiers `.feature` + step definitions à maintenir en double). Si le public
cible changeait (PO non technique, par exemple), ce serait le premier arbitrage à
reconsidérer.

**Piège rencontré — `baseURL` et chemins absolus.** Playwright résout `page.goto('/x')`
avec un chemin commençant par `/` comme *racine du domaine*, pas comme relatif au
`baseURL`. Comme Lab.qa est servi sous un sous-dossier GitHub Pages
(`https://.../Lab.qa/`), un `goto('/#/login')` atterrissait sur la page 404 de GitHub
Pages (`https://ssid-testing-agency.github.io/#/login`) et les tests restaient bloqués à
attendre un sélecteur qui n'existait pas. Tous les appels `goto` du projet utilisent donc
des chemins relatifs sans `/` en tête (`./#/login`).

## Cas couverts

| Cas | Fichier | Compte(s) |
|---|---|---|
| 1 — Authentification | `tests/auth.spec.ts` | `jean_dupont`, `client_chaos`, `tortue_du_web` |
| 2 — Compte verrouillé | `tests/auth.spec.ts` | `compte_banni` |
| 3 — Parcours d'achat complet | `tests/purchase.spec.ts` | `jean_dupont` |
| 4 — Tri des produits | `tests/sorting.spec.ts` | `jean_dupont` |
| 5 — Investigation | `tests/investigation/*.spec.ts` | `tortue_du_web`, `jean_dupont` |
| 6 — Architecture | *(transversal, voir ci-dessus)* | — |
| 7 — CI/observabilité (bonus) | *non traité, voir plus bas* | — |

**Cas 3**, détail des vérifications : sous-total et TVA incluse dès l'ajout au panier,
puis au récapitulatif prix produits + sous-total + TVA + livraison + total, et enfin
numéro de commande + montant payé à la confirmation — tous recalculés indépendamment de
l'affichage à partir des prix unitaires relevés au catalogue, pas simplement recopiés
depuis une étape précédente.

## Cas 5 — Investigation

### Volet 1 : compte lent (`tortue_du_web`)

**Démarche.** Connexion avec `tortue_du_web`, chronométrée. La page d'accueil annonce
« Délai au login (3 s) » ; une mesure réelle confirme un délai d'environ 3 secondes avant
redirection vers le catalogue, et le `localStorage` révèle un rôle dédié,
`performance_glitch_user` (à comparer à `standard_user` pour `jean_dupont`).

**Priorité.** Documenter le comportement avec une connexion réelle, dans une fourchette
large (`> 1.5 s` et `< 8 s`) : assez stricte pour détecter une régression (le compte ne
serait plus "lent" du tout, ou deviendrait anormalement plus lent), assez large pour ne
pas rendre le test fragile si le délai varie légèrement d'une exécution à l'autre.

**Pour que le reste de la suite reste rapide malgré lui (cas 6)** : seul ce test passe
par le vrai formulaire de connexion pour ce compte. Partout ailleurs où `tortue_du_web`
intervient (le rejeu multi-comptes du cas 1), c'est via `authenticatedPage`, qui
contourne l'UI de connexion — la lenteur de ce compte reste donc cantonnée à un seul
test, pas propagée à toute la suite.

### Volet 2 : mode dégradé (`?bugs=true`)

**Démarche.** Connecté en `jean_dupont`, parcours comparé du catalogue, du panier et de
la commande en mode normal puis avec `?bugs=true` (ex. `#/catalog?bugs=true`) : relevé
des `data-testid` présents, des requêtes réseau en échec, et des classes CSS des
éléments interactifs.

**Deux anomalies reproductibles et stables ont été isolées** (vérifiées sur plusieurs
rechargements) :

1. **Images manquantes pour les produits de catégorie Livres.** En mode dégradé, les
   images des 6 livres pointent vers `images/products/missing-product-image.png`, qui
   répond en 404 — contre une image valide en mode normal.
2. **Bouton "Ajouter au panier" invisible et non cliquable pour certains produits**
   (`book-playwright`, `book-clean-code`) : le bouton existe dans le DOM mais porte les
   classes `invisible pointer-events-none`, le rendant impossible à utiliser alors que le
   produit est affiché comme disponible. Aucune interaction (survol, incrément de
   quantité) ne le rend cliquable.

**Priorité.** Ces deux anomalies cassent un parcours utilisateur concret (voir un produit,
vouloir l'acheter, ne pas y arriver / ne pas voir ce qu'on achète) — contrairement, par
exemple, au réordonnancement des catégories dans le catalogue en mode dégradé (observé
mais non retenu : visible, mais n'empêche aucune action).

**Choix d'implémentation : `test.fail()`.** Les deux tests qui documentent ces bugs sont
déclarés avec `test.fail()` : ils échouent tant que l'anomalie est présente, mais
Playwright les compte comme un *échec attendu* — ils n'apparaissent pas comme des échecs
dans le résumé de la suite (`npm test` affiche `N passed`, ce N les inclut). Si le bug
est un jour corrigé, le test se mettra à réussir *alors qu'il est censé échouer* :
Playwright le signalera comme échec inattendu, ce qui alerte qu'il faut retirer
`test.fail()`. Un troisième test (sans `test.fail()`) vérifie qu'un produit non affecté
reste normalement achetable en mode dégradé — un vrai échec ici serait une régression de
la suite elle-même. Les trois tests portent le tag `@known-bug` / sont filtrables via
`--grep-invert @known-bug`.

## Usage de l'IA

Projet conçu avec Claude (Anthropic) comme assistant de développement, de bout en bout :
exploration du site réel (scripts Playwright ad hoc pour relever les `data-testid`, les
montants, le comportement des comptes de test et du mode dégradé — rien n'a été deviné
ou inventé), conception de l'architecture, écriture du code et du README.

Vérification : le typecheck (`npm run typecheck`) et la suite complète ont été exécutés
contre le site réel avant livraison (`npm run test:chromium` → 11/11 tests verts, bugs
connus inclus et correctement comptés comme échecs attendus). Un bug a été débusqué et
corrigé pendant cette vérification : un chemin de navigation `/#/login` qui, combiné au
`baseURL` du projet, atterrissait sur la page 404 de GitHub Pages au lieu de Lab.qa (voir
plus haut).

## Ce qui n'est pas encore fait

Volontairement laissés pour une étape suivante :

- **Dépôt GitHub privé** (accès lecteur à `lordrequiem`) : le projet est prêt en local,
  non encore poussé.
- **Cas 7 (bonus — CI/observabilité)** : pas de workflow GitHub Actions pour l'instant.
