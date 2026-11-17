import { Meadow, Pollution, Road, drawWorld } from './lib';
import {
  discounted,
  pollutedSquares,
  warmingPollution,
} from '../lib/pollution';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import WarmingPollution from '../Rules/WarmingPollution';
import { expect } from 'chai';

describe('pollutedSquares', (): void => {
  it('lists each polluted square once, in the order its pollution was registered, and nothing else', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      registry = new TileImprovementRegistry(),
      world = await drawWorld(['mmm', 'mmm'], ruleRegistry),
      [a, b, c] = [world.get(2, 1), world.get(0, 0), world.get(1, 0)];

    registry.register(
      new Pollution(a, ruleRegistry),
      new Road(b, ruleRegistry),
      new Pollution(c, ruleRegistry),
      new Pollution(a, ruleRegistry)
    );

    expect(pollutedSquares(Pollution, registry)).to.deep.equal([a, c]);
  });

  it('follows pollution leaving the registry, however it leaves', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      registry = new TileImprovementRegistry(),
      world = await drawWorld(['mm'], ruleRegistry),
      first = new Pollution(world.get(0, 0), ruleRegistry),
      second = new Pollution(world.get(1, 0), ruleRegistry);

    registry.register(first, second);
    registry.unregister(first);

    expect(pollutedSquares(Pollution, registry)).to.deep.equal([
      world.get(1, 0),
    ]);
  });

  it('counts the same from a registry rebuilt from the same improvements, as a load makes', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      registry = new TileImprovementRegistry(),
      loaded = new TileImprovementRegistry(),
      world = await drawWorld(['mmmm'], ruleRegistry);

    registry.register(
      ...world
        .entries()
        .slice(1)
        .map((tile: Tile) => new Pollution(tile, ruleRegistry))
    );
    loaded.register(...registry.entries());

    expect(pollutedSquares(Pollution, loaded)).to.deep.equal(
      pollutedSquares(Pollution, registry)
    );
    expect(pollutedSquares(Pollution, loaded)).to.have.length(3);
  });
});

describe('discounted', (): void => {
  it('counts each square 1, less the times it is discounted, plus those times over the divisor, rounded down once', async (): Promise<void> => {
    const world = await drawWorld(['mmmmm'], new RuleRegistry()),
      times = new Map<Tile, number>([
        [world.get(0, 0), 1],
        [world.get(1, 0), 1],
        [world.get(2, 0), 1],
        [world.get(3, 0), 2],
      ]),
      count = discounted((tile: Tile): number => times.get(tile) ?? 0);

    // 5 squares, discounted 5 times: 5 - 5 + 2.
    expect(count(world.entries())).to.equal(2);
    // One square near one discounted area: 1 - 1 + 0.
    expect(count([world.get(0, 0)])).to.equal(0);
    // Two such squares make a whole one.
    expect(count([world.get(0, 0), world.get(1, 0)])).to.equal(1);
    // A square counted twice counts nothing: 1 - 2 + 1.
    expect(count([world.get(3, 0)])).to.equal(0);
    expect(count([world.get(4, 0)])).to.equal(1);
    expect(discounted(() => 1, 3)(world.entries())).to.equal(1);
  });
});

describe('warmingPollution', (): void => {
  it('is one a square with no rule, else the highest answer', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      world = await drawWorld(['mmm'], ruleRegistry),
      squares = world.entries();

    expect(warmingPollution(squares, ruleRegistry)).to.equal(3);

    ruleRegistry.register(
      new WarmingPollution(new Effect((tiles: Tile[]) => tiles.length * 2)),
      new WarmingPollution(new Effect(() => 1))
    );

    expect(warmingPollution(squares, ruleRegistry)).to.equal(6);
    expect(world.get(0, 0).terrain()).to.be.instanceOf(Meadow);
  });
});
