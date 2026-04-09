'use client';

import PlayerChrome from '@/components/PlayerChrome';

/** Pre-missie briefing na `/players` — daarna door naar `/?resume=uitleg`. */
export default function BeginPage() {
  return (
    <PlayerChrome backgroundImage="" wrapWithActionContainer={false}>
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
                <h1 className="ge-h1">We gaan beginnen</h1>
                <div className="ge-body flex flex-col gap-4 text-pretty font-medium">
                  <p>Maar let goed op! In de volgende video zitten de eerste aanwijzingen.</p>
                  <p>
                    Zodra je het weet laat je het aan de Quizmaster zien – maar natuurlijk zonder dat de
                    andere teams het kunnen zien.
                  </p>
                  <p>
                    Als jullie het goed hebben krijgen jullie als eerst een opdracht. De vragen kun je
                    alleen oplossen via deze app. Wees dus nog even geduldig.
                  </p>
                  <p className="font-semibold">Veel succes…</p>
                </div>
              </div>
              <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = '/?resume=uitleg';
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
