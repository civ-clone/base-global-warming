import {
  GLOBAL_WARMING_STATE,
  globalWarmingState,
  setGlobalWarmingState,
} from '../lib/state';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import { expect } from 'chai';

describe('globalWarmingState', (): void => {
  it('is level 0, no warmings and no turn with no record, and saves no record while both are 0', (): void => {
    const registry = new PendingEffectRegistry();

    expect(globalWarmingState(registry)).to.deep.equal({
      level: 0,
      warmings: 0,
      turn: null,
    });

    setGlobalWarmingState({ level: 0, warmings: 0, turn: 4 }, registry);

    expect(registry.entries()).to.have.length(0);
  });

  it('keeps one record, updated in place, as strings', (): void => {
    const registry = new PendingEffectRegistry();

    setGlobalWarmingState({ level: 3, warmings: 0, turn: 1 }, registry);

    const [record] = registry.entries();

    setGlobalWarmingState({ level: 11, warmings: 2, turn: 9 }, registry);

    expect(registry.entries()).to.deep.equal([record]);
    expect(record.handler()).to.equal(GLOBAL_WARMING_STATE);
    expect(record.target()).to.equal(null);
    expect(record.data()).to.deep.equal({
      level: '11',
      warmings: '2',
      turn: '9',
    });
    expect(globalWarmingState(registry)).to.deep.equal({
      level: 11,
      warmings: 2,
      turn: 9,
    });
  });

  it('drops the record, turn and all, when the level and warmings go back to 0', (): void => {
    const registry = new PendingEffectRegistry();

    setGlobalWarmingState({ level: 3, warmings: 0, turn: 1 }, registry);
    setGlobalWarmingState({ level: 0, warmings: 0, turn: 2 }, registry);

    expect(registry.entries()).to.have.length(0);
    expect(globalWarmingState(registry)).to.deep.equal({
      level: 0,
      warmings: 0,
      turn: null,
    });

    // After a warming the level is 0 but the warmings aren't: that's kept.
    setGlobalWarmingState({ level: 0, warmings: 1, turn: 3 }, registry);

    expect(globalWarmingState(registry)).to.deep.equal({
      level: 0,
      warmings: 1,
      turn: 3,
    });
  });

  it('reads back what a save wrote', (): void => {
    const registry = new PendingEffectRegistry(),
      loaded = new PendingEffectRegistry();

    setGlobalWarmingState({ level: 7, warmings: 1, turn: 40 }, registry);

    const [record] = registry.entries(),
      saved = JSON.parse(
        JSON.stringify({ handler: record.handler(), data: record.data() })
      );

    loaded.register(new PendingEffect(saved.handler, null, saved.data));

    expect(globalWarmingState(loaded)).to.deep.equal({
      level: 7,
      warmings: 1,
      turn: 40,
    });
  });

  it('reads a record with no turn as no turn', (): void => {
    const registry = new PendingEffectRegistry();

    registry.register(
      new PendingEffect(GLOBAL_WARMING_STATE, null, {
        level: '5',
        warmings: '0',
      })
    );

    expect(globalWarmingState(registry)).to.deep.equal({
      level: 5,
      warmings: 0,
      turn: null,
    });
  });
});
