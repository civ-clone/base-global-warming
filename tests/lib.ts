import { Land, Water } from '@civ-clone/core-terrain/Types';
import Generator from '@civ-clone/core-world-generator/Generator';
import LandMassRegistry from '@civ-clone/core-world/LandMassRegistry';
import RuleRegistry from '@civ-clone/core-rule/RuleRegistry';
import Terrain from '@civ-clone/core-terrain/Terrain';
import TileImprovement from '@civ-clone/core-tile-improvement/TileImprovement';
import World from '@civ-clone/core-world/World';

// A toy rule set's classes: none of them is any game's.
export class Ocean extends Water {}
export class Meadow extends Land {}
export class Dunes extends Land {}
export class Marsh extends Land {}
export class Peak extends Land {}

export class Pollution extends TileImprovement {}
export class Road extends TileImprovement {}

const letters: { [letter: string]: typeof Terrain } = {
  '~': Ocean,
  m: Meadow,
  d: Dunes,
  x: Marsh,
  p: Peak,
};

/** A world drawn row by row from `rows`, one letter a square (see `letters`). */
export class DrawnGenerator extends Generator {
  #rows: string[];
  #ruleRegistry: RuleRegistry;

  constructor(rows: string[], ruleRegistry: RuleRegistry) {
    super(rows.length, rows[0].length);

    this.#rows = rows;
    this.#ruleRegistry = ruleRegistry;
  }

  async generate(): Promise<Terrain[]> {
    return this.#rows
      .join('')
      .split('')
      .map(
        (letter: string): Terrain => new letters[letter](this.#ruleRegistry)
      );
  }
}

export const drawWorld = (
  rows: string[],
  ruleRegistry: RuleRegistry
): Promise<World> =>
  new World(
    new DrawnGenerator(rows, ruleRegistry),
    ruleRegistry,
    new LandMassRegistry()
  ).build();

/** The world's squares as letters again, row by row. */
export const drawn = (world: World): string[] => {
  const letterOf = new Map<typeof Terrain, string>(
      Object.entries(letters).map(([letter, Type]) => [Type, letter])
    ),
    rows: string[] = [];

  for (let y = 0; y < world.height(); y++) {
    let row = '';

    for (let x = 0; x < world.width(); x++) {
      row += letterOf.get(
        world.get(x, y).terrain().constructor as typeof Terrain
      );
    }

    rows.push(row);
  }

  return rows;
};
