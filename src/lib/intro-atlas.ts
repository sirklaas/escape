/**
 * Intro-flow routes — `/intro-atlas` hub + dev nav under the phone.
 */
export const INTRO_ATLAS_PATHS = [
  '/start',
  '/robotvid',
  '/teamnaam',
  '/players',
  '/uitleg',
  '/video122',
  '/vulin',
  '/122',
  '/toka',
] as const;

export type IntroAtlasPath = (typeof INTRO_ATLAS_PATHS)[number];

export function introAtlasSlugLabel(path: string): string {
  return path.replace(/^\//, '') || '/';
}

/** Prev/next for dev toolbar; null if `pathname` is not an intro-atlas step. */
export function introAtlasNav(pathname: string) {
  const idx = INTRO_ATLAS_PATHS.indexOf(pathname as IntroAtlasPath);
  if (idx < 0) return null;
  return {
    slug: introAtlasSlugLabel(pathname),
    prev: idx > 0 ? INTRO_ATLAS_PATHS[idx - 1] : null,
    next: idx < INTRO_ATLAS_PATHS.length - 1 ? INTRO_ATLAS_PATHS[idx + 1] : null,
  };
}
