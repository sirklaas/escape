"use server";

import PocketBase from 'pocketbase';
import { PB_URL, PB_TEAM_SESSION_CITY, isPocketBaseSkipped, normalizeGamedata, type EscapeData } from '@/lib/pb';
import { LOCATION_SLUG_ORDER } from '@/lib/location-slugs';

const PB_SCORES_COLLECTION = 'escape_player_scores';

type PagePhaseTimes = { odd: number; even: number };

function toPositiveNumber(value: unknown, fallback: number): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function getDefaultLocationData(
  masterdasboard: unknown,
  activeGameId: string | null,
  activeGameCity: string,
): {
  activeGameId: string | null;
  activeGameCity: string;
  playedLocations: string[];
  times: Record<string, number>;
  pageBudgets: Record<string, PagePhaseTimes>;
  pageTimes: Record<string, PagePhaseTimes>;
} {
  const normalized = normalizeGamedata(masterdasboard);
  const activeVariant = normalized?.activeVariant ?? 'city';
  const variantData = (normalized as EscapeData | null)?.[activeVariant];
  const pages = variantData?.pages ?? [];

  const pageBudgets: Record<string, PagePhaseTimes> = {};
  const pageTimes: Record<string, PagePhaseTimes> = {};

  LOCATION_SLUG_ORDER.forEach((slug, idx) => {
    const locationNumber = idx + 1;
    const locationPages = pages
      .filter((p) => p.locationNumber === locationNumber)
      .sort((a, b) => a.pageNumber - b.pageNumber);

    const oddDefault = toPositiveNumber(locationPages[0]?.timerLimit, 600);
    const evenDefault = toPositiveNumber(locationPages[1]?.timerLimit, oddDefault);

    pageBudgets[slug] = { odd: oddDefault, even: evenDefault };
    pageTimes[slug] = { odd: oddDefault, even: evenDefault };
  });

  return {
    activeGameId,
    activeGameCity,
    playedLocations: [],
    times: {},
    pageBudgets,
    pageTimes,
  };
}

export type LeaderboardEntry = {
  teamName: string;
  totalTime: number;
};

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  if (isPocketBaseSkipped()) return [];

  const pb = new PocketBase(PB_URL);

  try {
    // Authenticate securely on the server using the master credentials provided in the legacy file
    // await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");

    // Pull team score rows from dedicated score collection.
    const records = await pb.collection(PB_SCORES_COLLECTION).getFullList({ requestKey: null });

    const entries: LeaderboardEntry[] = [];

    for (const record of records) {
      const locationData =
        typeof record.location_data === 'string'
          ? JSON.parse(record.location_data)
          : record.location_data ?? {};
      const playedLocations: string[] = locationData?.playedLocations || [];
      const times: Record<string, number> = locationData?.times || {};
      const pageTimes: Record<string, { odd?: number; even?: number }> = locationData?.pageTimes || {};
      
      let totalTime = 0;
      const hasPageTimes = pageTimes && Object.keys(pageTimes).length > 0;
      if (hasPageTimes) {
        for (const phaseTimes of Object.values(pageTimes)) {
          totalTime += toPositiveNumber(phaseTimes?.odd, 0);
          totalTime += toPositiveNumber(phaseTimes?.even, 0);
        }
      } else {
        // Backward compatibility with legacy location totals.
        let playedCount = 0;
        for (const [slug, time] of Object.entries(times)) {
          if (playedLocations.includes(slug)) {
            totalTime += time as number;
            playedCount++;
          }
        }
        const unplayedCount = 9 - playedCount;
        if (unplayedCount > 0) {
          totalTime += (unplayedCount * 2500);
        }
      }

      entries.push({
        teamName: record.team_name,
        totalTime
      });
    }

    // Return officially sorted from lowest time to highest time
    entries.sort((a, b) => a.totalTime - b.totalTime);
    
    return entries;

  } catch (err) {
    console.error("Critical failure pulling leaderboard data Server-Side:", err);
    return [];
  }
}

export async function checkTeamExistsAction(teamName: string): Promise<boolean> {
  if (isPocketBaseSkipped()) return false;

  const pb = new PocketBase(PB_URL);
  try {
    // await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name = "${teamName}"`, { requestKey: null });
    return !!record;
  } catch (err) {
    return false;
  }
}

