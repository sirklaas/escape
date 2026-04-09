import PocketBase from 'pocketbase';
/** Bundled copy — always available (no fetch / PocketBase required). Keep in sync with `public/escapedata.json`. */
import bundledEscapedata from '../../public/escapedata.json';

export const PB_URL = 'https://pinkmilk.pockethost.io';

/**
 * `city` on team-session rows in `escape_game_data`.
 * Admin may use e.g. `TEST Leiden`. Server: `PB_ESCAPE_TEAM_SESSION_CITY`; browser (location saves): `NEXT_PUBLIC_PB_ESCAPE_TEAM_SESSION_CITY`.
 */
export const PB_TEAM_SESSION_CITY =
  process.env.NEXT_PUBLIC_PB_ESCAPE_TEAM_SESSION_CITY ??
  process.env.PB_ESCAPE_TEAM_SESSION_CITY ??
  'team_session';

/** Rows that participate in sessions / leaderboard — excludes the global game JSON row only. */
export const PB_TEAM_ROWS_FILTER = 'team_name != "MASTER_DASHBOARD"';

/**
 * Design / offline: no PocketBase. Game JSON comes from `public/escapedata.json`.
 * - `NEXT_PUBLIC_SKIP_POCKETBASE=true` | `1` → skip PB (also in production)
 * - `NEXT_PUBLIC_SKIP_POCKETBASE=false` | `0` → use PB
 * - unset → skip only when `NODE_ENV === 'development'` (`next dev`)
 */
export function isPocketBaseSkipped(): boolean {
  const v = process.env.NEXT_PUBLIC_SKIP_POCKETBASE?.toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') return true;
  if (v === '0' || v === 'false' || v === 'no') return false;
  return process.env.NODE_ENV === 'development';
}

let pb: PocketBase | null = null;
export function getPB() {
  if (!pb) pb = new PocketBase(PB_URL);
  return pb;
}

// ── Types (Must match page.tsx and escapedata.json) ──────────────────────────
export type GameVariant = 'city' | 'diner' | 'rat';

export interface EscapePage {
  pageNumber: number;
  locationNumber: number;
  kop: string;
  bodyTxt: string;
  correctAnswer: string;
  hints: string[];
  nextPage: string;
  timerLimit?: number;
}

export interface EscapeLocation {
  locationNumber: number;
  name: string;
  heading: string;
  subheading: string;
  body: string;
  startUrl: string;
  skip?: boolean;
  mapUrl?: string;
  verificationAnswer?: string;
}

export interface VariantData {
  locations: EscapeLocation[];
  pages:     EscapePage[];
}

export interface EscapeData {
  activeVariant: GameVariant;
  city:  VariantData;
  diner: VariantData;
  rat:   VariantData;
}

const EMPTY_VARIANT: VariantData = { locations: [], pages: [] };

function isGameVariant(v: unknown): v is GameVariant {
  return v === 'city' || v === 'diner' || v === 'rat';
}

/**
 * PocketBase may return `gamedata` as a JSON string. Older seeds used a flat
 * `{ locations, pages }` shape like `public/escapedata.json` instead of nested
 * `{ city: { locations, pages }, ... }` — both must load or every location shows “Not Found”.
 */
