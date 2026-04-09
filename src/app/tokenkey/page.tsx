'use client';

import { useState, useCallback, useRef } from 'react';

// The 10 correct tokens that spell the secret — matches original main.js
const SECRET_TOKENS = ['f', 'l', 'a', 'm', 'e', 't', 'h', 'r', 'o', 'w'];

// All 26 letter–symbol pairs from original main.js
const LETTERS_SYMBOLS: [string, string][] = [
  ['a', 'ㄱ'], ['b', 'ㄴ'], ['c', 'ㄷ'], ['d', 'ㅁ'], ['e', 'ㅅ'],
  ['f', 'ㅇ'], ['g', 'ㅆ'], ['h', 'ㅋ'], ['i', 'ㅌ'], ['j', 'ㅐ'],
  ['k', 'ㅓ'], ['l', 'ㅕ'], ['m', 'ㅗ'], ['n', 'ㅜ'], ['o', 'ㅠ'],
  ['p', 'ㅟ'], ['q', 'ㅥ'], ['r', 'ㅨ'], ['s', 'ㅱ'], ['t', 'ㆁ'],
  ['u', 'ㅺ'], ['v', 'ㅿ'], ['w', 'ㆀ'], ['x', 'ㅸ'], ['y', 'ㆆ'],
  ['z', 'ㄾ'],
];

const MAX_WRONG_CLICKS = 6; // after this many wrong clicks the token is greyed out

type CellState = 'idle' | 'selected' | 'greyed';

interface CellData {
  letter: string;
  symbol: string;
  state: CellState;
  wrongCount: number;
}

type Phase = 'intro' | 'puzzle' | 'complete' | 'revealed';

function playSound(src: string) {
  try {
    const audio = new Audio(src);
    audio.play().catch(() => {});
  } catch {}
}

export default function TokenKeyPage() {
  const [phase, setPhase] = useState<Phase>('intro');

  const [cells, setCells] = useState<CellData[]>(() =>
    LETTERS_SYMBOLS.map(([letter, symbol]) => ({
      letter,
      symbol,
      state: 'idle' as CellState,
      wrongCount: 0,
    }))
  );

  // Tracks which correct letters have been selected this round
  const selectedCorrect = useRef<string[]>([]);
  // Tracks all clicked cells this round (for reset on wrong)
  const selectedCellsThisRound = useRef<number[]>([]);

  const [notification, setNotification] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string, ms = 1500) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), ms);
  }, []);

  const handleCellClick = useCallback(
    (index: number) => {
      if (phase !== 'puzzle') return;

      const cell = cells[index];

      // Already selected or greyed — ignore
      if (cell.state === 'selected' || cell.state === 'greyed') return;
      // Already found as correct this round
      if (selectedCorrect.current.includes(cell.letter)) return;

      const isCorrect = SECRET_TOKENS.includes(cell.letter);

      if (isCorrect) {
        // Mark selected
        selectedCorrect.current.push(cell.letter);
        selectedCellsThisRound.current.push(index);

        setCells(prev =>
          prev.map((c, i) => (i === index ? { ...c, state: 'selected' } : c))
        );

        playSound('/sounds/right.mp3');

        // All 10 found?
        if (selectedCorrect.current.length === SECRET_TOKENS.length) {
          setTimeout(() => setPhase('complete'), 600);
        }
      } else {
        // Wrong click — increment wrongCount
        const newWrongCount = cell.wrongCount + 1;
        const goGrey = newWrongCount >= MAX_WRONG_CLICKS;

        playSound('/sounds/wrong.mp3');
        showNotification('Fout! Probeer opnieuw…');

        // Flash the wrong cell briefly, then reset round
        setCells(prev =>
          prev.map((c, i) => {
            if (i === index) return { ...c, wrongCount: newWrongCount, state: goGrey ? 'greyed' : 'idle' };
            // Un-select all correct cells from this round
            if (selectedCellsThisRound.current.includes(i)) return { ...c, state: 'idle' };
            return c;
          })
        );

        // Reset round tracking
        selectedCorrect.current = [];
        selectedCellsThisRound.current = [];
      }
    },
    [cells, phase, showNotification]
  );

  // ── INTRO PHASE ──────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <PageShell>
        <div className="tk-intro flex flex-col h-full items-center justify-between py-10 px-6 text-center">
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <h1 className="tk-h1">Nog 1 hindernis te gaan</h1>
            <p className="tk-body">
              Jullie hebben <strong>10 tokens</strong> gevonden onderweg.
              <br />
              Deze gaan jullie nu gebruiken.
              <br />
              <br />
              Doe je best!
            </p>
          </div>
          <button
            className="tk-btn-yellow"
            onClick={() => setPhase('puzzle')}
          >
            START
          </button>
        </div>
      </PageShell>
    );
  }

  // ── COMPLETE PHASE (show reveal of letter-symbol pairs) ──────────────────
  if (phase === 'complete' || phase === 'revealed') {
    const completedPairs = LETTERS_SYMBOLS.filter(([letter]) =>
      SECRET_TOKENS.includes(letter)
    );

    return (
      <PageShell>
        <div className="tk-intro flex flex-col h-full items-center justify-between py-8 px-5 text-center">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full">
            <h1 className="tk-h1">Goed gedaan! 🎉</h1>
            <p className="tk-body mb-2">Nu nog de 12-letterige code kraken</p>

            {/* Revealed token → letter pairs */}
            <div className="tk-reveal-grid">
              {completedPairs.map(([letter, symbol]) => (
                <div key={letter} className="tk-reveal-cell">
                  <span className="tk-symbol">{symbol}</span>
                  <span className="tk-arrow">→</span>
                  <span className="tk-letter">{letter.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full items-center pb-2">
            {/* Let players revisit the unlocked codes */}
            <button
              className="tk-btn-blue"
              onClick={() => setPhase('revealed')}
            >
              Bekijk codes opnieuw
            </button>
            <button
              className="tk-btn-yellow"
              onClick={() => { window.location.href = '/flame'; }}
            >
              We gaan dit kraken →
            </button>
          </div>
        </div>
      </PageShell>
    );
  }

  // ── PUZZLE PHASE ─────────────────────────────────────────────────────────
  const foundCount = selectedCorrect.current.length;

  return (
    <PageShell>
      <div className="tk-puzzle flex flex-col h-full">
        {/* Progress bar */}
        <div className="tk-progress-bar-wrap">
          <div
            className="tk-progress-bar-fill"
            style={{ width: `${(foundCount / SECRET_TOKENS.length) * 100}%` }}
          />
        </div>
        <p className="tk-progress-label">{foundCount} / {SECRET_TOKENS.length} tokens gevonden</p>

        {/* Grid */}
        <div className="tk-grid">
          {cells.map((cell, i) => (
            <button
              key={`${cell.letter}-${i}`}
              className={[
                'tk-cell',
                cell.state === 'selected' ? 'tk-cell--selected' : '',
                cell.state === 'greyed' ? 'tk-cell--greyed' : '',
              ].join(' ')}
              onClick={() => handleCellClick(i)}
              disabled={cell.state === 'greyed'}
              aria-label={`Token ${cell.symbol}`}
            >
              {cell.symbol}
            </button>
          ))}
        </div>

        {/* Notification toast */}
        <div className={`tk-notification ${notification ? 'tk-notification--visible' : ''}`}>
          {notification}
        </div>
      </div>
    </PageShell>
  );
}

// ── Phone shell wrapper ───────────────────────────────────────────────────
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tk-outer">
      <div className="tk-card">
        <div
          className="tk-inner"
          style={{ backgroundImage: 'url(/purple.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="player-view relative flex flex-col h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
