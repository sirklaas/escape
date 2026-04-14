'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import type { EndAtlasPath } from '@/lib/end-atlas';
import { endAtlasNavHref } from '@/lib/end-atlas';

const btnBase =
  'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800';

export default function EndAtlasStepCard({
  stepIndex,
  path,
  title,
  description,
  prevPath,
  nextPath,
}: {
  stepIndex: number;
  path: EndAtlasPath;
  title: string;
  description: string;
  prevPath: EndAtlasPath | null;
  nextPath: EndAtlasPath | null;
}) {
  const href = endAtlasNavHref(path);
  const [copied, setCopied] = useState(false);
  const slug = path.replace(/^\//, '');

  const copyPath = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }, [path]);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
            Step {stepIndex}
          </p>
          <p className="mt-1 font-mono text-base font-semibold text-zinc-900">{path}</p>
          <p className="text-xs text-zinc-500">
            slug · <span className="font-mono text-zinc-700">{slug}</span>
          </p>
          <h2 className="mt-2 text-sm font-semibold text-zinc-800">{title}</h2>
          <p className="mt-1 text-sm leading-snug text-zinc-600">{description}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnBase} bg-amber-800 text-white shadow-sm hover:bg-amber-900`}
        >
          Open page
        </Link>
        <button
          type="button"
          onClick={copyPath}
          className={`${btnBase} border border-zinc-300 bg-zinc-50 text-zinc-800 hover:border-zinc-400 hover:bg-zinc-100`}
        >
          {copied ? 'Copied path' : 'Copy path'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-zinc-100 pt-3">
        <span className="w-full text-xs font-medium text-zinc-500">Flow (new tab)</span>
        {prevPath ? (
          <Link
            href={endAtlasNavHref(prevPath)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}
          >
            ← {prevPath}
          </Link>
        ) : (
          <span
            className={`${btnBase} cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-400`}
          >
            ← First step
          </span>
        )}
        {nextPath ? (
          <Link
            href={endAtlasNavHref(nextPath)}
            target="_blank"
            rel="noopener noreferrer"
            className={`${btnBase} border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50`}
          >
            {nextPath} →
          </Link>
        ) : (
          <span
            className={`${btnBase} cursor-not-allowed border border-zinc-100 bg-zinc-50 text-zinc-400`}
          >
            Last step →
          </span>
        )}
      </div>
    </div>
  );
}
