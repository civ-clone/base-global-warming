import { Dunes, Marsh, Meadow, Peak, drawWorld, drawn } from './lib';
import { warm, warmedTerrain } from '../lib/warm';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TerrainChanged from '@civ-clone/core-world/Rules/TerrainChanged';
import Tile from '@civ-clone/core-world/Tile';
import WarmedTerrain from '../Rules/WarmedTerrain';
import { expect } from 'chai';

describe('warmedTerrain', (): void => {
  it('is the first answer that names a terrain, or null', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      world = await drawWorld(['m'], ruleRegistry),
      tile = world.get(0, 0);

    expect(warmedTerrain(tile, 0, ruleRegistry)).to.equal(null);

    ruleRegistry.register(
      new WarmedTerrain(new Effect(() => null)),
      new WarmedTerrain(
        new Criterion((tile: Tile, warmings: number) => warmings > 0),
        new Effect(() => Dunes)
      ),
      new WarmedTerrain(new Effect(() => Marsh))
    );

    expect(warmedTerrain(tile, 0, ruleRegistry)).to.equal(Marsh);
    expect(warmedTerrain(tile, 1, ruleRegistry)).to.equal(Dunes);
  });
});

describe('warm', (): void => {
  it('decides every square before changing any, and changes them through TerrainChanged', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      changes: [string, string, string][] = [],
      world = await drawWorld(['xmmmp', 'mmmmm'], ruleRegistry);

    // A meadow next to a marsh becomes one: applied square by square, the marsh would spread along the row.
    ruleRegistry.register(
      new WarmedTerrain(
        new Criterion(
          (tile: Tile): boolean =>
            tile.terrain() instanceof Meadow &&
            tile
              .getNeighbours()
              .some((neighbour: Tile) => neighbour.terrain() instanceof Marsh)
        ),
        new Effect(() => Marsh)
      ),
      // Asking for a square's own terrain changes nothing.
      new WarmedTerrain(
        new Criterion((tile: Tile): boolean => tile.terrain() instanceof Peak),
        new Effect(() => Peak)
      ),
      new TerrainChanged(
        new Effect((tile: Tile, from: Terrain, to: Terrain): void => {
          changes.push([
            `${tile.x()},${tile.y()}`,
            from.constructor.name,
            to.constructor.name,
          ]);
        })
      )
    );

    const before = world.get(4, 0).terrain(),
      changed = warm(world.entries(), 0, ruleRegistry);

    // The world wraps east to west, so the marsh at 0,0 touches the last column too.
    expect(drawn(world)).to.deep.equal(['xxmmp', 'xxmmx']);
    expect(
      changed.map((tile: Tile) => `${tile.x()},${tile.y()}`)
    ).to.deep.equal(['1,0', '0,1', '1,1', '4,1']);
    expect(changes).to.deep.equal([
      ['1,0', 'Meadow', 'Marsh'],
      ['0,1', 'Meadow', 'Marsh'],
      ['1,1', 'Meadow', 'Marsh'],
      ['4,1', 'Meadow', 'Marsh'],
    ]);
    expect(world.get(4, 0).terrain()).to.equal(before);
  });

  it('passes the warmings before this one', async (): Promise<void> => {
    const ruleRegistry = new RuleRegistry(),
      seen: number[] = [],
      world = await drawWorld(['mm'], ruleRegistry);

    ruleRegistry.register(
      new WarmedTerrain(
        new Effect((tile: Tile, warmings: number): null => {
          seen.push(warmings);

          return null;
        })
      )
    );

    expect(warm(world.entries(), 3, ruleRegistry)).to.deep.equal([]);
    expect(seen).to.deep.equal([3, 3]);
  });
});
