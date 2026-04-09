'use client';

import PlayerChrome from '@/components/PlayerChrome';

export default function TokenKeyPage() {
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
                <h1 className="ge-h1">De Laatste Sleutel</h1>
                <div className="ge-body flex flex-col gap-4 text-pretty font-medium text-white/90">
                  <p>
                    Jullie zijn er bijna! Voer hier de geheime token in die jullie hebben gevonden.
                  </p>
                  <div className="mt-4 flex flex-col gap-4 px-2">
                    <input
                      type="text"
                      placeholder="Voer code in..."
                      className="w-full h-12 rounded-full px-6 text-center text-[#0d1f4a] font-bold shadow-lg outline-none"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/flame';
                  }}
                  className="ge-btn-yellow ge-btn-yellow--foot"
                >
                  ONTGRENDELEN
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
