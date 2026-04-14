import { NextRequest, NextResponse } from 'next/server';
import PocketBase from 'pocketbase';

const PB_URL = 'https://pinkmilk.pockethost.io';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, data } = body;

    if (!sessionId || !data) {
      return NextResponse.json(
        { success: false, error: 'Missing sessionId or data' },
        { status: 400 }
      );
    }

    const pb = new PocketBase(PB_URL);

    // Authenticate as admin if credentials available
    const adminEmail = process.env.POCKETBASE_ADMIN_EMAIL;
    const adminPassword = process.env.POCKETBASE_ADMIN_PASSWORD;

    if (adminEmail && adminPassword) {
      try {
        await pb.admins.authWithPassword(adminEmail, adminPassword);
        console.log('[API /save] Authenticated as admin for save operation');
      } catch (authErr: any) {
        console.warn('[API /save] Admin auth failed:', authErr.message);
        // Continue without auth - might fail if collection requires auth
      }
    } else {
      console.log('[API /save] No admin credentials, using unauthenticated PB');
    }

    // Update the record
    console.log('[API /save] Saving to session:', sessionId);
    console.log('[API /save] Data has', Object.keys(data).length, 'keys');
    console.log('[API /save] Data activeVariant:', data.activeVariant);
    
    try {
      const record = await pb.collection('escape_game_data').update(sessionId, {
        masterdasboard: data,
        total_time: Date.now(),
      });

      console.log('[API /save] Successfully saved to session:', sessionId, 'record:', record.id);
      console.log('[API /save] Saved masterdasboard keys:', Object.keys(record.masterdasboard || {}).join(', '));
      return NextResponse.json({ success: true, recordId: record.id });
    } catch (updateErr: any) {
      console.error('[API /save] Update failed:', updateErr.message);
      console.error('[API /save] Response data:', updateErr.response?.data);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Update failed: ' + updateErr.message,
          details: updateErr.response?.data 
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error('Save API error:', err.message, err.response?.data);
    return NextResponse.json(
      {
        success: false,
        error: err.message,
        details: err.response?.data || null,
      },
      { status: 500 }
    );
  }
}
