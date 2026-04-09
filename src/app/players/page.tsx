'use client';

import { useCallback, useEffect, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

const MAX_PLAYERS = 15;

const NR_HINT = 'Nr.?';

const ORDINAL_SHORT = [
  'Tweede',
  'Derde',
  'Vierde',
  'Vijfde',
  'Zesde',
  'Zevende',
  'Achtste',
  'Negende',
  'Tiende',
  'Elfde',
  'Twaalfde',
  'Dertiende',
  'Veertiende',
  'Vijftiende',
] as const;

/** Prompt in the name pill (0-based slot), e.g. Eerste speler? */
function playerPrompt(slotIndex: number): string {
  if (slotIndex === 0) return 'Eerste speler?';
  const ord = ORDINAL_SHORT[slotIndex - 1];
  if (ord) return `${ord} speler?`;
  return `Speler ${slotIndex + 1}?`;
}

const shellStyle =
  'overflow-hidden border-[3px] border-white bg-[#d4d4d4] text-[var(--ge-navy)] transition-[width,min-width,max-width,padding] duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)]';

const circleDims = 'h-10 w-10 min-h-10 min-w-10 max-h-10 max-w-10 shrink-0';

type Phase = 'count' | 'names';

/** `/players` — na team; teamnaam later van PB / nu localStorage. */
export default function PlayersPage() {
  const [phase, setPhase] = useState<Phase>('count');
  const [teamName, setTeamName] = useState('…');
  const [countRaw, setCountRaw] = useState('');
  const [playerCount, setPlayerCount] = useState(0);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  useEffect(() => {
    const t = localStorage.getItem('escaperoomTeamName');
    if (t && t.trim()) setTeamName(t.trim());
  }, []);

  const parsedCount = Math.min(MAX_PLAYERS, Math.max(0, parseInt(countRaw, 10) || 0));
  const countValid = parsedCount >= 1 && parsedCount <= MAX_PLAYERS;

  const commitCount = useCallback(() => {
    if (!countValid) return;
    setPlayerCount(parsedCount);
    setCurrentSlot(0);
    setPlayerNames(Array.from({ length: parsedCount }, () => ''));
    setPhase('names');
  }, [countValid, parsedCount]);

  const currentName = playerNames[currentSlot] ?? '';
  const currentHasName = currentName.trim().length > 0;

  const setNameAt = useCallback((idx: number, value: string) => {
    setPlayerNames((prev) => {
      const next = prev.slice();
      next[idx] = value;
      return next;
    });
  }, []);

  const advanceSlot = useCallback(() => {
    if (phase !== 'names' || !currentHasName) return;
    if (currentSlot < playerCount - 1) {
      setCurrentSlot((s) => s + 1);
    } else {
      window.location.href = '/begin';
    }
  }, [phase, currentHasName, currentSlot, playerCount]);

  useEffect(() => {
    if (phase !== 'names' || playerCount < 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && currentHasName) {
        e.preventDefault();
        advanceSlot();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, playerCount, currentHasName, advanceSlot]);

  useEffect(() => {
    if (phase !== 'count') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && countValid) {
        e.preventDefault();
        commitCount();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, countValid, commitCount]);

  const isCount = phase === 'count';
  /** Eerste speler blijft pill na teamgrootte; daarna cirkel → pill onder vorige namen. */
  const activeNameWide = !isCount && (currentSlot === 0 || currentHasName);

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-700">
        <div className="action_container mt-2 flex min-h-0 min-w-0 flex-col overflow-hidden">
          <div className="shrink-0 px-1 pt-1">
            <h1 className="ge-h1 font-semibold text-[var(--ge-navy)] drop-shadow-sm">
              Jullie zijn team: {teamName}
            </h1>
          </div>

          {isCount ? (
            <div className="mt-4 flex min-h-0 flex-1 flex-col items-center gap-6 px-2 pb-4">
              <p className="ge-body max-w-[280px] font-medium">
                Hoeveel kanjers zitten er in jullie team?
              </p>

              <div
                className={[
                  'flex h-10 max-h-10 items-center justify-center rounded-full',
                  shellStyle,
                  circleDims,
                ].join(' ')}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={countRaw}
                  onChange={(e) => setCountRaw(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder={NR_HINT}
                  className="ge-body h-full w-10 cursor-text bg-transparent text-center text-[10px] font-medium tabular-nums text-[var(--ge-navy)] outline-none placeholder:text-[var(--ge-navy)]/55 placeholder:text-center sm:text-xs"
                />
              </div>

              <button
                type="button"
                onClick={commitCount}
                disabled={!countValid}
                className="ge-btn-blue ge-btn-blue--foot disabled:pointer-events-none disabled:opacity-45"
              >
                Verder
              </button>
            </div>
          ) : (
            <div className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col px-2 pb-4">
              <div className="flex min-h-0 w-full flex-1 flex-col items-center gap-2 overflow-y-auto [-webkit-overflow-scrolling:touch]">
                <div className="flex w-full max-w-[min(100%,280px)] flex-col items-center gap-2 pb-1">
                  {Array.from({ length: currentSlot }, (_, i) => (
                    <div
                      key={`entered-${i}`}
                      className={[
                        'flex h-10 max-h-10 w-full min-w-0 shrink-0 items-center justify-center rounded-full px-2 sm:px-3',
                        shellStyle,
                      ].join(' ')}
                    >
                      <span className="ge-body max-w-full truncate text-center text-[11px] font-medium leading-tight text-[var(--ge-navy)] sm:text-xs">
                        {(playerNames[i] ?? '').trim()}
                      </span>
                    </div>
                  ))}
                  <div
                    key={`active-${currentSlot}`}
                    className={[
                      'flex h-10 max-h-10 shrink-0 items-center justify-center rounded-full',
                      shellStyle,
                      activeNameWide
                        ? 'w-full min-w-0 px-2 sm:px-3'
                        : circleDims,
                    ].join(' ')}
                  >
                    {activeNameWide ? (
                      <input
                        type="text"
                        value={currentName}
                        onChange={(e) => setNameAt(currentSlot, e.target.value)}
                        placeholder={playerPrompt(currentSlot)}
                        autoComplete="name"
                        autoFocus
                        className="ge-body min-w-0 flex-1 bg-transparent text-center text-[11px] font-medium leading-tight text-[var(--ge-navy)] outline-none placeholder:text-[var(--ge-navy)]/55 sm:text-xs"
                      />
                    ) : (
                      <div className="relative h-10 w-10 shrink-0">
                        <input
                          type="text"
                          value={currentName}
                          onChange={(e) => setNameAt(currentSlot, e.target.value)}
                          autoComplete="name"
                          autoFocus
                          aria-label={playerPrompt(currentSlot)}
                          className="absolute inset-0 z-10 m-0 h-10 w-10 cursor-text rounded-full bg-transparent text-center text-[11px] font-medium text-[var(--ge-navy)] outline-none"
                        />
                        {!currentHasName && (
                          <span className="pointer-events-none flex h-10 w-10 items-center justify-center px-0.5 text-center text-[8px] font-medium leading-[1.15] text-[var(--ge-navy)]/55">
                            {playerPrompt(currentSlot)}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 justify-center pt-4">
                <button
                  type="button"
                  onClick={advanceSlot}
                  disabled={!currentHasName}
                  className="ge-btn-blue ge-btn-blue--foot text-sm disabled:pointer-events-none disabled:opacity-45"
                >
                  Volgende
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PlayerChrome>
  );
}
