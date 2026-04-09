'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerChrome from '@/components/PlayerChrome';
import { markFlameWinnerAction } from '@/app/actions';

// ── Word definition ───────────────────────────────────────────────────────────
const ROW1 = 'FLAME'.split('');    // indices 0-4
const ROW2 = 'THROWER'.split(''); // indices 5-11
const WORD_LETTERS = [...ROW1, ...ROW2]; // 12 letters total

// 10 unique token letters
const TOKEN_LETTERS = ['F', 'L', 'A', 'M', 'E', 'T', 'H', 'R', 'O', 'W'];

function playSound(src: string) {
  try { new Audio(src).play().catch(() => {}); } catch {}
}

interface Tile { id: number; letter: string; x: number; y: number; }
interface Slot { filledBy: number | null; }

export default function FlamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [dims, setDims] = useState({ w: 300, h: 500 });
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [slots, setSlots] = useState<Slot[]>(() => WORD_LETTERS.map(() => ({ filledBy: null })));
  const [fixed, setFixed] = useState<Set<number>>(new Set());
  const [teamName, setTeamName] = useState('Jullie team');
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winRank, setWinRank] = useState<number | null>(null);
  const [playingVideo, setPlayingVideo] = useState(false);

  const nextId = useRef(0);
  const drag = useRef<{ id: number; ox: number; oy: number; tileW: number } | null>(null);
  const spawned = useRef(false);

  /**
   * SQUARE_SIZE optimized for mobile viewports.
   * On 375px screens, action_container width is 335px.
   * 36 * 7 (letters) + 6 * 4px (gaps) = 252 + 24 = 276px.
   * This leaves ~30px on each side for total safety.
   */
  const SQUARE_SIZE = 36;

  useEffect(() => {
    setTeamName(localStorage.getItem('escaperoomTeamName') ?? 'Jullie team');
  }, []);

  useEffect(() => {
    const measure = () => {
      if (!containerRef.current) return;
      const r = containerRef.current.getBoundingClientRect();
      if (r.width > 50) setDims({ w: r.width, h: r.height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const getRandomPos = (w: number, h: number) => {
    const spawnTopLimit = h * 0.45;
    return {
      x: Math.random() * (w - SQUARE_SIZE - 20) + 10,
      y: spawnTopLimit + Math.random() * (h - spawnTopLimit - SQUARE_SIZE - 40),
    };
  };

  useEffect(() => {
    if (spawned.current || dims.w < 50) return;
    spawned.current = true;
    setTiles(TOKEN_LETTERS.map(letter => {
      const pos = getRandomPos(dims.w, dims.h);
      return { id: nextId.current++, letter, x: pos.x, y: pos.y };
    }));
  }, [dims]);

  const resetAll = useCallback(() => {
    playSound('/sounds/wrong.mp3');
    setFixed(new Set());
    setSlots(WORD_LETTERS.map(() => ({ filledBy: null })));
    setTiles(TOKEN_LETTERS.map(letter => {
      const pos = getRandomPos(dims.w, dims.h);
      return { id: nextId.current++, letter, x: pos.x, y: pos.y };
    }));
  }, [dims]);

  const spawnExtra = useCallback((letter: string) => {
    const pos = getRandomPos(dims.w, dims.h);
    setTiles(prev => [...prev, { id: nextId.current++, letter, x: pos.x, y: pos.y }]);
  }, [dims]);

  const getHitSlot = (cx: number, cy: number) => {
    for (let i = 0; i < WORD_LETTERS.length; i++) {
        const el = slotsRef.current[i];
        if (!el || !containerRef.current) continue;
        const r = el.getBoundingClientRect();
        const cr = containerRef.current.getBoundingClientRect();
        const sx = r.left - cr.left;
        const sy = r.top - cr.top;
        if (cx >= sx - 10 && cx <= sx + r.width + 10 && cy >= sy - 10 && cy <= sy + r.height + 10) return i;
    }
    return -1;
  };

  const onTileDown = (e: React.PointerEvent, id: number) => {
    if (fixed.has(id)) return;
    e.preventDefault();
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    const cr = containerRef.current!.getBoundingClientRect();
    const t = tiles.find(tile => tile.id === id)!;
    drag.current = { id, ox: e.clientX - cr.left - t.x, oy: e.clientY - cr.top - t.y, tileW: el.offsetWidth };
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const cr = containerRef.current!.getBoundingClientRect();
    let x = e.clientX - cr.left - drag.current.ox;
    let y = e.clientY - cr.top - drag.current.oy;
    x = Math.max(0, Math.min(x, dims.w - drag.current.tileW));
    y = Math.max(0, Math.min(y, dims.h - drag.current.tileW));
    setTiles(prev => prev.map(t => t.id === drag.current!.id ? { ...t, x, y } : t));
  };

  const onTileUp = (e: React.PointerEvent, id: number) => {
    if (!drag.current || drag.current.id !== id) return;
    const { tileW } = drag.current;
    drag.current = null;
    const tile = tiles.find(t => t.id === id)!;
    const cr = containerRef.current!.getBoundingClientRect();
    const hitIdx = getHitSlot(tile.x + tileW / 2, tile.y + tileW / 2);

    if (hitIdx !== -1 && tile.letter === WORD_LETTERS[hitIdx] && slots[hitIdx].filledBy === null) {
      playSound('/sounds/right.mp3');
      const r = slotsRef.current[hitIdx]!.getBoundingClientRect();
      const snapX = r.left - cr.left + (r.width - tileW) / 2;
      const snapY = r.top - cr.top + (r.height - tileW) / 2;
      setTiles(prev => prev.map(t => t.id === id ? { ...t, x: snapX, y: snapY } : t));
      setFixed(prev => new Set(prev).add(id));
      const newSlots = slots.map((s, i) => i === hitIdx ? { filledBy: id } : s);
      setSlots(newSlots);
      if (WORD_LETTERS.filter(l => l === tile.letter).length > newSlots.filter(s => tiles.find(t2 => t2.id === s.filledBy)?.letter === tile.letter).length) {
        setTimeout(() => spawnExtra(tile.letter), 300);
      }
      if (newSlots.every(s => s.filledBy !== null)) {
        markFlameWinnerAction(localStorage.getItem('escaperoomTeamName') ?? '').then(res => {
          setWinRank(res.rank ?? null);
          setShowWinPopup(true);
        });
      }
    } else if (hitIdx !== -1) resetAll();
  };

  return (
    <PlayerChrome backgroundImage="/purple.jpg" wrapWithActionContainer={false}>
      {playingVideo && (
        <div className="absolute inset-0 z-50 bg-black">
          <video autoPlay playsInline className="h-full w-full object-cover" onEnded={() => { window.location.href = '/watzullenwe'; }}>
            <source src="/videos/watzullenwe.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="relative flex h-full w-full flex-col min-h-0 overflow-hidden">
        
        <div className="flex shrink-0 justify-center pt-[1.35rem]">
          <img src="/EscapeLogobadge.png" alt="" width={150} height={132} className="h-[132px] w-[150px] object-contain drop-shadow-md" />
        </div>

        <div 
          ref={containerRef}
          className="action_container min-h-0 flex-1 overflow-hidden pt-4" 
          style={{ height: '60cqh', maxHeight: '60cqh', marginTop: 'auto', border: '1px solid black', touchAction: 'none' }}
          onPointerMove={onMove}
        >
          <div className="pointer-events-none flex flex-col items-center gap-6 w-full pt-2 flex-1">
            <h1 className="ge-h1 text-white text-center leading-tight">Sleep de letters op de juiste plek</h1>

            <div className="flex flex-col gap-2 items-center w-full px-2 pointer-events-auto">
              {/* Row 1: FLAME */}
              <div className="flex gap-1 items-center justify-center w-full">
                {ROW1.map((letter, i) => (
                  <div key={`r1-${i}`} ref={el => { slotsRef.current[i] = el; }} className={`flame-slot ${slots[i].filledBy !== null ? 'flame-slot--filled' : ''}`} style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}>
                    {slots[i].filledBy !== null && <span className="flame-slot-letter text-[1rem]">{letter}</span>}
                  </div>
                ))}
              </div>

              <div className="flex w-full items-center gap-2 px-10 opacity-20"><div className="h-px flex-1 bg-white" /></div>

              {/* Row 2: THROWER (Reduced to 36px to GUARANTEE it fits) */}
              <div className="flex gap-1 items-center justify-center w-full">
                {ROW2.map((letter, i) => (
                  <div key={`r2-${i}`} ref={el => { slotsRef.current[i + 5] = el; }} className={`flame-slot ${slots[i + 5].filledBy !== null ? 'flame-slot--filled' : ''}`} style={{ width: SQUARE_SIZE, height: SQUARE_SIZE }}>
                    {slots[i + 5].filledBy !== null && <span className="flame-slot-letter text-[1rem]">{letter}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Draggable tiles */}
          {tiles.map(tile => (
            <div key={tile.id} className="flame-tile" style={{ position: 'absolute', left: tile.x, top: tile.y, width: SQUARE_SIZE, height: SQUARE_SIZE, zIndex: fixed.has(tile.id) ? 5 : 20, touchAction: 'none', opacity: fixed.has(tile.id) ? 0 : 1, fontSize: '1rem' }} onPointerDown={e => onTileDown(e, tile.id)} onPointerUp={e => onTileUp(e, tile.id)}>{tile.letter}</div>
          ))}

          <div className="shrink-0 pointer-events-none pb-2 mt-auto">
            <p className="tk-progress-label text-[#808080] uppercase tracking-widest text-[10px]">
              {slots.filter(s => s.filledBy !== null).length} / 12 letters op de plek
            </p>
          </div>
        </div>
      </div>

      {showWinPopup && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 p-6">
          <div className="ge-popup-yellow flex flex-col items-center p-8 text-center" style={{ width: 280, minHeight: 200, borderRadius: 40 }}>
            <p className="ge-popup__title">Jullie zijn de winnaar! 🏆</p>
            {winRank && <p className="ge-popup__meta">{winRank === 1 ? '🥇 1e Plek!' : winRank === 2 ? '🥈 2e Plek!' : `${winRank}e Plek`}</p>}
            <p className="ge-popup__message mt-2 mb-6">{teamName} heeft de code gekraakt!</p>
            <button className="ge-popup__ok" onClick={() => { window.location.href = '/watzullenwe'; }}>OK</button>
          </div>
        </div>
      )}
    </PlayerChrome>
  );
}
