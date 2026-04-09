'use client';

import { useEffect, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';
import { updatePlayerNamesAction } from '@/app/actions';

type IntroStep = 'START' | 'PLAYERS' | 'UITLEG';

export default function IntroPage() {
  const [step, setStep] = useState<IntroStep>('START');
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'players') {
      setStep('PLAYERS');
      window.history.replaceState({}, '', '/');
    }
    if (params.get('resume') === 'uitleg') {
      setStep('UITLEG');
      window.history.replaceState({}, '', '/');
    }
    if (params.get('resume') === 'puzzle122') {
      window.location.replace('/vulin');
    }
  }, []);

  // Function to move to next step
  const nextStep = () => {
    if (step === 'START') {
      window.location.href = '/robotvid';
      return;
    }
    if (step === 'PLAYERS') setStep('UITLEG');
    else if (step === 'UITLEG') {
      window.location.href = '/122';
      return;
    }
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      setPlayerNames([...playerNames, newPlayerName.trim()]);
      setNewPlayerName('');
    }
  };

  const removePlayer = (idx: number) => {
    setPlayerNames(playerNames.filter((_, i) => i !== idx));
  };

  const handleSavePlayers = async () => {
    if (playerNames.length === 0) {
      alert('Voeg ten minste één speler toe.');
      return;
    }
    setLoading(true);
    // Team id from /team step lives in localStorage
    const storedTeam = localStorage.getItem('escaperoomTeamName');
    if (storedTeam) {
      const success = await updatePlayerNamesAction(storedTeam, playerNames);
      if (success) {
        nextStep();
      } else {
        alert("Fout bij het opslaan van spelersnamen.");
      }
    }
    setLoading(false);
  };

  const renderText = (str: string = '') => {
    return str.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== str.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <PlayerChrome
      backgroundImage={step === 'START' ? '' : '/Escapebackdrop.jpg'}
      wrapWithActionContainer={false}
    >
        {/* §2.4 golden rule: full-bleed fills stay inside .player-view (inner rounded screen), not as PhoneWrapper siblings */}
        {/* Step 1: START — image_container + blue_back + badge (globaldesign §5.4) */}
        {step === 'START' && (
          <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-0">
            <div className="ge-intro-inner flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              <div className="flex h-full min-h-0 flex-1 flex-col pt-[1.35rem] text-center">
                <div className="flex shrink-0 justify-center">
                  <img
                    src="/EscapeLogobadge.png"
                    alt=""
                    width={196}
                    height={189}
                    className="h-[189px] w-[196px] object-contain drop-shadow-md"
                  />
                </div>
                <div className="action_container min-h-0 flex-1 overflow-hidden pt-4">
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
                    <h1 className="ge-h1">
                      {renderText('Ontcijfer de code\nen stop Bad Elon')}
                    </h1>
                    <p className="ge-body text-pretty">
                      {renderText(
                        `Want hij heeft een plan: robots aan de\u00A0macht, mensen op de bank en hijzelf op de\u00A0twittertroon.

Zijn zwakte? Hij verstopt altijd een geheime code ergens.
Gelukkig zijn jullie hier. Met jullie brainpower en een beetje teamwork gaan jullie deze megalomane miljardair een lesje leren.

De wereld rekent op jullie.`,
                      )}
                      <br />
                      <span className="font-normal">Geen druk. Echt niet. 😅</span>
                    </p>
                  </div>
                  <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                    <button type="button" onClick={nextStep} className="ge-btn-yellow ge-btn-yellow--foot">
                      OK Let&apos;s do this!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: PLAYERS */}
        {step === 'PLAYERS' && (
          <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-1000">
            <div className="action_container min-h-0 flex-1">
              <div className="mt-2 text-[var(--ge-navy)]">
                <h2 className="ge-h1 font-semibold leading-tight">Wie spelen er mee?</h2>
                <p className="ge-body mt-2 font-medium">Voeg de namen van je teamgenoten toe</p>
              </div>

              <div className="mt-8 flex min-h-24 w-full flex-wrap justify-center gap-2">
                {playerNames.length === 0 && (
                  <div className="mt-4 text-sm italic text-gray-400">Nog geen spelers toegevoegd...</div>
                )}
                {playerNames.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex animate-in items-center gap-2 rounded-full border border-[#003566]/20 bg-white/90 px-4 py-2 text-sm font-bold text-[#003566] zoom-in duration-300"
                  >
                    {p}
                    <button
                      type="button"
                      onClick={() => removePlayer(idx)}
                      className="font-bold text-red-500 transition-transform hover:scale-110"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex w-full flex-col items-center gap-3">
                <div className="flex w-full max-w-[280px] items-center gap-3">
                  <input
                    type="text"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                    placeholder="Naam speler..."
                    className="ge-pill-input min-h-[36px] min-w-0 flex-1 text-base"
                  />
                  <button
                    type="button"
                    onClick={handleAddPlayer}
                    aria-label="Speler toevoegen"
                    className="ge-btn-yellow ge-btn-yellow--foot !max-w-[3rem] !min-h-[2.75rem] !min-w-[2.75rem] shrink-0 !rounded-full !p-0 text-2xl font-bold !tracking-normal"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <div className="relative h-32 w-full overflow-hidden rounded-[24px] border-4 border-white bg-black shadow-xl">
                  <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale">
                    <source src="/videos/RankingNaam.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black uppercase tracking-[0.2em] text-white outline-text drop-shadow-lg">
                      PLAYERS
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={handleSavePlayers}
                  disabled={playerNames.length === 0 || loading}
                  className="ge-btn-blue ge-btn-blue--foot !max-w-[280px]"
                >
                  {loading && (
                    <span
                      className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-white/35 border-t-white"
                      aria-hidden
                    />
                  )}
                  Gereed — Dan gaan we
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Step 5: UITLEG */}
        {step === 'UITLEG' && (
          <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-1000">
            <div className="action_container scrollbar-hide min-h-0 flex-1 overflow-hidden">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
                <div className="flex flex-col gap-2 pt-2">
                  <h1 className="ge-h1">
                    Bad Elon heeft een plan <br />
                    <span className="ge-body mt-1 inline-block font-medium opacity-90">
                      Maar jullie gaan hem stoppen.
                    </span>
                  </h1>
                </div>

                <div className="mt-6 flex flex-col gap-6">
                  <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-[var(--ge-radius-inner-screen)] border-4 border-white bg-black shadow-xl">
                    <video autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover opacity-80 grayscale">
                      <source src="/videos/IntroPage1.mp4" type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-black uppercase tracking-[0.2em] text-white outline-text drop-shadow-lg">
                        MISSIE
                      </span>
                    </div>
                  </div>

                  <div className="ge-body flex flex-col gap-4 pb-4 text-left font-medium">
                    <p>
                      <strong>Wat gaan jullie doen?</strong> Onderweg voeren jullie 9 opdrachten uit. <br />
                      Elke opdracht telt, elke seconde telt … want hoe sneller jullie zijn, hoe hoger de score.
                    </p>
                    <p>
                      Jullie hebben 90 minuten in totaal. <br />
                      Geen paniek. Waarschijnlijk.
                    </p>
                    <p>
                      Bij elke goed uitgevoerde opdracht verdienen jullie een <strong>Token 🪙</strong> <br />
                      Bewaar die goed — want ze zijn goud waard. Letterlijk. <br />
                      Het eerste token? Die krijgen jullie zo meteen al bij opdracht één.
                    </p>
                    <p>
                      In totaal verzamelen jullie <strong>10 Tokens</strong>. <br />
                      Die hebben jullie nodig om de geheime code van 12 letters te kraken en Bad Elon definitief terug naar zijn raket te sturen. 🚀
                    </p>
                    <p>
                      De klok loopt. De robots naderen. <br />
                      En Bad Elon tweet alweer over zichzelf. Succes! 😅
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button type="button" onClick={nextStep} className="ge-btn-blue ge-btn-blue--foot !max-w-[280px]">
                  Klaar voor de start!
                </button>
              </div>
            </div>
          </div>
        )}

    </PlayerChrome>
  );
}
