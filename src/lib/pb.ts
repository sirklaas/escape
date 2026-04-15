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
export const PB_SCORES_COLLECTION = 'escape_player_scores';

/**
 * Design / offline: no PocketBase. Game JSON comes from `public/escapedata.json`.
 * - `NEXT_PUBLIC_SKIP_POCKETBASE=true` | `1` → skip PB (also in production)
 * - `NEXT_PUBLIC_SKIP_POCKETBASE=false` | `0` → use PB
 * - unset → use PB (skip is now explicit opt-in)
 */
export function isPocketBaseSkipped(): boolean {
  const v = process.env.NEXT_PUBLIC_SKIP_POCKETBASE?.toLowerCase();
  if (v === '1' || v === 'true' || v === 'yes') return true;
  if (v === '0' || v === 'false' || v === 'no') return false;
  return false;
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
  plusCode?: string;  // Google Plus Code (open location code) e.g., "9F4W9C8C+W4"
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
export function normalizeGamedata(raw: unknown): EscapeData | null {
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
    const variantData: VariantData = {
      locations: o.locations as EscapeLocation[],
      pages: o.pages as EscapePage[],
    };
    // Populate all variants with the same data for now
    // (each game has one master config shared across variants in PB)
    return {
      activeVariant,
      city: variantData,
      diner: variantData,
      rat: variantData,
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
 * Reads from the priority=1 game's masterdasboard field.
 * (`public/escapedata.json` is still fetched optionally if you replace it at runtime.)
 */
export async function fetchEscapeData(): Promise<EscapeData | null> {
  const bundled = getBundledEscapeData();
  
  try {
    const pb = getPB();
    // Get the priority=1 game (active game) and read masterdasboard
    const record = await pb.collection('escape_game_data').getFirstListItem('priority=1', { requestKey: null });
    console.log('Priority=1 game record:', record);
    const remote = normalizeGamedata(record.masterdasboard);
    console.log('Normalized masterdasboard data:', remote);
    if (remote) return remote;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('PB Fetch Failed:', message);
  }

  console.log('Falling back to bundled data');
  return bundled ?? (await fetchEscapeDataFromPublicJson());
}

/**
 * Saves the entire EscapeData to a specific game's masterdasboard field.
 * If no sessionId provided, saves to priority=1 game.
 */
export async function saveEscapeData(data: EscapeData, sessionId?: string): Promise<boolean> {
  if (isPocketBaseSkipped()) {
    console.warn('[escape] saveEscapeData: PocketBase skipped (design mode)');
    return false;
  }

  if (!sessionId) {
    throw new Error('No session selected - select a game first');
  }

  try {
    // Use server-side API route to save (handles admin auth securely)
    const res = await fetch('/api/dashboard/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, data }),
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      throw new Error(result.error || `HTTP ${res.status}`);
    }

    console.log('Saved masterdasboard to game:', sessionId);
    return true;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('PB Save Failed:', message);
    throw err;
  }
}

// ── Team Session Progression ──────────────────────────────────────────────────

export interface TeamProgress {
  playedLocations: string[];
  times: Record<string, number>;
  playerNames?: string[];
  locationData?: TeamLocationData;
}

export type LocationPhase = 'odd' | 'even';

export interface TeamLocationPhaseTimes {
  odd: number;
  even: number;
}

export interface TeamLocationData {
  activeGameId: string | null;
  activeGameCity: string;
  playedLocations: string[];
  times: Record<string, number>;
  pageBudgets: Record<string, TeamLocationPhaseTimes>;
  pageTimes: Record<string, TeamLocationPhaseTimes>;
}

function toPositiveNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function normalizeTeamLocationData(rawData: unknown): TeamLocationData {
  const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
  const asObj = (parsed && typeof parsed === 'object' ? parsed : {}) as Record<string, unknown>;
  const activeGameId = typeof asObj.activeGameId === 'string' ? asObj.activeGameId : null;
  const activeGameCity = typeof asObj.activeGameCity === 'string' ? asObj.activeGameCity : PB_TEAM_SESSION_CITY;
  const playedLocations = Array.isArray(asObj.playedLocations) ? (asObj.playedLocations as string[]) : [];
  const times = (asObj.times && typeof asObj.times === 'object' ? asObj.times : {}) as Record<string, number>;
  const pageBudgets = (asObj.pageBudgets && typeof asObj.pageBudgets === 'object'
    ? asObj.pageBudgets
    : {}) as Record<string, TeamLocationPhaseTimes>;
  const pageTimes = (asObj.pageTimes && typeof asObj.pageTimes === 'object'
    ? asObj.pageTimes
    : {}) as Record<string, TeamLocationPhaseTimes>;

  return {
    activeGameId,
    activeGameCity,
    playedLocations,
    times,
    pageBudgets,
    pageTimes,
  };
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
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name="${teamId}"`, { requestKey: null });
    // PB might return a raw string or an object depending on column settings. Handle both gracefully.
    const parsedData = normalizeTeamLocationData(record.location_data);
    const playersRaw = record.players;
    const parsedPlayers = typeof playersRaw === 'string' ? JSON.parse(playersRaw) : playersRaw;
    
    return {
      playedLocations: parsedData.playedLocations || [],
      times: parsedData.times || {},
      playerNames: parsedPlayers?.playerNames || [],
      locationData: parsedData,
    };
  } catch {
    // Safe default if the team record hasn't been created yet
    return { playedLocations: [], times: {} };
  }
}

export async function markTeamStartIfUnset(teamId: string): Promise<boolean> {
  if (isPocketBaseSkipped()) return true;
  const pb = getPB();
  try {
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name="${teamId}"`, { requestKey: null });
    const existingStart = typeof record.start === 'string' ? record.start : '';
    if (existingStart.trim()) return true;
    await pb.collection(PB_SCORES_COLLECTION).update(record.id, { start: new Date().toISOString() });
    return true;
  } catch (err) {
    console.error('Failed to set team start time:', err);
    return false;
  }
}

export async function recordLocationPageTime(
  teamId: string,
  slug: string,
  phase: LocationPhase,
  secondsTaken: number,
): Promise<boolean> {
  if (isPocketBaseSkipped()) return true;
  const pb = getPB();
  try {
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name="${teamId}"`, { requestKey: null });
    const locationData = normalizeTeamLocationData(record.location_data);
    const budget = locationData.pageBudgets[slug] || { odd: 600, even: 600 };
    const current = locationData.pageTimes[slug] || { odd: budget.odd, even: budget.even };
    const normalizedSeconds = toPositiveNumber(secondsTaken, phase === 'odd' ? budget.odd : budget.even);
    current[phase] = normalizedSeconds;
    locationData.pageTimes[slug] = current;
    locationData.times[slug] = toPositiveNumber(current.odd, 0) + toPositiveNumber(current.even, 0);

    await pb.collection(PB_SCORES_COLLECTION).update(record.id, {
      location_data: locationData,
    });
    return true;
  } catch (err) {
    console.error('Failed to record page time:', err);
    return false;
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
    const locationData = current.locationData ?? {
      activeGameId: null,
      activeGameCity: PB_TEAM_SESSION_CITY,
      playedLocations: current.playedLocations,
      times: current.times,
      pageBudgets: {},
      pageTimes: {},
    };
    
    if (!locationData.playedLocations.includes(slug)) {
      locationData.playedLocations.push(slug);
    }

    const phaseTimes = locationData.pageTimes[slug];
    const totalForLocation = phaseTimes
      ? toPositiveNumber(phaseTimes.odd, 0) + toPositiveNumber(phaseTimes.even, 0)
      : toPositiveNumber(secondsTaken, 0);
    locationData.times[slug] = totalForLocation;

    const payload = {
      team_name: teamId,
      location_data: locationData,
      players: { playerNames: current.playerNames || [] },
      city: locationData.activeGameCity || PB_TEAM_SESSION_CITY,
      flame_completed: false,
      time_left: 90,
      start: '',
    };

    try {
      const existing = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name="${teamId}"`);
      await pb.collection(PB_SCORES_COLLECTION).update(existing.id, {
        location_data: locationData,
      });
    } catch {
      await pb.collection(PB_SCORES_COLLECTION).create(payload);
    }
    return true;
  } catch (err) {
    console.error('PB Save Team Progress Failed:', err);
    return false;
  }
}
