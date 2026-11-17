import {
  GLOBAL_WARMING_STATE,
  globalWarmingState,
  setGlobalWarmingState,
} from '../lib/state';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import { expect } from 'chai';

describe('globalWarmingState', (): void => {
  it('is 0 and 0 with no record, and saves no record while both are 0', (): void => {
    const registry = new PendingEffectRegistry();

    expect(globalWarmingState(registry)).to.deep.equal({
      level: 0,
      warmings: 0,
    });

    setGlobalWarmingState({ level: 0, warmings: 0 }, registry);

    expect(registry.entries()).to.have.length(0);
  });

  it('keeps one record, updated in place, as strings', (): void => {
    const registry = new PendingEffectRegistry();

    setGlobalWarmingState({ level: 3, warmings: 0 }, registry);
    setGlobalWarmingState({ level: 0, warmings: 2 }, registry);
    setGlobalWarmingState({ level: 0, warmings: 0 }, registry);
    setGlobalWarmingState({ level: 11, warmings: 2 }, registry);

    expect(registry.entries()).to.have.length(1);
    expect(registry.entries()[0].handler()).to.equal(GLOBAL_WARMING_STATE);
    expect(registry.entries()[0].target()).to.equal(null);
    expect(registry.entries()[0].data()).to.deep.equal({
      level: '11',
      warmings: '2',
    });
    expect(globalWarmingState(registry)).to.deep.equal({
      level: 11,
      warmings: 2,
    });
  });

  it('reads back what a save wrote', (): void => {
    const registry = new PendingEffectRegistry(),
      loaded = new PendingEffectRegistry();

    setGlobalWarmingState({ level: 7, warmings: 1 }, registry);

    const [record] = registry.entries(),
      saved = JSON.parse(
        JSON.stringify({ handler: record.handler(), data: record.data() })
      );

    loaded.register(new PendingEffect(saved.handler, null, saved.data));

    expect(globalWarmingState(loaded)).to.deep.equal({
      level: 7,
      warmings: 1,
    });
  });
});
