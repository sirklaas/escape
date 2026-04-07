# Escape Room Player Page Design Specifications

This document outlines the mobile-first design system for the Escape Room Player Pages (e.g., `/blokker`, `/boek`, etc.).

## 📱 Global Layout (Phone Wrapper)
- **Container**: Fixed, full-viewport wrapper (`h-screen overflow-hidden`).
- **Standard Frame**: A consistent **20px white margin** (`inset-5`) around the entire content.
- **Card Styling**: High-contrast, premium rounded corners (`rounded-[32px]`) with subtle `shadow-2xl`.

## 📍 Page Segmentation (The 1/4 Flow)
The content is divided into a vertical flex-column structure:
1.  **Top Section (1/4 - 25%)**: 
    - **Purpose**: Brand identity and navigation markers.
    - **Logo**: Centered, 20px below the top of the frame.
    - **Header**: Location codes (e.g., `5F9Q+M5 LEIDEN`) in `text-gray-300`, centered.
2.  **Middle Section (2/4 - 55%)**: 
    - **Purpose**: Primary interaction area (Maps, Verification, or Puzzles).
    - **Content**: Map iframes, Intro text, or Input fields.
    - **Alignment**: Items are centered within this block.
3.  **Bottom Section (1/4 - 20%)**: 
    - **Purpose**: Footer actions and timers.
    - **Timer**: A large, circular SVG timer (`80px`) with a red progress stroke.
    - **Action Button**: Standardized height (`h-10`) with a blue gradient background (`from-[#004e92] to-[#000428]`).

## 🚨 Popup High-Priority Specifications (Alerts)
- **Fixed Size**: Must be exactly **200px (Height)** and **280px (Width)**.
- **Top Offset**: Heading ("Jammer") and body text start exactly **40px from the top** (`mt-10`).
- **Bottom Offset**: OK circle button is anchored exactly **20px from the bottom** (`bottom-5`).
- **Style**:
  - **Wrong**: Red vertical gradient (`from-[#D62828] to-[#800000]`), white text.
  - **Correct**: Yellow/Amber gradient (`from-amber-400 to-yellow-200`).
- **Animation**: Premium **2.0s duration** (`duration-[2000ms]`) for all slide-up and slide-down transitions.

## 🎨 Typography & Interaction
- **Primary Typeface**: `Barlow Semi Condensed` (Black/Bold for headings, Light/Regular for body).
- **Transitions**: Non-interactive elements use `cubic-bezier(0.16, 1, 0.3, 1)` for fluid, natural motion.
- **Button Feedback**: `active:scale-95` on all touch targets for tactical responsiveness.

---
*Last updated: 2026-04-06*
