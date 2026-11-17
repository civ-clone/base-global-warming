import { Engine } from '@civ-clone/core-engine/Engine';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { TileImprovementRegistry } from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import World from '@civ-clone/core-world/World';
/** Emitted when the world warms, with how many times it has warmed (this one included) and the squares that changed. */
export declare const GLOBAL_WARMING = 'world:global-warming';
/** Emitted when a `WarmingWarning` rule warns, with the level and the pollution that counted. */
export declare const GLOBAL_WARMING_WARNING = 'world:global-warming-warning';
export type GlobalWarmingDependencies = {
  /** The rule set's pollution improvement. */
  Pollution: typeof TileImprovement;
  engine?: Engine;
  pendingEffectRegistry?: PendingEffectRegistry;
  ruleRegistry?: RuleRegistry;
  tileImprovementRegistry?: TileImprovementRegistry;
  /** The world a warming changes; by default the world the first polluted square is in, or none. */
  world?: () => World | null;
};
/** What a turn's update saw and did. */
export type GlobalWarmingUpdate = {
  /** Every polluted square, each once. */
  squares: Tile[];
  /** How much they counted (`WarmingPollution`). */
  pollution: number;
  target: number;
  /** The level after this turn: 0 after a warming. */
  level: number;
  /** Warmings so far, this turn's included. */
  warmings: number;
  warned: boolean;
  struck: boolean;
  /** The squares a warming this turn changed. */
  changed: Tile[];
};
/**
 * A turn of global warming, for a rule set to call once a turn from a rule of its own:
 *
 * 1. the polluted squares are counted (`lib/pollution`) and weighed (`WarmingPollution`);
 * 2. the saved level moves toward this turn's target (`WarmingTarget`, `WarmingLevel`);
 * 3. `world:global-warming-warning` is emitted if a `WarmingWarning` rule says so;
 * 4. if a `WarmingStrike` rule says so, the world warms: the warmings go up by one, the level goes back to 0, every
 *    square of the world is warmed (`lib/warm`, with the warmings before this one) and `world:global-warming` is
 *    emitted.
 *
 * The level and warmings are saved (`lib/state`) before anything is emitted. With no rules registered, the target is 0,
 *  the level stays 0, nothing warns or strikes and nothing is saved.
 */
export declare const updateGlobalWarming: ({
  Pollution,
  engine,
  pendingEffectRegistry,
  ruleRegistry,
  tileImprovementRegistry,
  world,
}: GlobalWarmingDependencies) => GlobalWarmingUpdate;
export default updateGlobalWarming;
