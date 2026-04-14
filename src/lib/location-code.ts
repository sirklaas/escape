/**
 * Display label for the Google Plus Code / query shown above the map.
 * Supports plain codes, full maps URLs, and `q` / `query` search params.
 */
export function locationCodeLabel(mapUrl?: string): string {
  const fallback = '5F9Q+M5 LEIDEN';
  if (!mapUrl?.trim()) return fallback;
  const raw = mapUrl.trim();

  if (raw.startsWith('http')) {
    try {
      const url = new URL(raw);
      const q = url.searchParams.get('q') ?? url.searchParams.get('query');
      if (q) {
        return decodeURIComponent(q.replace(/\+/g, ' '))
          .trim()
          .toUpperCase();
      }
    } catch {
      /* fall through */
    }
    const seg = raw.split('/').pop()?.split('?')[0];
    if (seg) {
      return decodeURIComponent(seg.replace(/\+/g, ' '))
        .trim()
        .toUpperCase();
    }
  }

  if (raw.includes('/')) {
    const seg = raw.split('/').pop()?.split('?')[0]?.replace(/%20/g, ' ');
    if (seg) return seg.replace(/\+/g, ' ').trim().toUpperCase();
  }

  return raw.replace(/\+/g, ' ').trim().toUpperCase();
}

/** Embed URL for the in-app map iframe. */
export function mapsEmbedSrc(mapUrl?: string): string {
  const fb = '5F9Q+M5 Leiden';
  const q = mapUrl?.trim() || fb;
  return `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`;
}
