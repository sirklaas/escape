'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  totalAtlasNav,
  totalAtlasNavHref,
} from '@/lib/total-atlas';

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

export default function IntroFlowDevNav() {
  const pathname = usePathname();
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const current = new URLSearchParams(window.location.search).get('location') || undefined;
    setSelectedLocation(current);
  }, [pathname]);
  // Use total atlas nav which connects intro → game → end seamlessly
  const navData = pathname ? totalAtlasNav(pathname, selectedLocation) : null;

  // Convert to the format expected by the UI
  const nav = navData
    ? {
        slug: navData.slug,
        prev: navData.prev?.path ?? null,
        next: navData.next?.path ?? null,
      }
    : null;

  if (!devNavEnabled() || !nav) {
    return null;
  }

  const btn =
    'rounded-lg border border-zinc-400 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:bg-zinc-100 disabled:text-zinc-400';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] flex w-full justify-center px-3 pb-3 sm:px-6 sm:pb-4 md:px-10 md:pb-6 bg-red-500">
      <div
        className="flex w-full max-w-[min(100%,var(--ge-canvas-max-w))] shrink-0 flex-col items-stretch gap-2 rounded-xl border-4 border-red-600 bg-white px-3 py-3 shadow-2xl sm:px-4"
        data-testid="intro-flow-dev-nav"
      >
        <p className="text-center font-mono text-xs font-semibold text-zinc-700">{nav.slug}</p>
        <div className="flex items-center justify-center gap-2">
          {nav.prev ? (
            <Link href={totalAtlasNavHref(nav.prev, selectedLocation)} className={btn}>
              Previous
            </Link>
          ) : (
            <span className={btn} aria-disabled>
              Previous
            </span>
          )}
          {nav.next ? (
            <Link href={totalAtlasNavHref(nav.next, selectedLocation)} className={btn}>
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
