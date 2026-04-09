'use client';

import { useRef, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

type VideoPhase = 'idle' | 'playing' | 'ended';

/** Static route: `/robotvid` (wins over `[locationSlug]`). */
export default function RobotVidPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<VideoPhase>('idle');

  const continueToTeam = () => {
    window.location.href = '/naam';
  };

  const handleFootClick = () => {
    if (phase === 'ended') {
      continueToTeam();
      return;
    }
    const el = videoRef.current;
    if (!el || phase === 'playing') return;
    el.muted = false;
    setPhase('playing');
    void el.play();
  };

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg">
      <div className="flex min-h-0 flex-1 flex-col text-center">
        <h1 className="ge-h1 shrink-0">Let goed op</h1>
        <p className="ge-body text-pretty shrink-0 pt-2">
          Want in deze video zitten belangrijke hints!
        </p>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-4">
          <video
            ref={videoRef}
            className="max-h-full w-full max-w-[min(100%,360px)] object-contain"
            playsInline
            preload="metadata"
            onEnded={() => setPhase('ended')}
          >
            <source src="/videos/elonRobotSquare.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="flex w-full shrink-0 flex-col items-center pt-6">
          <button
            type="button"
            onClick={handleFootClick}
            disabled={phase === 'playing'}
            className="ge-btn-blue ge-btn-blue--foot disabled:cursor-not-allowed disabled:opacity-60"
          >
            {phase === 'ended' ? 'Ga verder' : 'Start video'}
          </button>
        </div>
      </div>
    </PlayerChrome>
  );
}
