'use client';

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

/** `/letters` — Reveal screen showing symbol → letter mappings after completing tokenkey puzzle. */
export default function LettersPage() {
  return (
    <PlayerChrome backgroundImage="/purple.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-0 text-center">
        {/* logo badge in the top (§5.4 pattern) */}
        <div className="flex shrink-0 justify-center pt-[1.35rem]">
          <img
            src="/EscapeLogobadge.png"
            alt="Escape Room Logo"
            width={150}
            height={132}
            className="h-[132px] w-[150px] object-contain drop-shadow-md"
          />
        </div>

        <div className="action_container min-h-0 flex-1 overflow-hidden pt-4" style={{ height: '70cqh', maxHeight: '70cqh', marginTop: 'auto' }}>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            <h1 className="ge-h1 text-white">Goed gedaan! 🎉</h1>
            <p className="ge-body text-white opacity-90">Nu nog de 12-letterige code kraken</p>
            <div className="tk-reveal-grid">
              {LETTERS_SYMBOLS.filter(([letter]) => SECRET_TOKENS.includes(letter)).map(([letter, symbol], idx) => (
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
          <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
            <button
              type="button"
              className="ge-btn-yellow ge-btn-yellow--foot"
              onClick={() => { window.location.href = '/flame'; }}
            >
              We gaan dit kraken →
            </button>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
