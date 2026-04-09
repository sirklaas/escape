# Great Escape — Global design system

This document captures the **reference UI** from the Escape prototypes (buttons, popups, intro screen, in-game pills, keyboard mode) and how to apply it in this repo so **player-facing screens feel like one product**.

### Source files (this repo)

| Priority | File | Role |
|----------|------|------|
| **1** | **`globaldesign.md`** (this doc) | Canonical tokens, chrome stack, golden rules. **Implementation must match this.** |
| **2** | **`pagedesign.md`** | Player page layout / **32px** card radius. |
| **3** | **`designloc.md`** | Location-phase UI. |

**`variants.html`** / **`preview.html`** are cited below as **external HTML prototypes**; they are **not** checked into this repository. When they disagree with the table above, **`pagedesign.md` + `globaldesign.md` win** — and the codebase should be updated to match, then this doc version bumped.

---

## 0. Product aim (read this first)

| Layer | Purpose |
|--------|--------|
| **Real phones** | **North star.** The app must look and behave like a polished phone experience: touch targets, safe areas (`env(safe-area-inset-*)`), `100dvh`, real keyboard, readable type, performance. All tokens and components should **make sense on device first**. |
| **Desktop / tablet** | **Preview harness only.** A centered “phone simulation” (max width × height, bezel, neutral letterboxing) so you can **check look-and-feel and flows** without confusing “full browser width” with the shipped layout. The fake frame is **not** the layout model — it **wraps** the same mobile-first content. |

**Rule:** Implement **mobile-first** inside the canvas; on large screens, **constrain and center** — never stretch gameplay UI to fill an arbitrary desktop width.

---

## 1. Goals

| Goal | How we satisfy it |
|------|-------------------|
| **Great on real phones** | Semantic HTML, accessible controls, fluid type where appropriate, test on actual devices. |
| **Consistent simulation on desktop** | One **PhoneCanvas** (or equivalent): max dimensions, centered, optional bezel, 20px white inset, inner rounded content area. |
| **One look everywhere** | **Tokens** (`--ge-*`) and/or **shared components** (`ScreenTitle`, `PillButton`, …) — **one edit updates all usages** for H1, body, pills, popups. |
| **Match designed diffs** | Blue / yellow / red pills, yellow / red popups, **20px white inset**, blue intro + badge, in-game pills + **check_pill** + keyboard mode (blur, lifted stack, soft keyboard). |

---

## 2. Viewport model (canvas)

### 2.1 Reference sizes

- **Minimum sanity check:** ~**375 × 667** CSS px (small phone class).
- **Large phone cap (simulation + design max):** pick one canonical pair, e.g. **393 × 852** or **430 × 932**, and store as `--ge-canvas-max-w` / `--ge-canvas-max-h`.

### 2.2 Small viewports (real phone or narrow browser)

- Content **`width: 100%`**, **`min-height: 100dvh`** (with `100vh` fallback where needed).
- **No** dependency on “desktop margin” for layout — the **inner screen** fills the viewport.

### 2.3 Large viewports (desktop preview)

- Outer: **`min-height: 100dvh`**, **`display: flex`**, **`align-items: center`**, **`justify-content: center`**, neutral background.
- Inner phone shell: **`width: min(100%, var(--ge-canvas-max-w))`**, **`height: min(100dvh, var(--ge-canvas-max-h))`** (or equivalent) so the **UI does not stretch** with monitor width.
- **`PhoneWrapper` implements this on every breakpoint** (not only ≥`md`). Viewports between ~400–767px used to use **`w-full`** on the shell and could grow past any real phone width (e.g. 716px); the shell must **always** respect **`--ge-canvas-max-w`** / **`--ge-canvas-max-h`** from `:root` in `globals.css` (currently **393px × 852px**, adjust in one place if the canonical device changes).
- Optional: black rounded bezel, shadow — purely cosmetic for simulation.

### 2.4 Chrome stack (every player screen)

Aligned with **`PhoneWrapper.tsx`** and the player location page pattern. **Named layout classes are only:** **`image_container`** and **`action_container`**. Inner clip, typography, and buttons use **`.image_container > div`**, **`globals.css`**, **`ge-*` type/button utilities**, or Tailwind — not **`ge-action-container`**, **`__copy`**, **`__header`**, or **`ge-cta-bottom-bar`**.

