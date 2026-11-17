import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
/** What `tile` becomes in a warming after `warmings` earlier ones: the first `WarmedTerrain` answer, or `null`. */
export declare const warmedTerrain: (
  tile: Tile,
  warmings: number,
  ruleRegistry?: RuleRegistry
) => typeof Terrain | null;
/**
 * Warms `tiles` (the world's squares) after `warmings` earlier warmings, and returns the squares that changed, in the
 *  order given.
 *
 * Every square is decided first and changed after, so no answer depends on a square already changed by this warming.
 *  A square whose answer is its own terrain's class stays as it is. Each change is a new terrain given through
 *  `Tile.setTerrain`, which processes core-world's `TerrainChanged`: what the square keeps (features, improvements) is
 *  the rule set's `TerrainChanged` rules' choice.
 */
export declare const warm: (
  tiles: Tile[],
  warmings: number,
  ruleRegistry?: RuleRegistry
) => Tile[];
export default warm;
