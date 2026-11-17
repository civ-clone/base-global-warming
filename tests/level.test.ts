import {
  aboveLevel,
  atLevel,
  stepToward,
  strikes,
  warmingLevel,
  warmingTarget,
  warns,
} from '../lib/level';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import WarmingLevel from '../Rules/WarmingLevel';
import WarmingStrike from '../Rules/WarmingStrike';
import WarmingTarget from '../Rules/WarmingTarget';
import WarmingWarning from '../Rules/WarmingWarning';
import { expect } from 'chai';

describe('warmingTarget', (): void => {
  it('is the fallback (0) with no rule, else the highest answer, from the pollution and the warmings', (): void => {
    const ruleRegistry = new RuleRegistry();

    expect(warmingTarget(10, 1, ruleRegistry)).to.equal(0);
    expect(warmingTarget(10, 1, ruleRegistry, 7)).to.equal(7);

    ruleRegistry.register(
      new WarmingTarget(
        new Effect(
          (pollution: number, warmings: number) => 3 * pollution - 5 * warmings
        )
      ),
      new WarmingTarget(new Effect(() => -1))
    );

    expect(warmingTarget(10, 1, ruleRegistry)).to.equal(25);
    expect(warmingTarget(0, 1, ruleRegistry)).to.equal(-1);
  });
});

describe('stepToward', (): void => {
  it('moves by the step, stops at the target and keeps within the bounds', (): void => {
    const step = stepToward(1, 0, 9);

    expect(step(3, 10)).to.equal(4);
    expect(step(3, 3)).to.equal(3);
    expect(step(3, -4)).to.equal(2);
    expect(step(0, -4)).to.equal(0);
    expect(step(9, 20)).to.equal(9);
    expect(step(12, 20)).to.equal(9);
    expect(stepToward(5)(3, 6)).to.equal(6);
    expect(stepToward(5)(3, -6)).to.equal(0);
  });
});

describe('warmingLevel', (): void => {
  it('steps by 1, never below 0, with no rule, else the highest answer', (): void => {
    const ruleRegistry = new RuleRegistry();

    expect(warmingLevel(4, 10, ruleRegistry)).to.equal(5);
    expect(warmingLevel(4, 0, ruleRegistry)).to.equal(3);
    expect(warmingLevel(0, -3, ruleRegistry)).to.equal(0);

    ruleRegistry.register(new WarmingLevel(new Effect(stepToward(2, 0, 5))));

    expect(warmingLevel(4, 10, ruleRegistry)).to.equal(5);
    expect(warmingLevel(4, 0, ruleRegistry)).to.equal(2);
  });
});

describe('warns and strikes', (): void => {
  it('are false with no rule, and true when any rule says so', (): void => {
    const ruleRegistry = new RuleRegistry();

    expect(warns(5, 5, ruleRegistry)).to.equal(false);
    expect(strikes(50, 50, ruleRegistry)).to.equal(false);

    ruleRegistry.register(
      new WarmingWarning(new Effect(atLevel(5, 2))),
      new WarmingWarning(new Criterion(() => false), new Effect(() => true)),
      new WarmingStrike(new Effect(aboveLevel(7)))
    );

    expect(warns(5, 3, ruleRegistry)).to.equal(true);
    expect(warns(5, 2, ruleRegistry)).to.equal(false);
    expect(warns(6, 3, ruleRegistry)).to.equal(false);
    expect(strikes(7, 0, ruleRegistry)).to.equal(false);
    expect(strikes(8, 0, ruleRegistry)).to.equal(true);
  });
});
