import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
/**
 * Every square that holds a `Pollution` improvement, each once, in the order its pollution was registered.
 *
 * Read from the tile improvements as they stand, so it is right after a load with nothing of its own to save. It walks
 *  the improvements (not the map) once per call: a turn's update calls it once. Counting as pollution comes and goes
 *  would need every way an improvement leaves the registry to say so, and some unregister it directly (pillage, a city
 *  destroyed).
 *
 * `Pollution` is the rule set's class (`base-tile-improvement-pollution`'s, for both of today's), passed in so this
 *  package never brings a copy of its own.
 */
export declare const pollutedSquares: (
  Pollution: typeof TileImprovement,
  tileImprovementRegistry?: TileImprovementRegistry
) => Tile[];
/**
 * A `WarmingPollution` effect that counts some squares at a discount: each square counts 1, less `timesCounted(tile)`
 *  for the times it falls in a discounted area, plus the total of those times over `divisor`, rounded down. With
 *  `divisor` 2 and squares near computer players' cities counted once per city, a square near one such city counts a
 *  half, the halves added before rounding, and one near two counts nothing.
 */
export declare const discounted: (
  timesCounted: (tile: Tile) => number,
  divisor?: number
) => (squares: Tile[]) => number;
/** How much `squares` count toward warming: the highest `WarmingPollution` answer, or one each when none is registered. */
export declare const warmingPollution: (
  squares: Tile[],
  ruleRegistry?: RuleRegistry
) => number;
export default pollutedSquares;