1. **Outer bezel** (optional on real full-screen PWA; useful in simulation).
2. **`image_container`** — White **card inset**: **`padding: 20px`**, **`border-radius: var(--ge-radius-image-container)`** (**32px**, from **`pagedesign.md`**), card shadow, bottom padding respects safe-area. **`PhoneWrapper`** sets **`class="image_container"`**; rules in **`globals.css`**.
3. **Inner screen** — **First child `div` of `image_container`** (often unclassed): **`border-radius: var(--ge-radius-inner-screen)`** (**25px**), **`overflow: hidden`** (or **`visible`** when keyboard mode needs unclipped stacks), default **`#f8f8f8`**, optional **`background-image`** **cover** / **top center** (**`PhoneWrapper`** inline style).
4. **`action_container`** — Inside **`.player-view`**: the **20px safe column** from the **inner screen** on **left, right, and bottom** (**`--ge-action-inset`**, **`width: calc(100% - 2×inset)`**, **`margin-inline: auto`**, **`margin-bottom: max(20px, safe-area)`**). **`padding-bottom: 0`** on the column; the **bottom CTA** sits on the column’s bottom edge with **`mt-auto`**. **`action-container--absolute-inset`**: full-area overlays (e.g. leaderboard) that still use this margin model. **`action-container--flush`**: **`gap: 0`** for %‑height stacks.

**Golden rule — media inside the stack:** Keep background gradients, **`background-image`**, **`<img>`**, **`<video>`**, and full-bleed steps **inside** **`image_container` > inner `div`** (usually under **`.player-view`**). Use **`position: absolute; inset: 0`** only against that inner stack — never **`fixed`** to the viewport, never **`PhoneWrapper`** siblings that skip **`image_container`**. Prefer **`overflow: hidden`** on the inner screen; for video use **`object-fit: contain`** when letterboxing is acceptable, or **`cover`** only inside a box with explicit bounds so nothing draws past the rounded clip.

**Intro START (§5.4) — layout check:** **`PhoneWrapper`** supplies **`image_container`** and the inner screen **`div`**. The blue **`ge-intro-inner`** panel, badge **`img`**, and scrollable copy + CTA live in **`action_container`** only (no extra layout shell classes). That matches §2.4.

**Player routes — default shell:** **`/`** (intro), **`/nine`**, and **`/[locationSlug]`** use **`PhoneWrapper`** (**`image_container`**) and **`.player-view`**. **`PlayerChrome`** wraps **`PhoneWrapper`** (default: one **`action_container`**). Intro sets **`wrapWithActionContainer={false}`** (per-step **`action_container`**). Location: main column = **`action_container`** + **`action-container--flush`**; **leaderboard** = **`action_container`** + **`action-container--absolute-inset`**. **Fullscreen video** layers are **not** **`action_container`**.

**Exception — `/dashboard` (non-negotiable):** The CMS **must stay full-screen** in the browser — **full viewport width and height** (**`100dvh`**, **`width: 100%`**, no max-width cap). It **never** uses **`PhoneWrapper`**, **`image_container`**, **`PlayerChrome`**, or **`action_container`**. Markup root: **`dashboard-fullscreen`** in **`dashboard/page.tsx`**.

---

## 3. Typography (single source of truth)

**Font:** **Barlow Semi Condensed** (weights 300–600 in references). **Inter** only for explicit secondary/CMS copy if needed.

### Fixed sizes (player-facing)

**Units:** **rem** for `--ge-type-h1-size` / `--ge-type-body-size` in `globals.css`. Do **not** use **pt** for these — CSS **pt** maps to ~96dpi **px** and made headings read as ~37px / body ~21px in devtools.

**Root:** **`html, body { font-size: 16px }`** (browser-standard root). **`1rem = 16px`** unless `html` changes.

**Line breaks in intro copy:** Literal **`\n`** in a string passed to **`renderText`** (intro **`page.tsx`**) becomes a **line break** in the UI (split + **`<br />`** between parts). Example: **`Ontcijfer de code\nen stop Bad Elon`** → two lines.

| Role | Token in `:root` | rem | ≈ px at 16px root | Casing / style |
|------|------------------|-----|-------------------|----------------|
| **H1 (in-content)** | `--ge-type-h1-size` | **`1.7rem`** | **~27.2** | `.ge-h1`: weight 400, `#3a3243`, light text shadow, **`text-transform: none`** |
| **Body** | `--ge-type-body-size` | **`1.1rem`** | **~17.6** | `.ge-body`: weight 300, line-height ~1.45, **`--ge-navy`** |

### Semantic roles → classes

