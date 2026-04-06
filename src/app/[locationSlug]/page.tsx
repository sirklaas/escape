'use client';

import { useEffect, useState, useCallback, use, useRef } from 'react';
import { fetchEscapeData, type EscapeData, type GameVariant, type EscapePage, type EscapeLocation, markLocationCompleted } from '@/lib/pb';
import { getLeaderboardData, type LeaderboardEntry } from '@/app/actions';
import { Loader2 } from 'lucide-react';

const GAME_SETTINGS = {
  hintButtonAppearTime: 120,
  timerIncrementInterval: 5,
  incorrectGuessPenalty: 25,
  challengeDuration: 600,
  sounds: { ping: '...', buzz: '...', doorbell: '...' }
};

const HINT_COSTS = [100, 200, 300, 400];

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

export default function PlayerPage({ params }: { params: Promise<{ locationSlug: string }> }) {
  const { locationSlug } = use(params);

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
  const [currentHintText, setCurrentHintText] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        const locIndex = ['blokker', 'boek', 'electro', 'lijst', 'kerk', 'brug', 'count', 'gall', 'drog'].indexOf(slugLower);
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
  const locationOrdinal = ['blokker', 'boek', 'electro', 'lijst', 'kerk', 'brug', 'count', 'gall', 'drog'].indexOf(slugLower) + 1;
  const vData = data?.[variant];
  const loc = vData?.locations.find(l => 
     l.locationNumber === locationOrdinal || 
     l.name?.toLowerCase() === slugLower || 
     l.mapUrl?.toLowerCase().includes(slugLower)
  );
  const locNumber = loc?.locationNumber || 1;
  const currentPageData = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === currentPageNumber);

  useEffect(() => {
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
  }, [step, currentPageNumber]);

  useEffect(() => {
    const limit = currentPageData?.timerLimit ?? GAME_SETTINGS.challengeDuration;
    if (challengeTimer >= limit) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAlertState('timeup');
    }
  }, [challengeTimer, currentPageData]);

  const handleStart = () => {
    setIsStarting(true);
    setTimeout(() => {
      setStep('puzzle');
      setCurrentPageNumber(1);
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
      setTimeout(() => setAlertState('none'), 3000);
    }
    setAnswer('');
  };

  const checkAnswer = () => {
    if (!loc) return;
    const normalizedUserInput = answer.toLowerCase().trim();
    const normalizedCorrectAnswer = (loc.verificationAnswer || "").toLowerCase().trim();
    if (normalizedUserInput === normalizedCorrectAnswer || !loc.verificationAnswer) {
      setAlertState('correct');
      setTimeout(() => {
        setStep('intro');
        setAlertState('none');
        setAnswer('');
      }, 1500);
    } else {
      setAlertState('wrong');
    }
  };

  const handleOpenMaps = () => {
    if (!loc?.mapUrl) return;
    let baseUrl = loc.mapUrl;
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(baseUrl)}`;
    }
    const walkUrl = baseUrl.includes('?') 
      ? `${baseUrl}&travelmode=walking&dir_action=navigate` 
      : `${baseUrl}?travelmode=walking&dir_action=navigate`;
    setNavPhase('verify');
    window.location.href = walkUrl;
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

  const proceedNext = () => {
    setAlertState('none');
    const nextP = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === currentPageNumber + 1);
    if (nextP) {
      setCurrentPageNumber(prev => prev + 1);
      setTimer(0); setChallengeTimer(0); setAttempts(0); setHintsRevealed(0); setShowHintButton(false);
    } else {
      setStep('video');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-500 w-8 h-8" /></div>;
  if (!data || !loc) return <div className="min-h-screen flex items-center justify-center text-gray-900 bg-white">Location Not Found</div>;

  const dashArray = 2 * Math.PI * 38;
  const currentLimit = currentPageData?.timerLimit ?? GAME_SETTINGS.challengeDuration;
  const progress = challengeTimer / currentLimit;
  const dashOffset = dashArray * (1 - progress);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300;400;500;600;800&display=swap');
        body { font-family: 'Barlow Semi Condensed', sans-serif; margin: 0; padding: 0; background: white; overflow: hidden; }
        @keyframes pulse-slow { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.8; transform: scale(0.98); } }
        .animate-pulse-slow { animation: pulse-slow 3s infinite ease-in-out; }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-10 overflow-auto">
        <div className="w-full h-[100dvh] md:w-[380px] md:h-[800px] bg-black md:rounded-[60px] md:border-[8px] md:border-zinc-900 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
          <div className="relative flex-1 overflow-hidden flex flex-col h-full" style={{ background: 'white', padding: '20px' }}>
            <div className="relative flex-1 rounded-[20px] overflow-hidden flex flex-col h-full bg-[#f8f8f8]" style={{ backgroundImage: step === 'video' ? 'none' : ( (step === 'direction' || step === 'verify') ? 'url("/Loc.jpg")' : 'url("/Escapebackdrop.jpg")'), backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}>
              <div className="flex-1 flex flex-col h-full w-full relative z-10 overflow-visible" style={{ opacity: step === 'video' ? 0 : 1, pointerEvents: step === 'video' ? 'none' : 'auto' }}>
                
                <div className="h-[10%] flex items-center justify-center px-4 w-full">
                  {step === 'puzzle' && (
                    <div className="bg-stone-200/80 backdrop-blur-md text-stone-600 px-6 py-2 rounded-full font-light text-xl shadow-md border border-white/30 text-center tracking-wide w-full max-w-[280px]" style={{ fontWeight: 300 }}>Tijd: {timer} s</div>
                  )}
                </div>

                <div className="h-[20%] w-full" />

                 <div className="h-[30%] flex flex-col items-center justify-start pt-2 text-center px-5 w-full">
                   {step === 'direction' && (
                     <div className="absolute inset-0 z-[100] flex flex-col items-center overflow-hidden">
                        {/* Location Indicator - Phase 1: Header | Phase 2: High Header */}
                        <div className="absolute w-full px-6 flex flex-col items-center transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1)" style={{ top: navPhase === 'verify' ? '40.25%' : '27.25%', transform: 'translateY(-50%)' }}>
                           <div className={`w-full max-w-sm animate-in fade-in zoom-in duration-1000 ${navPhase === 'verify' ? 'scale-90 opacity-40 blur-[1px]' : 'scale-100 opacity-100 blur-0'}`}>
                              <p className="text-gray-400 text-xl font-medium tracking-tighter text-center" style={{ fontFamily: 'Barlow Semi Condensed' }}>{ (loc?.mapUrl && loc.mapUrl.includes('/') ? loc.mapUrl.split('/').pop()?.split('?')[0]?.replace(/%20/g, ' ') : '5F9Q+M5 LEIDEN') }</p>
                           </div>
                        </div>

                        {/* Map Container - Phase 1: Full | Phase 2: Hidden/Slide-down */}
                        <div className={`absolute left-5 right-5 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${navPhase === 'maps' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-[100%] pointer-events-none'}`} 
                             style={{ top: '30%', height: '50%' }}>
                           <div className="w-full h-full bg-white rounded-[32px] overflow-hidden border-4 border-white shadow-2xl relative">
                              <iframe 
                                 width="100%" 
                                 height="100%" 
                                 frameBorder="0" 
                                 style={{ border: 0 }}
                                 src={`https://www.google.com/maps?q=${encodeURIComponent(loc?.mapUrl || '5F9Q+M5 Leiden')}&output=embed`}
                                 allowFullScreen
                              />
                              <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                                 <button onClick={handleOpenMaps} className="w-12 h-12 bg-white rounded-full shadow-lg border-2 border-[#6c5ce7]/10 flex items-center justify-center text-xl transition-transform active:scale-90">🧭</button>
                              </div>
                           </div>
                        </div>

                        {/* Verification Block - Phase 2 */}
                        <div className={`absolute w-full px-6 flex flex-col gap-4 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${navPhase === 'verify' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-20 pointer-events-none'}`} style={{ top: '32%' }}>
                           <div className="bg-white/95 backdrop-blur-md rounded-[32px] p-8 shadow-2xl border border-gray-100 w-full max-w-sm animate-fluent-slide-up">
                              <h2 className="text-2xl text-[#6c5ce7] font-black uppercase tracking-wider mb-2 leading-tight" style={{ fontFamily: 'Barlow Semi Condensed' }}>{(loc?.heading && loc.heading.trim() !== '') ? renderText(loc.heading) : 'LAATSTE CHECK'}</h2>
                              <p className="text-gray-600 font-medium text-[15px] leading-relaxed mb-6" style={{ fontFamily: 'Inter' }}>{(loc?.body && loc.body.trim() !== '') ? renderText(loc.body) : 'Je bent op de juiste plek. Voer hieronder de code of het antwoord in om door naar de volgende fase te gaan.'}</p>
                              <div className="relative group">
                                 <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && checkAnswer()} placeholder="Antwoord..." className={`w-full h-16 bg-gray-50 border-4 ${alertState === 'wrong' ? 'border-[#d63031] text-[#d63031] animate-shake' : 'border-[#6c5ce7]/20 text-gray-900 focus:border-[#6c5ce7] focus:bg-white'} rounded-2xl text-center text-2xl font-black uppercase tracking-widest outline-none transition-all shadow-inner`} style={{ fontFamily: 'monospace' }} />
                                 <div className="absolute -bottom-1 left-0 right-0 h-1 bg-[#6c5ce7]/10 rounded-full scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
                              </div>
                           </div>
                        </div>

                        {/* Footer Action Button */}
                        <div className="absolute bottom-10 w-full px-6 max-w-sm flex flex-col items-center gap-2">
                           <button onClick={(e) => { e.stopPropagation(); if (navPhase === 'maps') setNavPhase('verify'); else checkAnswer(); }} className={`w-full h-10 rounded-[24px] border-4 text-[18px] tracking-[0.2em] shadow-[0_20px_40px_rgba(108,92,231,0.3)] active:scale-95 transition-all duration-1000 flex items-center justify-center gap-4 ${navPhase === 'maps' ? 'bg-gradient-to-b from-[#004e92] to-[#000428] border-white text-white animate-pulse-slow' : 'bg-[#6c5ce7] border-white text-white'}`} style={{ fontFamily: 'Barlow Semi Condensed', fontWeight: 300 }}>
                              {navPhase === 'maps' ? "Ik ben er" : "CONTROLEER"}
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
                  {step === 'puzzle' && (
                    <div className="space-y-4 w-full animate-in fade-in duration-1000">
                      <h2 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 400 }}>{renderText(currentPageData?.kop)}</h2>
                      <p className="text-lg font-light text-gray-800 leading-normal" style={{ fontWeight: 300 }}>{renderText(currentPageData?.bodyTxt)}</p>
                    </div>
                  )}
                </div>

                {(alertState === 'correct' || alertState === 'hint' || alertState === 'wrong') && (
                  <div className="absolute left-0 right-0 top-[65%] -translate-y-1/2 z-[100] h-[26%] flex items-center justify-center pointer-events-none">
                    <div className="w-[calc(100%-40px)] mx-auto h-full pointer-events-auto animate-fluent-slide-up">
                      {alertState === 'wrong' && (
                         <div className="bg-[#D62828] text-white p-8 rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center justify-center">
                            <p className="text-xl font-black mb-4">Helaas...</p>
                            <button onClick={() => setAlertState('none')} className="w-14 h-14 bg-[#003566] text-white rounded-full border-4 border-white shadow-xl active:scale-95 flex items-center justify-center">OK</button>
                         </div>
                      )}
                      {(alertState === 'correct' || alertState === 'hint') && (
                        <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 p-8 rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center justify-center">
                           <p className="text-[#003566] text-center font-bold px-2">{alertState === 'correct' ? "Geweldig gedaan!" : `Hint: ${currentHintText}`}</p>
                           <button onClick={alertState === 'correct' ? proceedNext : () => setAlertState('none')} className="w-14 h-14 mt-4 bg-[#003566] text-white rounded-full border-4 border-white shadow-xl active:scale-95 flex items-center justify-center">OK</button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="h-[20%] relative flex flex-col items-center justify-center w-full gap-4 overflow-visible">
                  {step === 'intro' && (
                    <button onClick={handleStart} className={`w-[100px] h-[100px] bg-[#D62828] text-white rounded-full border-4 border-white text-xl font-medium shadow-2xl active:scale-95 transition-all transform ${isStarting ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} duration-700`}>START</button>
                  )}
                  {step === 'puzzle' && (
                    <div className="w-full px-6 space-y-3">
                      <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} placeholder="Wat denken jullie?" className="w-full h-10 rounded-full border-2 border-gray-200 text-center text-sm shadow-sm bg-white/95 transition-all outline-none" />
                      <button onClick={handleCheck} className="w-full h-10 bg-[#D62828] text-white rounded-full text-sm font-bold shadow-lg active:scale-95">Check</button>
                    </div>
                  )}
                </div>

                <div className="h-[20%] flex items-center justify-center w-full relative">
                  {step === 'puzzle' && (
                    <div className="w-[80px] h-[80px] relative">
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <circle className="stroke-gray-300 fill-none stroke-[12px] opacity-40" cx="50" cy="50" r="38" />
                        <circle className="fill-none stroke-[#D62828] stroke-[15px] transition-all duration-500 ease-linear" cx="50" cy="50" r="38" transform="rotate(-90 50 50)" style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }} />
                      </svg>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
