/**
 * Convertit un montant affiché ("103,97 €", avec espace insécable éventuel)
 * en centimes (entier), pour comparer des prix sans piéger sur les flottants.
 */
export function parseEuroToCents(text: string): number {
  const normalized = text.replace(/ /g, ' ');
  const match = normalized.match(/(-?\d[\d\s]*,\d{2})\s*€/);
  if (!match) {
    throw new Error(`Impossible d'extraire un montant en euros depuis : "${text}"`);
  }
  const digits = match[1].replace(/\s/g, '').replace(',', '.');
  return Math.round(parseFloat(digits) * 100);
}

/** TVA (20 %) incluse dans un montant TTC, arrondie comme le fait Lab.qa. */
export function vatIncludedInCents(totalTtcCents: number, vatRatePercent = 20): number {
  return Math.round(totalTtcCents - totalTtcCents / (1 + vatRatePercent / 100));
}
