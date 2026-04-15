/**
 * Total game flow — combines intro-atlas, game-atlas, and end-atlas
 * for complete end-to-end testing.
 *
 * NOTE: This is for DEV TESTING only.
 * Real game: /nine → choose location → complete sequence → back to /nine (repeat) → /endstart
 * Dev nav: Linear sequence showing each location's full puzzle flow
 *
 * Each location sequence: /locxx (with location context) → /od<location> → /even<location> → /leaderboard<location> → /tok<letter>
 * Tokens in this flow:
 * - Intro gives A via /toka
 * - Game locations give: F L W M E T H R O
 */

export type AtlasPhase = 'intro' | 'game' | 'end';

export interface TotalAtlasStep {
  path: string;
  phase: AtlasPhase;
  title: string;
  description: string;
}

/** Complete game flow from start to finish - DEV TESTING SEQUENCE */
export const TOTAL_ATLAS_STEPS: TotalAtlasStep[] = [
  // INTRO phase (9 steps)
  { path: '/start', phase: 'intro', title: 'start', description: 'Welkom + Start-knop' },
  { path: '/robotvid', phase: 'intro', title: 'robotvid', description: 'Robot video intro' },
  { path: '/teamnaam', phase: 'intro', title: 'teamnaam', description: 'Kies een teamnaam' },
  { path: '/players', phase: 'intro', title: 'players', description: 'Voeg spelers toe' },
  { path: '/uitleg', phase: 'intro', title: 'uitleg', description: 'Speluitleg' },
  { path: '/video122', phase: 'intro', title: 'video122', description: 'Video met hints voor 122' },
  { path: '/vulin', phase: 'intro', title: 'vulin', description: 'Vul 122 in om Token A te verdienen' },
  { path: '/122', phase: 'intro', title: '122', description: 'Fantastisch gedaan! 122 reward' },
  { path: '/toka', phase: 'intro', title: 'toka', description: 'Token A video (einde intro)' },
  { path: '/nine', phase: 'game', title: 'nine-1', description: 'Keuze scherm (kies volgende puzzel)' },

  // GAME phase - Location 1: Blokker (F token)
  { path: '/locxx', phase: 'game', title: 'locblokker', description: 'Locatie 1: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odblokker', description: 'Locatie 1: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenblokker', description: 'Locatie 1: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardblokker', description: 'Locatie 1: Leaderboard' },
  { path: '/tokf', phase: 'game', title: 'tokf', description: 'Locatie 1: Token F video' },
  { path: '/nine', phase: 'game', title: 'nine-2', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 2: Boek (L token)
  { path: '/locxx', phase: 'game', title: 'locboek', description: 'Locatie 2: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odboek', description: 'Locatie 2: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenboek', description: 'Locatie 2: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardboek', description: 'Locatie 2: Leaderboard' },
  { path: '/tokl', phase: 'game', title: 'tokl', description: 'Locatie 2: Token L video' },
  { path: '/nine', phase: 'game', title: 'nine-3', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 3: Electro (W token)
  { path: '/locxx', phase: 'game', title: 'locelectro', description: 'Locatie 3: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odelectro', description: 'Locatie 3: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenelectro', description: 'Locatie 3: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardelectro', description: 'Locatie 3: Leaderboard' },
  { path: '/tokw', phase: 'game', title: 'tokw', description: 'Locatie 3: Token W video' },
  { path: '/nine', phase: 'game', title: 'nine-4', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 4: Lijst (M token)
  { path: '/locxx', phase: 'game', title: 'loclijst', description: 'Locatie 4: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odlijst', description: 'Locatie 4: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenlijst', description: 'Locatie 4: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardlijst', description: 'Locatie 4: Leaderboard' },
  { path: '/tokm', phase: 'game', title: 'tokm', description: 'Locatie 4: Token M video' },
  { path: '/nine', phase: 'game', title: 'nine-5', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 5: Kerk (E token)
  { path: '/locxx', phase: 'game', title: 'lockerk', description: 'Locatie 5: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odkerk', description: 'Locatie 5: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenkerk', description: 'Locatie 5: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardkerk', description: 'Locatie 5: Leaderboard' },
  { path: '/toke', phase: 'game', title: 'toke', description: 'Locatie 5: Token E video' },
  { path: '/nine', phase: 'game', title: 'nine-6', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 6: Brug (T token)
  { path: '/locxx', phase: 'game', title: 'locbrug', description: 'Locatie 6: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odbrug', description: 'Locatie 6: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evenbrug', description: 'Locatie 6: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardbrug', description: 'Locatie 6: Leaderboard' },
  { path: '/tokt', phase: 'game', title: 'tokt', description: 'Locatie 6: Token T video' },
  { path: '/nine', phase: 'game', title: 'nine-7', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 7: Count (H token)
  { path: '/locxx', phase: 'game', title: 'loccount', description: 'Locatie 7: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odcount', description: 'Locatie 7: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evencount', description: 'Locatie 7: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardcount', description: 'Locatie 7: Leaderboard' },
  { path: '/tokh', phase: 'game', title: 'tokh', description: 'Locatie 7: Token H video' },
  { path: '/nine', phase: 'game', title: 'nine-8', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 8: Gall (R token)
  { path: '/locxx', phase: 'game', title: 'locgall', description: 'Locatie 8: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'odgall', description: 'Locatie 8: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evengall', description: 'Locatie 8: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboardgall', description: 'Locatie 8: Leaderboard' },
  { path: '/tokr', phase: 'game', title: 'tokr', description: 'Locatie 8: Token R video' },
  { path: '/nine', phase: 'game', title: 'nine-9', description: 'Terug naar keuze scherm' },

  // GAME phase - Location 9: Drog (O token)
  { path: '/locxx', phase: 'game', title: 'locdrog', description: 'Locatie 9: Gekozen op /nine + map hint' },
  { path: '/pageodd', phase: 'game', title: 'oddrog', description: 'Locatie 9: Puzzel' },
  { path: '/pageeven', phase: 'game', title: 'evendrog', description: 'Locatie 9: Succes' },
  { path: '/leaderboard', phase: 'game', title: 'leaderboarddrog', description: 'Locatie 9: Leaderboard' },
  { path: '/toko', phase: 'game', title: 'toko', description: 'Locatie 9: Token O video' },
  { path: '/nine', phase: 'game', title: 'nine-10', description: 'Laatste terugkeer naar keuze scherm' },

  // END phase (6 steps) - finale after collecting all 9 tokens
  { path: '/endstart', phase: 'end', title: 'endstart', description: 'Finale splash - start end game' },
  { path: '/tokenkey', phase: 'end', title: 'tokenkey', description: 'Symbolengrid (10 juiste letters)' },
  { path: '/letters', phase: 'end', title: 'letters', description: 'Symbool → letter mapping' },
  { path: '/flame', phase: 'end', title: 'flame', description: 'FLAME / THROWER sleeppuzzel' },
  { path: '/eindscore', phase: 'end', title: 'eindscore', description: 'Missie voltooid, scores' },
  { path: '/watzullenwe', phase: 'end', title: 'watzullenwe', description: 'Audio wat-nu' },
];

export type TotalAtlasPath = TotalAtlasStep['path'];

/** Get href for navigation */
export function totalAtlasNavHref(path: string, locationSlug?: string): string {
  if (locationSlug && (path === '/locxx' || path === '/pageodd' || path === '/pageeven')) {
    return `${path}?location=${encodeURIComponent(locationSlug)}`;
  }
  return path;
}

/** Extract slug from path for display */
export function totalAtlasSlugLabel(path: string): string {
  return path.replace(/^\//, '') || '/';
}

/** Get phase color for UI */
export function totalAtlasPhaseColor(phase: AtlasPhase): string {
  switch (phase) {
    case 'intro':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'game':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'end':
      return 'bg-rose-100 text-rose-800 border-rose-200';
    default:
      return 'bg-zinc-100 text-zinc-800 border-zinc-200';
  }
}

/** Get phase label */
export function totalAtlasPhaseLabel(phase: AtlasPhase): string {
  switch (phase) {
    case 'intro':
      return 'Intro';
    case 'game':
      return 'Game';
    case 'end':
      return 'End';
    default:
      return phase;
  }
}

/** Prev/next navigation for any path in the total atlas */
function expectedTitleForPathAndLocation(path: string, locationSlug?: string): string | null {
  if (!locationSlug) return null;
  switch (path) {
    case '/locxx':
      return `loc${locationSlug}`;
    case '/pageodd':
      return `od${locationSlug}`;
    case '/pageeven':
      return `even${locationSlug}`;
    case '/leaderboard':
      return `leaderboard${locationSlug}`;
    default:
      return null;
  }
}

export function totalAtlasNav(pathname: string, locationSlug?: string) {
  const p = pathname.split('?')[0].split('#')[0];
  const matches = TOTAL_ATLAS_STEPS
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => step.path === p)
    .map(({ index }) => index);
  let idx = matches[0] ?? -1;

  if (matches.length > 1) {
    // First preference: choose deterministic step using selected location context.
    const expectedTitle = expectedTitleForPathAndLocation(p, locationSlug);
    if (expectedTitle) {
      const exact = matches.find((m) => TOTAL_ATLAS_STEPS[m].title === expectedTitle);
      if (exact !== undefined) {
        idx = exact;
      }
    }

    // Fallback for duplicate paths without location context (/nine, /toka): preserve stable render.
    if (typeof window !== 'undefined' && (idx < 0 || !expectedTitle)) {
      const rawLast = window.sessionStorage.getItem('total-atlas-last-idx');
      const rawLastPath = window.sessionStorage.getItem('total-atlas-last-path');
      const lastIdx = rawLast ? Number(rawLast) : NaN;

      if (Number.isFinite(lastIdx) && rawLastPath === p && matches.includes(lastIdx)) {
        idx = lastIdx;
      } else if (Number.isFinite(lastIdx)) {
        const nextMatch = matches.find((m) => m > lastIdx);
        idx = nextMatch ?? matches[0];
      }
    }
  }

  if (idx < 0) return null;
  if (typeof window !== 'undefined') {
    window.sessionStorage.setItem('total-atlas-last-idx', String(idx));
    window.sessionStorage.setItem('total-atlas-last-path', p);
  }

  const step = TOTAL_ATLAS_STEPS[idx];
  return {
    slug: step.title.startsWith('nine-') ? 'nine' : step.title,
    phase: step.phase,
    stepNumber: idx + 1,
    totalSteps: TOTAL_ATLAS_STEPS.length,
    prev: idx > 0 ? TOTAL_ATLAS_STEPS[idx - 1] : null,
    next: idx < TOTAL_ATLAS_STEPS.length - 1 ? TOTAL_ATLAS_STEPS[idx + 1] : null,
  };
}

/** Get all steps for a specific phase */
export function totalAtlasStepsByPhase(phase: AtlasPhase): TotalAtlasStep[] {
  return TOTAL_ATLAS_STEPS.filter((s) => s.phase === phase);
}
