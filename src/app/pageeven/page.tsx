'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import LocationPlayer from '@/app/[locationSlug]/LocationPlayer';
import { GAME_ATLAS_LOCATION_SLUG } from '@/lib/game-atlas';
import { LOCATION_SLUG_ORDER } from '@/lib/location-slugs';

function isKnownLocationSlug(value: string): value is (typeof LOCATION_SLUG_ORDER)[number] {
  return LOCATION_SLUG_ORDER.includes(value as (typeof LOCATION_SLUG_ORDER)[number]);
}

/** Correct-answer modal (“Geweldig gedaan!”) for QA. */
function PageEvenContent() {
  const searchParams = useSearchParams();
  const requested = (searchParams.get('location') || '').toLowerCase();
  const locationSlug = isKnownLocationSlug(requested) ? requested : GAME_ATLAS_LOCATION_SLUG;
  return <LocationPlayer locationSlug={locationSlug} atlasPhase="pageeven" />;
}

export default function PageEvenPage() {
  return (
    <Suspense fallback={null}>
      <PageEvenContent />
    </Suspense>
  );
}
