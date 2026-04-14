'use client';

import { useEffect } from 'react';
import PlayerChrome from '@/components/PlayerChrome';

/** `/start` — opening splash; next is `/robotvid`. */
export default function StartPage() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'puzzle122') {
      window.location.replace('/vulin');
    }
  }, []);

  const renderText = (str: string = '') => {
    return str.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== str.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <PlayerChrome backgroundImage="" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-0">
        <div className="ge-intro-inner flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-full min-h-0 flex-1 flex-col pt-[1.35rem] text-center">
            <div className="flex shrink-0 justify-center">
              <img
                src="/EscapeLogobadge.png"
                alt="Escape Room Logo"
                width={150}
                height={132}
                className="h-[132px] w-[150px] object-contain drop-shadow-md"
              />
            </div>
            <div className="action_container min-h-0 flex-1 overflow-hidden pt-4">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
                <h1 className="ge-h1">{renderText('Ontcijfer de code\nen stop Bad Elon')}</h1>
                <p className="ge-body text-pretty">
                  {renderText(
                    `Want hij heeft een plan: robots aan de\u00A0macht, mensen op de bank en hijzelf op de\u00A0twittertroon.

Zijn zwakte? Hij verstopt altijd een geheime code ergens.
Gelukkig zijn jullie hier. Met jullie brainpower en een beetje teamwork gaan jullie deze megalomane miljardair een lesje leren.

De wereld rekent op jullie.`,
                  )}
                  <br />
                  <span className="font-normal">Geen druk. Echt niet. 😅</span>
                </p>
              </div>
              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/robotvid';
                  }}
                  className="ge-btn-yellow ge-btn-yellow--foot"
                >
                  OK Let&apos;s do this!
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
