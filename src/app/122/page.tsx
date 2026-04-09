'use client';

import { useRef, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

/** Elon square video — zelfde layout als `/robotvid`; daarna door naar `/vulin`. */
export default function Elon122Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playbackStarted, setPlaybackStarted] = useState(false);

  const goPuzzle = () => {
    window.location.href = '/vulin';
  };

  const handlePuzzleOrPlay = () => {
    if (playbackStarted) {
      goPuzzle();
      return;
    }
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    setPlaybackStarted(true);
    void el.play();
  };

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg">
      <div className="flex min-h-0 flex-1 flex-col text-center">
        <h1 className="ge-h1 shrink-0">Kijk zorgvuldig naar deze video</h1>
        <p className="ge-body text-pretty shrink-0 pt-2">En daarmee los je de eerste opdracht op…</p>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-4">
          <video
            ref={videoRef}
            className="max-h-full w-full max-w-[min(100%,360px)] object-contain"
            playsInline
            preload="metadata"
          >
            <source src="/videos/elonRobotSquare.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="flex w-full shrink-0 flex-col items-center pt-6">
          <button
            type="button"
            onClick={handlePuzzleOrPlay}
            className="ge-btn-blue ge-btn-blue--foot"
          >
            {playbackStarted ? 'We weten het!' : 'Play'}
          </button>
        </div>
      </div>
    </PlayerChrome>
  );
}
