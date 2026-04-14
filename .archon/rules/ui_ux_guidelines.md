# UI/UX Guidelines: Great Escape

## Core Design Philosophy
- **Premium & Fluent**: Every interaction should feel smooth and intentional. Use long durations (2.0s) for phase transitions to create a cinematic feel.
- **Mobile First**: All designs are optimized for viewing on a mobile phone (19.5:9 aspect ratio target).

## Layout & Insets
- **Safe Column**: All interactive elements MUST live within the `.action_container`.
- **Insets**: Use the CSS variable `--ge-action-inset` (20px) for all side and bottom margins.
- **Corner Radii**:
  - Outer Card: `32px` (`--ge-radius-image-container`)
  - Inner Screen: `25px` (`--ge-radius-inner-screen`)
  - Blue Back / Inner Panels: `20px` (`--ge-radius-blue-back`)

## Animations & Transitions
- **Standard Duration**: 2.0 seconds (`duration-[2000ms]`) for major transitions and slides.
- **Easing**: 
  - Canonical: `cubic-bezier(0.16, 1, 0.3, 1)`
  - Fluent Easing: `var(--ge-ease-fluent)` / `cubic-bezier(0.32, 0.72, 0, 1)`
- **Animations**: Use `.animate-fluent-slide-up` and `.animate-fluent-slide-down` for consistent entry/exits.

## Color Palette & Typography
- **Primary Navy**: `#0d1f4a` (CSS var `--ge-navy`).
- **Standard H1**: `var(--ge-type-h1-size)` (1.7rem), Barlow Semi Condensed, color `#3a3243`.
- **Gradients**:
  - Yellow Pill: `var(--ge-yellow-gradient)`
  - Blue Pill: `var(--ge-blue-gradient)`
  - Popup Yellow: `var(--ge-popup-yellow)`
  - Popup Red: `var(--ge-popup-red)`
- **Font**: **Barlow Semi Condensed** is the primary font for headings and UI. **Inter** is used for body text.

## Standard Components
- **Buttons/Pills**: Use classes `.ge-btn-yellow`, `.ge-btn-blue`, `.ge-btn-red`.
- **Popups**: Use classes `.ge-popup-yellow` or `.ge-popup-red`. Internal buttons should use `.ge-popup__ok` (the circular dark button).
- **Inputs**: Use `.ge-pill-input` (pill-shaped, white background, centered text).

## Interaction States
- **Loading**: Use consistent spinners or pulsing skeletons.
- **Errors**: Input fields should shake (`animate-shake`) and turn red (`border-[#d63031]`).
- **Success**: Use yellow/amber gradients and smooth slide-down exits for alerts.
