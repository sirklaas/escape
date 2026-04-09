'use client';

import React from 'react';

interface PhoneWrapperProps {
  children: React.ReactNode;
  backgroundImage?: string;
  className?: string;
}

export default function PhoneWrapper({ 
  children, 
  backgroundImage = '/Escapebackdrop.jpg',
  className = ""
}: PhoneWrapperProps) {
  return (
    <div className={`min-h-[100dvh] bg-gray-100 flex items-center justify-center p-3 sm:p-6 md:p-10 overflow-auto ${className}`}>
      {/*
        Shell width/height: always cap to real-phone-class max (§2.1).
        Below `md`, old `w-full` made ~716px windows a giant “phone”; use min(100%, --ge-canvas-max-w).
      */}
      <div
        className="relative mx-auto flex h-[min(100dvh,var(--ge-canvas-max-h))] min-h-0 w-full max-w-[min(100%,var(--ge-canvas-max-w))] shrink-0 flex-col overflow-hidden rounded-[2.5rem] border-[6px] border-zinc-900 bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] md:rounded-[60px] md:border-8"
      >
        {/* globaldesign §2.4: `image_container` (+ unclassed inner div = clip / backdrop) */}
        <div className="image_container">
          <div
            style={{
              backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
