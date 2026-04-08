# Escape Room Player Page Design Specifications

This document outlines the mobile-first design system for the Escape Room Player Pages (e.g., `/blokker`, `/boek`, etc.).

## 📱 Global Layout (Phone Wrapper)
- **Container**: Fixed, full-viewport wrapper (`h-screen overflow-hidden`).
- **Standard Frame**: A consistent **20px white margin** (`inset-5`) around the entire content.
- **Card Styling**: High-contrast, premium rounded corners (`rounded-[32px]`) with subtle `shadow-2xl`.

## 📍 Page Segmentation (Vertical Flow)
The viewport is divided into five vertical sections for precise layout control:
1.  **Top Header (10%)**: 
    - **Purpose**: Displays global status (e.g., "Tijd: XX s") centered in a blurred stone-colored pill.
2.  **Spacer (20%)**: 
    - **Purpose**: Visual breathing room to center content lower on the screen for thumb reach.
3.  **Content Area (30%)**: 
    - **Purpose**: Primary interaction area (Maps, Verification instructions, or Puzzle text).
    - **Transition**: Uses `animate-in fade-in duration-[2000ms]`.
4.  **Control Area (20%)**: 
    - **Purpose**: Action inputs (Check button, Answer field, or Page-1 "START" button).
5.  **Footer Area (20%)**: 
    - **Purpose**: Circular timer and navigation markers.
    - **Timer**: Circular SVG (`80px`) with red stroke (`#D62828`).

## 🚨 Popup High-Priority Specifications (Alerts)
- **Fixed Size**: Must be exactly **200px (Height)** and **280px (Width)**.
- **Top Offset**: Text starts exactly **40px from the top** (`mt-10` or `pt-10`).
- **Bottom Offset**: OK circle button is centered and anchored **20px from the bottom** (`bottom-5`).
- **Styles**:
  - **Wrong (Jammer)**: Red vertical gradient (`from-[#D62828] to-[#800000]`), white text.
  - **Correct / Hint**: Yellow/Amber gradient (`from-amber-400 to-yellow-200`), Navy text (`text-[#003566]`).
- **Animation**: Premium **2.0s duration** (`duration-[2000ms]`) for slide-up and slide-down transitions.

## 🧩 Puzzle Interaction (Page 1, 2, etc.)
- **Input Layout**: 
  - **Row 1 (Top)**: Full-width pill shape input (`w-full h-10`) with placeholder "Wat denken jullie?".
  - **Row 2 (Bottom)**: 
    - **Left**: Small pill (`w-1/3 h-10`) showing `Poging: {attempts}`.
    - **Right**: Flexible "Check" button (`flex-grow h-10`, Red background).
  - **Spacing**: 
    - **20px side margins** from left and right edges for both rows.
    - **20px vertical gap** between Row 1 and Row 2.
- **Success Metrics**: 
  - The correct answer popup must display the completion time (`Tijd: XX s`) centered below the "Geweldig gedaan!" text.

## 🎨 Backgrounds & Assets
- **Navigation/Verify**: Uses `Loc.jpg` backdrop.
- **Puzzle/Intro**: Uses `Escapebackdrop.jpg` backdrop.
- **Contrast**: Content is often placed inside a `rounded-[20px]` container with 20px padding (white background) to ensure legibility.

---
*Last updated: 2026-04-08*
