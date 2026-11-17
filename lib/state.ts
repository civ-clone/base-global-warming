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

/** The warming level (`level`), and how many times the world has warmed (`warmings`). */
export type GlobalWarmingState = {
  level: number;
  warmings: number;
};

const recordOf = (
  pendingEffectRegistry: PendingEffectRegistry
): PendingEffect | null =>
  pendingEffectRegistry.getByHandler(GLOBAL_WARMING_STATE)[0] ?? null;

const numberOf = (value: string | undefined): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : 0;
};

/** The saved state, or 0 and 0 in a game that has none yet. */
export const globalWarmingState = (
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): GlobalWarmingState => {
  const record = recordOf(pendingEffectRegistry);

  if (record === null) {
    return { level: 0, warmings: 0 };
  }

  const data = record.data();

  return {
    level: numberOf(data.level),
    warmings: numberOf(data.warmings),
  };
};

/**
 * Saves `state`. A game whose level and warmings are both still 0 gets no record, so a game in which nothing has
 *  happened saves exactly as it did before.
 */
export const setGlobalWarmingState = (
  { level, warmings }: GlobalWarmingState,
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): void => {
  const record = recordOf(pendingEffectRegistry),
    data = { level: String(level), warmings: String(warmings) };

  if (record !== null) {
    record.setData(data);

    return;
  }

  if (level === 0 && warmings === 0) {
    return;
  }

  pendingEffectRegistry.register(
    new PendingEffect(GLOBAL_WARMING_STATE, null, data)
  );
};

export default globalWarmingState;