function normalizeGamedata(raw: unknown): EscapeData | null {
  if (raw == null) return null;
  let data: unknown = raw;
  if (typeof data === 'string') {
    try {
      data = JSON.parse(data);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;

  const city = o.city;
  if (
    city &&
    typeof city === 'object' &&
    city !== null &&
    Array.isArray((city as VariantData).locations) &&
    Array.isArray((city as VariantData).pages)
  ) {
    const ed = data as EscapeData;
    const activeVariant = isGameVariant(ed.activeVariant) ? ed.activeVariant : 'city';
    return {
      activeVariant,
      city: ed.city,
      diner: ed.diner ?? EMPTY_VARIANT,
      rat: ed.rat ?? EMPTY_VARIANT,
    };
  }

  if (Array.isArray(o.locations) && Array.isArray(o.pages)) {
    const activeVariant = isGameVariant(o.activeVariant) ? o.activeVariant : 'city';
    return {
      activeVariant,
      city: {
        locations: o.locations as EscapeLocation[],
        pages: o.pages as EscapePage[],
      },
      diner: EMPTY_VARIANT,
      rat: EMPTY_VARIANT,
    };
  }

  return null;
}

// ── PocketBase Persistence ───────────────────────────────────────────────────

/** In-memory game JSON shipped with the app — primary source so location routes always have data. */
function getBundledEscapeData(): EscapeData | null {
  return normalizeGamedata(bundledEscapedata as unknown);
}

async function fetchEscapeDataFromPublicJson(): Promise<EscapeData | null> {
  try {
    const res = await fetch('/escapedata.json', { cache: 'no-store' });
    if (!res.ok) return null;
    const raw: unknown = await res.json();
    return normalizeGamedata(raw);
  } catch {
    return null;
  }
}

/**
 * Game data: bundled `escapedata.json` first, then PocketBase when enabled and reachable.
 * (`public/escapedata.json` is still fetched optionally if you replace it at runtime.)
 */
export async function fetchEscapeData(): Promise<EscapeData | null> {
  const bundled = getBundledEscapeData();
  if (isPocketBaseSkipped()) {
    return bundled ?? (await fetchEscapeDataFromPublicJson());
  }

  try {
    const pb = getPB();
    const record = await pb.collection('escape_game_data').getFirstListItem('team_name="MASTER_DASHBOARD"', { requestKey: null });
    const remote = normalizeGamedata(record.gamedata);
    if (remote) return remote;
  } catch (err) {
    console.error('PB Fetch Failed:', err);
  }

  return bundled ?? (await fetchEscapeDataFromPublicJson());
}

/**
 * Saves the entire EscapeData to the singleton record.
 */
export async function saveEscapeData(data: EscapeData): Promise<boolean> {
  if (isPocketBaseSkipped()) {
    console.warn('[escape] saveEscapeData: PocketBase skipped (design mode)');
    return false;
  }

  const pb = getPB();
  const payload = {
    team_name: "MASTER_DASHBOARD",
    gamedata: JSON.stringify(data),
    nr_teams: 1, // dummy value
    city: "all", // dummy value
    total_time: Date.now()
  };

  try {
    const existing = await pb.collection('escape_game_data').getFirstListItem('team_name="MASTER_DASHBOARD"');
    await pb.collection('escape_game_data').update(existing.id, payload);
    return true;
  } catch {
    try {
      await pb.collection('escape_game_data').create(payload);
      return true;
    } catch (createErr) {
      console.error('PB Save Failed:', createErr);
      return false;
    }
  }
}

// ── Team Session Progression ──────────────────────────────────────────────────

export interface TeamProgress {
  playedLocations: string[];
  times: Record<string, number>;
  playerNames?: string[];
}

/**
 * Fetches the progress for a specific team.
 * If the team doesn't exist yet, it returns an empty state safely.
 */
export async function fetchTeamProgress(teamId: string): Promise<TeamProgress> {
  if (isPocketBaseSkipped()) {
    return { playedLocations: [], times: {} };
  }

  const pb = getPB();
  try {
    const record = await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamId}"`, { requestKey: null });
    // PB might return a raw string or an object depending on column settings. Handle both gracefully.
    const rawData = record.gamedata;
    const parsedData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    
    return {
      playedLocations: parsedData?.playedLocations || [],
      times: parsedData?.times || {}
    };
  } catch (err) {
    // Safe default if the team record hasn't been created yet
    return { playedLocations: [], times: {} };
  }
}

/**
 * Marks a location as finished for a specific team, appending the slug and saving the time taken.
 * Automatically handles creating the team row if it is their first puzzle.
 */
export async function markLocationCompleted(teamId: string, slug: string, secondsTaken: number): Promise<boolean> {
  if (isPocketBaseSkipped()) {
    return true;
  }

  const pb = getPB();
  try {
    const current = await fetchTeamProgress(teamId);
    
    if (!current.playedLocations.includes(slug)) {
       current.playedLocations.push(slug);
    }
    
    // Increment or initialize the time tracking for this specific location
    current.times[slug] = (current.times[slug] || 0) + secondsTaken;

    const payload = {
      team_name: teamId,
      gamedata: JSON.stringify(current),
      nr_teams: 1,
      city: PB_TEAM_SESSION_CITY,
      total_time: Date.now(),
      current_page: 0,
      challenge_timer: 0,
    };

    try {
      const existing = await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamId}"`);
      await pb.collection('escape_game_data').update(existing.id, {
        gamedata: JSON.stringify(current),
        total_time: Date.now(),
      });
    } catch {
      await pb.collection('escape_game_data').create(payload);
    }
    return true;
  } catch (err) {
    console.error('PB Save Team Progress Failed:', err);
    return false;
  }
}
