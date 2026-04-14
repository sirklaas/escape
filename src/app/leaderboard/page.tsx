'use client';

import PlayerChrome from '@/components/PlayerChrome';

/** `/leaderboard` — standalone placeholder (not on the end-atlas spine; open URL directly in dev). */
export default function LeaderboardPage() {
  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg">
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-4 text-center">
        <p className="font-mono text-xs text-zinc-500">leaderboard</p>
        <h1 className="ge-h1">leaderboard</h1>
        <p className="ge-body text-pretty text-zinc-600">
          Placeholder for layout QA. Use Previous / Next under the phone in dev.
        </p>
      </div>
    </PlayerChrome>
  );
}
