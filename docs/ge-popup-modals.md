# Yellow / red popup modals (player-view) — reuse for game screens

Handoff note: same pattern as the hint on **`/vulin`**.

## Pattern

1. **Shell**: Wrap the screen with **`PlayerChrome`** (or any wrapper that includes **`player-view`**). Global rules for popups are scoped under **`.player-view`** in `src/app/globals.css`.

2. **Card**: Use **`ge-popup-yellow`** or **`ge-popup-red`** plus **`ge-popup_animation`** on the card for the entrance. Shell uses **`padding-top`** and **`padding-bottom: var(--ge-action-inset)` (20px)** so the title/heading and bottom CTA sit **20px** from the card edges; last **`button`** child gets **`margin-top: auto`** (with a specificity override for **`ge-btn-*--foot`**) to pin the CTA to the bottom inset.

3. **Overlay**: Animate the **backdrop / full-screen layer** with **fade only** — e.g. `animate-in fade-in duration-200`. **Do not** add **`zoom-in`** (or heavy scale `animate-in` on the container) when the card already uses **`ge-popup_animation`**, or the whole layer will feel like it “snaps” instead of sliding smoothly.

4. **Why `ge-popup_animation`**: It runs the shared **`fluent-slide-up`** keyframes (same **2s** duration as `.animate-fluent-slide-up`) with **`animation-fill-mode: both`** so there is no one-frame flash at full opacity before the animation runs. **`will-change: transform, opacity`** is on this class. **`prefers-reduced-motion: reduce`** disables the animation.

5. **Reference implementation**: `src/app/vulin/page.tsx` — hint overlay: outer `fade-in`, inner **`ge-popup-yellow ge-popup_animation`**; primary action is **`Speel de video`** (full-width `ge-btn-red`) navigating to `/video122`. Success is **`/122`**; first token video is **`/toka`** (Token A / `tokenA.mp4`).

## Related utilities

- **`animate-fluent-slide-up`** / **`animate-fluent-slide-down`**: different duration (e.g. 2s on fluent-slide-up utility); use for non-popup slides where that timing fits.
- Design tokens and inner structure: **`ge-popup__title`** (default **400**, **`ge-popup__title--bold`** for **700**), **`ge-popup__meta`**, **`ge-popup__message`**, **`ge-popup__ok`** — see `globaldesign.md` and `.archon/rules/ui_ux_guidelines.md`.
