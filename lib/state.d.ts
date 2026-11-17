import { PendingEffectRegistry } from '@civ-clone/core-pending-effect/PendingEffectRegistry';
/**
 * The `PendingEffect` handler name the saved state is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so warming needs no saved class or registry of its own.
 */
export declare const GLOBAL_WARMING_STATE = 'base-global-warming:state';
/**
 * The warming level (`level`), how many times the world has warmed (`warmings`), and the last turn `updateGlobalWarming`
 *  ran on (`turn`), or `null` when none is recorded.
 */
export type GlobalWarmingState = {
  level: number;
  warmings: number;
  turn: number | null;
};
/** The saved state: level 0, no warmings and no turn in a game that has none. */
export declare const globalWarmingState: (
  pendingEffectRegistry?: PendingEffectRegistry
) => GlobalWarmingState;
/**
 * Saves `state`. The record is dropped when the level and the warmings are both back at 0, and none is made for that
 *  state, so a game in which nothing has happened, or everything has gone back to the start, saves exactly as one
 *  that never had warming. Its `turn` goes with it: see `updateGlobalWarming` for what that means.
 */
export declare const setGlobalWarmingState: (
  { level, warmings, turn }: GlobalWarmingState,
  pendingEffectRegistry?: PendingEffectRegistry
) => void;
export default globalWarmingState;
