import Rule from '@civ-clone/core-rule/Rule';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
/**
 * What a square becomes when the world warms, given the square and how many times the world had warmed before this
 *  one: a terrain class, or `null` (or nothing) to leave it as it is. Asked for every square of the world.
 */
export declare class WarmedTerrain extends Rule<
  [Tile, number],
  typeof Terrain | null | void
> {}
export default WarmedTerrain;
