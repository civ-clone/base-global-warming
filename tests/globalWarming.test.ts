import {
  GLOBAL_WARMING,
  GLOBAL_WARMING_WARNING,
  GlobalWarmingUpdate,
  updateGlobalWarming,
} from '../lib/globalWarming';
import { Dunes, Marsh, Meadow, Pollution, drawWorld, drawn } from './lib';
import { aboveLevel, atLevel, stepToward } from '../lib/level';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Engine from '@civ-clone/core-engine/Engine';
import { GLOBAL_WARMING_STATE } from '../lib/state';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainChanged from '@civ-clone/core-world/Rules/TerrainChanged';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import WarmedTerrain from '../Rules/WarmedTerrain';
import WarmingLevel from '../Rules/WarmingLevel';
import WarmingPollution from '../Rules/WarmingPollution';
import WarmingStrike from '../Rules/WarmingStrike';
import WarmingTarget from '../Rules/WarmingTarget';
import WarmingWarning from '../Rules/WarmingWarning';
import World from '@civ-clone/core-world/World';
import { discounted } from '../lib/pollution';
import { expect } from 'chai';

// A toy rule set's numbers, which are no game's: the target is 3 a polluted square less 4 a warming so far, the level
//  moves 2 a turn between 0 and 10, it warns at exactly 4 with more than 1 square counting, and strikes above 6. A
//  polluted square on the bottom row counts half. A warming turns the meadows beside the sea into marshes, and the
//  inland meadows on column 2 into dunes in the first warming, column 3 in the second, and so on.
const toyRules = (events: string[]) => [
  new WarmingPollution(
    new Effect(discounted((tile: Tile): number => (tile.y() === 3 ? 1 : 0)))
  ),
  new WarmingTarget(
    new Effect(
      (pollution: number, warmings: number) => 3 * pollution - 4 * warmings
    )
  ),
  new WarmingLevel(new Effect(stepToward(2, 0, 10))),
  new WarmingWarning(new Effect(atLevel(4, 1))),
  new WarmingStrike(new Effect(aboveLevel(6))),
  new WarmedTerrain(
    new Criterion(
      (tile: Tile): boolean =>
        tile.terrain() instanceof Meadow && tile.isCoast()
    ),
    new Effect(() => Marsh)
  ),
  new WarmedTerrain(
    new Criterion(
      (tile: Tile, warmings: number): boolean =>
        tile.terrain() instanceof Meadow &&
        !tile.isCoast() &&
        tile.x() === warmings + 2
    ),
    new Effect(() => Dunes)
  ),
  new TerrainChanged(
    new Effect((tile: Tile, from: Terrain, to: Terrain): void => {
      events.push(
        `changed ${tile.x()},${tile.y()} ${from.constructor.name} to ${
          to.constructor.name
        }`
      );
    })
  ),
];

const rows = ['~~~~~~~', '~mmmmm~', '~mmmmm~', '~mmmmm~', '~~~~~~~'];

type Game = {
  world: World;
  engine: Engine;
  events: string[];
  pendingEffectRegistry: PendingEffectRegistry;
  ruleRegistry: RuleRegistry;
  tileImprovementRegistry: TileImprovementRegistry;
  turn: () => GlobalWarmingUpdate;
  pollute: (x: number, y: number) => void;
};

const newGame = async (): Promise<Game> => {
  const ruleRegistry = new RuleRegistry(),
    events: string[] = [],
    engine = new Engine(),
    pendingEffectRegistry = new PendingEffectRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    world = await drawWorld(rows, ruleRegistry);

  ruleRegistry.register(...toyRules(events));

  engine.on(GLOBAL_WARMING_WARNING, (level: number, pollution: number) =>
    events.push(`warning ${level} ${pollution}`)
  );
  engine.on(GLOBAL_WARMING, (warmings: number, changed: Tile[]) =>
    events.push(`warming ${warmings} ${changed.length}`)
  );

  return {
    world,
    engine,
    events,
    pendingEffectRegistry,
    ruleRegistry,
    tileImprovementRegistry,
    turn: () =>
      updateGlobalWarming({
        Pollution,
        engine,
        pendingEffectRegistry,
        ruleRegistry,
        tileImprovementRegistry,
      }),
    pollute: (x: number, y: number) =>
      tileImprovementRegistry.register(
        new Pollution(world.get(x, y), ruleRegistry)
      ),
  };
};

const levels = (game: Game, turns: number): string[] =>
  new Array(turns).fill(0).map((): string => {
    const { level, warmings, pollution, target } = game.turn();

    return `${pollution}/${target}: ${level} ${warmings}`;
  });

