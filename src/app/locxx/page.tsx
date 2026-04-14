import LocationPlayer from '@/app/[locationSlug]/LocationPlayer';
import { GAME_ATLAS_LOCATION_SLUG } from '@/lib/game-atlas';

/** Wireframe “LocXX” — map / “Ik ben er” phase; same PB location as PageOdd/PageEven. */
export default function LocxxPage() {
  return <LocationPlayer locationSlug={GAME_ATLAS_LOCATION_SLUG} atlasPhase="locxx" />;
}
