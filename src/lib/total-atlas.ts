/**
 * Total game flow — combines intro-atlas, game-atlas, and end-atlas
 * for complete end-to-end testing.
 */

import type { IntroAtlasPath } from '@/lib/intro-atlas';
import type { GameAtlasPath } from '@/lib/game-atlas';
import type { EndAtlasPath } from '@/lib/end-atlas';

export type AtlasPhase = 'intro' | 'game' | 'end';

export interface TotalAtlasStep {
  path: string;
  phase: AtlasPhase;
  title: string;
  description: string;
}

/** Complete game flow from start to finish */
export const TOTAL_ATLAS_STEPS: TotalAtlasStep[] = [
  // INTRO phase
  { path: '/start', phase: 'intro', title: 'Start', description: 'Welkom + Start-knop' },
  { path: '/robotvid', phase: 'intro', title: 'robotvid', description: 'Robot video intro' },
  { path: '/teamnaam', phase: 'intro', title: 'teamnaam', description: 'Kies een teamnaam' },
  { path: '/players', phase: 'intro', title: 'players', description: 'Voeg spelers toe' },
  { path: '/uitleg', phase: 'intro', title: 'uitleg', description: 'Speluitleg' },
  { path: '/video122', phase: 'intro', title: 'video122', description: 'Video voor locatie 122' },
  { path: '/vulin', phase: 'intro', title: 'vulin', description: 'Vul in puzzle (1234 → QR)' },
  { path: '/122', phase: 'intro', title: '122', description: 'QR scan → toka' },
  { path: '/toka', phase: 'intro', title: 'toka', description: 'Token A video (einde intro)' },

  // GAME phase
  { path: '/nine', phase: 'game', title: 'nine', description: '9-vlak grid opdrachten' },
  { path: '/locxx', phase: 'game', title: 'locxx', description: 'Locatie hint + map' },
  { path: '/pageodd', phase: 'game', title: 'pageodd', description: 'Puzzel (timer + PB data)' },
  { path: '/pageeven', phase: 'game', title: 'pageeven', description: 'Succes modal' },
  { path: '/toka', phase: 'game', title: 'toka', description: 'Token A video (einde game loop)' },

  // END phase
  { path: '/endstart', phase: 'end', title: 'endstart', description: 'Finale splash' },
  { path: '/tokenkey', phase: 'end', title: 'tokenkey', description: 'Symbolengrid (10 juiste letters)' },
  { path: '/letters', phase: 'end', title: 'letters', description: 'Symbool → letter mapping' },
  { path: '/flame', phase: 'end', title: 'flame', description: 'FLAME / THROWER sleeppuzzel' },
  { path: '/eindscore', phase: 'end', title: 'eindscore', description: 'Missie voltooid, scores' },
  { path: '/watzullenwe', phase: 'end', title: 'watzullenwe', description: 'Audio wat-nu' },
];

export type TotalAtlasPath = TotalAtlasStep['path'];

/** Get href for navigation (handles special cases like query params) */
export function totalAtlasNavHref(path: string): string {
  // Game-atlas toka needs atlas=1 param
  if (path === '/toka') {
    // Determine context by checking where we came from
    return '/toka?atlas=1';
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
export function totalAtlasNav(pathname: string) {
  const p = pathname.split('?')[0].split('#')[0];
  const idx = TOTAL_ATLAS_STEPS.findIndex((s) => s.path === p);
  if (idx < 0) return null;

  const step = TOTAL_ATLAS_STEPS[idx];
  return {
    slug: totalAtlasSlugLabel(p),
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
