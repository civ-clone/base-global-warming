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
import { GLOBAL_WARMING_STATE, setGlobalWarmingState } from '../lib/state';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import PendingEffectRegistry from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainChanged from '@civ-clone/core-world/Rules/TerrainChanged';
import Tile from '@civ-clone/core-world/Tile';
import TileImprovementRegistry from '@civ-clone/core-tile-improvement/TileImprovementRegistry';
import Turn from '@civ-clone/core-turn-based-game/Turn';
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

/** An update that ran: `null` would mean it was a turn already done. */
const ran = (update: GlobalWarmingUpdate | null): GlobalWarmingUpdate => {
  expect(update).to.not.equal(null);

  return update!;
};

type Game = {
  world: World;
  engine: Engine;
  events: string[];
  pendingEffectRegistry: PendingEffectRegistry;
  ruleRegistry: RuleRegistry;
  tileImprovementRegistry: TileImprovementRegistry;
  gameTurn: Turn;
  /** The next turn's update. */
  turn: () => GlobalWarmingUpdate;
  pollute: (x: number, y: number) => void;
};

const newGame = async (): Promise<Game> => {
  const ruleRegistry = new RuleRegistry(),
    events: string[] = [],
    engine = new Engine(),
    pendingEffectRegistry = new PendingEffectRegistry(),
    tileImprovementRegistry = new TileImprovementRegistry(),
    gameTurn = new Turn(),
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
    gameTurn,
    turn: (): GlobalWarmingUpdate => {
      gameTurn.increment();

      return ran(
        updateGlobalWarming({
          Pollution,
          engine,
          pendingEffectRegistry,
          ruleRegistry,
          tileImprovementRegistry,
          turn: gameTurn,
        })
      );
    },
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

    const turn = new Turn();

    for (let count = 0; count < 50; count++) {
      turn.increment();

      expect(
        updateGlobalWarming({
          Pollution,
          engine,
          pendingEffectRegistry,
          ruleRegistry,
          tileImprovementRegistry,
          turn,
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

    // A second half square makes a whole one: 2, target 6. The level steps from 3 over 4 to 5, so it is never exactly 4
    //  and nothing warns.
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
      interrupted.gameTurn.increment();

      const { level, warmings, pollution, target } = ran(
        updateGlobalWarming({
          Pollution,
          engine: interrupted.engine,
          pendingEffectRegistry,
          ruleRegistry: interrupted.ruleRegistry,
          tileImprovementRegistry,
          turn: interrupted.gameTurn,
        })
      );

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

    const turn = new Turn(),
      dependencies = {
        Pollution,
        engine,
        pendingEffectRegistry,
        ruleRegistry,
        tileImprovementRegistry,
        turn,
      };

    expect(ran(updateGlobalWarming(dependencies)).changed).to.deep.equal([]);
    expect(drawn(world)).to.deep.equal(['~m~']);

    turn.increment();

    // Every square is asked, the sea too: the rule decides.
    expect(
      ran(updateGlobalWarming({ ...dependencies, world: () => world })).changed
    ).to.have.length(3);
    expect(drawn(world)).to.deep.equal(['ddd']);
    expect(warmings).to.deep.equal([1, 2]);
  });

  it('runs once a turn: a second call on the same turn does nothing', async (): Promise<void> => {
    const game = await newGame();

    game.pollute(2, 1);
    game.pollute(2, 2);

    expect(levels(game, 1)).to.deep.equal(['2/6: 2 0']);

    // The same turn again, as a rule run for each player would call it.
    for (let call = 0; call < 3; call++) {
      expect(
        updateGlobalWarming({
          Pollution,
          engine: game.engine,
          pendingEffectRegistry: game.pendingEffectRegistry,
          ruleRegistry: game.ruleRegistry,
          tileImprovementRegistry: game.tileImprovementRegistry,
          turn: game.gameTurn,
        })
      ).to.equal(null);
    }

    expect(game.pendingEffectRegistry.entries()[0].data()).to.deep.equal({
      level: '2',
      warmings: '0',
      turn: '1',
    });

    // The next turn moves again, once: 2 → 4, which warns once.
    expect(levels(game, 1)).to.deep.equal(['2/6: 4 0']);
    expect(game.events).to.deep.equal(['warning 4 2']);
  });

  it('drops its record when the level and warmings go back to 0', async (): Promise<void> => {
    const game = await newGame();

    game.pollute(2, 2);

    expect(levels(game, 2)).to.deep.equal(['1/3: 2 0', '1/3: 3 0']);
    expect(game.pendingEffectRegistry.entries()).to.have.length(1);

    game.tileImprovementRegistry.unregister(
      ...game.tileImprovementRegistry.entries()
    );

    expect(levels(game, 2)).to.deep.equal(['0/0: 1 0', '0/0: 0 0']);
    expect(game.pendingEffectRegistry.entries()).to.have.length(0);
  });
});

describe('updateGlobalWarming, at the boundaries of a Civilization II-like shape', (): void => {
  // The shape only, with no game's weighting: the target is twice the polluted squares, the level moves 1 a turn
  //  between 0 and 99, it warns at exactly 12 with more than 6 squares counting and strikes above 16.
  const boundary = async (
    level: number,
    polluted: number
  ): Promise<{ update: GlobalWarmingUpdate; events: string[] }> => {
    const ruleRegistry = new RuleRegistry(),
      engine = new Engine(),
      events: string[] = [],
      pendingEffectRegistry = new PendingEffectRegistry(),
      tileImprovementRegistry = new TileImprovementRegistry(),
      turn = new Turn(),
      world = await drawWorld(['mmmmmmmmmm', '~~~~~~~~~~'], ruleRegistry);

    ruleRegistry.register(
      new WarmingTarget(new Effect((pollution: number) => 2 * pollution)),
      new WarmingLevel(new Effect(stepToward(1, 0, 99))),
      new WarmingWarning(new Effect(atLevel(12, 6))),
      new WarmingStrike(new Effect(aboveLevel(16))),
      new WarmedTerrain(
        new Criterion(
          (tile: Tile): boolean => tile.terrain() instanceof Meadow
        ),
        new Effect(() => Marsh)
      )
    );
    engine.on(GLOBAL_WARMING_WARNING, (level: number, pollution: number) =>
      events.push(`warning ${level} ${pollution}`)
    );
    engine.on(GLOBAL_WARMING, (warmings: number) =>
      events.push(`warming ${warmings}`)
    );

    world
      .entries()
      .slice(0, polluted)
      .forEach((tile: Tile) =>
        tileImprovementRegistry.register(new Pollution(tile, ruleRegistry))
      );

    setGlobalWarmingState(
      { level, warmings: 0, turn: null },
      pendingEffectRegistry
    );
    turn.increment();

    return {
      update: ran(
        updateGlobalWarming({
          Pollution,
          engine,
          pendingEffectRegistry,
          ruleRegistry,
          tileImprovementRegistry,
          turn,
        })
      ),
      events,
    };
  };

  it('warns at level 12 only with more than 6 squares counting', async (): Promise<void> => {
    const six = await boundary(11, 6),
      seven = await boundary(11, 7);

    expect(six.update).to.include({ level: 12, warned: false });
    expect(six.events).to.deep.equal([]);
    expect(seven.update).to.include({ level: 12, warned: true });
    expect(seven.events).to.deep.equal(['warning 12 7']);
  });

  it('strikes when the level passes 16, not at 16', async (): Promise<void> => {
    const sixteen = await boundary(15, 9),
      seventeen = await boundary(16, 9);

    expect(sixteen.update).to.include({
      level: 16,
      warmings: 0,
      struck: false,
    });
    expect(sixteen.events).to.deep.equal([]);
    expect(seventeen.update).to.include({
      level: 0,
      warmings: 1,
      struck: true,
    });
    expect(seventeen.update.changed).to.have.length(10);
    expect(seventeen.events).to.deep.equal(['warming 1']);
  });
});
