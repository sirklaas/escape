'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import PlayerChrome from '@/components/PlayerChrome';
import { readVulinSolved } from '@/lib/vulin-flow';
import { fetchEscapeData } from '@/lib/pb';
import {
  GAME_ATLAS_LOCATION_SLUG,
  tokenVideoSrcFromNextPageUrl,
} from '@/lib/game-atlas';
import { slugOrderIndex } from '@/lib/location-slugs';

/**
 * Token A (first earned token) — video from PB `nextPage` for the atlas location.
 * Intro: `/vulin` → `/122` → `/toka`. Game-atlas QA: `/toka?atlas=1` skips the vulin gate.
 */
function TokaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const atlas = searchParams.get('atlas') === '1';
  const [allowed, setAllowed] = useState(false);
  const [videoSrc, setVideoSrc] = useState('/videos/tokenA.mp4');

  useEffect(() => {
    if (atlas) {
      let cancelled = false;
      (async () => {
        try {
          const pbData = await fetchEscapeData();
          if (pbData && !cancelled) {
            const variant = pbData.activeVariant || 'city';
            const vData = pbData[variant];
            const slugLower = GAME_ATLAS_LOCATION_SLUG.toLowerCase();
            const locationOrdinal = slugOrderIndex(slugLower) + 1;
            const loc = vData?.locations.find(
              (l) =>
                l.locationNumber === locationOrdinal ||
                l.name?.toLowerCase() === slugLower ||
                l.mapUrl?.toLowerCase().includes(slugLower)
            );
            if (loc) {
              const locPages = vData.pages.filter((p) => p.locationNumber === loc.locationNumber);
              if (locPages.length > 0) {
                const firstPageNum = Math.min(...locPages.map((p) => p.pageNumber));
                const page = locPages.find((p) => p.pageNumber === firstPageNum);
                if (page?.nextPage) {
                  setVideoSrc(tokenVideoSrcFromNextPageUrl(page.nextPage));
                }
              }
            }
          }
        } catch {
          /* default tokenA */
        }
        if (!cancelled) setAllowed(true);
      })();
      return () => {
        cancelled = true;
      };
    }
    if (!readVulinSolved()) {
      router.replace('/vulin');
      return;
    }
    setAllowed(true);
  }, [router, atlas]);

  if (!allowed) return null;

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
        <div className="absolute inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-black animate-in fade-in zoom-in duration-500">
          <video autoPlay playsInline className="h-full w-full min-h-0 flex-1 object-contain">
            <source src={videoSrc} type="video/mp4" />
          </video>
          <div
            className="absolute bottom-10 z-[70] flex min-w-0 gap-4"
            style={{
              left: 'var(--ge-action-inset)',
              right: 'var(--ge-action-inset)',
            }}
          >
            <button
              type="button"
              onClick={() => router.push('/122')}
              className="ge-btn-red ge-btn-red--foot min-h-0 min-w-0 flex-1 !max-w-none !self-stretch"
            >
              Kijk nog eens
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.href = '/nine';
              }}
              className="ge-btn-blue ge-btn-blue--foot min-h-0 min-w-0 flex-1 !max-w-none !self-stretch"
            >
              Begin maar
            </button>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}

export default function PageToka() {
  return (
    <Suspense fallback={null}>
      <TokaContent />
    </Suspense>
  );
}
