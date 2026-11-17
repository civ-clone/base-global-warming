import Rule from '@civ-clone/core-rule/Rule';

/** The warming level after this turn's move, given the level before it and this turn's target (`WarmingTarget`). */
export class WarmingLevel extends Rule<[number, number], number> {}

export default WarmingLevel;
