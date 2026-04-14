'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LocationPlayer from '@/app/[locationSlug]/LocationPlayer';
import { GAME_ATLAS_LOCATION_SLUG } from '@/lib/game-atlas';
import { LOCATION_SLUG_ORDER } from '@/lib/location-slugs';

function isKnownLocationSlug(value: string): value is (typeof LOCATION_SLUG_ORDER)[number] {
  return LOCATION_SLUG_ORDER.includes(value as (typeof LOCATION_SLUG_ORDER)[number]);
}

/** Wireframe “LocXX” — map / “Ik ben er” phase; same PB location as PageOdd/PageEven. */
function LocxxContent() {
  const searchParams = useSearchParams();
  const requested = (searchParams.get('location') || '').toLowerCase();
  const locationSlug = isKnownLocationSlug(requested) ? requested : GAME_ATLAS_LOCATION_SLUG;
  return <LocationPlayer locationSlug={locationSlug} atlasPhase="locxx" />;
}

export default function LocxxPage() {
  return (
    <Suspense fallback={null}>
      <LocxxContent />
    </Suspense>
  );
}
