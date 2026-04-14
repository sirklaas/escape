# Project Architecture: Great Escape

## Overview
This is a modern, interactive Escape Room platform built using Next.js and PocketBase. It features highly animated, responsive pages designed for a premium mobile-first user experience.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Runtime**: Node.js 20+
- **Frontend**: React 19, Tailwind CSS 4
- **Database / Backend**: PocketBase (via `pocketbase` JS SDK)
- **Icons**: Lucide React

## Directory Structure
- `src/app/`: Next.js App Router pages and layouts.
  - `[locationSlug]/`: Dynamic route for specific escape room locations.
  - `dashboard/`: Admin or overview dashboard.
- `src/components/`: Reusable React components.
  - `PhoneWrapper.tsx`: The primary shell mimicking a mobile device.
  - `PlayerChrome.tsx`: Provides the background and base layout for game pages.
- `src/lib/`: Core utilities and database clients.
  - `pb.ts`: PocketBase client initialization and authentication.

## Layout & Containers
- **Device Frame**: Managed via `.image_container` (outer white card) and `.ge-player` (inner screen container).
- **Safe Area**: The `.action_container` is the primary interaction zone, typically restricted to the bottom 65% of the inner screen (`65cqh`) to preserve visibility of background logos.
- **Insets**: A global inset of 20px (`--ge-action-inset`) is maintained for all content sitting against the bezel.

## Core Data Flow
1. **Authentication**: Users/Teams authenticate via PocketBase.
2. **State Management**: React state for local UI transitions; PocketBase records for persistent game state.
3. **Real-time**: Leverages PocketBase's real-time subscriptions for live leaderboard updates and game progress.

## Global Styles
Defined in `src/app/globals.css`, prioritizing fluid animations and consistent theme tokens.
