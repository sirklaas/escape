'use client';

import PlayerChrome from '@/components/PlayerChrome';

export default function EindscorePage() {
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
                <h1 className="ge-h1">Missie Voltooid!</h1>
                <div className="ge-body flex flex-col gap-4 text-pretty font-medium text-white/90">
                  <p className="text-2xl font-bold text-yellow-400">GEWELDIG GEDAAN</p>
                  <div className="bg-white/10 rounded-2xl p-4 mt-2">
                    <p className="text-sm uppercase tracking-wider opacity-70">Jullie Eindscore</p>
                    <p className="text-4xl font-black">---</p>
                  </div>
                  <div className="bg-white/10 rounded-2xl p-4">
                    <p className="text-sm uppercase tracking-wider opacity-70">Totale Tijd</p>
                    <p className="text-4xl font-black">--:--:--</p>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/watzullenwe';
                  }}
                  className="ge-btn-yellow ge-btn-yellow--foot"
                >
                  WAT NU?
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
