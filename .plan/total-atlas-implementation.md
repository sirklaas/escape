# Total Atlas Implementation Plan

## Goal
Create a unified navigation system that shows Previous/Next buttons and the current slug on ALL game pages, connecting intro → /nine → location loops → end phases seamlessly.

## Current State
- `total-atlas.ts` exists with all pages listed (70 total steps)
- `IntroFlowDevNav` component exists using `totalAtlasNav()`
- Working on standard pages (PlayerChrome) and location pages ([locationSlug]/page.tsx)
- Fixed position at bottom of viewport (z-index: 100)
- Location-specific slugs (e.g., `odlijst`, `tokf`, `locboek`)
- 10 Token video pages created: tokf, tokl, toka, tokm, toke, tokt, tokh, tokr, toko, tokw

## Total Atlas Flow (70 steps)

### INTRO Phase (9 steps)
- `/start` - Welkom + Start-knop
- `/robotvid` - Robot video intro
- `/teamnaam` - Kies een teamnaam
- `/players` - Voeg spelers toe
- `/uitleg` - Speluitleg
- `/video122` - Video met hints voor 122
- `/vulin` - Vul 122 in om Token A te verdienen
- `/122` - Fantastisch gedaan! 122 reward
- `/toka` - Token A video (einde intro)
- NOTE: `toka` (letter A) is already awarded in the intro and is not repeated as a separate game token.

### GAME Phase (55 steps incl. `/nine` loops)

**Flow per keuze op `/nine`:**
`/nine` → `/locxx` (met gekozen location) → `/pageodd` → `/pageeven` → `/leaderboard` → `/tok<letter>` → `/nine`

The dev nav shows location-specific slugs like `locblokker`, `odlijst`, and `leaderboardkerk` to identify which location's instance you're viewing.

**Location 1 - Blokker (F token):**
- `/locxx` → slug: `locblokker` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odblokker` - Puzzel
- `/pageeven` → slug: `evenblokker` - Succes
- `/leaderboard` → slug: `leaderboardblokker` - Leaderboard
- `/tokf` → slug: `tokf` - Token F video

**Location 2 - Boek (L token):**
- `/locxx` → slug: `locboek` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odboek` - Puzzel
- `/pageeven` → slug: `evenboek` - Succes
- `/leaderboard` → slug: `leaderboardboek` - Leaderboard
- `/tokl` → slug: `tokl` - Token L video

**Location 3 - Electro (W token):**
- `/locxx` → slug: `locelectro` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odelectro` - Puzzel
- `/pageeven` → slug: `evenelectro` - Succes
- `/leaderboard` → slug: `leaderboardelectro` - Leaderboard
- `/tokw` → slug: `tokw` - Token W video

**Location 4 - Lijst (M token):**
- `/locxx` → slug: `loclijst` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odlijst` - Puzzel
- `/pageeven` → slug: `evenlijst` - Succes
- `/leaderboard` → slug: `leaderboardlijst` - Leaderboard
- `/tokm` → slug: `tokm` - Token M video

**Location 5 - Kerk (E token):**
- `/locxx` → slug: `lockerk` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odkerk` - Puzzel
- `/pageeven` → slug: `evenkerk` - Succes
- `/leaderboard` → slug: `leaderboardkerk` - Leaderboard
- `/toke` → slug: `toke` - Token E video

**Location 6 - Brug (T token):**
- `/locxx` → slug: `locbrug` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odbrug` - Puzzel
- `/pageeven` → slug: `evenbrug` - Succes
- `/leaderboard` → slug: `leaderboardbrug` - Leaderboard
- `/tokt` → slug: `tokt` - Token T video

**Location 7 - Count (H token):**
- `/locxx` → slug: `loccount` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odcount` - Puzzel
- `/pageeven` → slug: `evencount` - Succes
- `/leaderboard` → slug: `leaderboardcount` - Leaderboard
- `/tokh` → slug: `tokh` - Token H video

**Location 8 - Gall (R token):**
- `/locxx` → slug: `locgall` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odgall` - Puzzel
- `/pageeven` → slug: `evengall` - Succes
- `/leaderboard` → slug: `leaderboardgall` - Leaderboard
- `/tokr` → slug: `tokr` - Token R video

**Location 9 - Drog (O token):**
- `/locxx` → slug: `locdrog` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `oddrog` - Puzzel
- `/pageeven` → slug: `evendrog` - Succes
- `/leaderboard` → slug: `leaderboarddrog` - Leaderboard
- `/toko` → slug: `toko` - Token O video

### END Phase (6 steps) - Finale
- `/endstart` - Finale splash
- `/tokenkey` - Symbolengrid (10 juiste letters)
- `/letters` - Symbool → letter mapping
- `/flame` - FLAME / THROWER sleeppuzzel
- `/eindscore` - Missie voltooid, scores
- `/watzullenwe` - Audio wat-nu

## Tokens Collected (FLAMETHROWER)
| Letter | Token Page | Location | Slug |
|--------|-----------|----------|------|
| F | /tokf | Blokker | tokf |
| L | /tokl | Boek | tokl |
| A | /toka | Intro | toka |
| M | /tokm | Lijst | tokm |
| E | /toke | Kerk | toke |
| T | /tokt | Brug | tokt |
| H | /tokh | Count | tokh |
| R | /tokr | Gall | tokr |
| O | /toko | Drog | toko |
| W | /tokw | Electro | tokw |

