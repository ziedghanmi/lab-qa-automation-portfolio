import 'dotenv/config';

export const config = {
  baseURL: process.env.BASE_URL ?? 'https://ssid-testing-agency.github.io/Lab.qa/',
  defaultPassword: process.env.TEST_ACCOUNTS_PASSWORD ?? 'Baguette42!',
  testCard: {
    number: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
  },
  catalog: {
    productsPerPage: 6,
    totalPages: 3,
  },
  shippingCentsByMethod: {
    standard: 399,
    express: 999,
    pickup: 0,
  },
} as const;

export type DeliveryMethod = keyof typeof config.shippingCentsByMethod;
