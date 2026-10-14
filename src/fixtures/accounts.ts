import { config } from '../config';

export interface Account {
  username: string;
  password: string;
 
  expectedRole: string;
  description: string;
}

export const accounts = {
  jeanDupont: {
    username: 'jean_dupont',
    password: config.defaultPassword,
    expectedRole: 'standard_user',
    description: 'Parcours complet',
  },
  compteBanni: {
    username: 'compte_banni',
    password: config.defaultPassword,
    expectedRole: 'locked_user',
    description: 'Compte verrouillé',
  },
  clientChaos: {
    username: 'client_chaos',
    password: config.defaultPassword,
    expectedRole: 'problem_user',
    description: 'Éléments défectueux',
  },
  tortueDuWeb: {
    username: 'tortue_du_web',
    password: config.defaultPassword,
    expectedRole: 'performance_glitch_user',
    description: 'Délai au login (~3 s)',
  },
} as const satisfies Record<string, Account>;


export const validAccounts: Account[] = [
  accounts.jeanDupont,
  accounts.clientChaos,
  accounts.tortueDuWeb,
];