## Key Design Decisions

1. **Location Sequence**: On `/nine` players choose a puzzle, then each location shows full flow: `/loc<location>` → `/od<location>` → `/even<location>` → `/leaderboard` → `/tok<letter>` → `/nine`
2. **Location-Specific Slugs**: Template pages show which location they belong to (e.g., `odlijst`, `locboek`, `evenkerk`)
3. **Token Video Pages**: 10 dedicated token pages: tokf, tokl, toka (intro), tokw (Electro), tokm, toke, tokt, tokh, tokr, toko
4. **Real Game Flow**: Players cycle: /nine → choose location → complete sequence → back to /nine (repeat 9x) → /endstart
5. **Dev Nav Position**: Fixed at bottom of viewport (z-index: 100) with Previous/Next buttons

## Page Naming Convention
- Location: `/<location>` (e.g., /blokker, /boek)
- Map hint: `/locxx` but shows slug `loc<location>` (e.g., locblokker, locboek)
- Puzzle: `/pageodd` but shows slug `od<location>` (e.g., odblokker, odboek)
- Success: `/pageeven` but shows slug `even<location>` (e.g., evenblokker, evenboek)
- Leaderboard: `/leaderboard` but shows slug `leaderboard<location>`
- Token: `/tok<letter>` with slug `tok<letter>` (e.g., tokf, tokl, tokm)

## Success Criteria
- [x] ALL pages show the dev nav bar with slug + Previous/Next
- [x] Navigation flows intro → /nine → choose puzzle → complete sequence → /nine again → end
- [x] Location pages have full sequence with location-specific slugs
- [x] 10 Token video pages created: tokf, tokl, toka, tokm, toke, tokt, tokh, tokr, toko, tokw
- [x] Tokens spell FLAMETHROWER: F-L-A-M-E-T-H-R-O-W
- [x] No import errors or console warnings
- [x] Can rapidly test entire game flow using Next button
- [x] Dev nav fixed at bottom, visible on all pages

## PocketBase Setup (Current Reality)

### 1) `escape_game_data` (currently used in app code)

This collection is used for:
- active game/session configuration (dashboard, priority switching, variants)
- team run rows (team initialization and progression)

Fields actively read/written by app code:
- system: `id`, `created`, `updated`
- top-level: `team_name`, `city`, `priority`, `variant`, `masterdasboard`, `gamedata`, `nr_teams`, `total_time`, `current_page`, `challenge_timer`

`gamedata` JSON keys currently used:
- `playedLocations`
- `times`
- `playerNames`
- `flameCompleted`
- `flameCompletedAt`
- `activeGameId`
- `activeGameCity`
- dashboard helper values in some flows: `nrPlayers`, `gameDurationLimit`

Notes:
- There is **no top-level `players` field** in `escape_game_data` in current code.
- Player names are currently stored in `gamedata.playerNames`.
- Team rows are currently tied to active game context via:
  - `city` (set from current `priority=1` game city)
  - `gamedata.activeGameId`
  - `gamedata.activeGameCity`

### 2) `escape_player_scores` (now wired for team/player runtime data)

Collection fields shown in PB:
- system: `id`, `created`, `updated`
- custom: `city`, `players`, `location_data`, `team_name`, `flame_completed`, `time_left`, `start`

Current status:
- app code now reads/writes `escape_player_scores` for:
  - team initialization (`team_name`, `city`, `players`, `location_data`)
  - player name updates (`players.playerNames`)
  - location progress (`location_data.playedLocations`, `location_data.times`)
  - flame completion + rank (`flame_completed`, `location_data.flameCompletedAt`)
  - leaderboard aggregation

### Runtime Rules (Confirmed Game Logic)

These are required runtime semantics for `escape_player_scores`:

1. **Team identity**
   - `team_name` must be unique and stored in `escape_player_scores`.
   - `city` must come from the active game (`escape_game_data` where `priority=1`).

2. **`players` default**
   - Keep `players` as a JSON object initialized at team creation.
   - Player names are filled later in flow and stored in this object.

3. **`location_data` default + active game reference**
   - Initialize `location_data` with:
     - active game reference (`activeGameId`, `activeGameCity`)
     - full per-location/per-page timing defaults for scoring.
   - Timing defaults come from dashboard-configured values for every location page pair:
     - e.g. `blokker_odd = 600`, `blokker_even = 600` (seconds).
   - During gameplay, each page's measured elapsed time replaces the default budget:
     - example: if `blokker_odd` default is `600` and team completes in `120`, stored value becomes `120`.
   - This replacement model is the basis for scoring.

4. **`flame_completed`**
   - Initialize `flame_completed = false`.
   - Set true only when flame puzzle is completed.

5. **`time_left`**
   - Do **not** hardcode to `0`.
   - Initialize from dashboard game duration input (default 90 min, but can be 60 or any configured value).
   - Must reflect current active game's configured duration at team creation time.

6. **`start` timestamp**
   - Do **not** set to creation time of the team row.
   - Set `start` only when gameplay actually begins:
     - first press on a start action in one of the nine locations
     - can be any first location/page (e.g., Electro odd, Gall odd, etc.).
   - `start` marks true run start, not registration time.

## Local Storage Usage

Yes — localStorage is used client-side.

Key currently used:
- `escaperoomTeamName`

Why:
- temporary client handoff between pages (`/teamnaam` → `/players` and later reads)
- PB remains source of truth for persisted team row creation/progression
