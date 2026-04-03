'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
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
          console.error("Failed to load team progress from PB", err);
       }
       setMounted(true);
    }
    
    initTeamProgress();
  }, []);

  if (!mounted) return null; // Hydration safe

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Semi+Condensed:wght@300;400;500;600;800&display=swap');
        body { font-family: 'Barlow Semi Condensed', sans-serif; margin: 0; padding: 0; background: white; overflow: hidden; }
      `}</style>
      
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-10 overflow-auto">
        {/* Fake Phone Frame */}
        <div className="w-full h-[100dvh] md:w-[380px] md:h-[800px] bg-black md:rounded-[60px] md:border-[8px] md:border-zinc-900 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
          <div className="relative flex-1 overflow-hidden flex flex-col h-full" style={{ background: 'white', padding: '20px' }}>
            
            {/* Background Container */}
            <div className="relative flex-1 rounded-[20px] overflow-hidden flex flex-col h-full bg-[#f8f8f8]" style={{ backgroundImage: 'url("/Escapebackdrop.jpg")', backgroundSize: 'cover', backgroundPosition: 'top center', backgroundRepeat: 'no-repeat' }}>
              
              {/* Vertical Grid Segments */}
              <div className="flex-1 flex flex-col h-full w-full relative z-10 overflow-visible">
                 
                 {/* 1. Timer Zone (0 - 10%) */}
                 <div className="h-[10%] w-full" />
                 
                 {/* 2-3. Logo Zone (10 - 30%) - Whitespace for badge */}
                 <div className="h-[20%] w-full" />
                 
                 {/* 4-6. Message Zone (30 - 60%) - Top-Aligned under Logo */}
                 <div className="flex flex-col items-center justify-start pt-2 text-center px-4 w-full">
                    <h2 className="text-3xl text-gray-800 font-medium tracking-tight drop-shadow-sm">Kies je uitdaging</h2>
                    
                    {/* Explicit visual air to protect text descendors */}
                    <div className="h-14 w-full flex-shrink-0" />
                    
                    {/* 3x3 Grid */}
                    <div className="w-[calc(100%-10px)] max-w-sm mx-auto">
                       <div className="grid grid-cols-3 gap-3">
                          {LOCATIONS.map((loc) => {
                             const isPlayed = playedLocations.includes(loc.slug);
                             
                             return (
                                <button
                                  key={loc.id}
                                  onClick={() => {
                                     if (!isPlayed) {
                                        window.location.href = `/${loc.slug}`;
                                     }
                                  }}
                                  className={`
                                    aspect-square bg-white border border-gray-800 shadow-[0_0_12px_rgba(234,88,12,0.8)] 
                                    flex items-center justify-center p-2 relative overflow-hidden outline-none
                                    ${isPlayed ? 'opacity-40 grayscale blur-[1px] cursor-not-allowed shadow-none border-gray-400' : 'active:scale-95 cursor-pointer transition-transform hover:shadow-[0_0_15px_rgba(234,88,12,1)]'}
                                  `}
                                >
                                   <div className="relative w-full h-full scale-[0.85]">
                                     <Image 
                                        src={loc.icon} 
                                        alt={loc.slug} 
                                        fill 
                                        className="object-contain"
                                     />
                                   </div>
                                </button>
                             );
                          })}
                       </div>
                    </div>
                 </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
