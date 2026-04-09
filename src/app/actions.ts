"use server";

import PocketBase from 'pocketbase';
import { PB_URL, PB_TEAM_ROWS_FILTER, PB_TEAM_SESSION_CITY, isPocketBaseSkipped } from '@/lib/pb';

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

    // Pull every tracking row marked as a team session
    const records = await pb.collection('escape_game_data').getFullList({
      filter: PB_TEAM_ROWS_FILTER,
    });

    const entries: LeaderboardEntry[] = [];

    for (const record of records) {
      if (!record.gamedata) continue;
      
      const gamedata = typeof record.gamedata === 'string' ? JSON.parse(record.gamedata) : record.gamedata;
      const playedLocations: string[] = gamedata?.playedLocations || [];
      const times: Record<string, number> = gamedata?.times || {};
      
      let totalTime = 0;
      let playedCount = 0;

      // Extract the exact time spent per completed game
      for (const [slug, time] of Object.entries(times)) {
        if (playedLocations.includes(slug)) {
          totalTime += time as number;
          playedCount++;
        }
      }

      // Legacy Rule: Apply exactly 2500 seconds penalty for any of the 9 games left unfinished
      const unplayedCount = 9 - playedCount;
      if (unplayedCount > 0) {
        totalTime += (unplayedCount * 2500);
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
    const record = await pb.collection('escape_game_data').getFirstListItem(`team_name = "${teamName}"`, { requestKey: null });
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
    const records = await pb.collection('escape_game_data').getList(1, 1, {
      sort: '-created',
      filter: PB_TEAM_ROWS_FILTER,
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
    
    // Check if team name already exists
    try {
      const record = await pb.collection('escape_game_data').getFirstListItem(`team_name = "${teamName}"`);
      if (record) return { success: false, message: 'Deze teamnaam bestaat al. Wees creatief en kies een andere naam.' };
    } catch (err) {
       // record not found, continue
    }

    // Initialize with empty gamedata for a new session
    const data = {
      team_name: teamName,
      gamedata: JSON.stringify({
        playedLocations: [],
        times: {},
      }),
      nr_teams: 1,
      city: PB_TEAM_SESSION_CITY,
      total_time: Date.now(),
      current_page: 0,
      challenge_timer: 0,
    };
    
    await pb.collection('escape_game_data').create(data);
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
    
    const record = await pb.collection('escape_game_data').getFirstListItem(`team_name = "${teamName}"`);
    const currentGamedata = typeof record.gamedata === 'string' ? JSON.parse(record.gamedata) : record.gamedata;
    
    currentGamedata.playerNames = playerNames;
    
    await pb.collection('escape_game_data').update(record.id, {
      gamedata: JSON.stringify(currentGamedata)
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
    const record = await pb.collection('escape_game_data').getFirstListItem(
      `team_name = "${teamName}"`,
      { requestKey: null }
    );
    const gamedata =
      typeof record.gamedata === 'string'
        ? JSON.parse(record.gamedata)
        : record.gamedata ?? {};

    gamedata.flameCompleted = true;
    gamedata.flameCompletedAt = Date.now();

    await pb.collection('escape_game_data').update(record.id, {
      gamedata: JSON.stringify(gamedata),
    });

    // Determine rank: how many teams have already completed flame before us?
    const allRecords = await pb
      .collection('escape_game_data')
      .getFullList({ filter: PB_TEAM_ROWS_FILTER, requestKey: null });

    const completedTimes = allRecords
      .map((r) => {
        const gd =
          typeof r.gamedata === 'string' ? JSON.parse(r.gamedata) : r.gamedata ?? {};
        return gd.flameCompleted ? (gd.flameCompletedAt as number) : null;
      })
      .filter((t): t is number => t !== null)
      .sort((a, b) => a - b);

    const rank =
      completedTimes.indexOf(gamedata.flameCompletedAt as number) + 1 || 1;

    return { success: true, rank };
  } catch (err) {
    console.error('markFlameWinnerAction failed:', err);
    return { success: false, rank: null };
  }
}
