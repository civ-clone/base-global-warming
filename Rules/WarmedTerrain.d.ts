import Rule from '@civ-clone/core-rule/Rule';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
/**
 * What a square becomes when the world warms, given the square and how many times the world had warmed before this
 *  one: a terrain class, or `null` (or nothing) to leave it as it is. Asked for every square of the world. The first
 *  rule to name a terrain decides, in the registry's order, so a later rule can't override an earlier one: change it
 *  with `RuleRegistry.replace` (by its id), or place a rule ahead of it with `RuleRegistry.before`.
 */
export declare class WarmedTerrain extends Rule<
  [Tile, number],
  typeof Terrain | null | void
> {}
export default WarmedTerrain;
