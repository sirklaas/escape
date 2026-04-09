'use client';

import { useState, useCallback, useRef } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

// The 10 correct tokens — matches original main.js
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

const MAX_WRONG_CLICKS = 6;

type CellState = 'idle' | 'selected' | 'greyed';
interface CellData { letter: string; symbol: string; state: CellState; wrongCount: number; }
type Phase = 'intro' | 'puzzle' | 'complete';

function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

export default function TokenKeyPage() {
  const [phase, setPhase] = useState<Phase>('intro');

  const [cells, setCells] = useState<CellData[]>(() =>
    LETTERS_SYMBOLS.map(([letter, symbol]) => ({ letter, symbol, state: 'idle', wrongCount: 0 }))
  );

  // tracks correct picks this round
  const selectedCorrect = useRef<string[]>([]);
  // tracks indices of all blue cells this round — reset on wrong
  const selectedIndices = useRef<number[]>([]);

  const [notification, setNotification] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showNotification = useCallback((msg: string, ms = 1800) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), ms);
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (phase !== 'puzzle') return;
    const cell = cells[index];
    if (cell.state === 'greyed') return;
    // already selected this round — ignore double-tap
    if (selectedIndices.current.includes(index)) return;

    const isCorrect = SECRET_TOKENS.includes(cell.letter);

    if (isCorrect) {
      selectedCorrect.current.push(cell.letter);
      selectedIndices.current.push(index);
      setCells(prev => prev.map((c, i) => i === index ? { ...c, state: 'selected' } : c));
      playSound('/sounds/right.mp3');

      if (selectedCorrect.current.length === SECRET_TOKENS.length) {
        setTimeout(() => setPhase('complete'), 500);
      }
    } else {
      const newWrongCount = cell.wrongCount + 1;
      const goGrey = newWrongCount >= MAX_WRONG_CLICKS;
      playSound('/sounds/wrong.mp3');
      showNotification('Fout! Alle tokens terug…');

      // Reset ALL selected cells back to idle, grey the wrong one if needed
      const resetIndices = new Set(selectedIndices.current);
      setCells(prev => prev.map((c, i) => {
        if (i === index) return { ...c, wrongCount: newWrongCount, state: goGrey ? 'greyed' : 'idle' };
        if (resetIndices.has(i)) return { ...c, state: 'idle' };
        return c;
      }));

      selectedCorrect.current = [];
      selectedIndices.current = [];
    }
  }, [cells, phase, showNotification]);

  const foundCount = selectedIndices.current.length;

  // ── INTRO — blue ge-intro-inner background (globaldesign §5.4) ────────────
  if (phase === 'intro') {
    return (
      <PlayerChrome backgroundImage="" wrapWithActionContainer={false}>
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
                  <h1 className="ge-h1">Nog 1 hindernis te gaan</h1>
                  <div className="ge-body flex flex-col gap-4 text-pretty font-medium">
                    <p>
                      Jullie hebben <strong>10 tokens</strong> gevonden onderweg.
                      <br />
                      Deze gaan jullie nu gebruiken.
                    </p>
                    <p className="font-semibold">Doe je best!</p>
                  </div>
                </div>
                <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                  <button
                    type="button"
                    onClick={() => setPhase('puzzle')}
                    className="ge-btn-yellow ge-btn-yellow--foot"
                  >
                    Start
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PlayerChrome>
    );
  }

  // ── COMPLETE — purple background, reveal pairs ──────────────────────────
  if (phase === 'complete') {
    const completedPairs = LETTERS_SYMBOLS.filter(([letter]) => SECRET_TOKENS.includes(letter));

    return (
      <PurpleShell>
        <div className="tk-intro flex flex-col h-full items-center justify-between py-8 px-5 text-center">
          <div className="flex-1 flex flex-col items-center justify-center gap-4 w-full min-h-0">
            <h1 className="tk-h1">Goed gedaan! 🎉</h1>
            <p className="tk-body">Nu nog de 12-letterige code kraken</p>
            <div className="tk-reveal-grid">
              {completedPairs.map(([letter, symbol], idx) => (
                <div
                  key={letter}
                  className="tk-reveal-cell"
                  style={{ animationDelay: `${idx * 60}ms` }}
                >
                  <span className="tk-symbol">{symbol}</span>
                  <span className="tk-arrow">→</span>
                  <span className="tk-letter">{letter.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3 w-full items-center pb-2 flex-shrink-0">
            {/* Back to puzzle to re-check — keeps state intact */}
            <button className="tk-btn-blue" onClick={() => setPhase('puzzle')}>
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
      </PurpleShell>
    );
  }

  // ── PUZZLE — full purple.jpg background, 3-column grid ──────────────────
  return (
    <PurpleShell>
      <div className="tk-puzzle flex flex-col h-full">
        {/* Progress */}
        <div className="tk-progress-bar-wrap">
          <div
            className="tk-progress-bar-fill"
            style={{ width: `${(foundCount / SECRET_TOKENS.length) * 100}%` }}
          />
        </div>
        <p className="tk-progress-label">{foundCount} / {SECRET_TOKENS.length} tokens gevonden</p>

        {/* 3-col grid — matches HTML original */}
        <div className="tk-grid">
          {cells.map((cell, i) => (
            <button
              key={`${cell.letter}-${i}`}
              className={[
                'tk-cell',
                cell.state === 'selected' ? 'tk-cell--selected' : '',
                cell.state === 'greyed'   ? 'tk-cell--greyed'   : '',
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
    </PurpleShell>
  );
}

// Purple full-bleed shell (puzzle + complete phases)
function PurpleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="tk-outer">
      <div className="tk-card">
        <div
          className="tk-inner"
          style={{
            backgroundImage: 'url(/purple.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="player-view relative flex flex-col h-full w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
