'use client';

import { useRef, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

/** `/team` — layout only; save / API logic comes later. */
export default function TeamNamePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDone, setVideoDone] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [playOverlayVisible, setPlayOverlayVisible] = useState(true);

  const startPlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    void el.play();
  };

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-700">
        {/* Default `action_container` height (65cqh) from globals — video centered inside via flex-1 + justify-center */}
        <div className="action_container mt-2 flex min-h-0 flex-col overflow-y-auto">
          <div className="shrink-0 px-1 pt-1">
            <h1 className="ge-h1 font-semibold text-[var(--ge-navy)] drop-shadow-sm">
              Verzin een Top Team Naam
            </h1>
            <p className="ge-body mt-2 font-medium">
              Want elk team moet natuurlijk een geweldige naam hebben.
            </p>
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-1 py-2">
            <div className="relative w-full max-w-[min(100%,360px)] shrink-0">
              <video
                ref={videoRef}
                className="w-full object-contain"
                playsInline
                preload="metadata"
                onPlay={() => setPlayOverlayVisible(false)}
                onEnded={() => {
                  setVideoDone(true);
                  setPlayOverlayVisible(false);
                }}
              >
                <source src="/videos/RankingNaam.mp4" type="video/mp4" />
              </video>
              {playOverlayVisible && !videoDone && (
                <button
                  type="button"
                  onClick={startPlayback}
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-white/10 transition-colors hover:bg-white/20"
                  aria-label="Video afspelen"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ge-navy)] shadow-lg ring-4 ring-white">
                    <svg
                      className="ml-1 h-9 w-9 text-white"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8 5v14l11-7L8 5z" />
                    </svg>
                  </span>
                </button>
              )}
            </div>
          </div>

          {videoDone && (
            <div className="flex w-full shrink-0 flex-col items-center gap-6 pb-2 pt-4">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Voer je teamnaam in"
                className="ge-pill-input"
                autoComplete="off"
              />
              <button
                type="button"
                className="ge-btn-red ge-btn-red--foot"
                onClick={() => {
                  if (teamName.trim()) localStorage.setItem('escaperoomTeamName', teamName.trim());
                  window.location.href = '/players';
                }}
              >
                Check
              </button>
            </div>
          )}
        </div>
      </div>
    </PlayerChrome>
  );
}
