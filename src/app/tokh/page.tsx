'use client';

import { Suspense, useState } from 'react';
import { useRouter } from 'next/navigation';
import PlayerChrome from '@/components/PlayerChrome';

/**
 * Token H - Earned at Count (Location 7)
 */
function TokhContent() {
  const router = useRouter();
  const [videoSrc] = useState('/videos/tokenH.mp4');

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
              onClick={() => router.push('/leaderboard')}
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
              Naar keuze scherm
            </button>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}

export default function PageTokh() {
  return (
    <Suspense fallback={null}>
      <TokhContent />
    </Suspense>
  );
}
