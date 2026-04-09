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
    <PlayerChrome backgroundImage="/purple.jpg" wrapWithActionContainer={false}>
      {/* 
        The background image is supplied by PhoneWrapper (wrapped by PlayerChrome).
        We ensure this container is transparent and fills the viewport.
      */}
      <div 
        className="relative z-10 flex h-full min-h-0 flex-col cursor-pointer bg-transparent"
        onClick={handleManualPlay}
      >
        <audio 
          ref={audioRef}
          src="/sounds/Lawineboys.m4a" 
          autoPlay 
          loop 
        />

        {/* 
          Force the content into the bottom 70% action safe-area.
          We use ge-intro-inner as an optional backdrop if the main image fails to load,
          ensuring the experience never looks like a "white blank page".
        */}
        <div className="action_container flex flex-col items-center justify-center p-6" style={{ height: '70cqh', maxHeight: '70cqh', marginTop: 'auto', backgroundColor: 'transparent' }}>
          
          <div className="flex flex-col gap-8 text-center items-center py-8">
            <h1 className="ge-h1 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-5xl font-bold leading-tight">
              We are the WINNERS !
            </h1>
            
            <button
              type="button"
              className="ge-btn-yellow shadow-[0_10px_30px_rgba(0,0,0,0.3)] transform transition-transform active:scale-95"
              style={{ padding: '16px 32px', fontSize: '1.1rem' }}
              onClick={(e) => {
                e.stopPropagation();
                alert('Gegevens zijn vastgelegd in de database!');
              }}
            >
              Leg dit vast in de database
            </button>

            <div className="ge-body flex flex-col gap-4 text-pretty font-medium text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-lg opacity-90 pb-10">
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
    </PlayerChrome>
  );
}
