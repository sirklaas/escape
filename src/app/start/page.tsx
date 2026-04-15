'use client';

import { useEffect, useState } from 'react';
import PlayerChrome from '@/components/PlayerChrome';
import { PB_URL } from '@/lib/pb';

/** `/start` — opening splash; next is `/robotvid`. */
export default function StartPage() {
  const [priorityCity, setPriorityCity] = useState<string>('');

  useEffect(() => {
    const loadPriorityCity = async () => {
      try {
        const res = await fetch('/api/dashboard/session', { cache: 'no-store' });
        if (res.ok) {
          const payload = await res.json();
          const city = payload?.session?.city;
          if (typeof city === 'string' && city.trim()) {
            setPriorityCity(city.trim());
            return;
          }
        }
      } catch {
        // Fall through to direct PB lookup.
      }

      try {
        // Fallback: read active game directly from PocketBase (priority=1).
        const res = await fetch(
          `${PB_URL}/api/collections/escape_game_data/records?perPage=1&filter=priority%3D1&sort=-updated`,
          { cache: 'no-store' },
        );
        if (!res.ok) return;
        const payload = await res.json();
        const city = payload?.items?.[0]?.city;
        if (typeof city === 'string' && city.trim()) {
          setPriorityCity(city.trim());
        }
      } catch {
        // Non-blocking UI enhancement; keep start page usable if lookup fails.
      }
    };

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('resume') === 'puzzle122') {
      window.location.replace('/vulin');
    }

    void loadPriorityCity();
  }, []);

  const renderText = (str: string = '') => {
    return str.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i !== str.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const displayCity = (priorityCity || 'Onbekende Stad')
    .toLowerCase()
    .replace(/\b\p{L}/gu, (char) => char.toUpperCase());

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
            <div className="mt-3 flex shrink-0 justify-center px-4">
              <h1 className="ge-h1 text-[#003566]">{displayCity}</h1>
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
