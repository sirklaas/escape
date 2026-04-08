import PocketBase from 'pocketbase';

export const PB_URL = 'https://pinkmilk.pockethost.io';

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

// ── PocketBase Persistence ───────────────────────────────────────────────────

/**
 * Fetches the entire EscapeData from a singleton record in 'escape_game_data'
 * We use a specific team_name="MASTER_DASHBOARD" to identify the record.
 */
export async function fetchEscapeData(): Promise<EscapeData | null> {
  const pb = getPB();
  try {
    const record = await pb.collection('escape_game_data').getFirstListItem('team_name="MASTER_DASHBOARD"', { requestKey: null });
    // The data is returned as an object by the PB SDK if the field type is JSON
    return record.gamedata as EscapeData;
  } catch (err) {
    console.error('PB Fetch Failed:', err);
    return null;
  }
}

/**
 * Saves the entire EscapeData to the singleton record.
 */
export async function saveEscapeData(data: EscapeData): Promise<boolean> {
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
       nr_teams: 1, // Dummy required field
       city: "team_session", 
       total_time: Date.now()
    };

    try {
      const existing = await pb.collection('escape_game_data').getFirstListItem(`team_name="${teamId}"`);
      await pb.collection('escape_game_data').update(existing.id, payload);
    } catch {
      await pb.collection('escape_game_data').create(payload);
    }
    return true;
  } catch (err) {
    console.error('PB Save Team Progress Failed:', err);
    return false;
  }
}
