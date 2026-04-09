'use client';

import PlayerChrome from '@/components/PlayerChrome';

export default function FlamePage() {
  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col p-0">
        <div className="ge-intro-inner flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-full min-h-0 flex-1 flex-col pt-[1.35rem] text-center">
            <div className="flex shrink-0 justify-center">
              <img
                src="/EscapeLogobadge.png"
                alt=""
                width={196}
                height={189}
                className="h-[189px] w-[196px] object-contain drop-shadow-md"
              />
            </div>
            <div className="action_container min-h-0 flex-1 overflow-hidden pt-4">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
                <h1 className="ge-h1">De Vlam</h1>
                <div className="ge-body flex flex-col gap-4 text-pretty font-medium text-white/90">
                  <p>
                    De vlam van de vrijheid brandt weer! Jullie hebben de stad gered van de ondergang.
                  </p>
                  <p>
                    Kijk nu goed om je heen. De finale is ingezet.
                  </p>
                </div>
              </div>
              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/eindscore';
                  }}
                  className="ge-btn-blue ge-btn-blue--foot"
                >
                  BEKIJK SCORE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
