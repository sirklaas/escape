'use client';

import PlayerChrome from '@/components/PlayerChrome';

/** Mission briefing after `/players`; next is `/video122`. */
export default function UitlegPage() {
  return (
    <PlayerChrome backgroundImage="/Escapebackdrop.jpg" wrapWithActionContainer={false}>
      <div className="relative z-10 flex h-full min-h-0 w-full flex-1 flex-col pt-4 text-center animate-in fade-in duration-1000">
        <div className="action_container scrollbar-hide min-h-0 flex-1 overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
            <div className="flex flex-col gap-2 pt-2">
              <h1 className="ge-h1">
                Bad Elon heeft een plan <br />
                <span className="ge-body mt-1 inline-block font-medium opacity-90">
                  Maar jullie gaan hem stoppen.
                </span>
              </h1>
            </div>

            <div className="mt-6 flex flex-col gap-6">
              <div className="ge-body flex flex-col gap-4 pb-4 text-left font-medium">
                <p>
                  <strong>Wat gaan jullie doen?</strong> Onderweg voeren jullie 9 opdrachten uit. <br />
                  Elke opdracht telt, elke seconde telt … want hoe sneller jullie zijn, hoe hoger de score.
                </p>
                <p>
                  Jullie hebben 90 minuten in totaal. <br />
                  Geen paniek. Waarschijnlijk.
                </p>
                <p>
                  Bij elke goed uitgevoerde opdracht verdienen jullie een <strong>Token 🪙</strong> <br />
                  Bewaar die goed — want ze zijn goud waard. Letterlijk. <br />
                  Het eerste token? Die krijgen jullie zo meteen al bij opdracht één.
                </p>
                <p>
                  In totaal verzamelen jullie <strong>10 Tokens</strong>. <br />
                  Die hebben jullie nodig om de geheime code van 12 letters te kraken en Bad Elon definitief terug naar zijn raket te sturen. 🚀
                </p>
                <p>
                  De klok loopt. De robots naderen. <br />
                  En Bad Elon tweet alweer over zichzelf. Succes! 😅
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto flex w-full shrink-0 flex-col items-center pt-4">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/video122';
              }}
              className="ge-btn-blue ge-btn-blue--foot !max-w-[280px]"
            >
              Klaar voor de start!
            </button>
          </div>
        </div>
      </div>
    </PlayerChrome>
  );
}
