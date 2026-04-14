import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import IntroAtlasEntry from '@/components/IntroAtlasEntry';
import { GAME_ATLAS_PATHS, gameAtlasNavHref, type GameAtlasPath } from '@/lib/game-atlas';

export const dynamic = 'force-dynamic';

function isLocalHost(host: string): boolean {
  const h = host.split(',')[0].trim().split(':')[0].toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

async function gameAtlasAllowed(): Promise<boolean> {
  if (process.env.SCREEN_ATLAS === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;
  const host = (await headers()).get('host') ?? '';
  return isLocalHost(host);
}

export default async function GameAtlasPage() {
  if (!(await gameAtlasAllowed())) {
    notFound();
  }

  return (
    <div className="min-h-dvh bg-zinc-100 px-4 py-8 text-zinc-900">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-zinc-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-800">
            Dev only
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            Game routes
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Linear order for QA (nine locations are parallel in real play). Open each route in a
            new tab. Use Previous / Next under the phone on these paths when running{' '}
            <code className="rounded bg-zinc-200 px-1 py-0.5 text-xs">next dev</code>.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700">
            <Link
              href="/intro-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              Intro atlas
            </Link>
            <span className="text-zinc-500">Game atlas — this page</span>
            <Link
              href="/end-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              End atlas
            </Link>
          </p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2">
          {GAME_ATLAS_PATHS.map((path) => (
            <li key={path}>
              <IntroAtlasEntry path={path} href={gameAtlasNavHref(path as GameAtlasPath)} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
