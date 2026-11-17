import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';

/**
 * The `PendingEffect` handler name the saved state is kept under. Nothing discharges it: it's a record, kept in the
 *  game's pending effects because they are saved, so warming needs no saved class or registry of its own.
 */
export const GLOBAL_WARMING_STATE = 'base-global-warming:state';

/**
 * The warming level (`level`), how many times the world has warmed (`warmings`), and the last turn `updateGlobalWarming`
 *  ran on (`turn`), or `null` when none is recorded.
 */
export type GlobalWarmingState = {
  level: number;
  warmings: number;
  turn: number | null;
};

const recordOf = (
  pendingEffectRegistry: PendingEffectRegistry
): PendingEffect | null =>
  pendingEffectRegistry.getByHandler(GLOBAL_WARMING_STATE)[0] ?? null;

const numberOf = (value: string | undefined, fallback: number): number => {
  const parsed = value === undefined || value === '' ? NaN : Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
};

/** The saved state: level 0, no warmings and no turn in a game that has none. */
export const globalWarmingState = (
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): GlobalWarmingState => {
  const record = recordOf(pendingEffectRegistry);

  if (record === null) {
    return { level: 0, warmings: 0, turn: null };
  }

  const data = record.data(),
    turn = numberOf(data.turn, NaN);

  return {
    level: numberOf(data.level, 0),
    warmings: numberOf(data.warmings, 0),
    turn: Number.isFinite(turn) ? turn : null,
  };
};

/**
 * Saves `state`. The record is dropped when the level and the warmings are both back at 0, and none is made for that
 *  state, so a game in which nothing has happened, or everything has gone back to the start, saves exactly as one
 *  that never had warming. Its `turn` goes with it: see `updateGlobalWarming` for what that means.
 */
export const setGlobalWarmingState = (
  { level, warmings, turn }: GlobalWarmingState,
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): void => {
  const record = recordOf(pendingEffectRegistry);

  if (level === 0 && warmings === 0) {
    if (record !== null) {
      pendingEffectRegistry.unregister(record);
    }

    return;
  }

  const data: { [key: string]: string } = {
    level: String(level),
    warmings: String(warmings),
  };

  if (turn !== null && turn !== undefined) {
    data.turn = String(turn);
  }

  if (record !== null) {
    record.setData(data);

    return;
  }

  pendingEffectRegistry.register(
    new PendingEffect(GLOBAL_WARMING_STATE, null, data)
  );
};

export default globalWarmingState;
