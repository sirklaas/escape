/**
 * End-game / wrap-up flow — `/end-atlas` hub + dev nav under the phone (same pattern as
 * `game-atlas` and `intro-atlas`). Linear QA after the main game loop (see `GAME_ATLAS_PATHS`).
 */
import { normalizeGameAtlasPathname } from '@/lib/game-atlas';

/** Ordered finale steps with copy for the hub and dev nav (see `docs/end-flow-atlas.md`). */
export const END_ATLAS_STEPS = [
  {
    path: '/endstart',
    title: 'endstart',
    description: 'Finale-splash; CTA → /tokenkey.',
  },
  {
    path: '/tokenkey',
    title: 'tokenkey',
    description: 'Symbolengrid (10 juiste letters).',
  },
  {
    path: '/letters',
    title: 'letters',
    description: 'Toont symbool → letter mapping (FLAMETHROW).',
  },
  {
    path: '/flame',
    title: 'flame',
    description: 'FLAME / THROWER sleeppuzzel.',
  },
  {
    path: '/eindscore',
    title: 'eindscore',
    description: 'Missie voltooid, scores.',
  },
  {
    path: '/watzullenwe',
    title: 'watzullenwe',
    description: 'Audio wat-nu.',
  },
] as const;

export type EndAtlasPath = (typeof END_ATLAS_STEPS)[number]['path'];

export const END_ATLAS_PATHS: readonly EndAtlasPath[] = END_ATLAS_STEPS.map((s) => s.path);

export function endAtlasSlugLabel(path: string): string {
  return path.replace(/^\//, '') || '/';
}

/** Optional href transform (e.g. query params); currently identity. */
export function endAtlasNavHref(path: EndAtlasPath): string {
  return path;
}

/** Prev/next for dev toolbar; null if `pathname` is not an end-atlas step. */
export function endAtlasNav(pathname: string) {
  const p = normalizeGameAtlasPathname(pathname);
  const idx = END_ATLAS_PATHS.indexOf(p as EndAtlasPath);
  if (idx < 0) return null;
  return {
    slug: endAtlasSlugLabel(p),
    prev: idx > 0 ? END_ATLAS_PATHS[idx - 1] : null,
    next: idx < END_ATLAS_PATHS.length - 1 ? END_ATLAS_PATHS[idx + 1] : null,
  };
}
