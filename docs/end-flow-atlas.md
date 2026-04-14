# End-game flow — dev atlas & handoff (for agents)

This document describes the **end-atlas** pattern: the same operational model as **`/game-atlas`** and **`/intro-atlas`**, applied to **post-loop** finale screens (token puzzle → flame → score → audio bridge). Use it when opening a **new agent / window** to continue QA or implementation on these routes.

---

## Purpose

- **Linear QA** through finale screens in a fixed order.
- Each step is a **real App Router page** at **`/slug`** (not embedded previews).
- Under the phone shell, **Previous / Next** links appear in dev (same bar as intro/game atlases).
- **Hub page** lists every slug with “open in new tab” + copy path — tile windows like intro-atlas.

---

## Where things live

| Piece | Path |
|--------|------|
| Ordered path list | `src/lib/end-atlas.ts` → `END_ATLAS_PATHS` |
| Prev/next resolver | `src/lib/end-atlas.ts` → `endAtlasNav()` |
| Dev hub (tile list) | `src/app/end-atlas/page.tsx` → **`/end-atlas`** |
| Dev toolbar wiring | `src/components/IntroFlowDevNav.tsx` |
| Game atlas (main loop) | `src/lib/game-atlas.ts` → `GAME_ATLAS_PATHS` (ends at **`/toka`**) |
| Intro atlas | `src/lib/intro-atlas.ts` → `INTRO_ATLAS_PATHS` |

---

## Ordered routes (`END_ATLAS_PATHS`)

| # | Slug | Page / role |
|---|------|----------------|
| 1 | `/endstart` | Finale splash; CTA → `/tokenkey` |
| 2 | `/tokenkey` | Token / symbol grid |
| 3 | `/flame` | FLAME / THROWER drag puzzle |
| 4 | `/eindscore` | “Missie voltooid” + score placeholders |
| 5 | `/watzullenwe` | Audio / “wat nu” bridge |

**`/leaderboard`** exists as a route but is **not** on this spine; open it by URL in dev if needed.

**Note:** In-game **player** navigation may jump between these in a different order. The **atlas order** is a **single linear QA spine** so Previous/Next always make sense in dev.

---

## Dev nav resolution order

`IntroFlowDevNav` picks **one** atlas per URL (first match wins):

1. **`gameAtlasNav`** — if the path is in `GAME_ATLAS_PATHS` (or `gameAtlasPhase` forces a game step on `LocationPlayer` atlas routes).
2. **`endAtlasNav`** — if the path is in `END_ATLAS_PATHS` and **not** already a game path.
3. **`introAtlasNav`** — intro-only routes (e.g. `/start` … `/toka`).

Overlaps:

- **`/toka`** exists in **intro** and **game** lists → **game** wins (same as before).
- End-only slugs (**`/endstart`** … **`/watzullenwe`**) are not in `GAME_ATLAS_PATHS`.

---

## Access control (hub + dev bar)

Same convention as **`/game-atlas`** and **`/intro-atlas`**:

- Allowed when `NODE_ENV === 'development'`, or `SCREEN_ATLAS === '1'`, or host is localhost / `127.0.0.1` / `::1`.
- Otherwise **`/end-atlas`** returns **404**.
- The **Previous/Next** bar is **hidden in production** unless `NEXT_PUBLIC_INTRO_DEV_NAV=1` (see `IntroFlowDevNav`).

---

## How to QA in a new agent session

1. Run `npm run dev` (or your chosen port).
2. Open **`/end-atlas`** — open each tile in a **new tab** if you want parallel inspection.
3. On any end slug, use **Previous / Next** under the phone to walk the spine.
4. **PocketBase** is optional for these pages in dev; bundled/offline behaviour is fine unless a screen explicitly calls PB.

---

## Extending the end spine

1. Add the new route to **`END_ATLAS_PATHS`** in `end-atlas.ts` (order matters).
2. Ensure `src/app/<slug>/page.tsx` exists and uses **`PlayerChrome`** / **`PhoneWrapper`** so the dev bar sits under the same shell as other player pages.
3. If the new step needs **special Link hrefs** (like `/toka?atlas=1` in game-atlas), extend **`endAtlasNavHref()`** in `end-atlas.ts` and use it from **`/end-atlas`** hub via `IntroAtlasEntry` (see `game-atlas/page.tsx`).
4. Update this doc’s table.

---

## Relationship to game-atlas

- **`GAME_ATLAS_PATHS`** ends at **`/toka`** (nine → loc QA → first token video).
- **`END_ATLAS_PATHS`** runs **`/tokenkey` → `/flame` → `/eindscore` → `/watzullenwe`**.
- There is **no automatic Next** from **`/toka`** into the end spine in dev nav (game “Next” is terminal at `toka`). Open **`/end-atlas`** or **`/tokenkey`** directly to QA the finale chapter.

---

## Files touched when adding end-atlas (checklist)

- [x] `src/lib/end-atlas.ts` — paths + `endAtlasNav` + `endAtlasNavHref`
- [x] `src/app/end-atlas/page.tsx` — hub
- [x] `src/components/IntroFlowDevNav.tsx` — `endNav` between game and intro
- [x] `src/lib/game-atlas.ts` — `GAME_ATLAS_PATHS` without `/leaderboard`
- [x] `docs/game-flow-atlas.md` — points here for finale
- [x] `docs/end-flow-atlas.md` — this file

---

## PocketBase (parked)

End screens may later read session/team data from PB. For atlas QA, **no PB row** is required; see project notes if `MASTER_DASHBOARD` / team rows are re-enabled.
