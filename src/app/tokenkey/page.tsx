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
function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

export default function TokenKeyPage() {
  const [cells, setCells] = useState<CellData[]>(() =>
    LETTERS_SYMBOLS.map(([letter, symbol]) => ({ letter, symbol, state: 'idle', wrongCount: 0 }))
  );

  const selectedCorrect = useRef<string[]>([]);
  const selectedIndices = useRef<number[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const notifTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const showNotification = useCallback((msg: string, ms = 1800) => {
    setNotification(msg);
    if (notifTimer.current) clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotification(null), ms);
  }, []);

  const handleCellClick = useCallback((index: number) => {
    if (isComplete) return;
    const cell = cells[index];
    if (cell.state === 'greyed') return;
    if (selectedIndices.current.includes(index)) return;

    const isCorrect = SECRET_TOKENS.includes(cell.letter);
    if (isCorrect) {
      selectedCorrect.current.push(cell.letter);
      selectedIndices.current.push(index);
      setCells(prev => prev.map((c, i) => i === index ? { ...c, state: 'selected' } : c));
      playSound('/sounds/right.mp3');
      if (selectedCorrect.current.length === SECRET_TOKENS.length) {
        setIsComplete(true);
        setTimeout(() => { window.location.href = '/letters'; }, 500);
      }
    } else {
      const newWrongCount = cell.wrongCount + 1;
      const goGrey = newWrongCount >= MAX_WRONG_CLICKS;
      playSound('/sounds/wrong.mp3');
      showNotification('Fout! Alle tokens terug…');
      const resetIndices = new Set(selectedIndices.current);
      setCells(prev => prev.map((c, i) => {
        if (i === index) return { ...c, wrongCount: newWrongCount, state: goGrey ? 'greyed' : 'idle' };
        if (resetIndices.has(i)) return { ...c, state: 'idle' };
        return c;
      }));
      selectedCorrect.current = [];
      selectedIndices.current = [];
    }
  }, [cells, isComplete, showNotification]);

  const foundCount = selectedIndices.current.length;

  return (
    <PlayerChrome 
      backgroundImage="/purple.jpg"
      wrapWithActionContainer={false}
    >
      {/* Token puzzle - click symbols to find the 10 secret tokens */}
      <div className="flex flex-col h-full">
        <div className="tk-progress-bar-wrap">
          <div
            className="tk-progress-bar-fill"
            style={{ width: `${(foundCount / SECRET_TOKENS.length) * 100}%` }}
          />
        </div>
        <p className="tk-progress-label">{foundCount} / {SECRET_TOKENS.length} tokens gevonden</p>

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
              disabled={cell.state === 'greyed' || isComplete}
            >
              {cell.symbol}
            </button>
          ))}
        </div>

        <div className={`tk-notification ${notification ? 'tk-notification--visible' : ''}`}>
          {notification}
        </div>
      </div>
    </PlayerChrome>
  );
}