| Role | Class | Implementation |
|------|--------|----------------|
| **H1 (in-content)** | `.ge-h1` | **`font-size: var(--ge-type-h1-size)`** in **`globals.css`** (under **`.player-view`**) |
| **Body** | `.ge-body` | **`font-size: var(--ge-type-body-size)`** |
| **Pill label** | `.ge-btn-*` | **`1rem`** (blue/yellow), **`0.9375rem`** (red), Barlow |

**Rule:** Use **`ge-h1` / `<ScreenTitle>`** (or equivalent) — avoid one-off `text-2xl` for the same semantic role across pages.

---

## 4. Color & surfaces

Align duplicate hex values in code to **one canonical token** each.

| Token | Use |
|--------|-----|
| `--ge-navy` | Primary text on light / OK buttons (`#0d1f4a` / `#003566` — unify) |
| `--ge-red` | Primary destructive / check (`#e42f2f` / `#D62828` — unify) |
| `--ge-red-gradient` | Red pill — **`variants.html`** (`.button_red`) |
| `--ge-blue-gradient` | Blue pill — **`variants.html`** (`.button_blue`) |
| `--ge-yellow-gradient` | Yellow pill — **`variants.html`** (`.button_yellow`) |
| `--ge-popup-yellow`, `--ge-popup-red` | Modal cards — **`variants.html`** (`.popup_yellow` / `.popup_red`) |
| `--ge-blue-back` | Intro: `linear-gradient(35.3deg, #2f7dd4, #5ca8f0, #bfe0ff)` |

---

## 5. Components (designed diffs)

Implement as **`src/components/ui/*`** (suggested) with **variants**, not copy-pasted class strings.

### 5.1 Action CTAs — `button_blue`, `button_yellow`, `button_red`

| Prototype | CSS class | Fill token (`:root`) |
|-----------|-----------|----------------------|
| **`button_yellow`** | **`.ge-btn-yellow`** | **`var(--ge-yellow-gradient)`** |
| **`button_blue`** | **`.ge-btn-blue`** | **`var(--ge-blue-gradient)`** |
| **`button_red`** | **`.ge-btn-red`** | **`var(--ge-red-gradient)`** |

- **`rounded-full`**, **2px white border**, fixed pill height **35px** (**`variants.html`**).
- **Typography:** Barlow **400**; **`letter-spacing: normal`** on pills (readable default); **no forced uppercase**.
- **`button_blue`:** lavender **glow** shadow (see **`variants.html`**). **`button_yellow`:** `0 6px 18px` neutral shadow. **`button_red`:** soft dark shadow.
- Inside canvas: **`width: 100%`**, **`max-width: 248px`**.
- **Primary pill at bottom of `action_container`**: wrap block in **`mt-auto shrink-0`** + **`pt-4`**; on the pill use **`ge-btn-*--foot`** (**yellow / blue / red**) so margins don’t lift it. Default column height is **`65cqh`** with **`margin-top: auto`** so the block sits on the inner bottom; **`mt-auto`** inside the column still pins the foot. Long copy: inner **`flex-1 min-h-0 overflow-y-auto`** wrapper, foot **sibling** (see UITLEG / PUZZLE122). **Exceptions**: floating **video** / **modal** controls, **`/nine`** tile grid.
- **Active:** **`transform: scale(0.98)`**, **`filter: brightness()`** on **`ge-btn-*`**.
- **Bottom inset:** **`action_container`** **`margin-bottom: max(20px, safe-area)`** and **`image_container`** bottom padding — not by **`padding-bottom`** on the column.

### 5.2 In-game row — `pill-input`, `pill-muted`, `check_pill`

| Element | Notes |
|---------|--------|
| **Input** | White, soft shadow, `rounded-full`, placeholder **#b0b0b0** |
| **Muted** | White pill, “Poging: n” |
| **check_pill** | Red CTA, white text, bold; **2px white border** in row; ~30px row height in reference |

**Keyboard mode** (from `preview.html`):

- State **`keyboard-open`** on the **screen root** (inside inner bezel only).
- **Backdrop:** `backdrop-blur` + light scrim; heading/body extra blur + lower opacity.
- **Pill stack:** ~**42%** vertical, `translateY(-50%)` — tune per canvas height.
- **Soft keyboard** anchored **bottom** of same screen; **Klaar**, **Escape**, tap blurred copy to dismiss.
- **Gotcha:** lifted stack may need **`overflow-visible`** on container while open — avoid clipping.

### 5.3 Popups — `popup_yellow`, `popup_red`

