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
}

export interface EscapeLocation {
  locationNumber: number;
  name: string;
  heading: string;
  subheading: string;
  body: string;
  startUrl: string;
}

export interface VariantData {
  locations: EscapeLocation[];
  pages:     EscapePage[];
}

export interface EscapeData {
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
    const record = await pb.collection('escape_game_data').getFirstListItem('team_name="MASTER_DASHBOARD"');
    // The data is stored as a JSON string in the 'gamedata' field
    return JSON.parse(record.gamedata) as EscapeData;
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
