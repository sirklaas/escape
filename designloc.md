# Location Page Design System & Specifications

This document outlines the final design rules for the Escape Room Location Page (`src/app/[locationSlug]/page.tsx`).

## 🕒 Global Animations
- **Duration**: Core transitions and "fluent-slide" animations are set to **2.0 seconds** (`duration-[2000ms]`) for a smooth, premium feel.
- **Easing**: Custom `cubic-bezier(0.16, 1, 0.3, 1)` for fluid, natural motion.

## 📍 Phase 1: Navigation Phase (Map View)
- **Header (Location Code)**:
  - Position: **27.25% from top** (`top: 27.25%`), centered.
  - Scaling: Transitions to 90% scale and 40% opacity when moving to Phase 2.
  - Style: `text-gray-300`, `text-xl`, `font-medium`, tracking-tighter.
- **Map Container**:
  - Position: **30% from top** (`top: 30%`), **50% height** (`h-[50%]`).
  - Strict 20px side margins (`left-5 right-5`).
  - White rounded card (`rounded-[32px]`) with internal padding (`p-5`).
- **Action Button ("Ik ben er")**:
  - **Text**: "Ik ben er" (Barlow Semi Condensed, weight 300).
  - **Style**: Blue gradient (`bg-gradient-to-b from-[#004e92] to-[#000428]`), `h-10` height.
  - **Position**: Anchored to bottom, 20px side margins.

## 🗝️ Phase 2: Verification Phase (Input View)
- **Layout Logic**:
  - **Header Position**: Shifts down to **40.25% from top** (`top: 40.25%`).
  - **Verification Block**: Positioned at **70% from top** (`top: 70%`).
  - **No white card frame** for the input section (direct overlay on backdrop).
- **Heading**: Centered, uppercase `Barlow Semi Condensed` font, `text-[#003566]`, `text-2xl`.
- **Antwoord Input**:
  - **Shape**: Pill-shaped with thick 4px border (`rounded-full border-4`).
  - **Size**: `h-10` height.
  - **Animation**: Error state triggers `animate-shake` and red border (`border-[#d63031]`).
- **Footer Button ("Controleer")**:
  - Matches Phase 1 action button style.
  - **Text**: "Controleer" (capitalized).

## 🚨 Popup Alerts (Jammer / Correct)
- **Card Specs**:
  - **Fixed Size**: `200px` height, `280px` width.
  - **Shadow**: Heavy shadow `shadow-[0_20px_50px_rgba(0,0,0,0.5)]`.
  - **Z-Index**: `z-[100]` for maximum visibility.
- **Top Alignment**: 
  - Text start exactly **40px from the top** (`mt-10` or `pt-10`).
- **Bottom Alignment**: 
  - OK button is centered and anchored **20px from the bottom** (`bottom-5`).
- **Styles**:
  - **Wrong (Jammer)**: Red gradient (`from-[#D62828] to-[#800000]`), white text.
  - **Correct / Hint**: Yellow/Amber gradient (`from-amber-400 to-yellow-200`), navy text (`text-[#003566]`).
- **Exit Flow**: OK button triggers a **2.0s smooth slide-down animation** (`animate-fluent-slide-down`) before unmounting.

## 🎬 Phase 3: Transition Phase (Video)
- **Background**: Solid black background.
- **Content**: Full-screen video player (`object-cover`).
- **Interaction**: Play/Pause button styled as a centered glassmorphism circle with a white border.
- **Navigation**: "Yes die hebben we" button (Yellow/Amber gradient) anchored to bottom to proceed to Leaderboard.

## 🏆 Phase 4: Final Phase (Leaderboard)
- **Background**: High-contrast light gray (`#f8f8f8`).
- **Heading**: "Leaderboard" (large, 4xl, navy `#003566`, black uppercase).
- **Entries**: 
  - **Rank**: Red circle (`#D62828`) with white border.
  - **Team**: White pill container with shadow and team name / time.
  - **Animation**: Sequential slide-in effect for team entries.

---
---
*Last updated: 2026-04-08*
