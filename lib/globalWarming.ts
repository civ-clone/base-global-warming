import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  TileImprovementRegistry,
  instance as tileImprovementRegistryInstance,
} from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import { globalWarmingState, setGlobalWarmingState } from './state';
import { pollutedSquares, warmingPollution } from './pollution';
import { strikes, warmingLevel, warmingTarget, warns } from './level';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import World from '@civ-clone/core-world/World';
import warm from './warm';

/** Emitted when the world warms, with how many times it has warmed (this one included) and the squares that changed. */
export const GLOBAL_WARMING = 'world:global-warming';

/** Emitted when a `WarmingWarning` rule warns, with the level and the pollution that counted. */
export const GLOBAL_WARMING_WARNING = 'world:global-warming-warning';

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
export const updateGlobalWarming = ({
  Pollution,
  engine = engineInstance,
  pendingEffectRegistry = pendingEffectRegistryInstance,
  ruleRegistry = ruleRegistryInstance,
  tileImprovementRegistry = tileImprovementRegistryInstance,
  world,
}: GlobalWarmingDependencies): GlobalWarmingUpdate => {
  const squares = pollutedSquares(Pollution, tileImprovementRegistry),
    before = globalWarmingState(pendingEffectRegistry),
    pollution = warmingPollution(squares, ruleRegistry),
    target = warmingTarget(pollution, before.warmings, ruleRegistry),
    moved = warmingLevel(before.level, target, ruleRegistry),
    warned = warns(moved, pollution, ruleRegistry),
    struck = strikes(moved, pollution, ruleRegistry),
    level = struck ? 0 : moved,
    warmings = struck ? before.warmings + 1 : before.warmings;

  setGlobalWarmingState({ level, warmings }, pendingEffectRegistry);

  if (warned) {
    engine.emit(GLOBAL_WARMING_WARNING, moved, pollution);
  }

  if (!struck) {
    return {
      squares,
      pollution,
      target,
      level,
      warmings,
      warned,
      struck,
      changed: [],
    };
  }

  const map = world ? world() : squares[0]?.map() ?? null,
    changed =
      map === null ? [] : warm(map.entries(), before.warmings, ruleRegistry);

  engine.emit(GLOBAL_WARMING, warmings, changed);

  return {
    squares,
    pollution,
    target,
    level,
    warmings,
    warned,
    struck,
    changed,
  };
};

export default updateGlobalWarming;
