'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerChrome from '@/components/PlayerChrome';
import { markFlameWinnerAction } from '@/app/actions';

// ── Word definition ───────────────────────────────────────────────────────────
// FLAMETHROWER split into two visual rows
const ROW1 = 'FLAME'.split('');    // indices 0-4
const ROW2 = 'THROWER'.split(''); // indices 5-11
const WORD_LETTERS = [...ROW1, ...ROW2]; // 12 letters total

// 10 unique token letters from tokenkey
const TOKEN_LETTERS = ['F', 'L', 'A', 'M', 'E', 'T', 'H', 'R', 'O', 'W'];

const TILE_SIZE = 52;

function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

// ── Random position in the "field" area (below the slot rows) ────────────────
function randomPos(fieldW: number, fieldH: number) {
  return {
    x: Math.random() * Math.max(fieldW - TILE_SIZE - 8, 1) + 4,
    y: Math.random() * Math.max(fieldH - TILE_SIZE - 8, 1) + 4,
  };
}

interface Tile { id: number; letter: string; x: number; y: number; }
interface Slot { filledBy: number | null; }

export default function FlamePage() {
  const fieldRef = useRef<HTMLDivElement>(null);
  const [fieldDims, setFieldDims] = useState({ w: 295, h: 400 });
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<Slot[]>(() => WORD_LETTERS.map(() => ({ filledBy: null })));
  const [fixed, setFixed] = useState<Set<number>>(() => new Set());  // tile ids locked in slots
  const [teamName, setTeamName] = useState('Jullie team');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winRank, setWinRank] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState(false);

  const nextId = useRef(0);
  const drag = useRef<{ id: number; ox: number; oy: number } | null>(null);

  // ── Read team name ────────────────────────────────────────────────────────
  useEffect(() => {
    setTeamName(localStorage.getItem('escaperoomTeamName') ?? 'Jullie team');
  }, []);

  // ── Measure field and spawn initial tiles ────────────────────────────────
  useEffect(() => {
    function measure() {
      if (!fieldRef.current) return;
      const r = fieldRef.current.getBoundingClientRect();
      if (r.width > 50) setFieldDims({ w: r.width, h: r.height });
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (fieldRef.current) ro.observe(fieldRef.current);
    return () => ro.disconnect();
  }, []);

  // Spawn once per field width
  const spawned = useRef(false);
  useEffect(() => {
    if (spawned.current || fieldDims.w < 50) return;
    spawned.current = true;
    setTiles(
      TOKEN_LETTERS.map(letter => {
        const pos = randomPos(fieldDims.w, fieldDims.h);
        return { id: nextId.current++, letter, x: pos.x, y: pos.y };
      })
    );
  }, [fieldDims.w]);

  // ── Reset all — called on wrong drop ─────────────────────────────────────
  const resetAll = useCallback(() => {
    playSound('/sounds/wrong.mp3');
    setFixed(new Set());
    setSlots(WORD_LETTERS.map(() => ({ filledBy: null })));
    // Return every non-fixed tile to a new random position
    // rebuild from the unique TOKEN_LETTERS (remove duplicates spawned for E/R)
    setTiles(
      TOKEN_LETTERS.map(letter => {
        const pos = randomPos(fieldDims.w, fieldDims.h);
        return { id: nextId.current++, letter, x: pos.x, y: pos.y };
      })
    );
  }, [fieldDims]);

  // ── Spawn duplicate tile for letters that appear twice in the word ────────
  const spawnExtra = useCallback((letter: string) => {
    const pos = randomPos(fieldDims.w, fieldDims.h);
    setTiles(prev => [...prev, { id: nextId.current++, letter, x: pos.x, y: pos.y }]);
  }, [fieldDims]);

  // ── Slot geometry: each row is centered independently ────────────────────
  // Slot row rendered as flexbox in JSX — hit-test reads DOM rects
  const slotsRef = useRef<(HTMLDivElement | null)[]>([]);

  function getHitSlot(cx: number, cy: number): number {
    // cx/cy are relative to fieldRef
    const fieldRect = fieldRef.current?.getBoundingClientRect();
    if (!fieldRect) return -1;
    for (let i = 0; i < WORD_LETTERS.length; i++) {
      const el = slotsRef.current[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      // Convert to field-relative coords
      const sx = r.left - fieldRect.left;
      const sy = r.top - fieldRect.top;
      const PAD = 16;
      if (
        cx >= sx - PAD && cx <= sx + r.width + PAD &&
        cy >= sy - PAD && cy <= sy + r.height + PAD
      ) return i;
    }
    return -1;
  }

  // ── Pointer handlers ──────────────────────────────────────────────────────
  const onTileDown = useCallback((e: React.PointerEvent, id: number) => {
    if (fixed.has(id)) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    const el = e.currentTarget as HTMLElement;
    const fieldRect = fieldRef.current!.getBoundingClientRect();
    drag.current = {
      id,
      ox: e.clientX - fieldRect.left - parseFloat(el.style.left || '0'),
      oy: e.clientY - fieldRect.top  - parseFloat(el.style.top  || '0'),
    };
  }, [fixed]);

  const onFieldMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const fieldRect = fieldRef.current!.getBoundingClientRect();
    const x = e.clientX - fieldRect.left - drag.current.ox;
    const y = e.clientY - fieldRect.top  - drag.current.oy;
    const { id } = drag.current;
    setTiles(prev => prev.map(t => t.id === id ? { ...t, x, y } : t));
  }, []);

  const onTileUp = useCallback((e: React.PointerEvent, id: number) => {
    if (!drag.current || drag.current.id !== id) return;
    drag.current = null;

    const tile = tiles.find(t => t.id === id);
    if (!tile) return;

    const fieldRect = fieldRef.current!.getBoundingClientRect();
    // center of tile in field coords
    const cx = tile.x + TILE_SIZE / 2;
    const cy = tile.y + TILE_SIZE / 2;
    const hitIdx = getHitSlot(cx, cy);

    if (hitIdx === -1) {
      // Missed all slots — just stays where dropped, no penalty
      return;
    }

    const expected = WORD_LETTERS[hitIdx];
    const alreadyFilled = slots[hitIdx].filledBy !== null;

    if (tile.letter === expected && !alreadyFilled) {
      // ✅ Correct
      playSound('/sounds/right.mp3');

      // Snap tile to slot position
      const slotEl = slotsRef.current[hitIdx];
      if (slotEl) {
        const sr = slotEl.getBoundingClientRect();
        const fr = fieldRef.current!.getBoundingClientRect();
        const snapX = sr.left - fr.left + (sr.width - TILE_SIZE) / 2;
        const snapY = sr.top  - fr.top  + (sr.height - TILE_SIZE) / 2;
        setTiles(prev => prev.map(t => t.id === id ? { ...t, x: snapX, y: snapY } : t));
      }

      setFixed(prev => new Set(prev).add(id));
      const newSlots = slots.map((s, i) => i === hitIdx ? { filledBy: id } : s);
      setSlots(newSlots);

      // Duplicate needed? (E or R appear twice)
      const neededCount = WORD_LETTERS.filter(l => l === tile.letter).length;
      const nowFilled = newSlots.filter(s => {
        const ft = tiles.find(t2 => t2.id === s.filledBy);
        return ft?.letter === tile.letter;
      }).length + 1; // +1 for current
      if (neededCount > nowFilled) {
        setTimeout(() => spawnExtra(tile.letter), 250);
      }

      // Win check
      const allFilled = newSlots.every(s => s.filledBy !== null);
      if (allFilled) {
        playSound('/sounds/right.mp3');
        const stored = localStorage.getItem('escaperoomTeamName') ?? '';
        markFlameWinnerAction(stored).then(res => {
          setWinRank(res.rank ?? null);
          setShowWinPopup(true);
        });
      }
    } else {
      // ❌ Wrong slot or already filled → reset everything
      resetAll();
    }
  }, [tiles, slots, fixed, spawnExtra, resetAll]);

  // ── Winner → video ────────────────────────────────────────────────────────
  const handleWinOk = () => {
    setShowWinPopup(false);
    setTimeout(() => setPlayingVideo(true), 300);
  };

  const filledCount = slots.filter(s => s.filledBy !== null).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PlayerChrome backgroundImage="/purple.jpg" wrapWithActionContainer={false}>

      {/* Full-screen video finale */}
      {playingVideo && (
        <div className="absolute inset-0 z-50 bg-black">
          <video
            autoPlay
            playsInline
            className="h-full w-full object-cover"
            onEnded={() => { window.location.href = '/watzullenwe'; }}
          >
            <source src="/videos/watzullenwe.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="player-view relative flex flex-col h-full w-full min-h-0">

        {/* ── HEADING ── */}
        <div className="relative z-10 text-center pt-4 pb-2 px-4 flex-shrink-0 bg-black/40">
          <h1 className="tk-h1" style={{ fontSize: '1.25rem' }}>Sleep de letters op de juiste plek</h1>
          {/* Progress bar */}
          <div className="tk-progress-bar-wrap mt-2">
            <div className="tk-progress-bar-fill" style={{ width: `${(filledCount / WORD_LETTERS.length) * 100}%` }} />
          </div>
          <p className="tk-progress-label mt-1">{filledCount} / {WORD_LETTERS.length}</p>
        </div>

        {/* ── SLOT ROWS (action_container) ─────────────────────────────────── */}
        <div className="action_container relative z-10 flex-shrink-0" style={{ height: 'auto', maxHeight: 'none', marginTop: 0, flex: '0 0 auto' }}>
          <div className="flex flex-col gap-2 w-full items-center py-3">

            {/* Row 1: FLAME */}
            <div className="flex gap-[5px] justify-center">
              {ROW1.map((letter, i) => {
                const slotIdx = i; // 0-4
                const filled = slots[slotIdx].filledBy !== null;
                return (
                  <div
                    key={`r1-${i}`}
                    ref={el => { slotsRef.current[slotIdx] = el; }}
                    className={`flame-slot ${filled ? 'flame-slot--filled' : ''}`}
                    style={{ width: 46, height: 46 }}
                  >
                    {filled && <span className="flame-slot-letter">{letter}</span>}
                  </div>
                );
              })}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2 w-full px-6">
              <div className="flex-1 h-px bg-white/30" />
              <span className="tk-progress-label text-white/60 text-xs">—</span>
              <div className="flex-1 h-px bg-white/30" />
            </div>

            {/* Row 2: THROWER */}
            <div className="flex gap-[5px] justify-center">
              {ROW2.map((letter, i) => {
                const slotIdx = ROW1.length + i; // 5-11
                const filled = slots[slotIdx].filledBy !== null;
                return (
                  <div
                    key={`r2-${i}`}
                    ref={el => { slotsRef.current[slotIdx] = el; }}
                    className={`flame-slot ${filled ? 'flame-slot--filled' : ''}`}
                    style={{ width: 46, height: 46 }}
                  >
                    {filled && <span className="flame-slot-letter">{letter}</span>}
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* ── DRAG FIELD (letters float here) ──────────────────────────────── */}
        <div
          ref={fieldRef}
          className="relative flex-1 min-h-0 z-10"
          style={{ touchAction: 'none' }}
          onPointerMove={onFieldMove}
        >
          {tiles.map(tile => (
            <div
              key={tile.id}
              className="flame-tile"
              style={{
                position: 'absolute',
                left: tile.x,
                top: tile.y,
                width: TILE_SIZE,
                height: TILE_SIZE,
                zIndex: fixed.has(tile.id) ? 5 : 20,
                touchAction: 'none',
                userSelect: 'none',
                opacity: fixed.has(tile.id) ? 0 : 1, // hide fixed tile in field (shown in slot)
                pointerEvents: fixed.has(tile.id) ? 'none' : 'auto',
              }}
              onPointerDown={e => onTileDown(e, tile.id)}
              onPointerUp={e => onTileUp(e, tile.id)}
            >
              {tile.letter}
            </div>
          ))}
        </div>

      </div>

      {/* ── WIN POPUP ── */}
      {showWinPopup && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65">
          <div className="player-view ge-popup-yellow" style={{ maxWidth: 280, margin: 'auto' }}>
            <p className="ge-popup__title">Jullie zijn de winnaar! 🏆</p>
            {winRank && (
              <p className="ge-popup__meta">
                {winRank === 1 ? '🥇 Eerste plek!' : winRank === 2 ? '🥈 Tweede plek!' : `🥉 Plek ${winRank}`}
              </p>
            )}
            <p className="ge-popup__message mt-2">
              {teamName} heeft FLAMETHROWER gekraakt!
            </p>
            <button className="ge-popup__ok" onClick={handleWinOk}>OK</button>
          </div>
        </div>
      )}

    </PlayerChrome>
  );
}
