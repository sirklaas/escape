'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  gameAtlasNav,
  gameAtlasNavHref,
  gameAtlasPathFromPhase,
  normalizeGameAtlasPathname,
  type GameAtlasPath,
  type GameAtlasPhase,
} from '@/lib/game-atlas';
import { endAtlasNav, endAtlasNavHref, type EndAtlasPath } from '@/lib/end-atlas';
import { introAtlasNav } from '@/lib/intro-atlas';

/** Never in production builds; local `next dev` only, or `next start` + `NEXT_PUBLIC_INTRO_DEV_NAV=1` in `.env.local`. */
function devNavEnabled(): boolean {
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  return (
    process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_INTRO_DEV_NAV === '1'
  );
}

export default function IntroFlowDevNav({
  gameAtlasPhase,
}: {
  /** From `LocationPlayer` on `/locxx` `/pageodd` `/pageeven` — drives slug + prev/next when pathname lags after Next.js client nav. */
  gameAtlasPhase?: GameAtlasPhase;
} = {}) {
  const pathname = usePathname();
  const normalized = pathname ? normalizeGameAtlasPathname(pathname) : '';
  const pathForGameNav =
    gameAtlasPhase != null ? gameAtlasPathFromPhase(gameAtlasPhase) : normalized;
  // Game → end-game → intro (e.g. `/toka` is game+intro; game wins; `/tokenkey`…`/watzullenwe` are end-only).
  const gameNav = pathForGameNav ? gameAtlasNav(pathForGameNav) : null;
  const endNav = !gameNav && normalized ? endAtlasNav(normalized) : null;
  const introNav = !gameNav && !endNav && normalized ? introAtlasNav(normalized) : null;
  const nav = gameNav ?? endNav ?? introNav;

  if (!devNavEnabled() || !nav) {
    return null;
  }

  const btn =
    'rounded-lg border border-zinc-400 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400';

  return (
    <div className="flex w-full justify-center px-3 pb-3 sm:px-6 sm:pb-4 md:px-10 md:pb-6">
      <div
        className="flex w-full max-w-[min(100%,var(--ge-canvas-max-w))] shrink-0 flex-col items-stretch gap-2 rounded-xl border border-zinc-200 bg-zinc-50/95 px-3 py-3 shadow-sm sm:px-4"
        data-testid="intro-flow-dev-nav"
      >
        <p className="text-center font-mono text-xs font-semibold text-zinc-700">{nav.slug}</p>
        <div className="flex items-center justify-center gap-2">
          {nav.prev ? (
            <Link
              href={
                gameNav
                  ? gameAtlasNavHref(nav.prev as GameAtlasPath)
                  : endNav
                    ? endAtlasNavHref(nav.prev as EndAtlasPath)
                    : nav.prev
              }
              className={btn}
            >
              Previous
            </Link>
          ) : (
            <span className={btn} aria-disabled>
              Previous
            </span>
          )}
          {nav.next ? (
            <Link
              href={
                gameNav
                  ? gameAtlasNavHref(nav.next as GameAtlasPath)
                  : endNav
                    ? endAtlasNavHref(nav.next as EndAtlasPath)
                    : nav.next
              }
              className={btn}
            >
              Next
            </Link>
          ) : (
            <span className={btn} aria-disabled>
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
