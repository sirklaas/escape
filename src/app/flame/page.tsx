'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { markFlameWinnerAction } from '@/app/actions';

// ── Word & letters ──────────────────────────────────────────────────────────
const TARGET_WORD = 'FLAMETHROWER'; // 12 letters
const WORD_LETTERS = TARGET_WORD.split('');

// The 10 unique letter tokens from tokenkey
const TOKEN_LETTERS = ['F', 'L', 'A', 'M', 'E', 'T', 'H', 'R', 'O', 'W'];

function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

// Random position within safe screen bounds (avoids the slot row)
function randomPos(w: number, h: number) {
  const TILE = 56;
  const SLOT_AREA_BOTTOM = Math.min(h * 0.45, 280); // keep tiles below slot row
  return {
    x: Math.random() * (w - TILE - 20) + 10,
    y: SLOT_AREA_BOTTOM + Math.random() * (h - SLOT_AREA_BOTTOM - TILE - 60),
  };
}

interface Tile {
  id: number;
  letter: string;
  x: number;
  y: number;
  fixed: boolean; // once placed correctly, stops being draggable
}

interface SlotState {
  filledBy: number | null; // tile id that filled this slot
}

type GamePhase = 'playing' | 'won';

export default function FlamePage() {
  const screenRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 335, h: 700 });
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<SlotState[]>(() => WORD_LETTERS.map(() => ({ filledBy: null })));
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [winRank, setWinRank] = useState<number | null>(null);

  const nextTileId = useRef(0);
  const dragState = useRef<{
    tileId: number;
    startX: number; startY: number;
    ox: number; oy: number; // offset from pointer to tile origin
  } | null>(null);

  // ── Init dims & tiles ────────────────────────────────────────────────────
  useEffect(() => {
    setTeamName(localStorage.getItem('escaperoomTeamName') ?? 'Jullie team');

    function measure() {
      if (!screenRef.current) return;
      const r = screenRef.current.getBoundingClientRect();
      setDims({ w: r.width, h: r.height });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Spawn initial 10 tiles once dims are real
  useEffect(() => {
    if (dims.w < 100) return;
    const initial: Tile[] = TOKEN_LETTERS.map((letter) => {
      const pos = randomPos(dims.w, dims.h);
      return { id: nextTileId.current++, letter, x: pos.x, y: pos.y, fixed: false };
    });
    setTiles(initial);
  }, [dims.w]); // only once when width is known

  // ── Spawn a duplicate tile at random position ────────────────────────────
  const spawnDuplicate = useCallback((letter: string) => {
    const pos = randomPos(dims.w, dims.h);
    setTiles(prev => [...prev, { id: nextTileId.current++, letter, x: pos.x, y: pos.y, fixed: false }]);
  }, [dims]);

  // ── Check win condition ──────────────────────────────────────────────────
  const checkWin = useCallback((currentSlots: SlotState[], currentTiles: Tile[]) => {
    const allFilled = currentSlots.every(s => s.filledBy !== null);
    if (!allFilled) return;

    // Verify letters match FLAMETHROWER
    const allCorrect = currentSlots.every((s, i) => {
      const tile = currentTiles.find(t => t.id === s.filledBy);
      return tile?.letter === WORD_LETTERS[i];
    });

    if (allCorrect) {
      setPhase('won');
      // Mark winner in PB + get rank
      const stored = localStorage.getItem('escaperoomTeamName') ?? '';
      markFlameWinnerAction(stored).then(res => {
        setWinRank(res.rank ?? null);
        setShowWinPopup(true);
      });
    }
  }, []);

  // ── Slot hit-test ────────────────────────────────────────────────────────
  // Returns slot index if tile center is within a slot region, else -1
  function getHitSlot(tileX: number, tileY: number): number {
    const TILE = 56;
    const slotCount = WORD_LETTERS.length;
    const slotW = Math.min(Math.floor((dims.w - 16) / slotCount), 30);
    const totalW = slotW * slotCount + (slotCount - 1) * 2;
    const startX = (dims.w - totalW) / 2;
    const slotY = 40; // top offset inside screen
    const cx = tileX + TILE / 2;
    const cy = tileY + TILE / 2;

    for (let i = 0; i < slotCount; i++) {
      const sx = startX + i * (slotW + 2);
      const sy = slotY;
      const tolerance = 24;
      if (
        cx >= sx - tolerance && cx <= sx + slotW + tolerance &&
        cy >= sy - tolerance && cy <= sy + slotW + tolerance
      ) {
        return i;
      }
    }
    return -1;
  }

  // ── Pointer drag handlers ─────────────────────────────────────────────────
  const handlePointerDown = useCallback((e: React.PointerEvent, tileId: number) => {
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.fixed) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = screenRef.current!.getBoundingClientRect();
    dragState.current = {
      tileId,
      startX: tile.x,
      startY: tile.y,
      ox: (e.clientX - rect.left) - tile.x,
      oy: (e.clientY - rect.top) - tile.y,
    };
  }, [tiles]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current || !screenRef.current) return;
    const rect = screenRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) - dragState.current.ox;
    const y = (e.clientY - rect.top) - dragState.current.oy;
    setTiles(prev => prev.map(t => t.id === dragState.current!.tileId ? { ...t, x, y } : t));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent, tileId: number) => {
    if (!dragState.current || dragState.current.tileId !== tileId) return;
    const ds = dragState.current;
    dragState.current = null;

    setTiles(prevTiles => {
      setSlots(prevSlots => {
        const tile = prevTiles.find(t => t.id === tileId)!;
        const hitIndex = getHitSlot(tile.x, tile.y);

        if (hitIndex === -1) {
          // Didn't hit any slot — bounce back to start pos
          playSound('/sounds/wrong.mp3');
          setTiles(p => p.map(t => t.id === tileId ? { ...t, x: ds.startX, y: ds.startY } : t));
          return prevSlots;
        }

        const expectedLetter = WORD_LETTERS[hitIndex];
        const slotAlreadyFilled = prevSlots[hitIndex].filledBy !== null;

        if (tile.letter === expectedLetter && !slotAlreadyFilled) {
          // ✅ Correct!
          playSound('/sounds/right.mp3');

          const newSlots = prevSlots.map((s, i) =>
            i === hitIndex ? { ...s, filledBy: tileId } : s
          );

          // Snap tile to exact slot position
          const slotCount = WORD_LETTERS.length;
          const slotW = Math.min(Math.floor((dims.w - 16) / slotCount), 30);
          const totalW = slotW * slotCount + (slotCount - 1) * 2;
          const startX = (dims.w - totalW) / 2;
          const slotX = startX + hitIndex * (slotW + 2);

          const newTiles = prevTiles.map(t =>
            t.id === tileId ? { ...t, x: slotX, y: 40, fixed: true } : t
          );

          // If this letter appears again in TARGET_WORD and all instances aren't filled yet → spawn duplicate
          const neededCount = WORD_LETTERS.filter(l => l === tile.letter).length;
          const filledCount = newSlots.filter(s => {
            const ft = newTiles.find(t2 => t2.id === s.filledBy);
            return ft?.letter === tile.letter;
          }).length;

          if (neededCount > filledCount) {
            setTimeout(() => spawnDuplicate(tile.letter), 200);
          }

          // Sync tiles then check win
          setTimeout(() => {
            setTiles(newTiles);
            checkWin(newSlots, newTiles);
          }, 0);

          return newSlots;
        } else {
          // ❌ Wrong slot or already filled
          playSound('/sounds/wrong.mp3');
          setTiles(p => p.map(t => t.id === tileId ? { ...t, x: ds.startX, y: ds.startY } : t));
          return prevSlots;
        }
      });
      return prevTiles;
    });
  }, [dims, spawnDuplicate, checkWin]);

  // ── Slot geometry helpers ────────────────────────────────────────────────
  const slotCount = WORD_LETTERS.length;
  const slotW = Math.min(Math.floor((dims.w - 16) / slotCount), 30);
  const totalW = slotW * slotCount + (slotCount - 1) * 2;
  const slotStartX = (dims.w - totalW) / 2;

  // ── Winner popup OK → play video ─────────────────────────────────────────
  const handleWinOk = () => {
    setShowWinPopup(false);
    setTimeout(() => setPlayingVideo(true), 300);
  };

  // ── Render ───────────────────────────────────────────────────────────────
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
          {/* Full-screen video finale */}
          {playingVideo && (
            <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center">
              <video
                autoPlay
                playsInline
                // NOT muted — as requested
                className="h-full w-full object-cover"
                onEnded={() => { window.location.href = '/watzullenwe'; }}
              >
                <source src="/videos/watzullenwe.mp4" type="video/mp4" />
              </video>
            </div>
          )}

          {/* Game screen */}
          <div
            ref={screenRef}
            className="relative flex flex-col"
            style={{ width: '100%', height: '100%', overflow: 'hidden' }}
            onPointerMove={handlePointerMove}
          >
            {/* ── Dark overlay with heading ── */}
            <div className="absolute inset-0 bg-black/45 pointer-events-none z-0" />

            {/* Heading row */}
            <div className="relative z-10 text-center pt-3 pb-1 px-2 pointer-events-none flex-shrink-0">
              <p className="tk-progress-label" style={{ fontSize: '0.75rem' }}>
                Sleep de letters op de juiste plek
              </p>
            </div>

            {/* ── SLOT ROW ── */}
            <div
              className="relative z-10 flex-shrink-0"
              style={{ height: 56, marginTop: 4 }}
            >
              {WORD_LETTERS.map((letter, i) => {
                const sx = slotStartX + i * (slotW + 2);
                const filled = slots[i].filledBy !== null;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      left: sx,
                      top: 0,
                      width: slotW,
                      height: slotW,
                    }}
                    className={`flame-slot ${filled ? 'flame-slot--filled' : ''}`}
                  >
                    {filled && (
                      <span className="flame-slot-letter">
                        {letter}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="relative z-10 flex-shrink-0 px-3 mt-1">
              <div className="tk-progress-bar-wrap">
                <div
                  className="tk-progress-bar-fill"
                  style={{ width: `${(slots.filter(s => s.filledBy !== null).length / slotCount) * 100}%` }}
                />
              </div>
            </div>

            {/* ── DRAGGABLE TILES ── */}
            {tiles.filter(t => !t.fixed).map(tile => (
              <div
                key={tile.id}
                className="flame-tile"
                style={{
                  position: 'absolute',
                  left: tile.x,
                  top: tile.y,
                  zIndex: 20,
                  touchAction: 'none',
                  userSelect: 'none',
                }}
                onPointerDown={e => handlePointerDown(e, tile.id)}
                onPointerUp={e => handlePointerUp(e, tile.id)}
              >
                {tile.letter}
              </div>
            ))}
          </div>

          {/* ── WIN POPUP ── */}
          {showWinPopup && (
            <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/60">
              <div className="ge-popup-yellow player-view" style={{ maxWidth: 280, margin: 'auto' }}>
                <p className="ge-popup__title">Jullie zijn de winnaar! 🏆</p>
                {winRank && (
                  <p className="ge-popup__meta">
                    {winRank === 1 ? '🥇 Eerste plek!' : winRank === 2 ? '🥈 Tweede plek!' : `🥉 Plek ${winRank}`}
                  </p>
                )}
                <p className="ge-popup__message mt-2">
                  {teamName} heeft FLAMETHROWER gekraakt!
                </p>
                <button className="ge-popup__ok" onClick={handleWinOk}>
                  OK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
