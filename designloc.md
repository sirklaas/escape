# Location Page Design System & Specifications

This document outlines the final design rules for the Escape Room Location Page (`src/app/[locationSlug]/page.tsx`).

## 🕒 Global Animations
- **Duration**: Core transitions and "fluent-slide" animations are set to **2.0 seconds** (`duration-[2000ms]`) for a smooth, premium feel.
- **Easing**: Custom `cubic-bezier(0.16, 1, 0.3, 1)` for fluid, natural motion.

## 📍 Phase 1: Navigation Phase (Map View)
- **Header**:
  - Removed "BESTEMMING" pill/label.
  - Location code (e.g., `5F9Q+M5 LEIDEN`) is centered, 20px below the logo, styled as `text-gray-300` (75% grey) with `font-medium` (500 weight).
- **Map Container**:
  - Strict 20px side margins (`left-5 right-5`).
  - White rounded card (`rounded-[32px]`) with internal padding (`p-5`) to keep the map `iframe` away from the edges.
- **Action Button ("Ik ben er")**:
  - **Text**: "Ik ben er" (Barlow Semi Condensed, weight 300).
  - **Style**: Blue gradient (`bg-gradient-to-b from-[#004e92] to-[#000428]`), `h-10` height.
  - **Position**: 20px side margins (`left-5 right-5`).

## 🗝️ Phase 2: Verification Phase (Input View)
- **Layout**:
  - Content starts at **70% from the top**.
  - **No white card frame/background** for this section.
- **Heading**: Centered, uppercase `Barlow Semi Condensed` font, `text-[#003566]`.
- **Antwoord Input**:
  - **Shape**: Rounded pill (`rounded-full`).
  - **Size**: `h-10` height.
  - **Position**: 20px side margins (`left-5 right-5`).
- **Footer Button ("Controleer")**:
  - Matches the style and margins of the Phase 1 action button.
  - **Text**: "Controleer" (capitalized).

## 🚨 Popup Alerts (Jammer / Correct)
- **Card Specs**:
  - **Fixed Size**: `200px` height, `280px` width.
  - **Shadow**: Heavy shadow `shadow-[0_20px_50px_rgba(0,0,0,0.5)]` for depth.
- **Top Alignment**: Heading ("Jammer") and body start exactly **40px from the top** (`pt-10`).
- **Bottom Alignment**: OK circle button is anchored exactly **20px from the bottom** (`bottom-5`).
- **Styles**:
  - **Wrong (Jammer)**: Red vertical gradient (`from-[#D62828] to-[#800000]`), white text.
  - **Correct**: Yellow/Amber gradient (`from-amber-400 to-yellow-200`).
- **Exit Flow**: OK button triggers a **2.0s smooth slide-down animation** (`animate-fluent-slide-down`) before unmounting.

---
*Last updated: 2026-04-06*
