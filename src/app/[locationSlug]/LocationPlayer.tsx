'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { fetchEscapeData, type EscapeData, type GameVariant, type EscapePage, type EscapeLocation, markLocationCompleted } from '@/lib/pb';
import { getLeaderboardData, type LeaderboardEntry } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import PhoneWrapper from '@/components/PhoneWrapper';
import IntroFlowDevNav from '@/components/IntroFlowDevNav';
import { tokenVideoSrcFromNextPageUrl, type GameAtlasPhase } from '@/lib/game-atlas';
import { locationCodeLabel, mapsEmbedSrc } from '@/lib/location-code';
import { slugOrderIndex } from '@/lib/location-slugs';

const GAME_SETTINGS = {
  hintButtonAppearTime: 120,
  timerIncrementInterval: 5,
  incorrectGuessPenalty: 25,
  challengeDuration: 600,
  sounds: { ping: '...', buzz: '...', doorbell: '...' }
};

const HINT_COSTS = [100, 200, 300, 400];

/** Keyboard lift / lower — matches CSS on `.ge-puzzle-stack` and `.ge-puzzle-overlay`. */
const PUZZLE_KEYBOARD_MS = 2000;

function LeaderboardList() {
  const [teams, setTeams] = useState<LeaderboardEntry[]>([]);
  const [positions, setPositions] = useState<number[]>([]);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await getLeaderboardData();
      setTeams(data);
      let pos = [...Array(data.length).keys()];
      for (let i = pos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pos[i], pos[j]] = [pos[j], pos[i]];
      }
      setPositions(pos);
      setTimeout(() => setAnimating(true), 1000);
    }
    load();
  }, []);

  if (teams.length === 0) return <div className="text-gray-400 font-light mt-8 animate-pulse">Computing Ranks...</div>;

  return (
    <div className="relative w-[calc(100%-10px)] max-w-sm mt-6 mb-2">
      {teams.map((team, index) => {
        const transformY = animating ? (index * 45) : ((positions[index] || 0) * 45);
        return (
          <div key={team.teamName} className={`absolute top-0 left-0 w-full h-[40px] flex items-center transition-transform ${animating ? 'duration-[2000ms] ease-in-out' : 'duration-0'}`} style={{ transform: `translateY(${transformY}px)` }}>
            <span className="w-8 h-8 shrink-0 bg-[#D62828] border-2 border-white rounded-full text-white flex justify-center items-center font-bold text-sm shadow-[0_0_0_1px_#D62828] mr-3">{index + 1}</span>
            <div className="flex-grow bg-white border-2 border-gray-300 rounded-full flex justify-between items-center px-4 h-[35px] shadow-sm">
               <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]" style={{ fontWeight: 400 }}>{team.teamName}</span>
               <span className="text-gray-500 font-medium text-xs" style={{ fontWeight: 500 }}>{team.totalTime} sec</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

type LocationPlayerProps = {
  locationSlug: string;
  /**
   * Game-atlas only: after PB load, jump to the step that matches the wireframes
   * (LocXX = map, PageOdd = puzzle, PageEven = “Geweldig gedaan” modal).
   */
  atlasPhase?: GameAtlasPhase;
};

export default function LocationPlayer({ locationSlug, atlasPhase }: LocationPlayerProps) {

  const [data, setData] = useState<EscapeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [variant, setVariant] = useState<GameVariant>('city');
  const [step, setStep] = useState<'direction' | 'verify' | 'intro' | 'puzzle' | 'video' | 'finished'>('intro');
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [isStarting, setIsStarting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [timer, setTimer] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showHintButton, setShowHintButton] = useState(false);
  const [answer, setAnswer] = useState('');
  const [navPhase, setNavPhase] = useState<'maps' | 'verify'>('maps');
  const [alertState, setAlertState] = useState<'none' | 'correct' | 'wrong' | 'timeup' | 'hint'>('none');
  const [isClosingAlert, setIsClosingAlert] = useState(false);
  const [currentHintText, setCurrentHintText] = useState('');

  const alertStateRef = useRef(alertState);
  alertStateRef.current = alertState;

  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const puzzleInputRef = useRef<HTMLInputElement>(null);
  const blurKeyboardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [keyboardOpen, setKeyboardOpen] = useState(false);

  const clearBlurKeyboardTimer = () => {
    if (blurKeyboardTimerRef.current) {
      clearTimeout(blurKeyboardTimerRef.current);
      blurKeyboardTimerRef.current = null;
    }
  };

  useEffect(() => () => clearBlurKeyboardTimer(), []);

  useEffect(() => {
    if (step !== 'puzzle') setKeyboardOpen(false);
  }, [step]);

  /** Match escapedesign/preview.html: dismiss keyboard when visual viewport grows again. */
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const overlap = window.innerHeight - vv.height;
      if (overlap < 40 && alertStateRef.current !== 'wrong') setKeyboardOpen(false);
    };
    vv.addEventListener('resize', onResize);
    vv.addEventListener('scroll', onResize);
    return () => {
      vv.removeEventListener('resize', onResize);
      vv.removeEventListener('scroll', onResize);
    };
  }, []);

  const onPuzzleInputFocus = () => {
    clearBlurKeyboardTimer();
    setKeyboardOpen(true);
  };

  const onPuzzleInputBlur = () => {
    clearBlurKeyboardTimer();
    blurKeyboardTimerRef.current = setTimeout(() => {
      if (alertStateRef.current === 'wrong') return;
      setKeyboardOpen(false);
      blurKeyboardTimerRef.current = null;
    }, 220);
  };

  /** Red “Jammer” popup: keep lift until OK, then 2s reverse (CSS) + clear alert. */
  const closeWrongPuzzleAlert = () => {
    setIsClosingAlert(true);
    puzzleInputRef.current?.blur();
    clearBlurKeyboardTimer();
    setKeyboardOpen(false);
    window.setTimeout(() => {
      setAlertState('none');
      setIsClosingAlert(false);
    }, PUZZLE_KEYBOARD_MS);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const renderText = (str: string = '') => {
    return str.split('\\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== str.split('\\n').length - 1 && <br />}
      </span>
    ));
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pbData = await fetchEscapeData();
      if (pbData) {
        setData(pbData);
        const activeV = pbData.activeVariant || 'city';
        setVariant(activeV);
        
        const slugLower = decodeURIComponent(locationSlug).toLowerCase();
        const locIndex = slugOrderIndex(slugLower);
        let locNum = locIndex + 1;
        
        let activeLoc = locNum > 0 ? pbData[activeV]?.locations.find(l => l.locationNumber === locNum) : null;
        if (!activeLoc) {
           activeLoc = pbData[activeV]?.locations.find(l => 
              l.name?.toLowerCase() === slugLower || 
              l.mapUrl?.toLowerCase().includes(slugLower)
           );
        }

        if (activeLoc && activeLoc.skip !== true) {
           setStep('direction');
        } else {
           setStep('intro');
        }
        
        // Find the first page for this location and set it as current
        const locPages = pbData[activeV]?.pages?.filter(p => p.locationNumber === activeLoc?.locationNumber);
        if (locPages && locPages.length > 0) {
           const firstPageNum = Math.min(...locPages.map(p => p.pageNumber));
           setCurrentPageNumber(firstPageNum);
        }

        if (activeV === 'rat' || activeV === 'diner') setStep('puzzle');
      }
    } catch (err) {
      console.error('Failed to load game data:', err);
    } finally {
      setLoading(false);
    }
  }, [locationSlug]);

  useEffect(() => { loadData(); }, [loadData]);

  const slugLower = decodeURIComponent(locationSlug).toLowerCase();
  const locationOrdinal = slugOrderIndex(slugLower) + 1;
  const vData = data?.[variant];
  const loc = vData?.locations.find(l => 
     l.locationNumber === locationOrdinal || 
     l.name?.toLowerCase() === slugLower || 
     l.mapUrl?.toLowerCase().includes(slugLower)
  );
  const locNumber = loc?.locationNumber || 1;
  const currentPageData = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === currentPageNumber);

  /** Atlas QA: same location slug, different steps (map → puzzle → success). */
  useEffect(() => {
    if (!atlasPhase) return;
    if (loading) return;
    if (!data || !loc) return;

    if (atlasPhase === 'locxx') {
      setStep('direction');
      setNavPhase('maps');
      setAlertState('none');
      setIsClosingAlert(false);
    } else if (atlasPhase === 'pageodd') {
      setStep('puzzle');
      setNavPhase('maps');
      setAlertState('none');
      setIsClosingAlert(false);
      setTimer(0);
      setChallengeTimer(0);
    } else if (atlasPhase === 'pageeven') {
      /* Same base as pageodd — no success popup on load (QA layout without modal). */
      setStep('puzzle');
      setNavPhase('maps');
      setAlertState('none');
      setIsClosingAlert(false);
      setTimer(0);
      setChallengeTimer(0);
    }
  }, [atlasPhase, loading, data, loc]);

  useEffect(() => {
    if (atlasPhase === 'pageeven') return;
    if (step === 'puzzle') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + GAME_SETTINGS.timerIncrementInterval);
        setChallengeTimer(prev => prev + GAME_SETTINGS.timerIncrementInterval);
      }, GAME_SETTINGS.timerIncrementInterval * 1000);
      const hintTimeout = setTimeout(() => setShowHintButton(true), GAME_SETTINGS.hintButtonAppearTime * 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
        clearTimeout(hintTimeout);
      };
    }
  }, [step, currentPageNumber, atlasPhase]);

  useEffect(() => {
    if (atlasPhase === 'pageeven') return;
    const limit = currentPageData?.timerLimit ?? GAME_SETTINGS.challengeDuration;
    if (challengeTimer >= limit) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAlertState('timeup');
    }
  }, [challengeTimer, currentPageData, atlasPhase]);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      setStep('puzzle');
      setIsStarting(false);
    }, 800);
  };

  const handleCheck = async () => {
    if (!currentPageData) return;
    if (answer.toLowerCase().trim() === currentPageData.correctAnswer.toLowerCase().trim()) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAlertState('correct');
    } else {
      setAttempts(prev => prev + 1);
      setTimer(prev => prev + GAME_SETTINGS.incorrectGuessPenalty);
      setAlertState('wrong');
    }
    setAnswer('');
  };

  const checkAnswer = () => {
    if (!loc) return;
    const normalizedUserInput = answer.toLowerCase().trim();
    const normalizedCorrectAnswer = String(
      loc.verificationAnswer !== undefined && loc.verificationAnswer !== null ? loc.verificationAnswer : ''
    )
      .toLowerCase()
      .trim();
    if (normalizedCorrectAnswer !== '' && normalizedUserInput === normalizedCorrectAnswer) {
      setAlertState('correct');
    } else {
      setAlertState('wrong');
    }
  };

  /** Yellow / hint: wait for OK → 2s `animate-fluent-slide-down` (matches globals.css), then clear + optional navigate. */
  const closeAlert = (cb?: () => void) => {
    setIsClosingAlert(true);
    window.setTimeout(() => {
      setAlertState('none');
      setIsClosingAlert(false);
      cb?.();
    }, PUZZLE_KEYBOARD_MS);
  };

  const handleRevealHint = () => {
    if (!currentPageData || hintsRevealed >= 4) return;
    const cost = HINT_COSTS[hintsRevealed];
    if (timer >= cost) {
      setTimer(prev => prev + cost);
      setCurrentHintText(currentPageData.hints[hintsRevealed]);
      setHintsRevealed(prev => prev + 1);
      setAlertState('hint');
    }
  };

  /** Called after yellow popup has finished closing (2s) — alert already cleared in `closeAlert`. */
  const proceedNext = () => {
    if (step === 'direction' || step === 'verify') {
      setStep('intro');
      setNavPhase('maps');
      setAnswer('');
      return;
    }
    const nextP = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === currentPageNumber + 1);
    if (nextP) {
      setCurrentPageNumber((prev) => prev + 1);
      setTimer(0);
      setChallengeTimer(0);
      setAttempts(0);
      setHintsRevealed(0);
      setShowHintButton(false);
    } else {
      setStep('video');
      markLocationCompleted('team_alpha', locationSlug.toLowerCase(), timer);
    }
  };

  if (loading)
    return (
      <PhoneWrapper backgroundImage="/Escapebackdrop.jpg">
        <div className="player-view relative z-10 flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="action_container min-h-0 flex flex-1 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        </div>
      </PhoneWrapper>
    );
  if (!data || !loc)
    return (
      <PhoneWrapper backgroundImage="/Escapebackdrop.jpg">
        <div className="player-view relative z-10 flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="action_container min-h-0 flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-gray-900">
            <p className="text-lg font-semibold">Location Not Found</p>
            <p className="text-sm text-gray-600">
              Geen uitdaging voor &quot;{decodeURIComponent(locationSlug)}&quot;, of game-data kon niet worden geladen
              (controleer PocketBase MASTER_DASHBOARD).
            </p>
            <Link
              href="/start"
              className="rounded-full bg-[#0d1f4a] px-6 py-2 text-sm font-medium text-white no-underline"
            >
              Terug naar start
            </Link>
          </div>
        </div>
      </PhoneWrapper>
    );

  const dashArray = 2 * Math.PI * 38;
  const currentLimit = currentPageData?.timerLimit ?? GAME_SETTINGS.challengeDuration;
  const progress = challengeTimer / currentLimit;
  const dashOffset = dashArray * (1 - progress);

  const playerBackgroundImage =
    step === 'video' ? '' : step === 'direction' || step === 'verify' ? '/Loc.jpg' : '/Escapebackdrop.jpg';

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300;400;500;600;800&display=swap');
        body { font-family: 'Barlow Semi Condensed', sans-serif; margin: 0; padding: 0; background: white; overflow: hidden; }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>

      <PhoneWrapper
        backgroundImage={playerBackgroundImage}
        className={atlasPhase === 'locxx' ? 'image_container--locxx' : ''}
      >
        <div className="player-view relative z-10 flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden">
          {/* Timer sits on player-view top — not inside action_container (that card is margin-top:auto / 65cqh, below the logo art). */}
          {step === 'puzzle' && (
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center px-4 transition-opacity duration-[2000ms] ease-out ${keyboardOpen ? 'opacity-0' : 'opacity-100'}`}
              style={{ paddingTop: 'max(0.25rem, env(safe-area-inset-top, 0px))' }}
            >
              <div
                className="pointer-events-auto bg-stone-200/90 backdrop-blur-md text-stone-600 px-6 py-2 rounded-full font-light text-xl shadow-md border border-white/30 text-center tracking-wide w-full max-w-[280px]"
                style={{ fontWeight: 300 }}
              >
                Tijd: {timer} s
              </div>
            </div>
          )}
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className="action_container action-container--flush relative z-10 flex min-h-0 flex-1 flex-col overflow-visible"
              style={{ opacity: step === 'video' ? 0 : 1, pointerEvents: step === 'video' ? 'none' : 'auto' }}
            >

                {step === 'puzzle' ? (
                  <div
                    className={`ge-puzzle-branch flex min-h-0 flex-1 flex-col text-center ${keyboardOpen ? 'ge-puzzle-branch--keyboard-open' : ''}`}
                  >
                    <div
                      className={`relative z-0 min-h-0 flex-1 overflow-y-auto px-4 pb-2 pt-2 transition-[filter,opacity] duration-[2000ms] ease-out ${keyboardOpen ? 'blur-[10px] opacity-55' : ''}`}
                    >
                      <div className="w-full shrink-0 space-y-4 animate-in fade-in duration-[2000ms]">
                        <h2 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 400 }}>
                          {renderText(currentPageData?.kop)}
                        </h2>
                        <p className="text-lg font-light text-gray-800 leading-normal" style={{ fontWeight: 300 }}>
                          {renderText(currentPageData?.bodyTxt)}
                        </p>
                      </div>
                    </div>
                    <div
                      className="ge-puzzle-overlay"
                      onClick={() => puzzleInputRef.current?.blur()}
                      aria-hidden
                    />
                    {/* escapedesign/preview.html — pill-stack; moves up when keyboard open */}
                    <div className={`ge-puzzle-stack ${keyboardOpen ? 'ge-puzzle-stack--keyboard-open' : ''}`}>
                      <input
                        ref={puzzleInputRef}
                        type="text"
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                        onFocus={onPuzzleInputFocus}
                        onBlur={onPuzzleInputBlur}
                        placeholder="Wat denken jullie?"
                        autoComplete="off"
                        enterKeyHint="done"
                        className={`ge-puzzle-pill-input ${alertState === 'wrong' ? 'ge-puzzle-pill-input--wrong animate-shake' : ''}`}
                      />
                      <div className="ge-puzzle-pill-row">
                        <div className="ge-puzzle-pill-muted" role="status">
                          Poging: {attempts}
                        </div>
                        <button type="button" className="ge-puzzle-check" onClick={handleCheck}>
                          Check
                        </button>
                      </div>
                      <div className="ge-puzzle-ring-wrap">
                        <svg width="52" height="52" viewBox="0 0 100 100" aria-hidden>
                          <circle className="stroke-[#e8dcc8] fill-none stroke-[12px]" cx="50" cy="50" r="38" />
                          <circle
                            className="fill-none stroke-[#e42f2f] stroke-[15px] transition-all duration-500 ease-linear"
                            cx="50"
                            cy="50"
                            r="38"
                            transform="rotate(-90 50 50)"
                            style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }}
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                <div className="h-[10%] flex items-center justify-center px-4 w-full" />

                <div className="h-[20%] w-full" />

                 <div className="h-[30%] flex flex-col items-center justify-start pt-2 text-center px-5 w-full">
                   {step === 'direction' && (
                     <div className="absolute inset-0 z-[100] flex flex-col items-center overflow-visible">
                        {/* Plus code — above map in paint order; no translateY(-50%) so parent overflow won’t clip */}
                        <div
                          className="pointer-events-none absolute z-[110] w-full px-6 flex flex-col items-center transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1)"
                          style={{ top: navPhase === 'verify' ? '11%' : '8%' }}
                        >
                           <div className={`w-full max-w-sm animate-in fade-in zoom-in duration-[2000ms] ${navPhase === 'verify' ? 'scale-90 opacity-40 blur-[1px]' : 'scale-100 opacity-100 blur-0'}`}>
                              <p className="text-gray-200 text-xl font-medium tracking-tighter text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]" style={{ fontFamily: 'Barlow Semi Condensed' }}>
                                {locationCodeLabel(loc?.mapUrl)}
                              </p>
                           </div>
                        </div>

                        {/* Map — fixed band (50% height @ 30% top) to match original card proportions */}
                        <div
                          className={`absolute z-10 left-5 right-5 transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${navPhase === 'maps' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-[100%] pointer-events-none'}`}
                          style={{ top: '30%', height: '50%' }}
                        >
                           <div className="h-full w-full bg-white rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative p-5">
                              <iframe
                                 width="100%"
                                 height="100%"
                                 title="Kaart"
                                 frameBorder={0}
                                 style={{ border: 0 }}
                                 src={mapsEmbedSrc(loc?.mapUrl)}
                                 allowFullScreen
                              />
                           </div>
                        </div>

                        {/* Verify — vertically centered in action_container (between top code and footer) */}
                         <div
                           className={`absolute inset-x-5 top-12 bottom-28 z-[20] flex flex-col justify-center transition-all duration-[2000ms] cubic-bezier(0.16, 1, 0.3, 1) ${navPhase === 'verify' ? 'pointer-events-auto opacity-100 scale-100' : 'pointer-events-none opacity-0 scale-95'}`}
                         >
                            <div className="mx-auto w-full max-w-sm animate-fluent-slide-up flex flex-col gap-3">
                               <h2 className="text-2xl text-[#003566] font-black uppercase tracking-wider leading-tight text-center" style={{ fontFamily: 'Barlow Semi Condensed' }}>{(loc?.heading && loc.heading.trim() !== '') ? renderText(loc.heading) : 'LAATSTE CHECK'}</h2>
                               <p className="text-gray-600 font-medium text-[15px] leading-relaxed text-center" style={{ fontFamily: 'Inter' }}>{(loc?.body && loc.body.trim() !== '') ? renderText(loc.body) : 'Je bent op de juiste plek. Voer hieronder de code of het antwoord in om door naar de volgende fase te gaan.'}</p>
                               <div className="relative group pt-1">
                                  <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                                    placeholder="Antwoord..."
                                    autoComplete="off"
                                    className={`w-full min-h-11 bg-white border-4 px-4 py-2 ${alertState === 'wrong' ? 'border-[#d63031] text-[#d63031] animate-shake' : 'border-[#003566]/10 text-gray-900 focus:border-[#003566]/30 focus:bg-white'} rounded-full text-center text-[20px] font-light outline-none transition-all shadow-inner placeholder:text-[20px] placeholder:font-light placeholder:text-gray-400`}
                                    style={{ fontFamily: 'Barlow Semi Condensed', fontWeight: 300 }}
                                  />
                               </div>
                            </div>
                         </div>

                        {/* Footer */}
                        <div className="absolute bottom-10 left-5 right-5 z-30 flex flex-col items-center gap-2">
                           <button type="button" onClick={(e) => { e.stopPropagation(); if (navPhase === 'maps') setNavPhase('verify'); else checkAnswer(); }} className="w-full h-10 rounded-[24px] border-4 text-[18px] tracking-[0.2em] shadow-[0_20px_40px_rgba(108,92,231,0.3)] active:scale-95 transition-all duration-[2000ms] flex items-center justify-center gap-4 bg-gradient-to-b from-[#004e92] to-[#000428] border-white text-white animate-pulse-slow" style={{ fontFamily: 'Barlow Semi Condensed', fontWeight: 800 }}>
                              {navPhase === 'maps' ? "Ik ben er" : "Controleer"}
                           </button>
                        </div>
                     </div>
                  )}

                  {step === 'intro' && (
                    <div className={`space-y-4 w-full transition-all duration-700 ${isStarting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      <h3 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 400 }}>{renderText(currentPageData?.kop)}</h3>
                      <p className="text-gray-900 text-lg font-light leading-snug" style={{ fontWeight: 300 }}>{renderText(currentPageData?.bodyTxt)}</p>
                    </div>
                  )}
                </div>
                  </>
                )}

                {(alertState === 'correct' || alertState === 'hint' || alertState === 'wrong') && (
                  <div className="absolute left-0 right-0 top-[65%] -translate-y-1/2 z-[100] h-[200px] flex items-center justify-center pointer-events-none">
                    <div className={`w-[280px] mx-auto h-full pointer-events-auto ${isClosingAlert ? 'animate-fluent-slide-down' : 'animate-fluent-slide-up'}`}>
                      {alertState === 'wrong' && (
                         <div className="bg-gradient-to-b from-[#D62828] to-[#600e0e] text-white rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center relative overflow-hidden">
                            <div className="flex flex-col items-center text-center w-full mt-10">
                               <h2 className="text-2xl font-black mb-1 uppercase" style={{ fontFamily: 'Barlow Semi Condensed' }}>Jammer</h2>
                               <p className="text-sm font-medium leading-tight px-4 text-white">
                                  Helaas dat is niet helemaal juist<br />probeer het opnieuw
                                </p>
                            </div>
                            <button
                              type="button"
                              onClick={closeWrongPuzzleAlert}
                              className="absolute bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#003566] text-white rounded-full border-4 border-white shadow-xl active:scale-95 flex items-center justify-center font-bold font-black"
                            >
                              OK
                            </button>
                         </div>
                      )}
                      {(alertState === 'correct' || alertState === 'hint') && (
                        <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center relative overflow-hidden">
                            <div className="flex flex-col items-center text-center w-full mt-10">
                              <p className="text-[#003566] text-center font-bold px-2">{alertState === 'correct' ? "Geweldig gedaan!" : `Hint: ${currentHintText}`}</p>
                              {alertState === 'correct' && step === 'puzzle' && (
                                <p className="text-[#003566] text-lg font-bold mt-2">Tijd: {timer} s</p>
                              )}
                           </div>
                           <button onClick={() => closeAlert(alertState === 'correct' ? proceedNext : undefined)} className="absolute bottom-5 left-1/2 -translate-x-1/2 w-14 h-14 bg-[#003566] text-white rounded-full border-4 border-white shadow-xl active:scale-95 flex items-center justify-center font-black">OK</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {step !== 'puzzle' && (
                  <>
                <div className="h-[20%] relative flex flex-col items-center justify-center w-full gap-4 overflow-visible">
                  {step === 'intro' && (
                    <button
                      type="button"
                      onClick={handleStart}
                      className={`w-[100px] h-[100px] bg-[#D62828] text-white rounded-full border-[6px] border-white text-xl font-medium shadow-xl active:scale-95 transition-all transform ${isStarting ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} duration-700`}
                    >
                      START
                    </button>
                  )}
                </div>

                <div className="h-[20%] flex items-center justify-center w-full relative" />
                  </>
                )}

              </div>

              {step === 'video' && (
                <div className="absolute inset-0 bg-black z-20 flex flex-col items-center justify-center">
                  <video 
                    ref={videoRef} 
                    src={tokenVideoSrcFromNextPageUrl(currentPageData?.nextPage || '')} 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onEnded={() => setIsPlaying(false)}
                  />
                  
                  {!isPlaying && (
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 w-full h-full outline-none">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/50 pl-3 shadow-2xl transition-transform active:scale-90">
                         <svg fill="white" viewBox="0 0 24 24" className="w-12 h-12"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </button>
                  )}

                  <div className="absolute bottom-8 z-30 w-[calc(100%-40px)] left-1/2 -translate-x-1/2">
                    <button onClick={() => setStep('finished')} className="w-full h-16 bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#003566] rounded-full border-4 border-white text-xl font-normal shadow-2xl active:scale-95 transition-all outline-none" style={{ fontWeight: 400 }}>
                      Yes die hebben we
                    </button>
                  </div>
                </div>
              )}

              {step === 'finished' && (
                <div className="action_container action-container--flush action-container--absolute-inset flex flex-col items-center bg-[#f8f8f8] pt-8">
                   <h2 className="text-4xl text-[#003566] font-black uppercase tracking-widest leading-tight drop-shadow-sm mb-4" style={{ fontFamily: 'Barlow Semi Condensed' }}>Leaderboard</h2>
                   <div className="flex-1 w-full overflow-y-auto pb-24 flex flex-col items-center">
                      <LeaderboardList />
                   </div>
                   
                   <div className="absolute bottom-8 left-5 right-5 z-50">
                      <button 
                        onClick={() => window.location.href = '/nine'} 
                        className="w-full h-14 bg-gradient-to-r from-[#D62828] to-[#9c1d1d] text-white rounded-full border-4 border-white text-lg font-bold shadow-2xl active:scale-95 transition-all outline-none"
                      >
                        Gauw de volgende doen
                      </button>
                   </div>
                </div>
              )}
          </div>
        </div>
      </PhoneWrapper>

      {/* Dev navigation for game-atlas routes */}
      <IntroFlowDevNav gameAtlasPhase={atlasPhase} />
    </>
  );
}
