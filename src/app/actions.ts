"use server";

import PocketBase from 'pocketbase';
import { PB_URL } from '@/lib/pb';

export type LeaderboardEntry = {
  teamName: string;
  totalTime: number;
};

export async function getLeaderboardData(): Promise<LeaderboardEntry[]> {
  // Always instantiate a distinct PB instance in server actions to prevent auth state leakage between requests
  const pb = new PocketBase(PB_URL);

  try {
    // Authenticate securely on the server using the master credentials provided in the legacy file
    await pb.admins.authWithPassword("klaas@republick.nl", "biknu8-pyrnaB-mytvyx");

    // Pull every tracking row marked as a team session
    const records = await pb.collection('escape_game_data').getFullList({
      filter: 'city="team_session"'
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
