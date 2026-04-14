import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import IntroAtlasEntry from '@/components/IntroAtlasEntry';
import { INTRO_ATLAS_PATHS } from '@/lib/intro-atlas';

export const dynamic = 'force-dynamic';

function isLocalHost(host: string): boolean {
  const h = host.split(',')[0].trim().split(':')[0].toLowerCase();
  return h === 'localhost' || h === '127.0.0.1' || h === '::1';
}

async function introAtlasAllowed(): Promise<boolean> {
  if (process.env.SCREEN_ATLAS === '1') return true;
  if (process.env.NODE_ENV === 'development') return true;
  const host = (await headers()).get('host') ?? '';
  return isLocalHost(host);
}

export default async function IntroAtlasPage() {
  if (!(await introAtlasAllowed())) {
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
            Intro routes
          </h1>
          <p className="mt-2 max-w-xl text-sm text-zinc-600">
            Open each route in a real tab — no embedded previews, so you see exactly what
            players see. Tile browser windows or use multiple tabs to compare layout.
          </p>
          <p className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-zinc-700">
            <span className="text-zinc-500">Intro atlas — this page</span>
            <Link
              href="/game-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              Game atlas
            </Link>
            <Link
              href="/end-atlas"
              className="font-medium text-amber-900 underline decoration-amber-800/40 underline-offset-2 hover:decoration-amber-800"
            >
              End atlas
            </Link>
          </p>
        </header>
        <ul className="grid gap-4 sm:grid-cols-2">
          {INTRO_ATLAS_PATHS.map((path) => (
            <li key={path}>
              <IntroAtlasEntry path={path} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
