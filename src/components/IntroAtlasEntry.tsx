'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';

function pathToSlugLabel(path: string): string {
  if (path === '/') return '/';
  return path.replace(/^\//, '');
}

export default function IntroAtlasEntry({
  path,
  href: hrefOverride,
  title,
  description,
}: {
  path: string;
  /** When set (e.g. `/toka?atlas=1`), used for the link; `path` stays the display/copy label. */
  href?: string;
  /** Optional hub line under the path (e.g. end-atlas step title). */
  title?: string;
  /** Optional short blurb for atlas tiles. */
  description?: string;
}) {
  const href = hrefOverride ?? path;
  const [copied, setCopied] = useState(false);
  const slugLabel = pathToSlugLabel(path);

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
    <div className="flex flex-col gap-2">
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm transition hover:border-zinc-300 hover:bg-zinc-50"
      >
        <span className="font-mono text-sm font-medium text-zinc-900">{path}</span>
        {title ? (
          <span className="mt-1 text-sm font-semibold tracking-tight text-zinc-800">{title}</span>
        ) : null}
        {description ? (
          <span className="mt-1 text-xs leading-snug text-zinc-600">{description}</span>
        ) : null}
        <span className="mt-1 text-xs text-zinc-500">Opens in a new tab</span>
      </Link>
      <button
        type="button"
        onClick={copyPath}
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2 text-left font-mono text-sm text-zinc-800 transition hover:border-zinc-400 hover:bg-zinc-100"
      >
        <span className="text-zinc-500">Slug · </span>
        <span className="font-medium">{slugLabel}</span>
        {copied ? (
          <span className="ml-2 text-xs font-sans font-normal text-emerald-600">Copied path</span>
        ) : null}
      </button>
    </div>
  );
}
