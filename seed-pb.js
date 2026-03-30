const fs = require('fs');
const PocketBase = require('pocketbase/cjs');

const PB_URL = 'https://pinkmilk.pockethost.io';
const JSON_PATH = './public/escapedata.json';

async function seed() {
  console.log('--- PocketBase Seeding ---');
  if (!fs.existsSync(JSON_PATH)) {
    console.error('Error: escapedata.json not found in ./public/');
    return;
  }

  const raw = fs.readFileSync(JSON_PATH, 'utf-8');
  const data = JSON.parse(raw);

  const pb = new PocketBase(PB_URL);
  
  // Note: This script assumes you have "Allow" access on the "escape_game_data" collection
  // (Admin access is not needed if the rules are open)
  
  const payload = {
    team_name: "MASTER_DASHBOARD",
    gamedata: JSON.stringify(data),
    nr_teams: 1,
    city: "all",
    total_time: Date.now()
  };

  try {
    console.log('Checking for existing MASTER_DASHBOARD record...');
    let existing;
    try {
      existing = await pb.collection('escape_game_data').getFirstListItem('team_name="MASTER_DASHBOARD"');
    } catch {
      existing = null;
    }

    if (existing) {
      console.log(`Updating record ${existing.id}...`);
      await pb.collection('escape_game_data').update(existing.id, payload);
      console.log('✅ Update complete!');
    } else {
      console.log('Creating new record...');
      await pb.collection('escape_game_data').create(payload);
      console.log('✅ Creation complete!');
    }
  } catch (err) {
    console.error('❌ Error during seeding:', err.message);
    if (err.data) console.error('Details:', err.data);
  }
}

seed();