describe('updateGlobalWarming', (): void => {
  it('does nothing and saves nothing with no rules registered', async (): Promise<void> => {
    const engine = new Engine(),
      ruleRegistry = new RuleRegistry(),
      pendingEffectRegistry = new PendingEffectRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      world = await drawWorld(rows, ruleRegistry),
      emitted: string[] = [];

    engine.on(GLOBAL_WARMING, () => emitted.push(GLOBAL_WARMING));
    engine.on(GLOBAL_WARMING_WARNING, () =>
      emitted.push(GLOBAL_WARMING_WARNING)
    );

    world
      .entries()
      .filter((tile: Tile) => tile.isLand())
      .forEach((tile: Tile) =>
        tileImprovementRegistry.register(new Pollution(tile, ruleRegistry))
      );

    for (let turn = 0; turn < 50; turn++) {
      expect(
        updateGlobalWarming({
          Pollution,
          engine,
          pendingEffectRegistry,
          ruleRegistry,
          tileImprovementRegistry,
        })
      ).to.include({ pollution: 15, target: 0, level: 0, warmings: 0 });
    }

    expect(emitted).to.deep.equal([]);
    expect(pendingEffectRegistry.entries()).to.deep.equal([]);
    expect(drawn(world)).to.deep.equal(rows);
  });

  it('moves the level toward the target, warns, warms the world and starts again', async (): Promise<void> => {
    const game = await newGame();

    // No pollution: nothing moves, nothing is saved.
    expect(levels(game, 2)).to.deep.equal(['0/0: 0 0', '0/0: 0 0']);
    expect(game.pendingEffectRegistry.entries()).to.have.length(0);

    // One polluted square inland, one on the bottom row counting half: 1 + 0 (rounded down) = 1, target 3.
    game.pollute(2, 1);
    game.pollute(3, 3);

    expect(levels(game, 3)).to.deep.equal(['1/3: 2 0', '1/3: 3 0', '1/3: 3 0']);

    // A second half square makes a whole one: 2, target 6; the level passes 4 with 2 counting, and warns.
    game.pollute(4, 3);

    expect(levels(game, 1)).to.deep.equal(['2/6: 5 0']);
    expect(game.events).to.deep.equal([]);

    game.pollute(2, 2);

    // 3, target 9: 5 → 7, above 6, so the world warms (the first time, so column 2's inland meadow becomes dunes) and
    //  the level goes back to 0.
    expect(levels(game, 1)).to.deep.equal(['3/9: 0 1']);
    expect(game.events.slice(-1)).to.deep.equal(['warming 1 13']);
    expect(drawn(game.world)).to.deep.equal([
      '~~~~~~~',
      '~xxxxx~',
      '~xdmmx~',
      '~xxxxx~',
      '~~~~~~~',
    ]);
    expect(
      game.events.filter((event: string) => event.startsWith('changed'))
    ).to.have.length(13);
    expect(game.events).to.include('changed 1,1 Meadow to Marsh');
    expect(game.events).to.include('changed 2,2 Meadow to Dunes');

    // After one warming the target is 9 - 4 = 5. The level climbs again, and warns at exactly 4.
    game.events.length = 0;

    expect(levels(game, 4)).to.deep.equal([
      '3/5: 2 1',
      '3/5: 4 1',
      '3/5: 5 1',
      '3/5: 5 1',
    ]);
    expect(game.events).to.deep.equal(['warning 4 3']);
  });

  it('carries on after a save and load as if never stopped', async (): Promise<void> => {
    const uninterrupted = await newGame(),
      interrupted = await newGame(),
      pollution: [number, number][] = [
        [1, 1],
        [2, 1],
        [3, 1],
        [2, 2],
        [3, 3],
      ];

    pollution.forEach(([x, y]) => {
      uninterrupted.pollute(x, y);
      interrupted.pollute(x, y);
    });

    const expected = levels(uninterrupted, 12);

    expect(levels(interrupted, 5)).to.deep.equal(expected.slice(0, 5));

    // What a save holds: the record's handler and data. A load makes new registries.
    const [record] =
        interrupted.pendingEffectRegistry.getByHandler(GLOBAL_WARMING_STATE),
      saved = JSON.stringify({
        handler: record.handler(),
        data: record.data(),
      }),
      { handler, data } = JSON.parse(saved),
      pendingEffectRegistry = new PendingEffectRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry();

    pendingEffectRegistry.register(new PendingEffect(handler, null, data));
    tileImprovementRegistry.register(
      ...interrupted.tileImprovementRegistry.entries()
    );

    const loaded = new Array(7).fill(0).map((): string => {
      const { level, warmings, pollution, target } = updateGlobalWarming({
        Pollution,
        engine: interrupted.engine,
        pendingEffectRegistry,
        ruleRegistry: interrupted.ruleRegistry,
        tileImprovementRegistry,
      });

      return `${pollution}/${target}: ${level} ${warmings}`;
    });

    expect(loaded).to.deep.equal(expected.slice(5));
    expect(drawn(interrupted.world)).to.deep.equal(drawn(uninterrupted.world));
    expect(interrupted.events).to.deep.equal(uninterrupted.events);
    expect(
      uninterrupted.events.filter((event: string) =>
        event.startsWith('warming')
      )
    ).to.have.length(2);
  });

  it('warms the world it is given, or none, when no square is polluted', async (): Promise<void> => {
    const engine = new Engine(),
      ruleRegistry = new RuleRegistry(),
      pendingEffectRegistry = new PendingEffectRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      world = await drawWorld(['~m~'], ruleRegistry),
      warmings: number[] = [];

    ruleRegistry.register(
      new WarmingStrike(new Effect(() => true)),
      new WarmedTerrain(new Effect(() => Dunes))
    );
    engine.on(GLOBAL_WARMING, (count: number) => warmings.push(count));

    const dependencies = {
      Pollution,
      engine,
      pendingEffectRegistry,
      ruleRegistry,
      tileImprovementRegistry,
    };

    expect(updateGlobalWarming(dependencies).changed).to.deep.equal([]);
    expect(drawn(world)).to.deep.equal(['~m~']);

    // Every square is asked, the sea too: the rule decides.
    expect(
      updateGlobalWarming({ ...dependencies, world: () => world }).changed
    ).to.have.length(3);
    expect(drawn(world)).to.deep.equal(['ddd']);
    expect(warmings).to.deep.equal([1, 2]);
  });
});
