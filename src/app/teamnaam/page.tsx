'use client';

import { useEffect, useRef, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';
import { initializeTeamAction } from '@/app/actions';

/** `/teamnaam` — team video + naam; was `/team` en `/naam`. */
export default function TeamnaamPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDone, setVideoDone] = useState(false);
  const [videoHidden, setVideoHidden] = useState(false);
  const [showTeamInput, setShowTeamInput] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [playOverlayVisible, setPlayOverlayVisible] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isClosingPopup, setIsClosingPopup] = useState(false);
  const [savedTeamName, setSavedTeamName] = useState('');
  const [didNavigateAfterPopup, setDidNavigateAfterPopup] = useState(false);

  const startPlayback = () => {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    void el.play();
  };

  const handleSubmitTeam = async () => {
    const normalizedTeam = teamName.trim();
    if (!normalizedTeam || isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);
    const result = await initializeTeamAction(normalizedTeam);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Opslaan van teamnaam is mislukt. Probeer opnieuw.');
      return;
    }

    localStorage.setItem('escaperoomTeamName', normalizedTeam);
    setSavedTeamName(normalizedTeam);
    setIsClosingPopup(false);
    setDidNavigateAfterPopup(false);
    setShowSuccessPopup(true);
  };

  useEffect(() => {
    if (!isClosingPopup || didNavigateAfterPopup) return;
    const fallback = window.setTimeout(() => {
      setDidNavigateAfterPopup(true);
      window.location.href = '/players';
    }, 2000);
    return () => window.clearTimeout(fallback);
  }, [isClosingPopup, didNavigateAfterPopup]);

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-700">
        <div className="action_container relative mt-2 flex min-h-0 flex-col overflow-y-auto">
          <div className="shrink-0 px-1 pt-1">
            <h1 className="ge-h1 font-semibold text-[var(--ge-navy)] drop-shadow-sm">
              Verzin een Top Team Naam
            </h1>
            <p className="ge-body mt-2 font-medium">
              Want elk team moet natuurlijk een vetgoeie naam hebben om te scoren
            </p>
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-center px-1 py-2">
            {!videoHidden && (
              <div
                className={[
                  'relative w-full max-w-[min(100%,360px)] shrink-0',
                  videoDone ? 'animate-fluent-slide-down-offscreen' : '',
                ].join(' ')}
                onAnimationEnd={() => {
                  if (!videoDone) return;
                  setVideoHidden(true);
                  setShowTeamInput(true);
                }}
              >
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
                  <source src="/videos/TeamNaamNW.m4v" type="video/mp4" />
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
            )}
          </div>

          {showTeamInput && (
            <div className="animate-fluent-slide-up absolute inset-x-0 bottom-2 z-[40] flex w-full flex-col items-center gap-4 px-2">
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void handleSubmitTeam();
                  }
                }}
                placeholder="Voer je teamnaam in"
                className="ge-pill-input"
                autoComplete="off"
              />
              {errorMessage && <p className="ge-body px-4 text-sm font-medium text-[#D62828]">{errorMessage}</p>}
              <button
                type="button"
                className="ge-btn-blue ge-btn-blue--foot"
                onClick={() => void handleSubmitTeam()}
                disabled={!teamName.trim() || isSubmitting}
              >
                {isSubmitting ? 'Bezig...' : 'Enter'}
              </button>
            </div>
          )}
          {showSuccessPopup && (
            <div className="absolute inset-0 z-[70] flex items-center justify-center overflow-hidden p-4">
              <div
                className={[
                  'ge-popup-yellow flex h-[280px] w-[280px] flex-col items-center text-center',
                  isClosingPopup ? 'ge-popup-motion-down' : 'ge-popup-motion-up',
                ].join(' ')}
                onAnimationEnd={() => {
                  if (!isClosingPopup || didNavigateAfterPopup) return;
                  setDidNavigateAfterPopup(true);
                  window.location.href = '/players';
                }}
              >
                <h1 className="ge-h1">Geweldig</h1>
                <p className="ge-popup__message mt-3">
                  Jullie zijn vanaf nu &apos;{savedTeamName}&apos;.
                  <br />
                  Doe je best.
                </p>
                <button
                  type="button"
                  className="ge-popup__ok mt-5"
                  disabled={isClosingPopup}
                  onClick={() => {
                    setIsClosingPopup(true);
                  }}
                >
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlayerChrome>
  );
}
