import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  TOTAL_ATLAS_STEPS,
  totalAtlasNavHref,
  totalAtlasPhaseColor,
  totalAtlasPhaseLabel,
  type AtlasPhase,
} from '@/lib/total-atlas';

export const dynamic = 'force-dynamic';

function isLocalHost(host: string): boolean {
  const h = host.split(',')[0].trim().split(':')[0].toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

async function totalAtlasAllowed(): Promise<boolean> {
  if (process.env.SCREEN_ATLAS === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;
  const host = (await headers()).get('host') ?? '';
  return isLocalHost(host);
}

const btnBase =
  'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800';

function PhaseBadge({ phase }: { phase: AtlasPhase }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${totalAtlasPhaseColor(
        phase
      )}`}
    >
      {totalAtlasPhaseLabel(phase)}
    </span>
  );
}

export default async function TotalAtlasPage() {
  if (!(await totalAtlasAllowed())) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-white">
              DEV
            </span>
            <h1 className="text-2xl font-semibold tracking-tight">
              Total Game Atlas
            </h1>
          </div>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Complete game flow combining intro, game, and end phases. Click any
            step to open it, or use Next/Previous to navigate the entire flow.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700">
            <Link
              href="/intro-atlas"
              className="font-medium text-blue-700 underline decoration-blue-600/40 underline-offset-2 hover:decoration-blue-600"
            >
              Intro atlas
            </Link>
            <Link
              href="/game-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              Game atlas
            </Link>
            <Link
              href="/end-atlas"
              className="font-medium text-rose-700 underline decoration-rose-600/40 underline-offset-2 hover:decoration-rose-600"
            >
              End atlas
            </Link>
          </p>
        </header>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap gap-3">
          <PhaseBadge phase="intro" />
          <PhaseBadge phase="game" />
          <PhaseBadge phase="end" />
        </div>

        {/* Steps list */}
        <div className="space-y-4">
          {TOTAL_ATLAS_STEPS.map((step, idx) => {
            const href = totalAtlasNavHref(step.path);
            const prevStep = idx > 0 ? TOTAL_ATLAS_STEPS[idx - 1] : null;
            const nextStep =
              idx < TOTAL_ATLAS_STEPS.length - 1 ? TOTAL_ATLAS_STEPS[idx + 1] : null;
            const slug = step.path.replace(/^\//, '');

            return (
              <div
                key={`${step.phase}-${step.path}-${idx}`}
                className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                  {/* Left: Step info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-zinc-500">
                        Step {idx + 1} / {TOTAL_ATLAS_STEPS.length}
                      </span>
                      <PhaseBadge phase={step.phase} />
                    </div>
                    <p className="mt-1 font-mono text-lg font-semibold text-zinc-900">
                      {step.path}
                    </p>
                    <p className="text-xs text-zinc-500">
                      slug ·{' '}
                      <span className="font-mono text-zinc-700">{slug}</span>
                    </p>
                    <h2 className="mt-2 text-sm font-semibold text-zinc-800">
                      {step.title}
                    </h2>
                    <p className="mt-1 text-sm leading-snug text-zinc-600">
                      {step.description}
                    </p>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col gap-2 sm:w-auto sm:min-w-[200px]">
                    <Link
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${btnBase} bg-amber-800 text-white shadow-sm hover:bg-amber-900`}
                    >
                      Open page
                    </Link>

                    {/* Prev/Next buttons */}
                    <div className="flex gap-2">
                      {prevStep ? (
                        <Link
                          href={totalAtlasNavHref(prevStep.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${btnBase} flex-1 border border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100`}
                        >
                          ← Prev
                        </Link>
                      ) : (
                        <span
                          className={`${btnBase} flex-1 cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-400`}
                        >
                          ← First
                        </span>
                      )}
                      {nextStep ? (
                        <Link
                          href={totalAtlasNavHref(nextStep.path)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${btnBase} flex-1 border border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100`}
                        >
                          Next →
                        </Link>
                      ) : (
                        <span
                          className={`${btnBase} flex-1 cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-400`}
                        >
                          Last →
                        </span>
                      )}
                    </div>

                    {/* Phase jump links */}
                    <div className="flex gap-2 text-xs">
                      {step.phase !== 'intro' && (
                        <Link
                          href="/intro-atlas"
                          className="text-blue-700 hover:underline"
                        >
                          Jump to intro
                        </Link>
                      )}
                      {step.phase !== 'game' && (
                        <Link
                          href="/game-atlas"
                          className="text-amber-800 hover:underline"
                        >
                          Jump to game
                        </Link>
                      )}
                      {step.phase !== 'end' && (
                        <Link
                          href="/end-atlas"
                          className="text-rose-700 hover:underline"
                        >
                          Jump to end
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <footer className="mt-8 border-t border-zinc-200 pt-6">
          <div className="flex flex-wrap gap-6 text-sm text-zinc-600">
            <div>
              <span className="font-semibold text-zinc-800">
                {TOTAL_ATLAS_STEPS.length}
              </span>{' '}
              total steps
            </div>
            <div>
              <span className="font-semibold text-blue-800">
                {TOTAL_ATLAS_STEPS.filter((s) => s.phase === 'intro').length}
              </span>{' '}
              intro
            </div>
            <div>
              <span className="font-semibold text-amber-800">
                {TOTAL_ATLAS_STEPS.filter((s) => s.phase === 'game').length}
              </span>{' '}
              game
            </div>
            <div>
              <span className="font-semibold text-rose-800">
                {TOTAL_ATLAS_STEPS.filter((s) => s.phase === 'end').length}
              </span>{' '}
              end
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
