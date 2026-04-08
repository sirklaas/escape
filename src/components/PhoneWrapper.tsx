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
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center p-0 md:p-10 overflow-auto ${className}`}>
      {/* Fake Phone Frame */}
      <div className="w-full h-[100dvh] md:w-[380px] md:h-[800px] bg-black md:rounded-[60px] md:border-[8px] md:border-zinc-900 md:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden flex flex-col">
        {/* White Margin (20px) */}
        <div className="relative flex-1 overflow-hidden flex flex-col h-full" style={{ background: 'white', padding: '20px' }}>
          
          {/* Rounded Background Content */}
          <div 
            className="relative flex-1 rounded-[20px] overflow-hidden flex flex-col h-full bg-[#f8f8f8]" 
            style={{ 
              backgroundImage: backgroundImage ? `url("${backgroundImage}")` : 'none', 
              backgroundSize: 'cover', 
              backgroundPosition: 'top center', 
              backgroundRepeat: 'no-repeat' 
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
