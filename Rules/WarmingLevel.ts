import Rule from '@civ-clone/core-rule/Rule';

/**
 * The warming level after this turn's move, given the level before it and this turn's target (`WarmingTarget`).
 * Register one: the reader takes the highest answer, so a second rule can't adjust the first; change it with
 *  `RuleRegistry.replace` (by the rule's id) instead.
 */
export class WarmingLevel extends Rule<[number, number], number> {}

export default WarmingLevel;
