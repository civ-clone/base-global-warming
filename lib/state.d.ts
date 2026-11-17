import { PendingEffectRegistry } from '@civ-clone/core-pending-effect/PendingEffectRegistry';
/**
 * The `PendingEffect` handler name the saved state is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so warming needs no saved class or registry of its own.
 */
export declare const GLOBAL_WARMING_STATE = 'base-global-warming:state';
/** The warming level (`level`), and how many times the world has warmed (`warmings`). */
export type GlobalWarmingState = {
  level: number;
  warmings: number;
};
/** The saved state, or 0 and 0 in a game that has none yet. */
export declare const globalWarmingState: (
  pendingEffectRegistry?: PendingEffectRegistry
) => GlobalWarmingState;
/**
 * Saves `state`. A game whose level and warmings are both still 0 gets no record, so a game in which nothing has
 *  happened saves exactly as it did before.
 */
export declare const setGlobalWarmingState: (
  { level, warmings }: GlobalWarmingState,
  pendingEffectRegistry?: PendingEffectRegistry
) => void;
export default globalWarmingState;
