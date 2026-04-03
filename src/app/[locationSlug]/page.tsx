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
      
      // Shuffle array for initial fallback vertical positions, simulating the legacy logic
      let pos = [...Array(data.length).keys()];
      for (let i = pos.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pos[i], pos[j]] = [pos[j], pos[i]];
      }
      setPositions(pos);

      // Force standard delay, then trigger CSS glide sort
      setTimeout(() => setAnimating(true), 1000);
    }
    load();
  }, []);

  if (teams.length === 0) return <div className="text-gray-400 font-light mt-8 animate-pulse">Computing Ranks...</div>;

  return (
    <div className="relative w-[calc(100%-10px)] max-w-sm mt-6 mb-2">
      {teams.map((team, index) => {
        // Position defaults to random array ID, then glides to its final rank ID
        const transformY = animating ? (index * 45) : ((positions[index] || 0) * 45);
        
        return (
          <div 
            key={team.teamName} 
            className={`absolute top-0 left-0 w-full h-[40px] flex items-center transition-transform ${animating ? 'duration-[2000ms] ease-in-out' : 'duration-0'}`}
            style={{ transform: `translateY(${transformY}px)` }}
          >
            {/* Rank Circle */}
            <span className="w-8 h-8 shrink-0 bg-[#D62828] border-2 border-white rounded-full text-white flex justify-center items-center font-bold text-sm shadow-[0_0_0_1px_#D62828] mr-3">
              {index + 1}
            </span>
            {/* Legacy Style Pill */}
            <div className="flex-grow bg-white border-2 border-gray-300 rounded-full flex justify-between items-center px-4 h-[35px] shadow-sm">
               <span className="font-medium text-gray-800 text-sm truncate max-w-[120px]" style={{ fontWeight: 400 }}>{team.teamName}</span>
               <span className="text-gray-500 font-medium text-xs" style={{ fontWeight: 500 }}>
                 {team.totalTime.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")} sec
               </span>
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
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
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

  useEffect(() => {
    async function loadData() {
      const gData = await fetchEscapeData();
      if (gData) {
        setData(gData);
        
        // Resolve exactly which Dashboard array object matches this URL slug integer
        const locIndex = ['blokker', 'boek', 'electro', 'lijst', 'kerk', 'brug', 'count', 'gall', 'drog'].indexOf(locationSlug.toLowerCase());
        const locNum = locIndex + 1;
        
        // Determine starting step dynamically based on the specific location's skip setting
        const activeLoc = gData[variant]?.locations.find(l => l.locationNumber === locNum);
        
        // If skip is mathematically false (or completely missing/unchecked in DB), force Directional page
        if (activeLoc && activeLoc.skip !== true) {
           setStep('direction');
        } else {
           setStep('intro');
        }
      }
      setLoading(false);
    }
    loadData();
  }, [locationSlug, variant]);

  const [timer, setTimer] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showHintButton, setShowHintButton] = useState(false);
  const [answer, setAnswer] = useState('');
  const [navPhase, setNavPhase] = useState<'maps' | 'verify'>('maps');
  const [alertState, setAlertState] = useState<'none' | 'correct' | 'wrong' | 'timeup' | 'hint'>('none');
  const [currentHintText, setCurrentHintText] = useState('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pbData = await fetchEscapeData();
      if (pbData) {
        setData(pbData);
        const activeV = pbData.activeVariant || 'city';
        setVariant(activeV);
        if (activeV === 'rat' || activeV === 'diner') setStep('puzzle');
      }
    } catch (err) {
      console.error('Failed to load game data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const locationIndex = ['blokker', 'boek', 'electro', 'lijst', 'kerk', 'brug', 'count', 'gall', 'drog'].indexOf(locationSlug.toLowerCase());
  const locNumber = locationIndex + 1;
  const vData = data?.[variant];
  const loc = vData?.locations.find(l => l.locationNumber === locNumber);
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
    // Normalized comparison for case-insensitivity and whitespace
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
    // If it's just a Plus Code like "5F9Q+M5, Leiden", turn it into a query
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(baseUrl)}`;
    }

    const walkUrl = baseUrl.includes('?') 
      ? `${baseUrl}&travelmode=walking&dir_action=navigate` 
      : `${baseUrl}?travelmode=walking&dir_action=navigate`;
    
    setNavPhase('verify');
    window.open(walkUrl, '_blank');
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
    // TODO: Save the accumulated seconds (timer) to PocketBase!
    // This needs to be assigned to the active Game and Team session later.
    setAlertState('none');
    const nextP = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === currentPageNumber + 1);
    if (nextP) {
      setCurrentPageNumber(prev => prev + 1);
      setTimer(0);
      setChallengeTimer(0);
      setAttempts(0);
      setHintsRevealed(0);
      setShowHintButton(false);
    } else {
      setStep('video');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-500 w-8 h-8" /></div>;
  if (locationIndex === -1 || !data || !loc) return <div className="min-h-screen flex items-center justify-center text-gray-900 bg-white">Location Not Found</div>;

  const dashArray = 2 * Math.PI * 38;
  const currentLimit = currentPageData?.timerLimit ?? GAME_SETTINGS.challengeDuration;
  const progress = challengeTimer / currentLimit;
  const dashOffset = dashArray * (1 - progress);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300;400;500;600;800&display=swap');
        body { font-family: 'Barlow Semi Condensed', sans-serif; margin: 0; padding: 0; background: white; overflow: hidden; }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-10 overflow-auto">
        {/* Fake Phone Frame */}
        <div className="w-full h-[100dvh] md:w-[380px] md:h-[800px] bg-black md:rounded-[60px] md:border-[8px] md:border-zinc-900 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
          <div className="relative flex-1 overflow-hidden flex flex-col h-full" style={{ background: 'white', padding: '20px' }}>
            
            {/* 10-Part Grid Container Background */}
            <div 
              className="relative flex-1 rounded-[20px] overflow-hidden flex flex-col h-full bg-[#f8f8f8]" 
              onClick={() => {
                 if (step === 'direction') {
                    handleOpenMaps();
                 }
              }}
              style={{ 
                backgroundImage: step === 'video' ? 'none' : ( (step === 'direction' || step === 'verify') ? 'url("/Loc.jpg")' : 'url("/Escapebackdrop.jpg")'), 
                backgroundSize: 'cover', 
                backgroundPosition: 'top center', 
                backgroundRepeat: 'no-repeat',
                cursor: step === 'direction' ? 'pointer' : 'default'
              }}
            >
              
              {/* Full-Screen Video Step Overlay */}
              {step === 'video' && (
                <div className="absolute inset-0 z-[200] bg-black flex flex-col items-center justify-center">
                  <video 
                    ref={videoRef} 
                    src="/videos/tokenA.mp4" 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover" 
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                  />
                  
                  {/* Play Button Overlay */}
                  {!isPlaying && (
                    <button onClick={togglePlay} className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 w-full h-full outline-none">
                      <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-4 border-white/50 pl-3 shadow-2xl transition-transform active:scale-90">
                         <svg fill="white" viewBox="0 0 24 24" className="w-12 h-12"><path d="M8 5v14l11-7z" /></svg>
                      </div>
                    </button>
                  )}

                  {/* Yes Button (Fixed at Bottom) */}
                  <div className="absolute bottom-8 z-20 w-[calc(100%-40px)] left-1/2 -translate-x-1/2">
                    <button onClick={() => setStep('finished')} className="w-full h-16 bg-gradient-to-tr from-amber-400 to-yellow-200 text-[#003566] rounded-full border-4 border-white text-xl font-normal shadow-2xl active:scale-95 transition-all outline-none" style={{ fontWeight: 400 }}>
                      Yes die hebben we
                    </button>
                  </div>
                </div>
              )}

              {/* Vertical Grid Segments */}
              <div className="flex-1 flex flex-col h-full w-full relative z-10 overflow-visible" style={{ opacity: step === 'video' ? 0 : 1, pointerEvents: step === 'video' ? 'none' : 'auto' }}>
                
                {/* 1. Timer Zone (0 - 10%) */}
                <div className="h-[10%] flex items-center justify-center px-4 w-full">
                  {step === 'puzzle' && (
                    <div className="bg-stone-200/80 backdrop-blur-md text-stone-600 px-6 py-2 rounded-full font-light text-xl shadow-md border border-white/30 text-center tracking-wide w-full max-w-[280px]" style={{ fontWeight: 300 }}>
                      Tijd: {timer} s
                    </div>
                  )}
                </div>

                {/* 2-3. Logo Zone (10 - 30%) - Whitespace for badge */}
                <div className="h-[20%] w-full" />

                {/* 4-6. Message Zone (30 - 60%) - Top-Aligned under Logo */}
                <div className="h-[30%] flex flex-col items-center justify-start pt-2 text-center px-5 w-full">
                  
                  {/* PHASE A: MAP NAVIGATION (Absolute Positioning for Precision) */}
                  {step === 'direction' && (
                    <div className="absolute inset-0 z-50 flex flex-col items-center">
                       
                       {/* 70% Anchor: Location Code */}
                       <div 
                          className="absolute w-full flex flex-col items-center transition-all duration-1000 ease-in-out"
                          style={{ top: '70%', transform: 'translateY(-50%)' }}
                       >
                          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-2xl border-2 border-white/50 w-[calc(100%-60px)] max-w-sm animate-in fade-in zoom-in duration-700">
                             <p className="text-[9px] text-gray-400 uppercase font-black tracking-[0.3em] mb-1 text-center">Lokatie Code</p>
                             <p className="text-[#003566] text-xl font-black tracking-tight text-center" style={{ fontFamily: 'monospace' }}>
                                { (loc?.mapUrl && loc.mapUrl.includes('/') ? loc.mapUrl.split('/').pop()?.split('?')[0]?.replace(/%20/g, ' ') : '5F9Q+M5 Leiden') }
                             </p>
                          </div>
                       </div>

                       {/* Fase 2 Content: Appears in the space between 70% and Bottom Button */}
                       <div 
                          className={`absolute w-[calc(100%-60px)] max-w-sm flex flex-col gap-3 transition-all duration-700 ease-out z-30 ${navPhase === 'verify' ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-95 pointer-events-none'}`}
                          style={{ top: '74%' }}
                       >
                          <div className="bg-white/90 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-white/40 animate-in slide-in-from-bottom-5 duration-700">
                             <h2 className="text-lg text-[#D62828] font-black uppercase tracking-wider mb-1 leading-tight">{renderText(loc?.heading) || 'Phase 2'}</h2>
                             <p className="text-gray-700 font-medium text-[13px] leading-tight line-clamp-2">{renderText(loc?.body)}</p>
                          </div>
                          
                          <div className="relative group">
                            <input 
                               type="text"
                               value={answer}
                               onChange={(e) => setAnswer(e.target.value)}
                               onKeyDown={(e) => e.key === 'Enter' && checkAnswer()}
                               placeholder="Typ je antwoord..."
                               className={`w-full h-12 bg-white/95 border-2 ${alertState === 'wrong' ? 'border-red-500 text-red-600 animate-shake' : 'border-[#003566]/10 text-gray-900 focus:border-[#003566]'} rounded-xl text-center text-[17px] font-bold uppercase tracking-widest outline-none transition-all shadow-inner`}
                               style={{ fontFamily: 'monospace' }}
                            />
                            {alertState === 'wrong' && <p className="absolute -bottom-5 left-0 right-0 text-[10px] text-red-500 font-bold text-center uppercase">Onjuist antwoord</p>}
                          </div>
                       </div>

                       {/* Persistent Bottom Button */}
                       <div className="absolute bottom-10 w-[calc(100%-60px)] max-w-sm">
                          <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               if (navPhase === 'maps') {
                                 handleOpenMaps();
                               } else {
                                 checkAnswer();
                               }
                             }}
                             className={`w-full h-16 rounded-2xl border-4 text-[16px] font-black uppercase tracking-[0.2em] shadow-[0_10px_25px_rgba(0,0,0,0.2)] active:scale-95 transition-all duration-500 flex items-center justify-center gap-3 ${navPhase === 'maps' ? 'bg-white border-[#003566] text-[#003566]' : 'bg-[#003566] border-white text-white rotate-0'}`}
                          >
                             {navPhase === 'maps' ? (
                               <>📍 OPEN MAPS</>
                             ) : (
                               "WE ZIJN ER"
                             )}
                          </button>
                       </div>
                    </div>
                  )}

                  {/* Redundant verify step removed, logic moved inside direction for smooth transitions */}
                  {step === 'verify' && null}

                  {step === 'intro' && (
                    <div className={`space-y-4 w-full transition-all duration-700 ${isStarting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      <h3 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 400 }}>{renderText(data?.[variant]?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === 1)?.kop)}</h3>
                      <p className="text-gray-900 text-lg font-light leading-snug" style={{ fontWeight: 300 }}>{renderText(data?.[variant]?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === 1)?.bodyTxt)}</p>
                    </div>
                  )}
                  {step === 'puzzle' && (
                    <div className="space-y-4 w-full animate-in fade-in duration-1000">
                      <h2 className="text-2xl text-gray-900 leading-tight" style={{ fontWeight: 400 }}>{renderText(currentPageData?.kop)}</h2>
                      <p className="text-lg font-light text-gray-800 leading-normal" style={{ fontWeight: 300 }}>{renderText(currentPageData?.bodyTxt)}</p>
                    </div>
                  )}
                  {step === 'finished' && (
                    <div className="w-full h-full flex flex-col items-center justify-start animate-in fade-in duration-1000 pt-2">
                      <h2 className="text-4xl text-[#003566] font-black uppercase tracking-widest leading-tight drop-shadow-sm z-10">Leaderboard</h2>
                      <LeaderboardList />
                    </div>
                  )}
                </div>

                {/* Main Popup Overlay (26% Height, centered over 6, 7, 8 segments) */}
                {(alertState === 'correct' || alertState === 'hint' || alertState === 'wrong') && (
                  <div className="absolute left-0 right-0 top-[65%] -translate-y-1/2 z-[100] h-[26%] flex items-center justify-center pointer-events-none">
                    <style>{`
                      @keyframes precisionSlideUp {
                        0% { transform: translateY(100%); opacity: 0; }
                        100% { transform: translateY(0); opacity: 1; }
                      }
                    `}</style>
                    <div 
                      key={alertState}
                      className="w-[calc(100%-40px)] mx-auto h-full pointer-events-auto"
                      style={{ 
                        animation: 'precisionSlideUp 3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                      }}
                    >
                      {alertState === 'wrong' && (
                         <div className="bg-[#D62828] text-white p-8 rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center">
                            <div className="flex-1" />
                            <div className="text-center space-y-1">
                               <p className="text-xl font-black leading-tight">Helaas...</p>
                               <p className="text-[11px] font-normal" style={{ fontWeight: 400 }}>Dat is niet goed</p>
                            </div>
                            <div className="flex-1" />
                            <button onClick={() => setAlertState('none')} className="w-14 h-14 mb-2 bg-[#003566] text-white rounded-full border-4 border-white text-base font-medium shadow-xl active:scale-95 transition-all flex items-center justify-center shrink-0">OK</button>
                            <div className="flex-1" />
                         </div>
                      )}
                      {(alertState === 'correct' || alertState === 'hint') && (
                        <div className="bg-gradient-to-tr from-amber-400 to-yellow-200 p-8 rounded-[40px] border-4 border-white shadow-2xl w-full h-full flex flex-col items-center">
                          <div className="flex-1" />
                          {alertState === 'correct' ? (
                            <div className="text-[#003566] text-center space-y-2">
                               <p className="text-xl font-black leading-tight">Geweldig gedaan !</p>
                               <p className="text-[12px] font-normal leading-relaxed" style={{ fontWeight: 400 }}>
                                  Jullie hadden {challengeTimer} seconden nodig voor deze opdracht.<br/>
                                  Gauw naar de volgende
                               </p>
                            </div>
                          ) : (
                            <div className="text-gray-800 text-center space-y-1">
                               <p className="text-[12px] font-medium leading-tight px-4">Hint: {currentHintText}</p>
                            </div>
                          )}
                          <div className="flex-1" />
                          <button onClick={alertState === 'correct' ? proceedNext : () => setAlertState('none')} className="w-14 h-14 mb-2 bg-[#003566] text-white rounded-full border-4 border-white text-base font-medium shadow-xl active:scale-95 transition-all flex items-center justify-center shrink-0">OK</button>
                          <div className="flex-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 7-8. Interactive Zone (60 - 80%) */}
                <div className="h-[20%] relative flex flex-col items-center justify-center w-full gap-4 overflow-visible">
                  {step === 'intro' && (
                    <button onClick={handleStart} className={`w-[100px] h-[100px] bg-[#D62828] text-white rounded-full border-4 border-white text-xl font-medium shadow-2xl active:scale-95 transition-all flex items-center justify-center transform ${isStarting ? 'opacity-0 scale-90' : 'opacity-100 scale-100'} duration-700`}>START</button>
                  )}
                  {step === 'puzzle' && (
                    <>
                      <div className="w-[calc(100%-40px)] mx-auto">
                        <input type="text" value={answer} onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCheck()} placeholder="Wat denken jullie?" className="w-full h-7 rounded-full border-2 border-gray-200 text-center text-sm font-light focus:border-[#D62828] outline-none shadow-sm bg-white/95 transition-all px-8 placeholder:text-gray-300" style={{ fontWeight: 300 }} />
                      </div>
                      <div className="flex items-center justify-between w-[calc(100%-40px)] gap-4 mx-auto">
                        <div className="w-1/3 h-7 flex items-center justify-center text-gray-900 font-light text-xs bg-white/90 rounded-full border border-gray-100 shadow-sm" style={{ fontWeight: 300 }}>Poging: {attempts}</div>
                        <button onClick={handleCheck} className="w-1/3 h-7 bg-[#D62828] text-white rounded-full font-light text-sm shadow-lg active:scale-95 transition-all" style={{ fontWeight: 300 }}>Check</button>
                      </div>
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                        <button onClick={handleRevealHint} className={`px-5 py-2 bg-white/90 border border-gray-200 text-gray-800 rounded-full font-black text-[10px] transition-all duration-1000 shadow-sm whitespace-nowrap ${showHintButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>💡 Hint kopen {hintsRevealed < 4 ? `(-${HINT_COSTS[hintsRevealed]}s)` : ''}</button>
                      </div>
                    </>
                  )}

                </div>


                {/* 9-10. Footer Zone (80 - 100%) - Red Circle Timer & Done Button */}
                <div className="h-[20%] flex items-center justify-center w-full relative">
                  {step === 'puzzle' && (
                    <div className="w-[80px] h-[80px] relative">
                      <svg width="80" height="80" viewBox="0 0 100 100">
                        <circle className="stroke-gray-300 fill-none stroke-[12px] opacity-40" cx="50" cy="50" r="38" />
                        <circle className="fill-none stroke-[#D62828] stroke-[15px] transition-all duration-500 ease-linear" cx="50" cy="50" r="38" transform="rotate(-90 50 50)" style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }} />
                      </svg>
                    </div>
                  )}
                  {step === 'finished' && (
                    <div className="absolute bottom-8 z-20 w-[calc(100%-40px)] left-1/2 -translate-x-1/2">
                      <button 
                        onClick={async () => {
                           // Persist the completed location securely in the PocketBase team session
                           await markLocationCompleted('team_alpha', locationSlug, 0);
                           window.location.href = '/nine';
                        }} 
                        className="w-full h-16 bg-[#003566] text-white rounded-full border-4 border-white text-xl font-normal shadow-2xl active:scale-95 transition-all outline-none" 
                        style={{ fontWeight: 400 }}
                      >
                        Gauw de volgende doen
                      </button>
                    </div>
                  )}
                  {/* Phase A Button */}
                  {step === 'direction' && (
                    <div className="absolute bottom-8 z-20 w-[calc(100%-40px)] left-1/2 -translate-x-1/2">
                      <button onClick={() => {
                          // Crucial Routing Logic: Only force verification question if it's explicitly set in the DB
                          if (loc?.verificationAnswer && loc.verificationAnswer.trim() !== '') {
                             setStep('verify');
                          } else {
                             setStep('intro');
                          }
                      }} className="w-full h-16 bg-[#003566] text-white rounded-full border-4 border-white text-xl font-normal shadow-2xl active:scale-95 transition-all outline-none" style={{ fontWeight: 400 }}>
                        WE ZIJN ER
                      </button>
                    </div>
                  )}

                  {/* Phase B Check Button */}
                  {step === 'verify' && (
                    <div className="absolute bottom-8 z-20 w-[calc(100%-40px)] left-1/2 -translate-x-1/2">
                      <button onClick={() => {
                          if (!loc?.verificationAnswer) return;
                          
                          if (answer.toLowerCase().trim() === loc.verificationAnswer.toLowerCase().trim()) {
                             setAnswer('');
                             setAlertState('none');
                             setStep('intro'); // Correct! Jump to puzzle sequence!
                          } else {
                             setAlertState('wrong');
                             setTimeout(() => setAlertState('none'), 3000);
                          }
                      }} className="w-full h-16 bg-[#D62828] text-white rounded-full border-4 border-white text-[19px] font-normal shadow-[0_0_15px_rgba(214,40,40,0.6)] active:scale-95 transition-all outline-none tracking-wide" style={{ fontWeight: 600 }}>
                        CONTROLEER ANTWOORD
                      </button>
                    </div>
                  )}
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* TIME UP Alert - Still full screen for urgency */}
        {alertState === 'timeup' && (
           <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-[#D62828]/95 animate-in fade-in duration-500 text-center text-white">
             <div className="space-y-8">
                <h1 className="text-6xl font-black italic leading-none">Tijd Op!</h1>
                <button onClick={() => window.location.href = '/'} className="bg-white text-[#D62828] px-8 py-3 rounded-full font-black text-xl shadow-2xl active:scale-95 transition-all">VOLGENDE</button>
             </div>
           </div>
        )}
      </div>
    </>
  );
}
