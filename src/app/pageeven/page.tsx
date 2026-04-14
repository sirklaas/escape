import LocationPlayer from '@/app/[locationSlug]/LocationPlayer';
import { GAME_ATLAS_LOCATION_SLUG } from '@/lib/game-atlas';

/** Correct-answer modal (“Geweldig gedaan!”) for QA. */
export default function PageEvenPage() {
  return <LocationPlayer locationSlug={GAME_ATLAS_LOCATION_SLUG} atlasPhase="pageeven" />;
}
