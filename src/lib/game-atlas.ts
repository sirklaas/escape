/**
 * Game-flow routes — `/game-atlas` hub + dev nav under the phone (same bar as intro).
 * Linear QA path; `/toka` (Token A video) matches intro end step — dev nav prefers
 * `gameAtlasNav` so Previous/Next follow this list on `/toka` (see `IntroFlowDevNav`).
 *
 * **LocXX → PageOdd → PageEven** are three **steps of one location** (same PB slug):
 * map / direction → puzzle (timer + copy from PB) → success modal. See `LocationPlayer`
 * `atlasPhase` prop.
 */
/** One nine-grid slug for the atlas location flow (map → puzzle → success). */
export const GAME_ATLAS_LOCATION_SLUG = 'blokker' as const;

export type GameAtlasPhase = 'locxx' | 'pageodd' | 'pageeven';

/** Main game QA path. Finale spine (`/tokenkey` … `/watzullenwe`) lives in `END_ATLAS_PATHS` (`end-atlas.ts`). */
export const GAME_ATLAS_PATHS = [
  '/nine',
  '/locxx',
  '/pageodd',
  '/pageeven',
  '/toka',
] as const;

export type GameAtlasPath = (typeof GAME_ATLAS_PATHS)[number];

/** Same mapping as `LocationPlayer` video step — PB `nextPage` URL → bundled asset. */
export function tokenVideoSrcFromNextPageUrl(url: string): string {
  if (url.includes('/toka/')) return '/videos/tokenA.mp4';
  if (url.includes('/toke/')) return '/videos/tokenE.mp4';
  if (url.includes('/tokh/')) return '/videos/tokenH.mp4';
  return '/videos/tokenA.mp4';
}

/**
 * Full href for dev nav / hub links. Intro `/toka` stays gated by `/vulin`; game-atlas
 * uses `?atlas=1` so QA can go pageeven → token video without opdracht één.
 */
export function gameAtlasNavHref(path: GameAtlasPath): string {
  if (path === '/toka') return '/toka?atlas=1';
  return path;
}

export function gameAtlasSlugLabel(path: string): string {
  return path.replace(/^\//, '') || '/';
}

/** Stabilize URL for atlas matching (trailing slash, etc.). */
export function normalizeGameAtlasPathname(pathname: string): string {
  const p = pathname.split('?')[0].split('#')[0];
  if (!p) return '';
  if (p.length > 1 && p.endsWith('/')) return p.slice(0, -1);
  return p;
}

/** `/locxx` | `/pageodd` | `/pageeven` — same names as `GameAtlasPhase`. */
export function gameAtlasPathFromPhase(phase: GameAtlasPhase): GameAtlasPath {
  return `/${phase}` as GameAtlasPath;
}

/** Prev/next for dev toolbar; null if `pathname` is not a game-atlas step. */
export function gameAtlasNav(pathname: string) {
  const p = normalizeGameAtlasPathname(pathname);
  const idx = GAME_ATLAS_PATHS.indexOf(p as GameAtlasPath);
  if (idx < 0) return null;
  return {
    slug: gameAtlasSlugLabel(p),
    prev: idx > 0 ? GAME_ATLAS_PATHS[idx - 1] : null,
    next: idx < GAME_ATLAS_PATHS.length - 1 ? GAME_ATLAS_PATHS[idx + 1] : null,
  };
}
