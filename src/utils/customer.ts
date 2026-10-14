export interface Customer {
  firstName: string;
  lastName: string;
  email: string;
  postalCode: string;
}

const FIRST_NAMES = ['Claire', 'Julien', 'Sofia', 'Marc', 'Lina', 'Hugo'];
const LAST_NAMES = ['Martin', 'Bernard', 'Dubois', 'Petit', 'Moreau'];

/**
 * Génère un client de test unique à chaque appel, pour ne jamais rejouer
 * deux fois exactement les mêmes données client d'un test à l'autre.
 */
export function buildCustomer(): Customer {
  const seed = Date.now() + Math.floor(Math.random() * 1000);
  const firstName = FIRST_NAMES[seed % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(seed / FIRST_NAMES.length) % LAST_NAMES.length];
  const email = `${firstName}.${lastName}.${seed}@example.test`.toLowerCase();
  return { firstName, lastName, email, postalCode: '59000' };
}
