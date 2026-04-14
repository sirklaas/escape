/**
 * Canonical 3×3 hub order for `/nine` and `[locationSlug]` routes.
 * `locationNumber` in `escapedata.json` / PocketBase matches index + 1 (1 = Blokker … 9 = Drog).
 */
export const LOCATION_SLUG_ORDER = [
  'blokker',
  'boek',
  'electro',
  'lijst',
  'kerk',
  'brug',
  'count',
  'gall',
  'drog',
] as const;

export type LocationSlugOrdered = (typeof LOCATION_SLUG_ORDER)[number];

/** 0-based index in `LOCATION_SLUG_ORDER`, or -1 if unknown. */
export function slugOrderIndex(slugLower: string): number {
  return (LOCATION_SLUG_ORDER as readonly string[]).indexOf(slugLower);
}
