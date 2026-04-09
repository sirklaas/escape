'use client';

import PhoneWrapper from '@/components/PhoneWrapper';

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
    <PhoneWrapper backgroundImage={backgroundImage} className={className}>
      <div className="player-view relative z-10 flex h-full w-full min-h-0 flex-1 flex-col overflow-hidden">
        {wrapWithActionContainer ? (
          <div className={`action_container min-h-0 flex-1 ${actionContainerClassName}`.trim()}>{children}</div>
        ) : (
          children
        )}
      </div>
    </PhoneWrapper>
  );
}
