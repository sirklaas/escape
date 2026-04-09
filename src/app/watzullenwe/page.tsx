'use client';

import { useEffect, useRef } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

export default function WatzullenwePage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleManualPlay = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.error("Playback failed", e));
    }
  };

  useEffect(() => {
    // Standard autoplay attempt
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log('Autoplay blocked. Tap anywhere to play.');
      });
    }
  }, []);

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      {/* 
        Clicking anywhere on the screen will trigger the sound 
        if autoplay was blocked.
      */}
      <div 
        className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-0 cursor-pointer"
        onClick={handleManualPlay}
      >
        <audio 
          ref={audioRef}
          src="/sounds/Lawineboys.m4a" 
          autoPlay 
          loop 
        />

        <div className="flex h-full min-h-0 flex-1 flex-col pt-20 text-center">
          
          <div className="action_container min-h-0 flex-1 overflow-hidden" style={{ height: '70cqh', maxHeight: '70cqh', marginTop: 'auto' }}>
            <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-6 justify-center overflow-y-auto px-4">
              <h1 className="ge-h1 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] text-5xl">We are the WINNERS !</h1>
              
              <div className="flex justify-center mt-4">
                <button
                  type="button"
                  className="ge-btn-yellow scale-110 shadow-2xl"
                  onClick={() => {
                    // Placeholder for actual database logging logic if needed
                    alert('Gegevens zijn vastgelegd!');
                  }}
                >
                  Leg dit vast in de database
                </button>
              </div>
              
              <div className="ge-body flex flex-col gap-4 text-pretty font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-xl mt-8">
                <p>
                  De missie zit erop! Tijd om te proosten op de goede afloop.
                </p>
                <p>
                  Geniet van de overwinning!
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PlayerChrome>
  );
}
