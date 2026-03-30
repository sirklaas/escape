'use client';

import { useEffect, useState, useCallback, use, useRef } from 'react';
import { fetchEscapeData, type EscapeData, type GameVariant, type EscapePage, type EscapeLocation } from '@/lib/pb';
import { Loader2 } from 'lucide-react';

// ── Constants from Legacy Code ───────────────────────────────────────────────
const GAME_SETTINGS = {
  hintButtonAppearTime: 120, // in seconds
  timerIncrementInterval: 5, // in seconds
  incorrectGuessPenalty: 25, // in seconds
  challengeDuration: 600,    // 10 minutes (600s)
  sounds: {
    ping: 'https://www.crazy.local/button/sounds/Chime2.wav',
    buzz: 'https://www.crazy.local/button/sounds/Expired.wav', 
    doorbell: 'https://www.crazy.local/fun/sounds/doorbell.wav' 
  }
};

const HINT_COSTS = [100, 200, 300, 400];

export default function PlayerPage({ params }: { params: Promise<{ locationSlug: string }> }) {
  const { locationSlug } = use(params);

  // ── State ──────────────────────────────────────────────────────────────────
  const [data, setData] = useState<EscapeData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [variant, setVariant] = useState<GameVariant>('city');
  const [step, setStep] = useState<'intro' | 'puzzle1' | 'puzzle2' | 'finished'>('intro');
  const [timer, setTimer] = useState(0);
  const [challengeTimer, setChallengeTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showHintButton, setShowHintButton] = useState(false);
  const [answer, setAnswer] = useState('');
  
  // UI States
  const [alertState, setAlertState] = useState<'none' | 'wrong' | 'correct' | 'hint' | 'timeup'>('none');
  const [currentHintText, setCurrentHintText] = useState('');

  const [teamName, setTeamName] = useState('Unknown Team');
  const [isScoreSaved, setIsScoreSaved] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const storedTeam = localStorage.getItem('escaperoomTeamName');
      if (storedTeam) setTeamName(storedTeam);

      const pbData = await fetchEscapeData();
      if (pbData) {
        setData(pbData);
        setVariant(pbData.activeVariant || 'city');
      }
    } catch (err) {
      console.error('Failed to load game data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Game Logic ─────────────────────────────────────────────────────────────
  const locationIndex = [
    'blokker', 'boek', 'electro', 'lijst', 'kerk', 'brug', 'count', 'gall', 'drog'
  ].indexOf(locationSlug.toLowerCase());

  const locNumber = locationIndex + 1;
  const challengeNumber = locNumber; 
  const vData = data?.[variant];
  const loc = vData?.locations.find(l => l.locationNumber === locNumber);
  const p1 = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === 1);
  const p2 = vData?.pages.find(p => p.locationNumber === locNumber && p.pageNumber === 2);

  const currentPageData = step === 'puzzle1' ? p1 : p2;

  const saveScoreToPB = async (seconds: number) => {
    console.log(`Saving score for ${teamName}: ${seconds}s (Challenge ${challengeNumber})`);
  };

  const playSound = (type: keyof typeof GAME_SETTINGS.sounds) => {
    console.log(`[Sound] Playing ${type}`);
  };

  // Timer Tick
  useEffect(() => {
    if (step === 'puzzle1' || step === 'puzzle2') {
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
  }, [step]);

  // Handle Challenge Expiry
  useEffect(() => {
    if (challengeTimer >= GAME_SETTINGS.challengeDuration) {
      if (timerRef.current) clearInterval(timerRef.current);
      setAlertState('timeup');
      playSound('doorbell');
    }
  }, [challengeTimer]);

  const handleStart = () => {
    setStep('puzzle1');
    setChallengeTimer(0);
    setTimer(0);
    setAttempts(0);
    setHintsRevealed(0);
    setShowHintButton(false);
    setIsScoreSaved(false);
  };

  const handleCheck = async () => {
    if (!currentPageData) return;
    if (answer.toLowerCase().trim() === currentPageData.correctAnswer.toLowerCase().trim()) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (!isScoreSaved) {
        setIsScoreSaved(true);
        await saveScoreToPB(timer);
      }
      setAlertState('correct');
    } else {
      playSound('buzz');
      setAttempts(prev => prev + 1);
      setTimer(prev => prev + GAME_SETTINGS.incorrectGuessPenalty);
      setAlertState('wrong');
      setTimeout(() => setAlertState('none'), 3000);
    }
    setAnswer('');
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
    if (step === 'puzzle1') {
      setStep('puzzle2');
      setHintsRevealed(0);
      setShowHintButton(false);
    } else {
      setStep('finished');
    }
  };

  // ── Render Helpers ─────────────────────────────────────────────────────────
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-gray-500 w-8 h-8" /></div>;
  if (locationIndex === -1 || !data || !loc) return <div className="min-h-screen flex items-center justify-center text-gray-900 bg-white">Location Not Found</div>;

  const dashArray = 2 * Math.PI * 45;
  const progress = challengeTimer / GAME_SETTINGS.challengeDuration;
  const dashOffset = dashArray * (1 - progress);

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@400;600;800&display=swap');
        body { font-family: 'Barlow Semi Condensed', sans-serif; margin: 0; padding: 0; background: white; overflow: hidden; }
      `}</style>
      
      {/* Responsive Wrapper: Full screen on mobile, Phone Mockup on Desktop */}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-10 overflow-auto">
        
        {/* Fake Phone Frame Mockup - Desktop only */}
        <div className="w-full h-[100dvh] md:w-[380px] md:h-[800px] bg-black md:rounded-[60px] md:border-[8px] md:border-zinc-900 md:shadow-[0_0_0_2px_#222,0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
          
          {/* Phone Notch / Dynamic Island */}
          <div className="hidden md:flex absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-[100] items-center justify-end px-3">
             <div className="w-2 h-2 bg-zinc-800 rounded-full" />
          </div>
          
          {/* Internal Screen Area - 20px white margin all sides */}
          <div className="relative flex-1 overflow-hidden flex flex-col" style={{ background: 'white', padding: '20px' }}>
            
            {/* The Inset Content Area - backdrop fills this entirely */}
            <div 
              className="relative flex-1 rounded-[20px] overflow-hidden flex flex-col items-center"
              style={{ 
                backgroundImage: 'url("/Escapebackdrop.jpg")', 
                backgroundSize: 'cover', 
                backgroundPosition: 'top center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* ── TIMER PILL — 20px from top, centered ── */}
              {(step === 'puzzle1' || step === 'puzzle2') && (
                <div style={{ position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, whiteSpace: 'nowrap' }}>
                  <div className="bg-white/95 backdrop-blur-md text-stone-900 px-6 py-1.5 rounded-full font-extrabold text-sm shadow-md border border-white/50">
                    Timer: {timer}s
                  </div>
                </div>
              )}

              {/* ── RED TIMER CIRCLE — 40px from bottom, centered ── */}
              {(step === 'puzzle1' || step === 'puzzle2' || step === 'finished') && (
                <div style={{ position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)', zIndex: 20, width: 64, height: 64, pointerEvents: 'none' }}>
                  <svg width="64" height="64" viewBox="0 0 100 100">
                    <circle className="stroke-gray-300 fill-none stroke-[8px] opacity-40" cx="50" cy="50" r="45" />
                    <circle
                      className="fill-none stroke-[#D62828] stroke-[10px] transition-all duration-500 ease-linear"
                      cx="50" cy="50" r="45"
                      transform="rotate(-90 50 50)"
                      style={{ strokeDasharray: dashArray, strokeDashoffset: dashOffset, strokeLinecap: 'round' }}
                    />
                  </svg>
                </div>
              )}

              {/* ── MAIN CONTENT CONTAINER — middle 50% of height (top 25% → bottom 25%) ── */}
              <div style={{ position: 'absolute', top: '25%', bottom: '25%', left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', gap: '16px' }}>

                {/* INTRO */}
                {step === 'intro' && (
                  <div className="w-full space-y-4 text-center animate-in fade-in zoom-in-95 duration-700">
                    <h1 className="text-3xl font-black text-gray-900 uppercase tracking-tight leading-none drop-shadow-sm">
                      {loc.name}
                    </h1>
                    <div className="space-y-1 p-3 bg-white/50 backdrop-blur-[2px] rounded-2xl">
                      <h3 className="text-xl font-bold text-gray-800">{loc.heading}</h3>
                      <p className="text-xs italic text-gray-600">&ldquo;{loc.subheading}&rdquo;</p>
                      <p className="text-gray-900 text-sm leading-snug font-medium pt-1 line-clamp-4">{loc.body}</p>
                    </div>
                    <button
                      onClick={handleStart}
                      className="w-full py-4 bg-[#D62828] hover:bg-[#b52222] text-white rounded-full font-black text-xl uppercase tracking-tight shadow-[0_8px_16px_rgba(214,40,40,0.3)] transition-all active:scale-95"
                    >
                      Start
                    </button>
                  </div>
                )}

                {/* PUZZLE */}
                {(step === 'puzzle1' || step === 'puzzle2') && (
                  <div className="w-full flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-500">

                    {/* Heading + Body */}
                    <div className="w-full text-center bg-white/40 backdrop-blur-[2px] rounded-2xl p-3">
                      <h2 className="text-xl font-black uppercase text-gray-900 leading-tight mb-1">
                        {currentPageData?.kop}
                      </h2>
                      <p className="text-sm font-semibold text-gray-800 leading-normal italic">
                        {currentPageData?.bodyTxt}
                      </p>
                    </div>

                    {/* Answer input */}
                    <input
                      type="text"
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                      placeholder="Antwoord..."
                      className="w-full h-12 rounded-full border-2 border-gray-300 text-center text-lg font-bold text-gray-900 focus:border-[#D62828] outline-none shadow-xl bg-white/95 transition-all"
                    />

                    {/* Poging counter | Check button */}
                    <div className="flex items-center justify-between w-full">
                      <div className="text-gray-900 font-extrabold text-[11px] bg-white/70 px-3 py-1 rounded-full border border-gray-200">
                        Poging: {attempts}
                      </div>
                      <button
                        onClick={handleCheck}
                        className="px-8 py-2 bg-[#D62828] text-white rounded-2xl font-black text-base uppercase shadow-lg active:scale-95 transition-all"
                      >
                        Check
                      </button>
                    </div>

                    {/* Hint button */}
                    <button
                      onClick={handleRevealHint}
                      className={`px-5 py-2.5 bg-white/90 border border-gray-200 text-gray-800 rounded-2xl font-black uppercase text-[10px] tracking-tight transition-all duration-1000 shadow-sm ${showHintButton ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                      💡 Hint kopen {hintsRevealed < 4 ? `(-${HINT_COSTS[hintsRevealed]}s)` : ''}
                    </button>
                  </div>
                )}

                {/* FINISHED */}
                {step === 'finished' && (
                  <div className="text-center space-y-6 animate-in zoom-in-95 duration-1000 w-full">
                    <h1 className="text-4xl font-black text-gray-900 uppercase italic leading-none">Victory!</h1>
                    <div className="bg-white/60 backdrop-blur-md p-6 rounded-3xl border border-white text-gray-900 shadow-xl">
                      <p className="text-xs font-black uppercase opacity-60 mb-2 tracking-widest">Coördinaten</p>
                      <div className="text-2xl font-black text-[#D62828] break-all leading-tight">
                        {p2?.nextPage || 'DONE!'}
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>

            {/* Mockup Details (Desktop only) */}
            <div className="hidden md:block absolute bottom-3 left-1/2 -translate-x-1/2 w-32 h-1.5 bg-zinc-800 rounded-full opacity-60" />
          </div>
        </div>

        {/* ── ALERTS (Fixed position relative to viewport) ───────────────────── */}
        <div className={`fixed inset-x-0 bottom-20 p-6 transition-all duration-500 z-[2000] flex justify-center pointer-events-none ${alertState === 'wrong' ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
          <div className="bg-[#D62828] text-white p-5 rounded-2xl w-full max-w-[280px] shadow-2xl flex items-center gap-3 border-2 border-white/30 italic font-bold">
            <div className="text-2xl">!</div>
            <p>Onjuist!</p>
          </div>
        </div>

        {alertState === 'correct' && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md" />
            <div className="relative bg-gradient-to-b from-amber-400 to-amber-100 p-8 rounded-[40px] border-4 border-white shadow-2xl w-full max-w-[280px] text-center space-y-6">
              <h1 className="text-[#003566] text-3xl font-black uppercase leading-none italic">Geweldig</h1>
              <p className="text-[#003566] text-lg font-bold">Tijd: {timer} s</p>
              <button onClick={proceedNext} className="w-16 h-16 rounded-full bg-[#003566] text-white border-4 border-white font-black text-2xl flex items-center justify-center mx-auto shadow-xl active:scale-95 transition-all">OK</button>
            </div>
          </div>
        )}

        {alertState === 'hint' && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="absolute inset-0 bg-black/40" onClick={() => setAlertState('none')} />
            <div className="relative bg-white p-10 rounded-[40px] border-4 border-amber-400 shadow-2xl w-full max-w-[280px] text-center">
              <button onClick={() => setAlertState('none')} className="absolute top-2 right-5 text-gray-400 text-4xl font-bold">&times;</button>
              <div className="text-amber-500 font-bold uppercase text-xs mb-3">Hint</div>
              <p className="text-gray-800 text-lg font-bold italic">{currentHintText}</p>
            </div>
          </div>
        )}

        {alertState === 'timeup' && (
           <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-[#D62828]/95 animate-in fade-in duration-500">
             <div className="text-center p-10 space-y-8 animate-out slide-out-to-top-[100%] fill-mode-forwards duration-[4500ms]">
                <h1 className="text-6xl font-black text-white uppercase italic leading-none">Tijd Op!</h1>
                <button onClick={() => window.location.href = '/'} className="bg-white text-[#D62828] px-8 py-3 rounded-full font-black uppercase text-lg shadow-2xl">Volgende</button>
             </div>
          </div>
        )}

      </div>
    </>
  );
}
