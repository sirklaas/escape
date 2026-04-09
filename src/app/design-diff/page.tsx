'use client';

import PlayerChrome from '@/components/PlayerChrome';

/**
 * Lab: `/design-diff` — mirrors escapedesign/variants.html under real player chrome.
 */
export default function DesignDiffPage() {
  return (
    <PlayerChrome
      backgroundImage="/Escapebackdrop.jpg"
      actionContainerClassName="action-container--lab scrollbar-hide"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-8 py-2 text-center">
        <div>
          <h1 className="ge-h1">variants.html parity</h1>
          <p className="ge-body mt-2 text-pretty opacity-90">
            Pills and popups match <code className="text-[0.9em]">escapedesign/variants.html</code>.
          </p>
        </div>

        <section className="flex flex-col gap-3" aria-labelledby="pill-heading">
          <h2 id="pill-heading" className="ge-body font-semibold text-[var(--ge-navy)]">
            button_blue / button_yellow / button_red
          </h2>
          <div className="flex flex-col items-center gap-4">
            <button type="button" className="ge-btn-blue ge-btn-blue--foot">
              Ik ben er
            </button>
            <button type="button" className="ge-btn-yellow ge-btn-yellow--foot">
              Yes die hebben we
            </button>
            <button type="button" className="ge-btn-red ge-btn-red--foot">
              Gauw de volgende doen
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-6 pb-16" aria-labelledby="popup-heading">
          <h2 id="popup-heading" className="ge-body font-semibold text-[var(--ge-navy)]">
            popup_yellow / popup_red
          </h2>
          <p className="ge-body text-pretty text-sm opacity-80">
            Same structure as variants: title, meta, circular OK (navy disc).
          </p>
          <div className="mx-auto w-full max-w-[280px]">
            <div className="ge-popup-yellow" role="dialog" aria-labelledby="diff-py-title">
              <p id="diff-py-title" className="ge-popup__title">
                Geweldig gedaan!
              </p>
              <p className="ge-popup__meta">Tijd: 120 s</p>
              <button type="button" className="ge-popup__ok" aria-label="Sluiten">
                OK
              </button>
            </div>
          </div>
          <div className="mx-auto w-full max-w-[280px]">
            <div className="ge-popup-red" role="dialog" aria-labelledby="diff-pr-title">
              <p id="diff-pr-title" className="ge-popup__title">
                Geweldig gedaan!
              </p>
              <p className="ge-popup__meta">Tijd: 120 s</p>
              <button type="button" className="ge-popup__ok" aria-label="Sluiten">
                OK
              </button>
            </div>
          </div>
        </section>
      </div>
    </PlayerChrome>
  );
}
