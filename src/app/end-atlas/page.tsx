import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import EndAtlasStepCard from '@/components/EndAtlasStepCard';
import { END_ATLAS_PATHS, END_ATLAS_STEPS, type EndAtlasPath } from '@/lib/end-atlas';

export const dynamic = 'force-dynamic';

function isLocalHost(host: string): boolean {
  const h = host.split(',')[0].trim().split(':')[0].toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

async function endAtlasAllowed(): Promise<boolean> {
  if (process.env.SCREEN_ATLAS === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;
  const host = (await headers()).get('host') ?? '';
  return isLocalHost(host);
}

export default async function EndAtlasPage() {
  if (!(await endAtlasAllowed())) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
            Dev only
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">End-game routes</h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            This is the <strong className="font-semibold text-zinc-800">finale chapter</strong> after the main loop.
            Intro-atlas begins at <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/start</code>; finale splash at{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/endstart</code>.
            Order:{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/endstart</code> →{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/tokenkey</code> →{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/flame</code> →{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/eindscore</code> →{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/watzullenwe</code>
            . After <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">GAME_ATLAS_PATHS</code> (ends at{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/toka</code>), open{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">/tokenkey</code> or this hub. Handoff:{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">docs/end-flow-atlas.md</code>.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700">
            <Link
              href="/intro-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              Intro atlas
            </Link>
            <Link
              href="/game-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              Game atlas
            </Link>
            <span className="text-zinc-500">End atlas — this page</span>
          </p>
        </header>
        <ul className="mx-auto max-w-xl space-y-4">
          {END_ATLAS_STEPS.map(({ path, title, description }, idx) => {
            const p = path as EndAtlasPath;
            return (
              <li key={path}>
                <EndAtlasStepCard
                  stepIndex={idx + 1}
                  path={p}
                  title={title}
                  description={description}
                  prevPath={idx > 0 ? END_ATLAS_PATHS[idx - 1] : null}
                  nextPath={
                    idx < END_ATLAS_PATHS.length - 1 ? END_ATLAS_PATHS[idx + 1] : null
                  }
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
