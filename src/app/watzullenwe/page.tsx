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
    // Attempt standard autoplay
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        console.log('Autoplay blocked. Tap anywhere to play.');
      });
    }
  }, []);

  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      {/* 
        Container is transparent to show Escapebackdrop.jpg. 
        Tapping anywhere starts the audio as a fail-safe.
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
          Centered winners' zone within the 70cqh interactive region.
        */}
        <div 
          className="action_container flex flex-col items-center justify-center p-6 bg-transparent" 
          style={{ height: '60cqh', maxHeight: '60cqh', marginTop: 'auto', border: '1px solid black' }}
        >
          
          <div className="flex flex-col gap-8 text-center items-center py-8">
            <h1 className="ge-h1 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] text-5xl font-bold leading-tight">
              We are the WINNERS !
            </h1>
            
            <button
              type="button"
              className="ge-btn-yellow scale-110 shadow-[0_10px_30px_rgba(0,0,0,0.3)] transition-transform active:scale-95"
              style={{ padding: '16px 32px', fontSize: '1.2rem' }}
              onClick={(e) => {
                e.stopPropagation(); // Don't trigger the general div click
                handleManualPlay();   // Play the sound on button click
                alert('Gegevens zijn vastgelegd in de database!');
              }}
            >
              Leg dit vast in de database
            </button>

            <div className="ge-body flex flex-col gap-4 text-pretty font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] text-lg opacity-90 pb-10">
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