export async function getLastSavedTeamAction(): Promise<string | null> {
  if (isPocketBaseSkipped()) return null;

  const pb = new PocketBase(PB_URL);
  try {
    // await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
    const records = await pb.collection(PB_SCORES_COLLECTION).getList(1, 1, {
      sort: '-created',
      requestKey: null,
    });
    if (records.items.length > 0) {
      return records.items[0].team_name;
    }
    return null;
  } catch (err) {
    console.error("Failed to get last saved team:", err);
    return null;
  }
}

export async function initializeTeamAction(teamName: string): Promise<{ success: boolean; message?: string }> {
  if (isPocketBaseSkipped()) {
    return { success: true };
  }

  const pb = new PocketBase(PB_URL);
  try {
    // await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");

    let activeGameId: string | null = null;
    let activeGameCity = PB_TEAM_SESSION_CITY;
    let activeGameDurationMinutes = 90;
    let activeGameMasterdasboard: unknown = null;
    try {
      const activeGame = await pb.collection('escape_game_data').getFirstListItem('priority=1', { requestKey: null });
      activeGameId = activeGame.id;
      if (typeof activeGame.city === 'string' && activeGame.city.trim()) {
        activeGameCity = activeGame.city.trim();
      }
      activeGameMasterdasboard = activeGame.masterdasboard ?? null;
      const gameMeta = typeof activeGame.gamedata === 'string' ? JSON.parse(activeGame.gamedata) : activeGame.gamedata ?? {};
      activeGameDurationMinutes = toPositiveNumber(gameMeta?.gameDurationLimit, 90);
    } catch {
      // Fallback to PB_TEAM_SESSION_CITY when no active game is available.
    }
    
    // Check if team name already exists
    try {
      const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name = "${teamName}"`, { requestKey: null });
      if (record) return { success: false, message: 'Deze teamnaam bestaat al. Wees creatief en kies een andere naam.' };
    } catch (err) {
       // record not found, continue
    }

    // Initialize score row for this team in dedicated score collection.
    const data = {
      team_name: teamName,
      players: {
        playerNames: [],
      },
      location_data: getDefaultLocationData(activeGameMasterdasboard, activeGameId, activeGameCity),
      city: activeGameCity,
      flame_completed: false,
      time_left: activeGameDurationMinutes,
      start: '',
    };
    
    await pb.collection(PB_SCORES_COLLECTION).create(data);
    return { success: true };
  } catch (err) {
    console.error("Failed to initialize team:", err);
    return { success: false, message: 'Er is een fout opgetreden bij het opslaan van de teamnaam. Probeer het opnieuw.' };
  }
}

export async function updatePlayerNamesAction(teamName: string, playerNames: string[]): Promise<boolean> {
  if (isPocketBaseSkipped()) {
    return true;
  }

  const pb = new PocketBase(PB_URL);
  try {
    // await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");
    
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(`team_name = "${teamName}"`, { requestKey: null });
    const currentPlayers = typeof record.players === 'string' ? JSON.parse(record.players) : record.players ?? {};
    currentPlayers.playerNames = playerNames;
    
    await pb.collection(PB_SCORES_COLLECTION).update(record.id, {
      players: currentPlayers
    });
    return true;
  } catch (err) {
    console.error("Failed to update player names:", err);
    return false;
  }
}

export async function markFlameWinnerAction(
  teamName: string
): Promise<{ success: boolean; rank: number | null }> {
  if (isPocketBaseSkipped()) {
    return { success: true, rank: 1 };
  }

  const pb = new PocketBase(PB_URL);
  try {
    // Fetch the team record
    const record = await pb.collection(PB_SCORES_COLLECTION).getFirstListItem(
      `team_name = "${teamName}"`,
      { requestKey: null }
    );
    const locationData =
      typeof record.location_data === 'string'
        ? JSON.parse(record.location_data)
        : record.location_data ?? {};

    locationData.flameCompletedAt = Date.now();

    await pb.collection(PB_SCORES_COLLECTION).update(record.id, {
      location_data: locationData,
      flame_completed: true,
    });

    // Determine rank: how many teams have already completed flame before us?
    const allRecords = await pb.collection(PB_SCORES_COLLECTION).getFullList({ requestKey: null });

    const completedTimes = allRecords
      .map((r) => {
        const ld =
          typeof r.location_data === 'string' ? JSON.parse(r.location_data) : r.location_data ?? {};
        return r.flame_completed ? (ld.flameCompletedAt as number) : null;
      })
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b);

    const rank =
      completedTimes.indexOf(locationData.flameCompletedAt as number) + 1 || 1;

    return { success: true, rank };
  } catch (err) {
    console.error('markFlameWinnerAction failed:', err);
    return { success: false, rank: null };
  }
}
