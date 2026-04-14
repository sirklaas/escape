# Total Atlas Implementation Plan

## Goal
Create a unified navigation system that shows Previous/Next buttons and the current slug on ALL game pages, connecting intro → /nine → location loops → end phases seamlessly.

## Current State
- `total-atlas.ts` exists with all pages listed (71 total pages)
- `IntroFlowDevNav` component exists using `totalAtlasNav()`
- Working on standard pages (PlayerChrome) and location pages ([locationSlug]/page.tsx)
- Fixed position at bottom of viewport (z-index: 100)
- Location-specific slugs (e.g., `odlijst`, `tokf`, `locboek`)
- 10 Token video pages created: tokf, tokl, toka, tokm, toke, tokt, tokh, tokr, toko, tokw

## Total Atlas Flow (71 steps)

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

### GAME Phase (56 steps incl. `/nine` loops)

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

**Location 3 - Electro (A token):**
- `/locxx` → slug: `locelectro` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `odelectro` - Puzzel
- `/pageeven` → slug: `evenelectro` - Succes
- `/leaderboard` → slug: `leaderboardelectro` - Leaderboard
- `/toka` → slug: `toka` - Token A video

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

**Location 9 - Drog (O+W tokens - 2 letters, 2 videos):**
- `/locxx` → slug: `locdrog` - Gekozen op `/nine` + map hint
- `/pageodd` → slug: `oddrog` - Puzzel
- `/pageeven` → slug: `evendrog` - Succes
- `/leaderboard` → slug: `leaderboarddrog` - Leaderboard
- `/toko` → slug: `toko` - Token O video
- `/tokw` → slug: `tokw` - Token W video

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
| A | /toka | Electro | toka |
| M | /tokm | Lijst | tokm |
| E | /toke | Kerk | toke |
| T | /tokt | Brug | tokt |
| H | /tokh | Count | tokh |
| R | /tokr | Gall | tokr |
| O | /toko | Drog | toko |
| W | /tokw | Drog | tokw |

## Key Design Decisions

1. **Location Sequence**: On `/nine` players choose a puzzle, then each location shows full flow: `/loc<location>` → `/od<location>` → `/even<location>` → `/leaderboard` → `/tok<letter>` → `/nine`
2. **Location-Specific Slugs**: Template pages show which location they belong to (e.g., `odlijst`, `locboek`, `evenkerk`)
3. **Token Video Pages**: 10 dedicated token pages: tokf, tokl, toka, tokm, toke, tokt, tokh, tokr, toko, tokw
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
