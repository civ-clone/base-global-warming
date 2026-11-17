import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import Tile from '@civ-clone/core-world/Tile';
import WarmedTerrain from '../Rules/WarmedTerrain';

/** What `tile` becomes in a warming after `warmings` earlier ones: the first `WarmedTerrain` answer, or `null`. */
export const warmedTerrain = (
  tile: Tile,
  warmings: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): typeof Terrain | null =>
  ruleRegistry
    .process(WarmedTerrain, tile, warmings)
    .find(
      (answer: typeof Terrain | null | void): answer is typeof Terrain =>
        typeof answer === 'function'
    ) ?? null;

/**
 * Warms `tiles` (the world's squares) after `warmings` earlier warmings, and returns the squares that changed, in the
 *  order given.
 *
 * Every square is decided first and changed after, so no answer depends on a square already changed by this warming.
 *  A square whose answer is its own terrain's class stays as it is. Each change is a new terrain given through
 *  `Tile.setTerrain`, which processes core-world's `TerrainChanged`: what the square keeps (features, improvements) is
 *  the rule set's `TerrainChanged` rules' choice.
 */
export const warm = (
  tiles: Tile[],
  warmings: number,
  ruleRegistry: RuleRegistry = ruleRegistryInstance
): Tile[] => {
  const changes = tiles
    .map((tile: Tile): [Tile, typeof Terrain | null] => [
      tile,
      warmedTerrain(tile, warmings, ruleRegistry),
    ])
    .filter(
      (
        change: [Tile, typeof Terrain | null]
      ): change is [Tile, typeof Terrain] =>
        change[1] !== null && change[0].terrain().constructor !== change[1]
    );

  changes.forEach(([tile, To]: [Tile, typeof Terrain]): void =>
    tile.setTerrain(new To(ruleRegistry))
  );

  return changes.map(([tile]: [Tile, typeof Terrain]): Tile => tile);
};

export default warm;
