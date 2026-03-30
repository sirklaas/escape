# Escape Room — Layout & Logic Documentation

Reference document for the Next.js migration of the Great Escape game. Covers both the **Admin Dashboard** (`/`) and the **Player Phone Pages** (`/[locationSlug]`).

---

## Data Model

All data is stored in PocketBase and fetched via `src/lib/pb.ts`.

```
EscapeData
├── activeVariant: 'city' | 'diner' | 'rat'
├── city: VariantData
├── diner: VariantData
└── rat: VariantData

VariantData
├── locations: EscapeLocation[]   (9 locations)
└── pages: EscapePage[]           (18 pages, 2 per location)

EscapeLocation
├── locationNumber: 1–9
├── name: string          (Blokker, Boek, Electro, …)
├── heading: string
├── subheading: string
├── body: string
└── startUrl: string

EscapePage
├── pageNumber: 1–18      (odd = puzzle 1, even = puzzle 2)
├── locationNumber: 1–9
├── kop: string           (heading shown on phone)
├── bodyTxt: string
├── correctAnswer: string
├── hints: string[]       (4 hints)
└── nextPage: string      (URL to navigate to after completing)
```

### Locations (index → slug)
| # | Name    | Slug    |
|---|---------|---------|
| 1 | Blokker | blokker |
| 2 | Boek    | boek    |
| 3 | Electro | electro |
| 4 | Lijst   | lijst   |
| 5 | Kerk    | kerk    |
| 6 | Brug    | brug    |
| 7 | Count   | count   |
| 8 | Gall    | gall    |
| 9 | Drog    | drog    |

### Game Variants
| Key   | Label | Icon           |
|-------|-------|----------------|
| city  | City  | Building2      |
| diner | Diner | UtensilsCrossed|
| rat   | Rat   | Rat            |

---

## Dashboard (`src/app/page.tsx`)

**Route:** `/`  
**Purpose:** Admin tool to edit all game content and save it to PocketBase.

### Layout

```
┌──────────────────────────────────────────────────────┐
│              GREAT ESCAPE DASHBOARD (h1)             │
├──────────────┬───────────────────────────────────────┤
│ Variant tabs │     Location icon tabs (9 buttons)    │
│ City/Diner/  │ Blokker Boek Electro Lijst …          │
│ Rat          │                                       │
├──────────────┴───────────────────────────────────────┤
│  [Status message bar — success / error / info]       │
├────────────────┬────────────────┬────────────────────┤
│  Col 1         │  Col 2         │  Col 3             │
│  LOC INFO      │  PAGE 1 (odd)  │  PAGE 2 (even)     │
│                │                │                    │
│  Heading       │  Heading       │  Heading           │
│  Sub Heading   │  Body Text     │  Body Text         │
│  Body          │  Correct Ans ★ │  Correct Ans ★     │
│  Start URL     │  Hint 1–4      │  Hint 1–4          │
│                │  Next Page URL │  Next Page URL     │
├────────────────┴────────────────┴────────────────────┤
│  ← Prev  |  Save (*)  |  Download JSON  |  Next →   │
│                               Location N of 9 — City │
└──────────────────────────────────────────────────────┘
```

> ★ Correct Answer fields have a yellow highlight to make them visually distinct.

### State

| State | Type | Description |
|---|---|---|
| `variant` | `'city'\|'diner'\|'rat'` | Currently selected game variant |
| `locationIndex` | `0–8` | Currently viewed location |
| `data` | `EscapeData` | Full game data (all variants) |
| `loading` | `boolean` | PocketBase fetch in progress |
| `statusMsg` | `string` | Toast-style status text |
| `unsaved` | `boolean` | Whether there are unsaved edits |

### Logic

- **Load:** `fetchEscapeData()` on mount → populates `data`  
- **Edit:** `updateLoc(field, value)` / `updatePage(pageNum, field, value)` → immutable state update + sets `unsaved = true`  
- **Save:** `saveEscapeData(data)` → writes to PocketBase  
- **Download:** Exports current `data` as `escapedata.json`  
- **Active variant:** Clicking `SET` badge on a variant sets `data.activeVariant` (controls which content players see)

---

## Player Phone Page (`src/app/[locationSlug]/page.tsx`)

**Route:** `/blokker`, `/boek`, `/electro`, etc.  
**Purpose:** The actual game interface shown on players' phones at each location.

### Layout (absolute-positioned over backdrop image)

