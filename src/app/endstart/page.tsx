'use client';

import PlayerChrome from '@/components/PlayerChrome';

/** `/endstart` — finale splash (end-atlas entry); CTA → `/tokenkey` (grid only; no duplicate intro). */
export default function EndStartPage() {
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
        {/* `overflow-y-auto` + `min-h-0`: logo + 65cqh card can exceed the shell; hidden overflow was clipping the Start CTA. */}
        <div className="ge-intro-inner flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col pt-[1.35rem] text-center">
            <div className="flex shrink-0 justify-center">
              <img
                src="/EscapeLogobadge.png"
                alt="Escape Room Logo"
                width={150}
                height={132}
                className="h-[132px] w-[150px] object-contain drop-shadow-md"
              />
            </div>
            <div className="action_container min-h-0 min-w-0 flex-1 pt-4">
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
                <h1 className="ge-h1">Nog 1 hindernis te gaan</h1>
                <div className="ge-body text-pretty">
                  {renderText(
                    'Jullie hebben 10 tokens gevonden onderweg.\nDeze gaan jullie nu gebruiken.\n\nDoe je best!',
                  )}
                </div>
              </div>
              <div className="pointer-events-auto relative z-30 mt-auto flex w-full shrink-0 flex-col items-center pt-4 pb-1">
                <button
                  type="button"
                  onClick={() => { window.location.href = '/tokenkey'; }}
                  className="ge-btn-yellow ge-btn-yellow--foot touch-manipulation"
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
