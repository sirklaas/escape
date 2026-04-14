'use client';

import { useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

/** 122 success page - shows token reward and leads to token video */
export default function Token122Page() {
  const [showTokenVideo, setShowTokenVideo] = useState(false);

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-1000">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#89d0f5] to-[#aae0ff]" aria-hidden />

        <div className="action_container relative z-10 min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center overflow-y-auto px-2">
            <h2 className="ge-h1 mt-6">Fantastisch gedaan!</h2>

            <p className="ge-body mt-6 px-4 font-medium">
              Laat dit nummer aan Quizmaster Klaas zien natuurlijk zonder dat andere teams dit zien.
            </p>

            <div
              className="mt-8 text-6xl font-bold tabular-nums tracking-tighter text-[var(--ge-navy)] drop-shadow-md"
              style={{ fontFamily: "'Barlow Semi Condensed', sans-serif" }}
            >
              122
            </div>

            <p className="ge-body mt-10 px-4 font-medium">
              En jullie hebben een eerste Token verdiend, deze wordt in een video aan jullie getoond.
              <br />
              <br />
              <strong>Bewaar deze goed!</strong>
            </p>
          </div>

          <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => setShowTokenVideo(true)}
              className="ge-btn-blue ge-btn-blue--foot !max-w-[min(100%,280px)]"
            >
              Dit is jullie eerste Token
            </button>
          </div>
        </div>

        {showTokenVideo && (
          <div className="absolute inset-0 z-[60] flex min-h-0 flex-col overflow-hidden bg-black animate-in fade-in zoom-in duration-500">
            <video autoPlay playsInline className="h-full w-full min-h-0 flex-1 object-contain">
              <source src="/videos/tokenA.mp4" type="video/mp4" />
            </video>
            <div className="absolute bottom-10 left-0 flex w-full justify-center gap-4 px-6">
              <button
                type="button"
                onClick={() => setShowTokenVideo(false)}
                className="flex-1 rounded-xl border border-white/30 bg-white/20 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md"
              >
                Kijk nog eens
              </button>
              <button
                type="button"
                onClick={() => {
                  window.location.href = '/toka';
                }}
                className="flex-1 rounded-xl border border-white/30 bg-blue-600/80 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md"
              >
                We gaan verder →
              </button>
            </div>
          </div>
        )}
      </div>
    </PlayerChrome>
  );
}
