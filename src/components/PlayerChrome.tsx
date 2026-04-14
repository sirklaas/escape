'use client';

import IntroFlowDevNav from '@/components/IntroFlowDevNav';

type PlayerChromeProps = {
  children: React.ReactNode;
  backgroundImage?: string;
  className?: string;
  /**
   * When false, the page supplies its own `action_container` region(s) (e.g. intro with per-step columns).
   * When true (default), one scroll column wraps all children.
   */
  wrapWithActionContainer?: boolean;
  actionContainerClassName?: string;
};

export default function PlayerChrome({
  children,
  backgroundImage,
  className = '',
  wrapWithActionContainer = true,
  actionContainerClassName = '',
}: PlayerChromeProps) {
  return (
    <div className={`min-h-[100dvh] bg-gray-100 flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 overflow-auto ${className}`}>
      {/*
        Shell width/height: always cap to real-phone-class max (§2.1).
        Below `md`, old `w-full` made ~716px windows a giant "phone"; use min(100%, --ge-canvas-max-w).
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
            <div className="player-view relative z-10 flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden">
              {wrapWithActionContainer ? (
                <div className={`action_container min-h-0 flex-1 ${actionContainerClassName}`.trim()}>{children}</div>
              ) : (
                children
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dev navigation - shows slug name and Previous/Next buttons under the phone */}
      <IntroFlowDevNav />
    </div>
  );
}