- Shell: **`.ge-popup-yellow`** / **`.ge-popup-red`** — gradients, **`border-radius` ~40px**, **6px white border**, **`min-height: 200px`**, shadow per **`variants.html`**.
- **`.ge-popup__title`**: yellow card **29px** / **700**, red card **27px** / **500** (navy).
- **`.ge-popup__meta`**: **1.5rem**, navy.
- **`.ge-popup__message`**: freeform copy (e.g. hints), **1rem** navy.
- **`.ge-popup__ok`**: **62×62** circle, **6px** white border, **#0d1f4a** fill, **`margin-top: auto`** inside the flex popup shell (stays **inside** the card — no negative offset).

### 5.4 Intro — `image_container` + `blue_back` + badge

- **Outer:** **`image_container`** — white, **padding 20px**, **32px** radius (`--ge-radius-image-container`), card shadow (`PhoneWrapper` + **`globals.css`**).
- **Inner screen:** first **`div`** inside **`image_container`** — **25px** radius (`--ge-radius-inner-screen`), **`globals.css`** selector **`.image_container > div`**.
- **Blue panel:** **`.ge-intro-inner`** — **`var(--ge-radius-blue-back)`** (**20px**, slightly tighter than inner screen), gradient, shadow.
- **Logo:** **150 × 132** px, `background-size: contain`, centered horizontally, **logo top-aligned** (`padding-top` ~**1.35rem**).
- Wrap heading + body + primary CTA in **`action_container`** (§2.4).
- Obey the **§2.4 golden rule**: media only inside **`image_container` > inner `div`** (`page.tsx` + `PhoneWrapper`).

---

## 6. Motion

- **Transitions:** ~200–320ms, **`cubic-bezier(0.32, 0.72, 0, 1)`** for keyboard / lift.
- Reuse **`animate-fluent-slide-up` / `slide-down`** from `globals.css` for modals where fit.
- **`prefers-reduced-motion`:** reduce blur and non-essential motion.

---

## 7. Implementation map (this repo)

| Today | Target |
|--------|--------|
| `globals.css` | Add **`--ge-*`** + Tailwind `@theme` where useful |
| Long inline TSX | **Shared UI components** per §5 |
| Duplicated phone chrome | **`PhoneWrapper`** + optional **`PlayerChrome`**: **`image_container`** + inner **`div`** + **`.player-view`** + **`action_container`** (player routes only; **`/dashboard`** excluded) |
| Per-page headings | **`ScreenTitle` / `ScreenBody`** or scoped **`.ge-h1`** under **`.player-view`** |
| Bottom primary CTA | Foot of **`action_container`** (**`mt-auto`** wrapper); **`padding-bottom: 0`** on the column |
| `action_container` | **`.player-view .action_container`** in **`globals.css`**; **`/`**, **`/nine`**, **`/[locationSlug]`** |
| Corner radii | `:root` **`--ge-radius-image-container`**, **`--ge-radius-inner-screen`**, **`--ge-radius-blue-back`** |
| Pill gradients §4 | `:root` **`--ge-yellow-gradient`**, **`--ge-blue-gradient`**, **`--ge-red-gradient`** — used by **`.ge-btn-*`** (§5.1) |

**Scoping:** **`.player-view`** (already in `globals.css`) keeps player tokens from leaking into **dashboard** styling.

---

## 8. Definition of done

- [ ] **Real phone:** layout and type work at 375px+; safe areas respected where needed.
- [ ] **Desktop simulation:** max canvas, centered, not stretched; flows testable.
- [ ] **Typography** via tokens/components for H1 / body / pill.
- [ ] **Pills & popups** shared with variants.
- [ ] **Intro blue** + badge placement per spec.
- [ ] **Primary CTAs** (§5.1): **20px** minimum above bottom of inner screen, with safe-area via **`margin-bottom: max(20px, env(safe-area-inset-bottom))`** on **`action_container`**.
- [ ] **Keyboard mode** without clipping.
- [ ] **Single source** for each semantic role — change H1 once, updates everywhere.

---

## 9. Prototype references (static HTML)

These filenames describe **original** Escape HTML; **they are not in this git repo**. Use **`pagedesign.md`** + **`globaldesign.md`** + **`:root` radii** as the enforced spec.

| File (reference only) | Contents |
|------|----------|
| **`variants.html`** | `image_container`, `blue_back`, pills, popups |
| **`preview.html`** | 20px inset, **`action_container`**, `action-heading` / `action-body`, pill stack, **`check_pill`**, `keyboard-open` |

---

*Document version 17 — **`action_container`**: **`flex: 1 1 0%`** + **`h-full`** flex chain; primary CTAs **`mt-auto`** + **`ge-btn-*--foot`**; scroll split for long steps (UITLEG / PUZZLE).*
