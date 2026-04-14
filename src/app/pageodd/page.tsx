import LocationPlayer from '@/app/[locationSlug]/LocationPlayer';
import { GAME_ATLAS_LOCATION_SLUG } from '@/lib/game-atlas';

/** After map: puzzle + timer; copy from PocketBase pages for this location. */
export default function PageOddPage() {
  return <LocationPlayer locationSlug={GAME_ATLAS_LOCATION_SLUG} atlasPhase="pageodd" />;
}
