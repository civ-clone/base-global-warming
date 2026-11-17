import Rule from '@civ-clone/core-rule/Rule';
import Tile from '@civ-clone/core-world/Tile';

/**
 * How much the world's polluted squares count toward warming, given every polluted square (each once, in the order
 *  its pollution was registered). A rule sees the whole list, so it can count a square more than once or not at all.
 */
export class WarmingPollution extends Rule<[Tile[]], number> {}

export default WarmingPollution;
