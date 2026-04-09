'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import PlayerChrome from '@/components/PlayerChrome';
import { fetchTeamProgress } from '../../lib/pb';

const LOCATIONS = [
  { id: 1, slug: 'blokker', icon: '/driehoek.png' },
  { id: 2, slug: 'boek', icon: '/boek.png' },
  { id: 3, slug: 'electro', icon: '/electro.png' },
  { id: 4, slug: 'lijst', icon: '/film.png' },
  { id: 5, slug: 'kerk', icon: '/kerk.png' },
  { id: 6, slug: 'brug', icon: '/brug.png' },
  { id: 7, slug: 'count', icon: '/calculator.png' },
  { id: 8, slug: 'gall', icon: '/coctail.png' },
  { id: 9, slug: 'drog', icon: '/expiriment.png' },
];

export default function ChallengeSelection() {
  const [playedLocations, setPlayedLocations] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    async function initTeamProgress() {
      try {
        const progress = await fetchTeamProgress('team_alpha');
        setPlayedLocations(progress.playedLocations || []);
      } catch (err) {
        console.error('Failed to load team progress from PB', err);
      }
      setMounted(true);
    }

    initTeamProgress();
  }, []);

  if (!mounted) return null;

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg">
      <div className="h-[10%] w-full shrink-0" />
      <div className="h-[20%] w-full shrink-0" />
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start pt-2 text-center">
        <h2 className="text-3xl font-medium tracking-tight text-gray-800 drop-shadow-sm">Kies je uitdaging</h2>
        <div className="h-14 w-full shrink-0" />
        <div className="mx-auto w-[calc(100%-10px)] max-w-sm">
          <div className="grid grid-cols-3 gap-3">
            {LOCATIONS.map((loc) => {
              const isPlayed = playedLocations.includes(loc.slug);

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    if (!isPlayed) {
                      window.location.href = `/${loc.slug}`;
                    }
                  }}
                  className={`
                    relative flex aspect-square items-center justify-center overflow-hidden border border-gray-800 bg-white p-2 shadow-[0_0_12px_rgba(234,88,12,0.8)] outline-none
                    ${isPlayed ? 'cursor-not-allowed border-gray-400 opacity-40 shadow-none grayscale blur-[1px]' : 'cursor-pointer transition-transform hover:shadow-[0_0_15px_rgba(234,88,12,1)] active:scale-95'}
                  `}
                >
                  <div className="relative h-full w-full scale-[0.85]">
                    <Image src={loc.icon} alt={loc.slug} fill className="object-contain" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
