'use client';

import { useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

/** Eerste opdracht: antwoord uit video — daarna token / door naar `/nine`. */
export default function VulinPage() {
  const [answer, setAnswer] = useState('');
  const [solved, setSolved] = useState(false);
  const [showTokenVideo, setShowTokenVideo] = useState(false);
  const [hintOpen, setHintOpen] = useState(false);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [hintMessage, setHintMessage] = useState('');

  const checkAnswer = () => {
    const ans = answer.trim().toLowerCase();
    if (ans === '122') {
      setSolved(true);
      setAnswer('');
    } else {
      const hints = [
        'helaas dat klopt niet. Probeer het opnieuw. Kijk nogmaals goed naar de video.',
        'Jammer Maar …Wat valt je op?',
        'Nee nee Letters tellen niet',
        'Mis Je hoort steeds getallen….',
        'Zo Close… Drie cijfers !',
        'Tel ze allemaal op en je weet het',
      ];
      setHintMessage(hints[Math.min(incorrectAttempts, hints.length - 1)]);
      setIncorrectAttempts((n) => n + 1);
      setHintOpen(true);
    }
  };

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      {!solved ? (
        <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-700">
          <div className="action_container relative z-10 min-h-0 flex-1 overflow-hidden">
            <div className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto">
              <h1 className="ge-h1 mt-4 shrink-0 font-semibold text-[var(--ge-navy)]">Zijn jullie er uit?</h1>
              <p className="ge-body my-[26px] max-w-[280px] shrink-0 px-2 font-medium text-[var(--ge-navy)]">
                Vul dat dan maar in…
              </p>

              <div className="mt-[50px] flex w-full max-w-[320px] flex-col items-center gap-10 px-4">
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                  placeholder="........"
                  className="w-full max-w-[280px] shrink-0 rounded-full border-[3px] border-white bg-white/95 px-4 text-center text-[var(--ge-navy)] placeholder:text-[var(--ge-placeholder)] shadow-[0_6px_20px_rgba(13,31,74,0.18)] outline-none transition-[box-shadow,border-color] focus:border-[var(--ge-navy)] focus:shadow-[0_8px_24px_rgba(13,31,74,0.22)]"
                  style={{
                    height: 35,
                    fontFamily: "'Barlow Semi Condensed', sans-serif",
                    fontSize: 'clamp(0.9375rem, 2.8vw, 1.0625rem)',
                  }}
                />

                <div className="flex w-full shrink-0 justify-center">
                  <button
                    type="button"
                    onClick={checkAnswer}
                    className="ge-btn-red ge-btn-red--foot !w-[120px] !min-w-[120px] !max-w-[120px] shrink-0"
                    style={{ height: 35 }}
                  >
                    Check
                  </button>
                </div>
              </div>
            </div>
          </div>

          {hintOpen && (
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <div className="relative z-10 w-full max-w-[280px]">
                <div className="ge-popup-yellow">
                  <p className="ge-popup__message">{hintMessage}</p>
                  <button
                    type="button"
                    className="ge-popup__ok"
                    aria-label="Terug naar video"
                    onClick={() => {
                      window.location.href = '/122';
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
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
                    window.location.href = '/nine';
                  }}
                  className="flex-1 rounded-xl border border-white/30 bg-blue-600/80 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white backdrop-blur-md"
                >
                  We gaan beginnen
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </PlayerChrome>
  );
}
