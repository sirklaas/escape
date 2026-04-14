# Game flow — slugs & dev nav (handoff)

## Ordered routes (`GAME_ATLAS_PATHS` in `src/lib/game-atlas.ts`)

| # | Slug | Notes |
|---|------|--------|
| 1 | `/nine` | Challenge hub (grid of 9); location slugs live under `/[locationSlug]` |
| 2 | `/locxx` | One location (`GAME_ATLAS_LOCATION_SLUG`, default `blokker`): **map** phase |
| 3 | `/pageodd` | Same: **puzzle** (timer + copy from PB pages) |
| 4 | `/pageeven` | Same: **success** modal after correct answer |
| 5 | `/toka` | Token A video (same route as intro end step; see below). Legacy `/tokxx` redirects here. |

**Finale / wrap-up** is a separate atlas: **`END_ATLAS_PATHS`** in `src/lib/end-atlas.ts` (`/tokenkey` → `/flame` → `/eindscore` → `/watzullenwe`). Hub: **`/end-atlas`**. Handoff: **`docs/end-flow-atlas.md`**.

**Intro** stays separate: `src/lib/intro-atlas.ts` → `/intro-atlas`.

**Dev hubs:** `/game-atlas`, `/end-atlas`, `/intro-atlas` (same gate: dev / localhost / `SCREEN_ATLAS=1`).

## Previous / Next

`src/components/IntroFlowDevNav.tsx` resolves **`gameAtlasNav`**, then **`endAtlasNav`**, then **`introAtlasNav`**, so **`/toka`** (Token A, listed in both intro and game) follows **game-atlas** prev/next; **`/tokenkey`** … **`/watzullenwe`** follow **end-atlas**. Still **hidden in production** (`NODE_ENV === 'production'`), unless `NEXT_PUBLIC_INTRO_DEV_NAV=1` in non-production.

## Not in this list

- **`/dashboard`**, **`/design-diff`** — tooling / CMS
- **`/blokker` … `/drog`** and other **`[locationSlug]`** routes — no dev nav unless added to `GAME_ATLAS_PATHS`
