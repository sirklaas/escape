import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';
import { PB_URL } from '@/lib/pb';

// Get PB client with optional admin auth
async function getPBWithAuth() {
  const pb = new PocketBase(PB_URL);
  
  // Try to authenticate as admin if credentials available
  const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
  const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;
  
  if (adminEmail && adminPassword) {
    try {
      await pb.admins.authWithPassword(adminEmail, adminPassword);
      console.log('[API] Authenticated as admin');
    } catch (authErr: any) {
      console.warn('[API] Admin auth failed:', authErr.message);
      // Continue without auth - might fail if collection requires auth
    }
  } else {
    console.log('[API] No admin credentials, using unauthenticated PB');
  }
  
  return pb;
}

export async function GET(req: NextRequest) {
  try {
    const pb = await getPBWithAuth();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('id');
    
    // If specific session ID requested, return it with masterdasboard
    if (sessionId) {
      try {
        const record = await pb.collection('escape_game_data').getOne(sessionId);
        const g = typeof record.gamedata === 'string' ? JSON.parse(record.gamedata) : record.gamedata;
        return NextResponse.json({
          success: true,
          id: record.id,
          city: record.city || 'Onbekende Stad',
          date: record.total_time ? new Date(record.total_time).toISOString() : record.created,
          nrPlayers: g?.nrPlayers || 0,
          nrTeams: record.nr_teams || 0,
          gameDurationLimit: g?.gameDurationLimit || 90,
          priority: record.priority || 0,
          activeVariant: record.variant || 'city',
          created: record.created,
          masterdasboard: record.masterdasboard || null
        });
      } catch {
        return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
      }
    }

    // 1. Fetch Master Dashboard Data from priority=1 game
    let escapeData = null;
    let masterRecord = null;
    try {
      masterRecord = await pb.collection('escape_game_data').getFirstListItem('priority=1', { requestKey: null });
      escapeData = masterRecord.masterdasboard || null;
    } catch {
      /* no priority=1 game found */
    }

    // 2. Fetch All Sessions for dropdown
    let allSessions: Array<{
      id: string;
      city: string;
      date: string;
      nrPlayers: number;
      nrTeams: number;
      gameDurationLimit: number;
      priority: number;
      activeVariant: string;
      created: string;
    }> = [];
    let activeSession = null;
    try {
      // Fetch all game sessions
      const list = await pb.collection('escape_game_data').getList(1, 50, {
        sort: '-created',
        requestKey: null,
        fields: 'id,city,nr_teams,total_time,variant,priority,created,gamedata'
      });
      
      console.log(`API: Found ${list.items.length} sessions in PocketBase`);
      
      // Map all sessions
      allSessions = list.items.map(rec => {
        const g = typeof rec.gamedata === 'string' ? JSON.parse(rec.gamedata) : rec.gamedata;
        return {
          id: rec.id,
          city: rec.city || 'Onbekende Stad',
          date: rec.total_time ? new Date(rec.total_time).toISOString() : rec.created,
          nrPlayers: g?.nrPlayers || 0,
          nrTeams: rec.nr_teams || 0,
          gameDurationLimit: g?.gameDurationLimit || 90,
          priority: rec.priority || 0,
          activeVariant: rec.variant || 'city',
          created: rec.created
        };
      });
      
      // Find the active one (priority 1) or use most recent
      activeSession = allSessions.find(s => s.priority === 1) || allSessions[0] || null;
    } catch (err: any) {
      console.error('API: Error fetching sessions:', err.message);
      /* no sessions found */
    }

    return NextResponse.json({
      success: true,
      data: escapeData,
      session: activeSession,
      allSessions
    });
  } catch (err: any) {
    console.error("API GET Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, payload } = body;
    const pb = await getPBWithAuth();

    if (action === 'CREATE_SESSION') {
      console.log('[API] Creating new session...');
      const { city, date, nrPlayers, nrTeams, priority, durationMinutes, activeVariant } = payload;
      const variant = activeVariant || 'city';
      // Ensure we have a valid timestamp for the unique team_name ID
      const timestamp = date ? new Date(date).getTime() : Date.now();
      
      const newPriority = priority ?? 1;
      
      // STEP 1: Get config from priority=1 game BEFORE demoting (this is the active game config)
      let masterConfig = null;
      if (newPriority === 1) {
        try {
          const priorityOne = await pb.collection('escape_game_data').getFirstListItem('priority=1', { requestKey: null });
          masterConfig = priorityOne.masterdasboard || null;
          console.log('[API] Got config from priority=1 game:', !!masterConfig);
        } catch {
          console.log('[API] No priority=1 game found');
        }
      }
      
      // STEP 2: If no config from priority=1, try same-variant game
      if (!masterConfig) {
        try {
          const sameVariantGames = await pb.collection('escape_game_data').getList(1, 1, {
            filter: `variant = "${variant}" && masterdasboard != null`,
            sort: '-created',
            requestKey: null
          });
          if (sameVariantGames.items.length > 0) {
            masterConfig = sameVariantGames.items[0].masterdasboard || null;
            console.log('[API] Got config from same-variant game:', !!masterConfig);
          }
        } catch {
          console.log('[API] No same-variant game with config found');
        }
      }
      
      // STEP 3: Demote existing priority=1 games AFTER we got their config
      if (newPriority === 1) {
        try {
          const existingPriorityOne = await pb.collection('escape_game_data').getFullList({
            filter: 'priority=1',
            requestKey: null
          });
          for (const game of existingPriorityOne) {
            await pb.collection('escape_game_data').update(game.id, { priority: 0 });
          }
          console.log('[API] Demoted', existingPriorityOne.length, 'existing priority=1 games');
        } catch {
          console.log('[API] No existing priority=1 games to demote');
        }
      }
      
      const data = {
        team_name: `SESSION_${timestamp}`,
        city: city || "Onbekende Stad",
        nr_teams: nrTeams || 1,
        total_time: timestamp,
        variant: variant,
        priority: newPriority,
        gamedata: JSON.stringify({ 
          nrPlayers: nrPlayers || 4, 
          gameDurationLimit: durationMinutes || 90,
        }),
        masterdasboard: masterConfig, // Copy master config from same-variant game
      };
      
      console.log('[API] Creating record:', { city: data.city, variant: data.variant, priority: data.priority, hasMasterConfig: !!data.masterdasboard });
      const record = await pb.collection('escape_game_data').create(data);
      console.log('[API] Record created successfully:', record.id);
      return NextResponse.json({ 
        success: true, 
        record,
        session: {
          id: record.id,
          city: data.city,
          date: new Date(timestamp).toISOString(),
          nrPlayers: nrPlayers || 4,
          nrTeams: nrTeams || 1,
          durationMinutes: durationMinutes || 90,
          priority: newPriority,
          activeVariant: variant,
          created: record.created,
        }
      });
    }

    if (action === 'SAVE_DASHBOARD') {
      const { data: dashboardData, sessionId } = payload;
      
      try {
        let targetId = sessionId;
        
        // If no sessionId, save to priority=1 game
        if (!targetId) {
          const priorityOne = await pb.collection('escape_game_data').getFirstListItem('priority=1', { requestKey: null });
          targetId = priorityOne.id;
        }
        
        console.log('[API] Saving dashboard to session:', targetId);
        
        // Save to the specified game's masterdasboard
        const updated = await pb.collection('escape_game_data').update(targetId, {
          masterdasboard: dashboardData,
          total_time: Date.now()
        });
        
        console.log('[API] Dashboard saved successfully to:', updated.id);
        return NextResponse.json({ success: true, sessionId: targetId, recordId: updated.id });
      } catch (err: any) {
        console.error('[API] SAVE_DASHBOARD error:', err.message, err.response?.data);
        return NextResponse.json({ 
          success: false, 
          error: 'Failed to save dashboard: ' + err.message,
          details: err.response?.data || err.message
        }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error("[API] POST error:", err.message, err.response?.data);
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      details: err.response?.data || null 
    }, { status: 500 });
  }
}