```
┌─────────────────────────────┐  ← body bg: white
│  [20px white margin]        │
│  ┌───────────────────────┐  │  ← Escapebackdrop.jpg (cover)
│  │                       │  │    rounded-[20px]
│  │  [Timer pill]  ← 20px │  │  ← absolute, top: 20px, centered
│  │   from top            │  │
│  │                       │  │
│  │  ┌─────────────────┐  │  │
│  │  │ top: 25%        │  │  │  ← CONTENT CONTAINER
│  │  │                 │  │  │    position: absolute
│  │  │  INTRO:         │  │  │    top: 25%, bottom: 25%
│  │  │  • Location name│  │  │
│  │  │  • Heading/sub  │  │  │
│  │  │  • Body text    │  │  │
│  │  │  • [START btn]  │  │  │
│  │  │                 │  │  │
│  │  │  PUZZLE:        │  │  │
│  │  │  • kop (h2)     │  │  │
│  │  │  • bodyTxt      │  │  │
│  │  │  • [Input field]│  │  │
│  │  │  Poging: N|CHECK│  │  │
│  │  │  [Hint button]  │  │  │
│  │  │                 │  │  │
│  │  │  FINISHED:      │  │  │
│  │  │  • Victory!     │  │  │
│  │  │  • Coordinates  │  │  │
│  │  └─────────────────┘  │  │
│  │       bottom: 25%     │  │
│  │                       │  │
│  │  [Red circle] ← 40px  │  │  ← absolute, bottom: 40px, centered
│  │       from bottom     │  │
│  └───────────────────────┘  │
│  [20px white margin]        │
└─────────────────────────────┘
```

### Game Flow (Step Machine)

```
intro ──[START]──▶ puzzle1 ──[correct]──▶ puzzle2 ──[correct]──▶ finished
                      │                      │
                   [wrong]               [wrong]
                      │                      │
                   attempts++             attempts++
                   +25s penalty           +25s penalty
```

### State

| State | Type | Description |
|---|---|---|
| `step` | `'intro'\|'puzzle1'\|'puzzle2'\|'finished'` | Current game step |
| `timer` | `number` | Running timer in seconds (adds penalty on wrong answers) |
| `challengeTimer` | `number` | Overall challenge timer (resets on new challenge, max 600s) |
| `attempts` | `number` | Wrong answer count |
| `hintsRevealed` | `number` | Number of hints purchased |
| `showHintButton` | `boolean` | Hint button visible after 120s |
| `answer` | `string` | Current text input value |
| `alertState` | `'none'\|'wrong'\|'correct'\|'hint'\|'timeup'` | Overlay state |
| `teamName` | `string` | From `localStorage.escaperoomTeamName` |
| `isScoreSaved` | `boolean` | Prevents double-saving |

### Game Settings (constants)

| Setting | Value |
|---|---|
| `hintButtonAppearTime` | 120 seconds |
| `timerIncrementInterval` | 5 seconds |
| `incorrectGuessPenalty` | +25 seconds |
| `challengeDuration` | 600 seconds (10 min) |
| Hint costs | 100s / 200s / 300s / 400s |

### Timer Logic

- Ticks every **5 seconds** via `setInterval`
- Both `timer` (total) and `challengeTimer` (per-challenge) increment
- `challengeTimer ≥ 600s` → time up → shows `timeup` alert
- Wrong answer → `timer += 25`, attempts++
- Hint purchased → `timer += hintCost`

### Data Lookup

Location slug → `locationIndex` (0-based) → `locNumber` (1-based):
- Lookup order: `['blokker','boek','electro','lijst','kerk','brug','count','gall','drog']`
- `p1` = page where `locationNumber === locNumber && pageNumber === 1`
- `p2` = page where `locationNumber === locNumber && pageNumber === 2`
- Active variant is read from `pbData.activeVariant` (set in dashboard)

### Alerts / Overlays

| Alert | Trigger | Behaviour |
|---|---|---|
| `wrong` | Wrong answer | Slides up from bottom for 3s, then slides back |
| `correct` | Correct answer | Full-screen fade-in with timer + OK button |
| `hint` | Hint purchased | Modal with hint text, tap outside to close |
| `timeup` | 600s elapsed | Full-screen red overlay |

### Desktop vs Mobile

On **mobile** (`< md`): Full-screen layout, no phone frame  
On **desktop** (`≥ md`): Renders inside a CSS phone mockup (380×800px, black frame, rounded corners, dynamic island notch)

---

## File Structure

```
src/
├── app/
│   ├── page.tsx              ← Dashboard (admin)
│   ├── layout.tsx
│   ├── globals.css
│   └── [locationSlug]/
│       └── page.tsx          ← Player phone page
├── lib/
│   └── pb.ts                 ← PocketBase client + fetch/save helpers
public/
├── Escapebackdrop.jpg        ← Background image for phone pages
└── escapedata.json           ← Local JSON fallback / download target
```
