'use client';

import { useState } from 'react';
import PhoneWrapper from '@/components/PhoneWrapper';

type IntroStep = 'START' | 'TEAM' | 'PLAYERS' | 'UITLEG' | 'VIDEO122' | 'PUZZLE122';

export default function IntroPage() {
  const [step, setStep] = useState<IntroStep>('START');
  const [teamName, setTeamName] = useState('');
  const [playerNames, setPlayerNames] = useState<string[]>([]);

  // Function to move to next step
  const nextStep = () => {
    if (step === 'START') setStep('TEAM');
    else if (step === 'TEAM') setStep('PLAYERS');
    else if (step === 'PLAYERS') setStep('UITLEG');
    else if (step === 'UITLEG') setStep('VIDEO122');
    else if (step === 'VIDEO122') setStep('PUZZLE122');
    else if (step === 'PUZZLE122') window.location.href = '/nine';
  };

  return (
    <PhoneWrapper>
      <div className="flex-1 flex flex-col h-full w-full relative z-10 overflow-hidden">
        
        {/* Step 1: START */}
        {step === 'START' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            {/* We will design this together next */}
            <h1 className="text-3xl font-bold text-gray-800">Escape Start</h1>
            <p className="mt-4 text-gray-600">Initial Page Placeholder</p>
            <button 
              onClick={nextStep}
              className="mt-10 px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg"
            >
              Let's do this!
            </button>
          </div>
        )}

        {/* Other steps will be added here one by one */}
        {step === 'TEAM' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold">Teamnaam</h2>
            <button onClick={nextStep} className="mt-4">Next</button>
          </div>
        )}

        {/* Placeholder for steps 3-6... */}
        {['PLAYERS', 'UITLEG', 'VIDEO122', 'PUZZLE122'].includes(step) && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold">{step}</h2>
            <button onClick={nextStep} className="mt-4">Next</button>
          </div>
        )}

      </div>
    </PhoneWrapper>
  );
}
